const fs = require('fs');

console.log('Loading posts data...');

// Read posts-data.js and extract the data
const postsDataContent = fs.readFileSync('posts-data.js', 'utf8');
const postsMatch = postsDataContent.match(/window\.POSTS_DATA\s*=\s*(\{[\s\S]*\});/);

if (!postsMatch) {
  console.error('Could not parse posts data');
  process.exit(1);
}

const posts = eval('(' + postsMatch[1] + ')');
console.log(`Found ${Object.keys(posts).length} posts`);

// Read template
const templateContent = fs.readFileSync('post-template.js', 'utf8');
const templateMatch = templateContent.match(/window\.POST_TEMPLATE\s*=\s*"([\s\S]*)";/);

if (!templateMatch) {
  console.error('Could not parse template');
  process.exit(1);
}

// Unescape the template - remove backslashes before quotes
const template = templateMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
console.log(`Template loaded (${template.length} chars)`);

// Route mappings
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
  "post15.html": "validate-a-forecasting-loop-and-surface-dispatcher-warnings-without-noise"
};

function replaceAll(source, token, value) {
  return source.split(token).join(value);
}

// Compile each post
let compiled = 0;
Object.keys(posts).forEach(fileName => {
  const post = posts[fileName];
  const slug = LEGACY_POST_SLUGS[fileName];
  
  if (!slug) {
    console.log(`⊘ Skipping ${fileName} - no slug mapping`);
    return;
  }
  
  let html = '<!DOCTYPE html>\n' + template;
  
  // Replace placeholders
  html = replaceAll(html, '__PAGE_TITLE__', post.pageTitle);
  html = replaceAll(html, '__CANONICAL__', `/blogs/${slug}/`);
  html = replaceAll(html, '__COMMENTS_FEED__', post.commentsFeed);
  html = replaceAll(html, '__IMAGE_SRC__', post.imageSrc);
  html = replaceAll(html, '__OG_URL__', `/blogs/${slug}/`);
  html = replaceAll(html, '__OG_TITLE__', post.ogTitle);
  html = replaceAll(html, '__OG_DESCRIPTION__', post.ogDescription);
  html = replaceAll(html, '__OG_IMAGE__', post.ogImage);
  html = replaceAll(html, '__ARTICLE_HTML__', post.articleHtml);
  
  // Write to the blog directory
  const outputPath = `blogs/${slug}/index.html`;
  try {
    fs.writeFileSync(outputPath, html, 'utf8');
    console.log(`✓ ${fileName} -> ${outputPath}`);
    compiled++;
  } catch (err) {
    console.error(`✗ Failed to write ${outputPath}:`, err.message);
  }
});

console.log(`\n✓ Done! Compiled ${compiled} posts to static HTML.`);
