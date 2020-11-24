// https://docs.cypress.io/api/introduction/api.html

describe("AddToCart Test", () => {
  it("Visits the app root url and click AddToCart button", () => {
    const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
    Cypress.on("uncaught:exception", err => {
      /* returning false here prevents Cypress from failing the test */
      if (resizeObserverLoopErrRe.test(err.message)) {
        return false;
      }
    });
    cy.visit("/");
    cy.get(".add-to-cart-btn")
      .first()
      .click();
    cy.get(".product-name")
      .first()
      .contains(
        "Книги. Алгоритмы. Построение и анализ. Т. Кормен, Ч. Лейзерсон, Р. Ривест, К. Штайн."
      );
  });
});
