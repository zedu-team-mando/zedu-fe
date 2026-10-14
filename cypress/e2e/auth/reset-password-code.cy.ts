/**
 * Reset Password: the 6-digit code is required before the form is sent.
 * Needs only the app running; the reset request is stubbed, so no real
 * account or email is used:
 *   CYPRESS_baseUrl=http://localhost:3000 \
 *   pnpm cypress run --spec cypress/e2e/auth/reset-password-code.cy.ts
 */
const RESET = "**/auth/password-reset/verify";
const CODE_ERROR = "Enter the 6-digit code from your email";
const PASSWORD = "abcdef1";

// Without NEXT_PUBLIC_GTM_SCRIPT_URL the analytics <Script> loads the page's
// own HTML and throws "Unexpected token '<'"; that's unrelated to this flow.
Cypress.on(
  "uncaught:exception",
  (err) => !err.message.includes("Unexpected token '<'")
);

const submit = () => cy.contains("button", "Reset Password").click();
const typeCode = (digits: string) =>
  cy.get("input[data-input-otp]").type(digits, { force: true });

describe("reset password code", () => {
  beforeEach(() => {
    cy.intercept("POST", RESET, {
      statusCode: 200,
      body: { status: "success", message: "Password reset successful" },
    }).as("reset");
    cy.visit("/auth/reset-password?email=test.user@example.com");
    cy.get('input[type="password"]').eq(0).type(PASSWORD);
    cy.get('input[type="password"]').eq(1).type(PASSWORD);
  });

  it("blocks an empty code and sends nothing", () => {
    submit();
    cy.contains(CODE_ERROR).should("be.visible");
    cy.get("@reset.all").should("have.length", 0);
  });

  it("clears the error while typing and still blocks an incomplete code", () => {
    submit();
    cy.contains(CODE_ERROR).should("be.visible");
    typeCode("123");
    cy.contains(CODE_ERROR).should("not.exist");
    submit();
    cy.contains(CODE_ERROR).should("be.visible");
    cy.get("@reset.all").should("have.length", 0);
  });

  it("sends the code once all 6 digits are entered", () => {
    typeCode("123456");
    submit();
    cy.wait("@reset")
      .its("request.body")
      .should("deep.equal", { token: "123456", new_password: PASSWORD });
    cy.location("pathname").should("eq", "/auth/reset-password-success");
  });
});
