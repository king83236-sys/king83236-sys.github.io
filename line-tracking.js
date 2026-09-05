(function () {
  "use strict";

  if (window.__tengyuContactTrackingLoaded) return;
  window.__tengyuContactTrackingLoaded = true;

  const currentPath = window.location.pathname;
  const isHomepage = currentPath === "/" || currentPath.endsWith("/index.html");
  const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
  const articleMatch = new URL(canonical, window.location.origin).pathname.match(/article-(\d+)\.html$/);
  const articleNumber = articleMatch ? Number(articleMatch[1]) : null;
  const articleId = articleNumber ? `article-${articleNumber}` : "not_applicable";
  const parentSupportArticles = new Set([53, 55, 56, 57, 58, 59, 60]);
  const childSupportArticles = new Set([54, 61, 62, 63, 64, 65, 66]);

  function pageType() {
    if (isHomepage) return "homepage";
    if (articleNumber) return "article";
    return "other";
  }

  function articleTopic() {
    if (articleNumber && articleNumber <= 52) return "traffic_accident";
    if (parentSupportArticles.has(articleNumber)) return "parent_support";
    if (childSupportArticles.has(articleNumber)) return "child_support";
    return "other";
  }

  function lineLocation(link) {
    const explicitLocation = link.dataset.lineLocation;
    if (explicitLocation) return explicitLocation;
    if (link.closest(".line-float, .float-btns")) return "floating_line";
    if (link.closest("footer, .footer")) return "footer_line";
    return isHomepage ? "homepage_contact" : "article_cta";
  }

  function toolLocation(link) {
    const explicitLocation = link.dataset.toolLocation;
    if (explicitLocation) return explicitLocation;
    if (link.closest(".tool-float, .float-btns")) return "floating_tool";
    if (link.closest("footer, .footer")) return "footer_tool";
    if (link.closest("nav, .nav")) return "navigation";
    if (link.classList.contains("hero-cta")) return "article_hero_cta";
    if (link.closest(".inline-cta")) return "article_mid_cta";
    if (link.closest(".cta, .cta-box, .cta-buttons")) return "article_end_cta";
    if (isHomepage) return "homepage_hero";
    return "article_inline";
  }

  function phoneLocation(link) {
    const explicitLocation = link.dataset.phoneLocation;
    if (explicitLocation) return explicitLocation;
    if (link.closest("footer, .footer")) return "footer_phone";
    if (link.closest("nav, .nav")) return "navigation_phone";
    return isHomepage ? "homepage_contact" : "article_body";
  }

  function isToolUrl(url) {
    if (url.hostname === "tool.tengyulaw.tw") return true;
    if (url.origin !== window.location.origin) return false;
    return ["/calculator/", "/child-support-calculator/", "/parent-support-assessment/"].some(
      (path) => url.pathname.startsWith(path)
    );
  }

  function toolName(url) {
    if (url.pathname.startsWith("/parent-support-assessment/")) return "parent_support_assessment";
    if (url.pathname.startsWith("/child-support-calculator/")) return "child_support_calculator";
    if (url.pathname.startsWith("/calculator/") || url.hostname === "tool.tengyulaw.tw") {
      return "accident_compensation_calculator";
    }
    return "other_tool";
  }

  function sendEvent(eventName, parameters) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", eventName, {
      page_type: pageType(),
      page_path: currentPath,
      article_id: articleId,
      article_topic: articleTopic(),
      transport_type: "beacon",
      ...parameters
    });
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    const link = target instanceof Element ? target.closest("a[href]") : null;
    if (!link) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch (error) {
      return;
    }

    if (url.hostname === "lin.ee" || url.hostname.endsWith("line.me")) {
      const location = lineLocation(link);
      sendEvent("line_click", {
        line_location: location,
        link_location: location,
        link_url: url.href
      });
      return;
    }

    if (url.protocol === "tel:") {
      const location = phoneLocation(link);
      sendEvent("phone_click", {
        phone_location: location,
        link_location: location
      });
      return;
    }

    // The homepage already tracks its data-tool-name cards inline.
    if (isToolUrl(url) && !(isHomepage && link.dataset.toolName)) {
      const location = toolLocation(link);
      sendEvent("tool_click", {
        tool_location: location,
        link_location: location,
        tool_name: toolName(url),
        link_url: url.href
      });
    }
  });
})();
