/**
 * Verify Account and Reset Password: the "We have sent a code" line shows the
 * masked email, or "your email address" when the link has no email.
 * Needs only the app running; nothing is sent to the backend:
 *   CYPRESS_baseUrl=http://localhost:3000 \
 *   pnpm cypress run --spec cypress/e2e/auth/masked-email.cy.ts
 */
const FALLBACK = "We have sent a code to your email address";
const MASKED = "We have sent a code to your email te***@example.com";

// Without NEXT_PUBLIC_GTM_SCRIPT_URL the analytics <Script> loads the page's
// own HTML and throws "Unexpected token '<'"; that's unrelated to this flow.
Cypress.on(
  "uncaught:exception",
  (err) => !err.message.includes("Unexpected token '<'")
);

const codeLine = () => cy.contains("p", "We have sent a code to your email");

["/auth/verify-account", "/auth/reset-password"].forEach((path) => {
  describe(`masked email on ${path}`, () => {
    it("falls back to 'your email address' without an email", () => {
      cy.visit(path);
      codeLine().should("have.text", FALLBACK);
      codeLine().should("not.contain", "undefined");
    });

    it("falls back when the email has no domain", () => {
      cy.visit(`${path}?email=test.user`);
      codeLine().should("have.text", FALLBACK);
    });

    it("still masks a real email", () => {
      cy.visit(`${path}?email=test.user@example.com`);
      codeLine().should("have.text", MASKED);
    });
  });
});
