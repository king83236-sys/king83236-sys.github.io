(function () {
  'use strict';

  if (window.__tengyuContactTrackingLoaded) {
    return;
  }
  window.__tengyuContactTrackingLoaded = true;

  function isHomepage() {
    return window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
  }

  function getLineLocation(link) {
    var explicitLocation = link.getAttribute('data-line-location');
    if (explicitLocation) {
      return explicitLocation;
    }

    if (link.closest('.line-float, .float-btns')) {
      return 'floating_line';
    }

    if (link.closest('footer, .footer')) {
      return 'footer_line';
    }

    return isHomepage() ? 'homepage_contact' : 'article_cta';
  }

  function getToolLocation(link) {
    if (link.closest('.tool-float, .float-btns')) {
      return 'floating_tool';
    }

    if (link.closest('footer, .footer')) {
      return 'footer_tool';
    }

    if (link.closest('nav, .nav')) {
      return 'navigation';
    }

    if (isHomepage()) {
      return 'homepage_hero';
    }

    if (link.matches('.cta-btn, .btn') || link.closest('.cta, .cta-box, .cta-buttons')) {
      return 'article_cta';
    }

    return 'article_inline';
  }

  document.addEventListener('click', function (event) {
    var target = event.target;
    var link = target instanceof Element ? target.closest('a[href]') : null;

    if (!link) {
      return;
    }

    var url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }

    if (typeof window.gtag !== 'function') {
      return;
    }

    if (url.hostname === 'lin.ee') {
      window.gtag('event', 'line_click', {
        line_location: getLineLocation(link),
        page_type: isHomepage() ? 'homepage' : 'article',
        page_path: window.location.pathname,
        link_url: url.href,
        transport_type: 'beacon'
      });
      return;
    }

    if (url.hostname === 'tool.tengyulaw.tw') {
      window.gtag('event', 'tool_click', {
        tool_location: getToolLocation(link),
        page_type: isHomepage() ? 'homepage' : 'article',
        page_path: window.location.pathname,
        link_url: url.href,
        transport_type: 'beacon'
      });
      return;
    }

    if (url.protocol === 'tel:') {
      window.gtag('event', 'phone_click', {
        phone_location: link.closest('footer, .footer') ? 'footer_phone' : 'homepage_contact',
        page_type: isHomepage() ? 'homepage' : 'article',
        page_path: window.location.pathname,
        transport_type: 'beacon'
      });
    }
  });
})();