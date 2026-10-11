/**
 * Marketing pages: canonical and og:url point at the page's own address,
 * and only the homepage points at the homepage. Needs only the app running:
 *   CYPRESS_baseUrl=http://localhost:3000 \
 *   pnpm cypress run --spec cypress/e2e/seo/page-own-url.cy.ts
 */

// The team pages that used to inherit the homepage's address.
const TEAM_PAGES = [
  "/contributors/egrets",
  "/contributors/heron",
  "/contributors/ibis",
  "/contributors/sparrow",
  "/contributors/zedu-drongo",
  "/contributors/zedu-gannet",
  "/contributors/zedu-osprey",
  "/contributors/zedu-quetzal",
  "/contributors/zedu-weaver",
];

// Pages that already set their own address and must keep it.
const OWN_URL_PAGES = ["/pricing", "/contributors/macaw"];

// Without NEXT_PUBLIC_GTM_SCRIPT_URL the analytics <Script> loads the page's
// own HTML and throws "Unexpected token '<'"; that's unrelated to this check.
Cypress.on(
  "uncaught:exception",
  (err) => !err.message.includes("Unexpected token '<'")
);

const canonical = () =>
  cy
    .get('link[rel="canonical"]')
    .should("have.length", 1)
    .invoke("attr", "href");
const ogUrl = () =>
  cy
    .get('meta[property="og:url"]')
    .should("have.length", 1)
    .invoke("attr", "content");

const stripSlash = (url: string) => url.replace(/\/$/, "");

describe("page canonical and og:url", () => {
  let home = "";

  before(() => {
    cy.visit("/");
    canonical().then((href) => {
      expect(new URL(String(href)).pathname).to.eq("/");
      home = stripSlash(String(href));
    });
  });

  it("keeps the homepage pointing at itself", () => {
    cy.visit("/");
    canonical().then((href) => expect(stripSlash(String(href))).to.eq(home));
    ogUrl().then((href) => expect(stripSlash(String(href))).to.eq(home));
  });

  [...TEAM_PAGES, ...OWN_URL_PAGES].forEach((path) => {
    it(`points ${path} at its own address`, () => {
      cy.visit(path);
      canonical().should((href) => expect(href).to.eq(`${home}${path}`));
      ogUrl().should((href) => expect(href).to.eq(`${home}${path}`));
    });
  });
});
