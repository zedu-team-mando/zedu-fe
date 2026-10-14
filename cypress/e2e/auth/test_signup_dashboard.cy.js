describe("E2e tests for signup and login", () => {
  it("Verify signup and use credentials to login and access dashboard", () => {
    const baseUrl = Cypress.env("baseUrl");
    cy.visit(baseUrl);
    cy.contains("Get started").eq(0).click({ force: true });

    const email = `firsttype${Date.now()}@email.com`;
    cy.contains("Email address").parent()?.find("input").type(email);
    cy.contains("Username").parent()?.find("input").type("UserName");
    cy.contains("Password").parent()?.find("input").type("UserLast1234*");
    cy.contains("Create Account").click();
    cy.wait(2000);
    cy.contains("user created successfully", { timeout: 10000 }).should(
      "exist"
    );
    cy.location("pathname").should("eq", "/auth/login");
    cy.contains("Email address").parent()?.find("input").type(email);
    cy.contains("Password").parent()?.find("input").type("UserLast1234*");
    cy.contains("button", "Login").click();
    cy.wait(5000);
    cy.url().should("include", "/dashboard/welcome");
    cy.contains("Welcome to Telex.").should("be.visible");
    cy.contains("button", "Get Started").click();
    cy.contains("h2", "Create Your Organisation").should("be.visible");
    cy.contains("label", "Organisation Name").should("be.visible");
    cy.get('input[name="organisationName"]').type("OrganisationName");
    cy.get('input[name="organisationType"]').type("OrganisationType");
    cy.get('button:contains("Select")').eq(0).click();
    cy.contains('[role="option"]', "United States").click({ force: true });
    cy.get('button:contains("Select")').click();
    cy.contains('[role="option"]', "Alabama").click({ force: true });
    cy.get('button:contains("Submit")').click();
    cy.get('button:contains("Proceed")').click();
  });
});
