describe('ui: Playbar component', () => {
  beforeEach(() => cy.visit('/iframe.html?id=playbar--primary'));
    
    it('should render the component', () => {
      cy.get('h1').should('contain', 'Welcome to ui!');
    });
});
