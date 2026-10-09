/**
 * Buzzs page: a live buzz reads "In progress", not the time until its
 * planned end. The API sends live buzzes with ended_at = start + 2 hours.
 * Needs only the app running; every API call is stubbed, so no real account
 * is used:
 *   CYPRESS_baseUrl=http://localhost:3000 \
 *   pnpm cypress run --spec cypress/e2e/buzzs/live-duration.cy.ts
 */
const ORG = "11111111-1111-4111-8111-111111111111";
const SLUG = "testorg";

// Without NEXT_PUBLIC_GTM_SCRIPT_URL the analytics <Script> loads the page's
// own HTML and throws "Unexpected token '<'"; push (OneSignal) isn't set up
// when testing either. Neither is related to this page.
Cypress.on(
  "uncaught:exception",
  (err) =>
    !err.message.includes("Unexpected token '<'") &&
    !err.message.includes("OneSignal")
);

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60e3).toISOString();
const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * 60e3).toISOString();

const buzz = (
  code: string,
  status: string,
  startedAt: string,
  endedAt: string | null
) => ({
  buzz_id: `id-${code}`,
  buzz_code: code,
  channel_id: "",
  channel_type: "channel",
  host_id: "host-1",
  org_id: ORG,
  status,
  participant_count: 1,
  buzz_type: "channel",
  created_at: startedAt,
  started_at: startedAt,
  ended_at: endedAt,
});

const BUZZES = [
  // Live, started 9 minutes ago, with the planned end the API sends
  buzz("CODE-LIVE", "active", minutesAgo(9), minutesFromNow(111)),
  // Ended after 45 minutes
  buzz("CODE-ENDED", "ended", minutesAgo(120), minutesAgo(75)),
];

const lineOf = (code: string) =>
  cy.contains(code).closest(".group").find("p").eq(1);

describe("live buzz duration", () => {
  beforeEach(() => {
    // Anything not stubbed below gets an empty success.
    cy.intercept(/\/api\/v1\//, { body: { status: "success", data: [] } });
    cy.intercept("GET", "**/buzz/org/all*", {
      status: "success",
      data: {
        buzzes: BUZZES,
        pagination: {
          current_page: 1,
          page_count: 1,
          total_pages_count: 1,
          total_items: BUZZES.length,
        },
      },
    });

    cy.visit(`/${SLUG}/buzzs`, {
      onBeforeLoad: ({ localStorage }) => {
        localStorage.setItem("token", "test-token");
        localStorage.setItem("orgId", ORG);
        localStorage.setItem("orgSlug", SLUG);
        localStorage.setItem("buzzs-hero-dismissed", "true");
      },
    });
    cy.contains("CODE-ENDED").should("exist");
  });

  it('shows "In progress" for a live buzz with a planned end time', () => {
    lineOf("CODE-LIVE")
      .should("contain", "In progress")
      .and("not.contain", "hour");
  });

  it("still shows the real duration for an ended buzz", () => {
    lineOf("CODE-ENDED").should("contain", "45 minutes");
  });
});
