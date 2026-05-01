(function bootstrapNavigationRoot() {
  var navRoot = document.querySelector('[data-nav-root]');
  if (!navRoot) {
    return;
  }

  var base = navRoot.getAttribute('data-nav-base') || '.';
  var pageLabel = navRoot.getAttribute('data-page-label') || 'Superpowers Blog';
  var links = [
    { href: './phases/discovery.html', label: 'Discovery' },
    { href: './simulation.html', label: 'Simulation' },
    { href: './artifacts.html', label: 'Artifacts' }
  ];

  function resolveHref(href) {
    if (base === '.') {
      return href;
    }
    return href.replace('./', '../');
  }

  var pathname = window.location.pathname || '';
  var current = pathname.split('/').pop();

  var navMarkup = links
    .map(function (link) {
      var resolvedHref = resolveHref(link.href);
      var isCurrent = current === resolvedHref.split('/').pop();
      var currentAttr = isCurrent ? ' aria-current="page"' : '';
      return '<a href="' + resolvedHref + '"' + currentAttr + '>' + link.label + '</a>';
    })
    .join('');

  navRoot.innerHTML =
    '<div class="site-shell">' +
    '<nav class="site-nav" aria-label="Primary">' + navMarkup + '</nav>' +
    '<h1 class="page-title">' + pageLabel + '</h1>' +
    '<p class="page-subtitle">Spec-driven blog work in progress.</p>' +
    '</div>';
  navRoot.setAttribute('data-nav-bootstrapped', 'true');
})();
