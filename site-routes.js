(function () {
  var LEGACY_STATIC_ROUTES = {
    "index.html": "/",
    "about.html": "/about/",
    "contactus.html": "/contact/",
    "login.html": "/login/",
    "register.html": "/register/",
    "404.html": "/404.html"
  };

  var LEGACY_POST_SLUGS = {
    "post1.html": "some-amazing-similarities-between-people-around-the-world",
    "post2.html": "little-known-facts-about-deer-worth-knowing",
    "post3.html": "shape-the-import-surface-of-a-python-analytics-service-before-the-live-loop",
    "post4.html": "keep-postgresql-lookups-cheap-while-a-vision-worker-boots-up",
    "post5.html": "turn-yolo-detections-into-per-frame-motion-buckets-without-losing-the-thread",
    "post6.html": "ship-live-metrics-into-postgresql-fan-them-out-and-keep-a-debug-overlay-nearby",
    "post7.html": "sketch-a-streamlit-analytics-page-with-filters-before-the-data-arrives",
    "post8.html": "query-recent-telemetry-and-draw-plotly-views-without-overcomplicating-the-refresh-cycle",
    "post9.html": "switch-between-live-mode-batch-export-and-safe-shutdown-in-one-python-entry-file",
    "post10.html": "lay-out-a-traffic-intelligence-file-before-the-first-frame-arrives",
    "post11.html": "track-vehicles-frame-by-frame-and-paint-a-calm-overlay-in-pil",
    "post12.html": "persist-live-detections-and-roll-them-into-an-hourly-mart",
    "post13.html": "start-the-workers-once-and-cache-the-first-history-pull",
    "post14.html": "filter-a-streamlit-traffic-dashboard-without-turning-the-layout-into-glue",
    "post15.html": "validate-a-forecasting-loop-and-surface-dispatcher-warnings-without-noise"
  };

  var CLEAN_POST_PATHS = {};
  var POST_IDS_BY_SLUG = {};
  var LEGACY_ROUTE_PATTERN = /(["'])(\.?\/?(?:index|about|contactus|login|register|post\d+)\.html(?:[?#][^"']*)?)\1/g;

  Object.keys(LEGACY_POST_SLUGS).forEach(function (legacyId) {
    var slug = LEGACY_POST_SLUGS[legacyId];
    var cleanPath = "/blogs/" + slug + "/";
    CLEAN_POST_PATHS[legacyId] = cleanPath;
    POST_IDS_BY_SLUG[slug] = legacyId;
  });

  function isHttpRuntime() {
    return typeof window !== "undefined" && /^https?:$/i.test(window.location.protocol || "");
  }

  function stripOrigin(value) {
    if (typeof value !== "string" || !value) {
      return "";
    }

    if (typeof window === "undefined" || !window.location || !window.location.origin) {
      return value;
    }

    if (value.indexOf(window.location.origin) === 0) {
      return value.slice(window.location.origin.length);
    }

    return value;
  }

  function normalizeRouteInput(value) {
    var normalized = stripOrigin(value || "");

    normalized = normalized.replace(/\\/g, "/");
    normalized = normalized.replace(/^\.\/+/, "");
    normalized = normalized.replace(/^\/+/, "");

    return normalized;
  }

  function splitPathAndSuffix(value) {
    var queryIndex = value.indexOf("?");
    var hashIndex = value.indexOf("#");
    var cutIndex = -1;

    if (queryIndex !== -1 && hashIndex !== -1) {
      cutIndex = Math.min(queryIndex, hashIndex);
    } else if (queryIndex !== -1) {
      cutIndex = queryIndex;
    } else if (hashIndex !== -1) {
      cutIndex = hashIndex;
    }

    if (cutIndex === -1) {
      return {
        path: value,
        suffix: ""
      };
    }

    return {
      path: value.slice(0, cutIndex),
      suffix: value.slice(cutIndex)
    };
  }

  function getCleanPath(rawValue) {
    var normalized = normalizeRouteInput(rawValue);
    var parts = splitPathAndSuffix(normalized);
    var path = parts.path;
    var suffix = parts.suffix;

    if (!path && suffix) {
      return "/" + suffix;
    }

    if (!path) {
      return "/";
    }

    if (LEGACY_STATIC_ROUTES[path]) {
      return LEGACY_STATIC_ROUTES[path] + suffix;
    }

    if (CLEAN_POST_PATHS[path]) {
      return CLEAN_POST_PATHS[path] + suffix;
    }

    if (
      path === "about" ||
      path === "about/" ||
      path === "contact" ||
      path === "contact/" ||
      path === "login" ||
      path === "login/" ||
      path === "register" ||
      path === "register/" ||
      path === "blogs" ||
      path === "blogs/"
    ) {
      return "/" + path.replace(/\/?$/, "/") + suffix;
    }

    if (path === "404" || path === "404/") {
      return "/404.html" + suffix;
    }

    if (path.indexOf("blogs/") === 0) {
      return "/" + path.replace(/\/?$/, "/") + suffix;
    }

    return null;
  }

  function getPostPath(legacyId) {
    return CLEAN_POST_PATHS[legacyId] || legacyId;
  }

  function getLegacyPostIdFromPath(pathname) {
    var normalized = normalizeRouteInput(pathname || "");
    var parts = splitPathAndSuffix(normalized);
    var path = parts.path.replace(/\/+$/, "");

    if (path.indexOf("blogs/") === 0 && /\/index\.html$/i.test(path)) {
      var nestedSlug = path.replace(/^blogs\//, "").replace(/\/index\.html$/i, "");
      return POST_IDS_BY_SLUG[nestedSlug] || null;
    }

    if (path.indexOf("blogs/") === 0) {
      var slug = path.slice("blogs/".length);
      return POST_IDS_BY_SLUG[slug] || null;
    }

    if (/^post\d+\.html$/i.test(path)) {
      return path;
    }

    return null;
  }

  function getCleanPathForCurrentLocation() {
    if (typeof window === "undefined" || !window.location) {
      return null;
    }

    var pathname = window.location.pathname || "/";
    var normalized = pathname.replace(/\\/g, "/");
    var lowerCasePath = normalized.toLowerCase();
    var query = window.location.search || "";
    var hash = window.location.hash || "";

    if (lowerCasePath === "/") {
      return "/" + query + hash;
    }

    if (lowerCasePath === "/about/" || lowerCasePath === "/contact/" || lowerCasePath === "/login/" || lowerCasePath === "/register/") {
      return lowerCasePath + query + hash;
    }

    if (lowerCasePath === "/404.html") {
      return "/404.html" + query + hash;
    }

    if (/^\/blogs\/[^/]+\/$/i.test(lowerCasePath)) {
      return lowerCasePath + query + hash;
    }

    if (lowerCasePath === "/index.html") {
      return "/" + query + hash;
    }

    if (lowerCasePath === "/about.html") {
      return "/about/" + query + hash;
    }

    if (lowerCasePath === "/contactus.html") {
      return "/contact/" + query + hash;
    }

    if (lowerCasePath === "/login.html") {
      return "/login/" + query + hash;
    }

    if (lowerCasePath === "/register.html") {
      return "/register/" + query + hash;
    }

    if (lowerCasePath === "/404/index.html") {
      return "/404.html" + query + hash;
    }

    if (lowerCasePath === "/about/index.html") {
      return "/about/" + query + hash;
    }

    if (lowerCasePath === "/contact/index.html") {
      return "/contact/" + query + hash;
    }

    if (lowerCasePath === "/login/index.html") {
      return "/login/" + query + hash;
    }

    if (lowerCasePath === "/register/index.html") {
      return "/register/" + query + hash;
    }

    var legacyPostId = getLegacyPostIdFromPath(normalized);
    if (legacyPostId && CLEAN_POST_PATHS[legacyPostId]) {
      return CLEAN_POST_PATHS[legacyPostId] + query + hash;
    }

    if (/^\/blogs\/[^/]+\/index\.html$/i.test(lowerCasePath)) {
      return lowerCasePath.replace(/index\.html$/i, "") + query + hash;
    }

    return null;
  }

  function rewriteAttributeValue(value) {
    var cleanPath = getCleanPath(value);
    if (!cleanPath || !isHttpRuntime()) {
      return value;
    }
    return cleanPath;
  }

  function rewriteLegacyLinks(root) {
    if (!root || !isHttpRuntime()) {
      return;
    }

    Array.prototype.forEach.call(root.querySelectorAll("a[href]"), function (anchor) {
      var href = anchor.getAttribute("href");
      if (!href || /^(?:[a-z]+:|\/\/|#)/i.test(href)) {
        return;
      }

      var replacement = getCleanPath(href);
      if (replacement) {
        anchor.setAttribute("href", replacement);
      }
    });
  }

  function rewriteHtmlReferences(html) {
    if (typeof html !== "string") {
      return html;
    }

    return html.replace(LEGACY_ROUTE_PATTERN, function (match, quote, rawValue) {
      var replacement = getCleanPath(rawValue);
      if (!replacement) {
        return match;
      }

      return quote + replacement + quote;
    });
  }

  function toAbsoluteUrl(path) {
    if (!path) {
      return path;
    }

    if (!isHttpRuntime()) {
      return path;
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return window.location.origin + path;
  }

  function updateMetaTags() {
    if (typeof document === "undefined") {
      return;
    }

    var cleanPath = getCleanPathForCurrentLocation();
    if (!cleanPath) {
      return;
    }

    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute("href", cleanPath);
    }

    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute("content", toAbsoluteUrl(cleanPath));
    }
  }

  function redirectLegacyPath() {
    if (!isHttpRuntime()) {
      return;
    }

    var cleanPath = getCleanPathForCurrentLocation();
    if (!cleanPath) {
      return;
    }

    var current = (window.location.pathname || "/") + (window.location.search || "") + (window.location.hash || "");
    if (current !== cleanPath) {
      window.location.replace(cleanPath);
    }
  }

  window.SITE_ROUTES = {
    cleanPosts: CLEAN_POST_PATHS,
    cleanStatic: LEGACY_STATIC_ROUTES,
    getCleanPath: getCleanPath,
    getCleanPathForCurrentLocation: getCleanPathForCurrentLocation,
    getLegacyPostIdFromPath: getLegacyPostIdFromPath,
    getPostPath: getPostPath,
    isHttpRuntime: isHttpRuntime,
    rewriteHtmlReferences: rewriteHtmlReferences,
    rewriteLegacyLinks: rewriteLegacyLinks,
    toAbsoluteUrl: toAbsoluteUrl,
    updateMetaTags: updateMetaTags
  };

  redirectLegacyPath();

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      rewriteLegacyLinks(document);
      updateMetaTags();
    });
  }
})();
