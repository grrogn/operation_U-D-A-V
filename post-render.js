(function () {
  var routeTools = window.SITE_ROUTES || {};
  var HEADER_LOGO_URL =
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhhTQYRE8H5fUkmMT17hRa2gfoFZIUWtJh08yFyhwrogJ1d4EgpgVu1fX4CCEAvKbBzcUDRigfteKq1sXYVa9oxLY8bLQ_UFDfoXpHcIth5VVIgsJrKuVGV3cn4T5MrXDmlYqyFDU3GNmMt/s1600/Kate-logo.png';
  var FOOTER_LOGO_URL =
    'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhDG_g30ix5KPdrrpKrnQLcsu7ZleO6gvu2HoEyFZhaTK9qyPuVWhle65TOiVJWdX-8h-IiiA0usmMao8k9WPtLMjuU__kTY8wqEljVzAOA3pPBD_KntWv30BueePB6Ig7vEMgFoe5lIIbi/';
  var HEADER_LOGO_LOCAL_URL = 'Kate-logo.png';
  var FOOTER_LOGO_LOCAL_URL = 'Kate-logo-White.png';
  var SIDEBAR_VIDEO_OLD_URL = 'https://www.youtube.com/embed/gmhw5XzNOuo';
  var SIDEBAR_VIDEO_LOCAL_URL = 'https://www.youtube.com/watch?v=apA-O6Qh6hs';
  var DATE_OVERRIDES = {
    'post1.html': {
      publishedOld: '2016-03-17T00:56:00-07:00',
      modifiedOld: '2021-10-28T09:29:22-07:00',
      publishedNew: '2024-01-18T09:20:00+03:00',
      displayOld: 'March 17, 2016',
      displayNew: 'January 18, 2024'
    },
    'post2.html': {
      publishedOld: '2016-03-17T00:42:00-07:00',
      modifiedOld: '2021-10-28T09:29:22-07:00',
      publishedNew: '2024-04-29T14:05:00+03:00',
      displayOld: 'March 17, 2016',
      displayNew: 'April 29, 2024'
    }
  };
  var POPULAR_POSTS_WIDGET = [
    '<div class="widget PopularPosts" data-version="2" id="PopularPosts1">',
    '<div class="widget-title">',
    '<h3 class="title">',
    'Popular Posts',
    '</h3>',
    '</div>',
    '<div class="widget-content">',
    '<div class="post">',
    '<div class="post-content">',
    '<a class="post-image-link" href="post9.html">',
    '<img alt="Switch Between Live Mode, Batch Export, and Safe Shutdown in One Python Entry File" class="post-thumb lazy-yard" src="./api.jpg">',
    '</a>',
    '<div class="post-info">',
    '<h2 class="post-title">',
    '<a href="post9.html">Switch Between Live Mode, Batch Export, and Safe Shutdown in One Python Entry File</a>',
    '</h2>',
    '</div>',
    '</div>',
    '</div>',
    '<div class="post">',
    '<div class="post-content">',
    '<a class="post-image-link" href="post8.html">',
    '<img alt="Query Recent Telemetry and Draw Plotly Views Without Overcomplicating the Refresh Cycle" class="post-thumb lazy-yard" src="./photo_7.jpg">',
    '</a>',
    '<div class="post-info">',
    '<h2 class="post-title">',
    '<a href="post8.html">Query Recent Telemetry and Draw Plotly Views Without Overcomplicating the Refresh Cycle</a>',
    '</h2>',
    '</div>',
    '</div>',
    '</div>',
    '<div class="post">',
    '<div class="post-content">',
    '<a class="post-image-link" href="post7.html">',
    '<img alt="Sketch a Streamlit Analytics Page With Filters Before the Data Arrives" class="post-thumb lazy-yard" src="./photo_4.jpg">',
    '</a>',
    '<div class="post-info">',
    '<h2 class="post-title">',
    '<a href="post7.html">Sketch a Streamlit Analytics Page With Filters Before the Data Arrives</a>',
    '</h2>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</div>'
  ].join('\n');
  var POPULAR_POSTS_PATTERN =
    /<div class="widget PopularPosts" data-version="2" id="PopularPosts1">[\s\S]*?<\/div>\s*<\/div>\s*<div class="widget HTML" data-version="2" id="HTML1">/;
  var FOOTER_SOCIAL_WIDGET = [
    '<div class="foot-bar-social social social-color section" id="foot-bar-social" name="Social Footer"><div class="widget LinkList" data-version="2" id="LinkList78">',
    '<div class="widget-content">',
    '<ul>',
    '<li class="facebook"><a href="https://www.facebook.com/katestudiopro/" target="_blank" title="facebook"></a></li>',
    '<li class="twitter"><a href="https://twitter.com/katestudio" target="_blank" title="twitter"></a></li>',
    '<li class="instagram"><a href="https://www.instagram.com/katestudio/" target="_blank" title="instagram"></a></li>',
    '<li class="youtube"><a href="https://www.youtube.com/@ThePythonDude" target="_blank" title="youtube"></a></li>',
    '<li class="linkedin"><a href="https://hr.linkedin.com/katestudio/" target="_blank" title="linkedin"></a></li>',
    '</ul>',
    '</div>',
    '</div></div>'
  ].join('\n');
  var FOOTER_SOCIAL_PATTERN =
    /<div class="foot-bar-social social social-color section" id="foot-bar-social" name="Social Footer"><div class="widget LinkList" data-version="2" id="LinkList78">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  var FOOTER_COPY_OLD =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s.';
  var FOOTER_COPY_NEW = 'Notes on software, systems and IT work.';
  var POST_TEMPLATE_OVERRIDES = [
    '<style id="post-template-overrides">',
    '#content-wrapper{margin:0 auto 0;}',
    '</style>'
  ].join('\n');

  function replaceAll(source, token, value) {
    return source.split(token).join(value);
  }

  function getCurrentFileName() {
    if (routeTools.getLegacyPostIdFromPath) {
      var routedPostId = routeTools.getLegacyPostIdFromPath(window.location.pathname || '');
      if (routedPostId) {
        return routedPostId;
      }
    }

    var pathname = window.location.pathname || '';
    var normalized = pathname.replace(/\\/g, '/');
    var fileName = normalized.split('/').pop();

    if (!fileName) {
      fileName = 'post1.html';
    }

    return decodeURIComponent(fileName);
  }

  function normalizeTemplateAssets(html, fileName) {
    var override = DATE_OVERRIDES[fileName];
    html = replaceAll(html, HEADER_LOGO_URL, HEADER_LOGO_LOCAL_URL);
    html = replaceAll(html, FOOTER_LOGO_URL, FOOTER_LOGO_LOCAL_URL);
    html = replaceAll(html, SIDEBAR_VIDEO_OLD_URL, SIDEBAR_VIDEO_LOCAL_URL);
    html = replaceAll(html, FOOTER_COPY_OLD, FOOTER_COPY_NEW);
    html = replaceAll(html, '</head>', POST_TEMPLATE_OVERRIDES + '\n</head>');
    html = html.replace(
      POPULAR_POSTS_PATTERN,
      POPULAR_POSTS_WIDGET + '\n</div><div class="widget HTML" data-version="2" id="HTML1">'
    );
    html = html.replace(FOOTER_SOCIAL_PATTERN, FOOTER_SOCIAL_WIDGET);
    if (override) {
      html = replaceAll(html, override.publishedOld, override.publishedNew);
      html = replaceAll(html, override.modifiedOld, override.publishedNew);
      html = replaceAll(html, override.displayOld, override.displayNew);
    }
    return html;
  }

  function renderPost() {
    var fileName = getCurrentFileName();
    var posts = window.POSTS_DATA || {};
    var template = window.POST_TEMPLATE;
    var post = posts[fileName];
    var cleanPath = routeTools.getPostPath ? routeTools.getPostPath(fileName) : fileName;
    var absoluteCleanPath = routeTools.toAbsoluteUrl ? routeTools.toAbsoluteUrl(cleanPath) : cleanPath;

    if (!template || !post) {
      document.open();
      document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Post not found</title></head><body><p>Unable to load the requested article.</p></body></html>');
      document.close();
      return;
    }

    var html = template;

    html = replaceAll(html, '__PAGE_TITLE__', post.pageTitle);
    html = replaceAll(html, '__CANONICAL__', cleanPath || post.canonical);
    html = replaceAll(html, '__COMMENTS_FEED__', post.commentsFeed);
    html = replaceAll(html, '__IMAGE_SRC__', post.imageSrc);
    html = replaceAll(html, '__OG_URL__', absoluteCleanPath || post.ogUrl);
    html = replaceAll(html, '__OG_TITLE__', post.ogTitle);
    html = replaceAll(html, '__OG_DESCRIPTION__', post.ogDescription);
    html = replaceAll(html, '__OG_IMAGE__', post.ogImage);
    html = replaceAll(html, '__ARTICLE_HTML__', post.articleHtml);
    html = replaceAll(html, '`n', '\n');
    html = replaceAll(html, '<script src="post-search.js"></script>', '<script src="site-routes.js"></script>\n<script src="post-search.js"></script>');
    html = normalizeTemplateAssets(html, fileName);
    if (routeTools.rewriteHtmlReferences) {
      html = routeTools.rewriteHtmlReferences(html);
    }
    html = replaceAll(html, '</body>', '<script src="post-code-theme.js"></script></body>');

    document.open();
    document.write(html);
    document.close();
  }

  renderPost();
})();
