(function () {
  function replaceAll(source, token, value) {
    return source.split(token).join(value);
  }

  function getCurrentFileName() {
    var pathname = window.location.pathname || '';
    var normalized = pathname.replace(/\\/g, '/');
    var fileName = normalized.split('/').pop();

    if (!fileName) {
      fileName = 'post1.html';
    }

    return decodeURIComponent(fileName);
  }

  function renderPost() {
    var fileName = getCurrentFileName();
    var posts = window.POSTS_DATA || {};
    var template = window.POST_TEMPLATE;
    var post = posts[fileName];

    if (!template || !post) {
      document.open();
      document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Post not found</title></head><body><p>Unable to load the requested article.</p></body></html>');
      document.close();
      return;
    }

    var html = template;

    html = replaceAll(html, '__PAGE_TITLE__', post.pageTitle);
    html = replaceAll(html, '__CANONICAL__', post.canonical);
    html = replaceAll(html, '__COMMENTS_FEED__', post.commentsFeed);
    html = replaceAll(html, '__IMAGE_SRC__', post.imageSrc);
    html = replaceAll(html, '__OG_URL__', post.ogUrl);
    html = replaceAll(html, '__OG_TITLE__', post.ogTitle);
    html = replaceAll(html, '__OG_DESCRIPTION__', post.ogDescription);
    html = replaceAll(html, '__OG_IMAGE__', post.ogImage);
    html = replaceAll(html, '__ARTICLE_HTML__', post.articleHtml);
    html = replaceAll(html, '`n', '\n');
    html = replaceAll(html, '</body>', '<script src="post-code-theme.js"></script></body>');

    document.open();
    document.write(html);
    document.close();
  }

  renderPost();
})();
