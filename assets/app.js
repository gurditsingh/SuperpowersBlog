(function bootstrapNavigationRoot() {
  var navRoot = document.querySelector('[data-nav-root]');
  if (!navRoot) {
    return;
  }

  navRoot.setAttribute('data-nav-bootstrapped', 'true');
})();
