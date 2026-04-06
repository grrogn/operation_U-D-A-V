const fs = require("fs");
const vm = require("vm");

const INDEX_PATH = "index.html";
const POSTS_DATA_PATH = "posts-data.js";
const POST_TEMPLATE_PATH = "post-template.js";

const LEGACY_POST_SLUGS = {
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
  "post15.html": "validate-a-forecasting-loop-and-surface-dispatcher-warnings-without-noise",
};

const POST_STYLE_OVERRIDES = [
  '<style id="post-template-overrides">',
  "#content-wrapper{margin:0 auto;}",
  "#main-wrapper .item-post-wrap{margin-top:18px;}",
  "#sidebar-wrapper .theiaStickySidebar{margin-top:18px;}",
  "#main-wrapper .post-body > .tr-caption-container{display:table;width:100% !important;max-width:100%;margin:0 0 24px !important;}",
  "#main-wrapper .post-body > .tr-caption-container tbody,#main-wrapper .post-body > .tr-caption-container tr,#main-wrapper .post-body > .tr-caption-container td{display:block;width:100% !important;}",
  "#main-wrapper .post-body > .tr-caption-container img{display:block;width:100% !important;height:auto;margin:0;}",
  "#main-wrapper .tr-caption-container tr:last-child,#main-wrapper .tr-caption-container .tr-caption{display:none;}",
  "#footer-wrapper .primary-footer .container{display:flex;align-items:center;justify-content:space-between;gap:25px;}",
  "#footer-about-area{float:none;width:auto;flex:1 1 auto;padding:0;}",
  "#footer-about-area .widget{float:none;display:flex;align-items:center;gap:20px;width:100%;}",
  "#footer-about-area .footer-logo{float:none;display:block;padding:0;margin:0;flex:0 0 auto;}",
  "#footer-about-area .Image .image-caption,#footer-about-area .image-caption{display:block;flex:1 1 auto;min-height:0;margin:0;}",
  ".foot-bar-social{float:none;width:auto;flex:0 0 auto;}",
  ".foot-bar-social .widget-content{display:flex;justify-content:flex-end;}",
  "#footer-wrapper > .container.row:last-child{display:flex;align-items:center;justify-content:flex-end;padding:7px 0;}",
  "#menu-footer{float:none;height:34px;min-height:34px;max-height:34px;padding:0;margin:0 0 0 auto;}",
  "#menu-footer .widget,#menu-footer .widget-content{background:transparent;border:none;box-shadow:none;padding:0;margin:0;}",
  "#menu-footer ul{display:flex;align-items:center;justify-content:flex-end;gap:5px;margin:0;padding:0;height:34px;line-height:34px;}",
  "#menu-footer ul li{float:none;display:flex;align-items:center;height:34px;line-height:34px;margin:0;padding:0;}",
  "#menu-footer ul li a{display:inline-flex;align-items:center;justify-content:center;height:34px;line-height:34px;padding:0 10px;margin:0 !important;}",
  "#menu-footer ul li:last-child a{padding-right:10px;}",
  "#menu-footer #theme-toggle{width:34px;min-width:34px;padding:0 !important;}",
  "#menu-footer #theme-toggle i{display:inline-flex;align-items:center;justify-content:center;width:14px;}",
  "body.dark-theme #footer-wrapper > .container.row:last-child{display:flex;align-items:center;justify-content:flex-end;padding:7px 0 !important;}",
  "body.dark-theme #menu-footer{margin:0 0 0 auto !important;}",
  "body.dark-theme #menu-footer ul{display:flex !important;align-items:center !important;justify-content:flex-end !important;gap:5px !important;}",
  "body.dark-theme #menu-footer ul li{display:flex !important;align-items:center !important;}",
  "body.dark-theme #menu-footer ul li a{display:inline-flex !important;align-items:center !important;justify-content:center !important;margin:0 !important;padding:0 10px !important;}",
  "body.dark-theme #menu-footer ul li:last-child a{padding-right:10px !important;}",
  "body.dark-theme #menu-footer #theme-toggle{width:34px !important;min-width:34px !important;padding:0 !important;}",
  "@media screen and (max-width:980px){",
  "#footer-wrapper .primary-footer .container{display:block;}",
  "#footer-about-area{width:100%;text-align:center;}",
  "#footer-about-area .widget{display:block;}",
  "#footer-about-area .footer-logo{display:inline-block;}",
  "#footer-about-area .Image .image-caption,#footer-about-area .image-caption{text-align:center;margin-top:10px;}",
  ".foot-bar-social{width:100%;margin-top:18px;}",
  ".foot-bar-social .widget-content{justify-content:center;}",
  "#footer-wrapper > .container.row:last-child{display:block;padding:7px 0 12px;text-align:center;}",
  "#menu-footer{width:100%;height:auto;min-height:0;max-height:none;margin:10px 0 0;}",
  "#menu-footer ul{justify-content:center;flex-wrap:wrap;height:auto;line-height:inherit;}",
  "#menu-footer ul li{height:auto;line-height:inherit;}",
  "#menu-footer ul li a{height:auto;line-height:inherit;margin:0 3px 5px;}",
  "body.dark-theme #footer-wrapper > .container.row:last-child{display:block;padding:7px 0 12px !important;text-align:center;}",
  "body.dark-theme #menu-footer{width:100%;margin:10px 0 0 !important;}",
  "body.dark-theme #menu-footer ul{justify-content:center !important;flex-wrap:wrap !important;height:auto !important;line-height:inherit !important;}",
  "body.dark-theme #menu-footer ul li{height:auto !important;line-height:inherit !important;}",
  "body.dark-theme #menu-footer ul li a{height:auto !important;line-height:inherit !important;margin:0 3px 5px !important;}",
  "}",
  "</style>",
].join("\n");

