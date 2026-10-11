/**
 * Marketing footer: the four link groups are a 2x2 grid on phones and four
 * even columns from 640px, every group is a plain list, the rule and indent
 * only appear from 1280px, and the footer stays compact. Needs only the app
 * running:
 *   CYPRESS_baseUrl=http://localhost:3000 \
 *   pnpm cypress run --spec cypress/e2e/marketing/footer-columns.cy.ts
 */
const GROUPS = ["Products", "Solutions", "Zedu", "Resources"];

const LINKS = [
  "/products/buzz",
  "/products/channels",
  "/products/file-management",
  "/solutions/bootcamps",
  "/solutions/schools",
  "/solutions/universities",
  "/pricing",
  "/contact-sales",
  "/resources",
  "/policy",
  "/terms-of-service",
];

// Upper bounds for the footer height, with some room over the measured
// values (about 900px at 390, 750px at 768 and 700px at 1024).
const VIEWPORTS = [
  { width: 390, maxHeight: 950, columns: 2 },
  { width: 768, maxHeight: 800, columns: 4 },
  { width: 1024, maxHeight: 760, columns: 4 },
  { width: 1440, maxHeight: 650, columns: 4 },
];

// Without NEXT_PUBLIC_GTM_SCRIPT_URL the analytics <Script> loads the page's
// own HTML and throws "Unexpected token '<'"; that's unrelated to the footer.
Cypress.on(
  "uncaught:exception",
  (err) => !err.message.includes("Unexpected token '<'")
);

const heading = (title: string) => cy.contains("footer h2", title);
const linkGrid = () => heading("Products").parent().parent();

describe("marketing footer link columns", () => {
  VIEWPORTS.forEach(({ width, maxHeight, columns }) => {
    describe(`at ${width}px`, () => {
      beforeEach(() => {
        cy.viewport(width, 900);
        cy.visit("/contact-sales");
        cy.get("footer").scrollIntoView();
      });

      it(`lays the groups out in ${columns} even columns`, () => {
        const rects: DOMRect[] = [];
        GROUPS.forEach((title) =>
          heading(title).then(($h) => {
            rects.push($h[0].getBoundingClientRect());
          })
        );
        cy.then(() => {
          const rows = [rects.slice(0, columns), rects.slice(columns)];
          rows.forEach((row) => {
            row.forEach((r) => expect(r.top).to.be.closeTo(row[0].top, 1));
          });
          if (columns === 2) {
            // 2x2: Zedu and Resources sit under Products and Solutions.
            expect(rects[2].top).to.be.greaterThan(rects[0].bottom);
            expect(rects[2].left).to.be.closeTo(rects[0].left, 1);
            expect(rects[3].left).to.be.closeTo(rects[1].left, 1);
          }
          // Columns are evenly spaced.
          const firstRow = rects.slice(0, columns);
          const gaps = firstRow
            .slice(1)
            .map((r, i) => r.left - firstRow[i].left);
          gaps.forEach((gap) => {
            expect(gap).to.be.greaterThan(0);
            expect(gap).to.be.closeTo(gaps[0], 1);
          });
        });
      });

      it("shows every group as a single vertical list", () => {
        GROUPS.forEach((title) => {
          heading(title)
            .next()
            .find("a")
            .then(($links) => {
              const lefts = [...$links].map(
                (a) => a.getBoundingClientRect().left
              );
              lefts.forEach((left) => expect(left).to.be.closeTo(lefts[0], 1));
              [...$links].forEach((a) =>
                expect(a.getBoundingClientRect().height).to.be.at.least(24)
              );
            });
        });
      });

      it("keeps every link", () => {
        linkGrid()
          .find("a")
          .then(($links) => {
            expect([...$links].map((a) => a.getAttribute("href"))).to.deep.eq(
              LINKS
            );
          });
      });

      it("only shows the rule and indent beside the newsletter", () => {
        linkGrid().then(($grid) => {
          const style = getComputedStyle($grid[0]);
          const expected = width >= 1280 ? "1px" : "0px";
          expect(style.borderLeftWidth).to.eq(expected);
          expect(style.paddingLeft).to.eq(width >= 1280 ? "56px" : "0px");
        });
      });

      it(`keeps the footer under ${maxHeight}px tall`, () => {
        cy.get("footer").then(($footer) => {
          const height = $footer[0].getBoundingClientRect().height;
          cy.log(`footer height: ${height}px`);
          expect(height).to.be.at.most(maxHeight);
        });
      });
    });
  });
});
