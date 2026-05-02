(function navigationModule(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.SuperpowerBlogNav = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function createNavigationModule() {
  function stripLeadingDotSlash(path) {
    return String(path || '').replace(/^\.?\//, '');
  }

  function normalizeBasePrefix(base) {
    if (!base || base === '.') {
      return './';
    }

    return String(base).replace(/\/+$/, '') + '/';
  }

  function normalizeCurrentPath(currentPath) {
    var normalized = stripLeadingDotSlash(currentPath || 'index.html');
    if (normalized === '') {
      return 'index.html';
    }
    return normalized;
  }

  function buildNavigationLinks(pages, base, currentPath) {
    var prefix = normalizeBasePrefix(base);
    var normalizedCurrentPath = normalizeCurrentPath(currentPath);

    return pages.map(function (page) {
      var path = stripLeadingDotSlash(page.path);
      return {
        href: prefix + path,
        label: page.label,
        isCurrent: path === normalizedCurrentPath
      };
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderList(items) {
    return '<ul>' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function renderPhaseSection(title, items) {
    return (
      '<section class="phase-section">' +
      '<h2>' + escapeHtml(title) + '</h2>' +
      renderList(items) +
      '</section>'
    );
  }

  function renderNavigation(options) {
    var links = buildNavigationLinks(options.pages, options.base, options.currentPath);
    var pageLabel = options.pageLabel || 'Superpowers Blog';
    var navMarkup = links
      .map(function (link) {
        var currentAttr = link.isCurrent ? ' aria-current="page"' : '';
        return '<a href="' + escapeHtml(link.href) + '"' + currentAttr + '>' + escapeHtml(link.label) + '</a>';
      })
      .join('');

    return (
      '<div class="site-shell">' +
      '<nav class="site-nav" aria-label="Primary">' + navMarkup + '</nav>' +
      '<h1 class="page-title">' + escapeHtml(pageLabel) + '</h1>' +
      '<p class="page-subtitle">Spec-driven blog work in progress.</p>' +
      '</div>'
    );
  }

  function renderPhasePage(phase) {
    return (
      '<article class="site-shell phase-page" data-rendered-phase="' + escapeHtml(phase.slug) + '">' +
      '<p class="phase-kicker">' + escapeHtml(phase.kicker || 'Superpowers phase') + '</p>' +
      '<h1 class="phase-title">' + escapeHtml(phase.title) + '</h1>' +
      '<p class="phase-goal">' + escapeHtml(phase.goal) + '</p>' +
      '<div class="phase-grid">' +
      renderPhaseSection('Inputs', phase.inputs || []) +
      renderPhaseSection('Outputs', phase.outputs || []) +
      renderPhaseSection('Antipatterns', phase.antipatterns || []) +
      renderPhaseSection('Done Criteria', phase.doneCriteria || []) +
      '</div>' +
      '</article>'
    );
  }

  function renderPhaseFallback() {
    return (
      '<article class="site-shell phase-page phase-page--fallback">' +
      '<h1 class="phase-title">Phase content unavailable</h1>' +
      '<p class="phase-goal">The structured phase content could not be loaded. Try refreshing the page.</p>' +
      '</article>'
    );
  }

  function currentPathFromLocation(pathname, pages) {
    var rawPath = String(pathname || '');
    var endedWithSlash = rawPath.slice(-1) === '/';
    var path = rawPath.replace(/\/+$/, '');
    if (!path || path === '') {
      return 'index.html';
    }

    if (endedWithSlash) {
      return 'index.html';
    }

    for (var index = 0; index < pages.length; index += 1) {
      var pagePath = stripLeadingDotSlash(pages[index].path);
      if (path === '/' + pagePath || path.slice(-pagePath.length - 1) === '/' + pagePath) {
        return pagePath;
      }
    }

    return path.split('/').pop() || 'index.html';
  }

  function bootstrapNavigationRoot(doc, locationObject) {
    var navRoot = doc.querySelector('[data-nav-root]');
    if (!navRoot) {
      return Promise.resolve(false);
    }

    var base = navRoot.getAttribute('data-nav-base') || '.';
    var pageLabel = navRoot.getAttribute('data-page-label') || 'Superpowers Blog';
    var dataUrl = normalizeBasePrefix(base) + 'assets/data/site.json';

    return fetch(dataUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load navigation data: ' + response.status);
        }
        return response.json();
      })
      .then(function (siteData) {
        var currentPath = currentPathFromLocation(locationObject.pathname, siteData.pages);
        navRoot.innerHTML = renderNavigation({
          pages: siteData.pages,
          base: base,
          currentPath: currentPath,
          pageLabel: pageLabel
        });
        navRoot.setAttribute('data-nav-bootstrapped', 'true');
        return true;
      });
  }

  function bootstrapPhaseRoot(doc) {
    var phaseRoot = doc.querySelector('[data-phase-root]');
    if (!phaseRoot) {
      return Promise.resolve(false);
    }

    var slug = phaseRoot.getAttribute('data-phase-slug');
    var base = phaseRoot.getAttribute('data-phase-base') || phaseRoot.getAttribute('data-nav-base') || '.';
    var dataUrl = normalizeBasePrefix(base) + 'assets/data/phases.json';

    return fetch(dataUrl)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load phase data: ' + response.status);
        }
        return response.json();
      })
      .then(function (phases) {
        var phase = phases.find(function (item) {
          return item.slug === slug;
        });
        if (!phase) {
          throw new Error('Unknown phase slug: ' + slug);
        }

        phaseRoot.innerHTML = renderPhasePage(phase);
        phaseRoot.setAttribute('data-phase-bootstrapped', 'true');
        return true;
      })
      .catch(function () {
        phaseRoot.innerHTML = renderPhaseFallback();
        phaseRoot.setAttribute('data-phase-error', 'true');
        return false;
      });
  }

  return {
    buildNavigationLinks: buildNavigationLinks,
    currentPathFromLocation: currentPathFromLocation,
    normalizeBasePrefix: normalizeBasePrefix,
    renderNavigation: renderNavigation,
    renderPhasePage: renderPhasePage,
    bootstrapNavigationRoot: bootstrapNavigationRoot,
    bootstrapPhaseRoot: bootstrapPhaseRoot
  };
});

if (typeof document !== 'undefined' && typeof fetch === 'function') {
  globalThis.SuperpowerBlogNav.bootstrapNavigationRoot(document, window.location).catch(function (error) {
    console.error(error);
  });
  globalThis.SuperpowerBlogNav.bootstrapPhaseRoot(document).catch(function (error) {
    console.error(error);
  });
}
