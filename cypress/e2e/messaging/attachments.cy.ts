/**
 * Message attachments: upload failures and removing the right attachment.
 * Needs the app and the API running; credentials come from the environment:
 *   CYPRESS_baseUrl=http://localhost:3000 CYPRESS_API_URL=http://localhost:8019/api/v1 \
 *   CYPRESS_USER_EMAIL=<email> CYPRESS_USER_PASSWORD=<password> \
 *   pnpm cypress run --spec cypress/e2e/messaging/attachments.cy.ts
 * Voice notes are not covered (they need a microphone stub).
 */
const UPLOAD = "**/files/upload-files";
const EDITOR = ".ProseMirror";

// Push (OneSignal) is not configured when testing and its init rejects unhandled.
Cypress.on("uncaught:exception", (err) => !err.message.includes("OneSignal"));

const attach = (...names: string[]) =>
  cy
    .get('input[type="file"]')
    .first()
    .selectFile(
      names.map((fileName) => ({
        contents: Cypress.Buffer.from(fileName),
        fileName,
        mimeType: "text/plain",
      })),
      { force: true }
    );

// Answers each upload with the name of the file it received; `failFor` fails
// the files whose name starts with it.
const stubUploads = (delay = 0, failFor = "") =>
  cy
    .intercept("POST", UPLOAD, (req) => {
      const body = String(req.body);
      const name = /filename="([^"]+)"/.exec(body)?.[1] ?? "unknown";
      if (failFor && name.startsWith(failFor)) {
        req.reply(500, { message: "Storage unavailable" });
        return;
      }
      const data = [{ id: name, file_name: name, file_link: `/${name}` }];
      req.reply({ statusCode: 200, delay, body: { data } });
    })
    .as("upload");

describe("message attachments", () => {
  beforeEach(() => {
    // Stub the send so these tests never post into the real channel.
    cy.intercept("POST", "**/threads/*", { statusCode: 201, body: {} }).as(
      "send"
    );
    const api = Cypress.env("API_URL");
    cy.request("POST", `${api}/auth/login`, {
      email: Cypress.env("USER_EMAIL"),
      password: Cypress.env("USER_PASSWORD"),
    }).then(({ body: { data } }) => {
      const { access_token: token, user } = data;
      cy.request({
        url: `${api}/organisations/${user.current_org}/user-channels`,
        headers: { Authorization: `Bearer ${token}` },
      }).then(({ body }) => {
        const slug = user.current_organisation_slug;
        cy.visit(`/${slug}/home/channels/${body.data[0].channels_id}`, {
          onBeforeLoad: ({ localStorage }) => {
            localStorage.setItem("token", token);
            localStorage.setItem("orgId", user.current_org);
            localStorage.setItem("orgSlug", slug);
            localStorage.setItem("user", JSON.stringify(user));
          },
        });
      });
    });
    cy.get(EDITOR).should("be.visible");
  });

  it("shows an error and blocks the send when an upload fails", () => {
    stubUploads(0, "report");
    attach("report.txt");
    cy.wait("@upload");

    cy.contains("Couldn't upload report.txt").should("be.visible");
    cy.get('[aria-label="Retry upload of report.txt"]').should("be.visible");

    cy.get(EDITOR).type("see attached{enter}");
    cy.contains("Retry or remove failed uploads before sending");
    cy.get("@send.all").should("have.length", 0);
  });

  it("does not send an attachment removed while it was uploading", () => {
    stubUploads(1500);
    attach("draft.txt");
    cy.get('[aria-label="Remove draft.txt"]').click();
    cy.wait("@upload");

    cy.get(EDITOR).type("hello{enter}");
    cy.wait("@send").its("request.body.media").should("have.length", 0);
  });

  it("keeps the right file when a failed attachment is removed", () => {
    stubUploads(0, "bad");
    attach("bad.txt", "good.txt");
    cy.wait(["@upload", "@upload"]);
    cy.get('[aria-label="Remove bad.txt"]').click();

    cy.get(EDITOR).type("hello{enter}");
    cy.wait("@send")
      .its("request.body.media")
      .should((media: { file_name: string }[]) => {
        expect(media.map((file) => file.file_name)).to.deep.equal(["good.txt"]);
      });
  });
});
