/**
 * System notices are visually distinct from user messages.
 * Requires the app and API plus CYPRESS_API_URL, CYPRESS_USER_EMAIL, and
 * CYPRESS_USER_PASSWORD:
 *   pnpm cypress run --spec cypress/e2e/messaging/system-notices.cy.ts
 */
const NOTICE =
  "@mimi joined this channel. @abduljaleel_abdulsamad and 5 others also joined.";

describe("channel system notices", () => {
  it("renders a slim notice with plain clickable names and a right-aligned time", () => {
    const api = Cypress.env("API_URL");
    cy.request("POST", `${api}/auth/login`, {
      email: Cypress.env("USER_EMAIL"),
      password: Cypress.env("USER_PASSWORD"),
    }).then(({ body: { data } }) => {
      const { access_token: token, user } = data;
      const slug = user.current_organisation_slug;

      cy.request({
        url: `${api}/organisations/${user.current_org}/user-channels`,
        headers: { Authorization: `Bearer ${token}` },
      }).then(({ body }) => {
        const channelId = body.data[0].channels_id;

        cy.intercept("GET", "**/threads/channels/*", {
          statusCode: 200,
          body: {
            data: [
              {
                thread_id: "system-notice",
                channels_id: channelId,
                org_id: user.current_org,
                username: "system",
                user_id: "system",
                created_at: "2026-10-17T10:30:00.000Z",
                updated_at: "2026-10-17T10:30:00.000Z",
                message: NOTICE,
                channel_name: "general",
                channel_type: "channel",
                message_count: 0,
                type: "system",
                media: [],
              },
            ],
          },
        }).as("systemNotices");

        cy.visit(`/${slug}/home/channels/${channelId}`, {
          onBeforeLoad: ({ localStorage }) => {
            localStorage.setItem("token", token);
            localStorage.setItem("orgId", user.current_org);
            localStorage.setItem("orgSlug", slug);
            localStorage.setItem("user", JSON.stringify(user));
          },
        });
      });
    });

    cy.wait("@systemNotices");
    cy.contains(".message-row", "mimi joined this channel.").within(() => {
      cy.get("svg").should("exist");
      cy.contains("mimi").should("have.class", "cursor-pointer");
      cy.contains("abduljaleel_abdulsamad").should(
        "have.class",
        "cursor-pointer"
      );
      cy.root().should("not.contain", "@");
      cy.get("time").should("have.class", "ml-auto");
    });
  });
});
