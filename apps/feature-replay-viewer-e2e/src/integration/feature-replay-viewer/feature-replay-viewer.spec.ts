describe('feature-replay-viewer: FeatureReplayViewer component', () => {
  beforeEach(() => cy.visit('/iframe.html?id=featurereplayviewer--primary'));
    
    it('should render the component', () => {
      cy.get('h1').should('contain', 'Welcome to feature-replay-viewer!');
    });
});
