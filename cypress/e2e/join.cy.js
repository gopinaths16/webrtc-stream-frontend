describe('empty spec', () => {
  it('passes', () => {
    cy.visit('/video')

    cy.get("#joinRoom").click()
  })
})