function loadWindowValue(filePath, key) {
  const context = { window: {} };
  context.window = context;
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), context, {
    filename: filePath,
  });
  return context[key] || context.window[key];
}

function replaceAll(source, token, value) {
  return source.split(token).join(value);
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function requireMatch(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Unable to extract ${label} from ${INDEX_PATH}`);
  }
  return match[0];
}

function ensureDir(path) {
  fs.mkdirSync(path, { recursive: true });
}

function buildSharedBlocks(indexHtml) {
  const header = requireMatch(
    indexHtml,
    /<div id="header-wrap">[\s\S]*?<div class="clearfix"><\/div>/,
    "header"
  );
  const sidebarWithFooterMarker = requireMatch(
    indexHtml,
    /<div id="sidebar-wrapper"[\s\S]*?<div class="clearfix"><\/div>\s*<!-- Footer Wrapper -->/,
    "sidebar"
  );
  const footer = requireMatch(
    indexHtml,
    /<!-- Footer Wrapper -->[\s\S]*?(?=<!-- Main Scripts -->)/,
    "footer"
  );

  return {
    header,
    sidebar: sidebarWithFooterMarker.replace(/\s*<!-- Footer Wrapper -->$/, ""),
    footer,
  };
}

function compilePost(template, post, slug, sharedBlocks) {
  let html = "<!DOCTYPE html>\n" + template;

  html = replaceAll(html, "__PAGE_TITLE__", post.pageTitle);
  html = replaceAll(html, "__CANONICAL__", `/blogs/${slug}/`);
  html = replaceAll(html, "__COMMENTS_FEED__", post.commentsFeed);
  html = replaceAll(html, "__IMAGE_SRC__", post.imageSrc);
  html = replaceAll(html, "__OG_URL__", `/blogs/${slug}/`);
  html = replaceAll(html, "__OG_TITLE__", post.ogTitle);
  html = replaceAll(html, "__OG_DESCRIPTION__", post.ogDescription);
  html = replaceAll(html, "__OG_IMAGE__", post.ogImage);
  html = replaceAll(html, "__ARTICLE_HTML__", post.articleHtml);
  html = replaceAll(html, "`n", "\n");

  html = html.replace(
    /<meta content="text\/html; charset=UTF-8" http-equiv="Content-Type">/,
    '$&\n<base href="../../">\n<script src="site-routes.js"></script>'
  );

  if (!html.includes('dark-theme.css?v=36')) {
    html = html.replace(
      '<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">',
      '<link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">\n<link href="dark-theme.css?v=36" rel="stylesheet" type="text/css">'
    );
  }

  html = html.replace("</head>", `${POST_STYLE_OVERRIDES}\n</head>`);

  html = html.replace(
    /<div id="header-wrap">[\s\S]*?<div class="clearfix"><\/div>/,
    sharedBlocks.header
  );
  html = html.replace(
    /<div id="sidebar-wrapper"[\s\S]*?<div class="clearfix"><\/div>\s*<!-- Footer Wrapper -->/,
    `${sharedBlocks.sidebar}\n<div class="clearfix"></div>\n<!-- Footer Wrapper -->`
  );
  html = html.replace(
    /<!-- Footer Wrapper -->[\s\S]*?(?=<!-- Main Scripts -->)/,
    sharedBlocks.footer
  );

  html = html.replace(
    '<script src="post-search.js"></script>',
    '<script src="post-search.js"></script>\n<script src="theme-toggle.js"></script>'
  );
  html = html.replace(
    "</body>",
    '<script src="post-code-theme.js"></script>\n</body>'
  );

  return html;
}

function main() {
  console.log("Loading source files...");

  const posts = loadWindowValue(POSTS_DATA_PATH, "POSTS_DATA");
  const template = loadWindowValue(POST_TEMPLATE_PATH, "POST_TEMPLATE");
  const indexHtml = readUtf8(INDEX_PATH);
  const sharedBlocks = buildSharedBlocks(indexHtml);

  console.log(`Found ${Object.keys(posts).length} posts in ${POSTS_DATA_PATH}`);

  let compiled = 0;
  Object.keys(LEGACY_POST_SLUGS).forEach((fileName) => {
    const slug = LEGACY_POST_SLUGS[fileName];
    const post = posts[fileName];

    if (!post) {
      throw new Error(`Missing ${fileName} in ${POSTS_DATA_PATH}`);
    }

    const outputDir = `blogs/${slug}`;
    const outputPath = `${outputDir}/index.html`;

    ensureDir(outputDir);
    const html = compilePost(template, post, slug, sharedBlocks);
    fs.writeFileSync(outputPath, html, "utf8");

    console.log(`✓ ${fileName} -> ${outputPath}`);
    compiled += 1;
  });

  console.log(`\n✓ Done. Compiled ${compiled} static blog posts.`);
}

main();
