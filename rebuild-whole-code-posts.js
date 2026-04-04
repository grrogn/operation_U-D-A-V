const fs = require("fs");

const POSTS_PATH = "posts-data.js";
const SEARCH_PATH = "post-search.js";
const INDEX_PATH = "index.html";

const AUTHOR_AVATAR =
  "//blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGEyigbC_aEx_Xxmhi4rrzNna7RtI53QTClI6EOlp7qotFQfcEXdHXC__u4n5QGvhmWdA7IeGSqqufMF_Kn4X5lEtf4BR-LeEDn9ICx3S5qqo78-O9AQytTpyjxDS3IFU/w100/Sora+Blogging+Tips.jpg";

const BLOCK_STYLE_BY_VARIANT = {
  rose: [
    "background:#171117",
    "border:1px solid #6a5361",
    "color:#f0dee6",
    "padding:22px",
    "line-height:1.7",
    "border-radius:4px",
    "box-shadow:inset 0 0 0 1px rgba(193,141,169,.08)",
    "--code-base:#f0dee6",
    "--code-comment:#b694a3",
    "--code-keyword:#dfa8bd",
    "--code-string:#e9bfd0",
    "--code-number:#d6a7bf",
    "--code-function:#efc5d5",
    "--code-class:#f3d0de",
    "--code-builtin:#dba8c1",
    "--code-constant:#eed2de",
    "--code-decorator:#d79bb4",
    "--code-operator:#c7b1bc",
    "--code-identifier:#f0dee6",
  ].join(";"),
  plum: [
    "background:#15131a",
    "border:1px solid #595267",
    "color:#e9e1ef",
    "padding:22px",
    "line-height:1.7",
    "border-radius:4px",
    "box-shadow:inset 0 0 0 1px rgba(162,144,190,.08)",
    "--code-base:#e9e1ef",
    "--code-comment:#aba0b9",
    "--code-keyword:#caaad7",
    "--code-string:#dbc4e6",
    "--code-number:#c6b1d4",
    "--code-function:#e0cdec",
    "--code-class:#ead9f1",
    "--code-builtin:#cfbedf",
    "--code-constant:#e3d5eb",
    "--code-decorator:#b9a2cf",
    "--code-operator:#b8aebf",
    "--code-identifier:#e9e1ef",
  ].join(";"),
};

const INDEX_MARKER_START = "<!-- WHOLE-CODE-SERIES:START -->";
const INDEX_MARKER_END = "<!-- WHOLE-CODE-SERIES:END -->";

function readPosts() {
  const raw = fs.readFileSync(POSTS_PATH, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw.replace(/^window\.POSTS_DATA = /, "").replace(/;\s*$/, ""));
}

function writePosts(posts) {
  fs.writeFileSync(
    POSTS_PATH,
    `window.POSTS_DATA = ${JSON.stringify(posts, null, 4)};\n`,
    "utf8"
  );
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraph(text) {
  return `<p>${text}</p>`;
}

function heading(level, text) {
  return `<h${level}>${text}</h${level}>`;
}

function blockquote(text) {
  return `<blockquote class="tr_bq">${text}</blockquote>`;
}

function list(items, tagName = "ul") {
  return `<${tagName}>${items.map((item) => `<li>${item}</li>`).join("")}</${tagName}>`;
}

function table(headers, rows) {
  return [
    "<table>",
    "<thead>",
    "<tr>",
    headers.map((header) => `<th>${header}</th>`).join(""),
    "</tr>",
    "</thead>",
    "<tbody>",
    rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
      )
      .join(""),
    "</tbody>",
    "</table>",
  ].join("");
}

function cover(imageSrc, altText, captionText) {
  return `
<table align="center" cellpadding="0" cellspacing="0" class="tr-caption-container" style="margin-left:auto;margin-right:auto;">
<tbody>
<tr>
<td style="text-align:center;"><img alt="${altText}" border="0" src="${imageSrc}" title="${altText}"></td>
</tr>
<tr>
<td class="tr-caption">${captionText}</td>
</tr>
</tbody>
</table>`.trim();
}

function codeBlock(code, note, variant = "rose") {
  const style = BLOCK_STYLE_BY_VARIANT[variant] || BLOCK_STYLE_BY_VARIANT.rose;

  return `
<div class="is-dark">
<pre class="code-box" style="${style}">${escapeHtml(code.trim())}</pre>
</div>
<p style="margin-top:8px;margin-bottom:20px;color:#6f7f92;font-size:13px;">${note}</p>`.trim();
}

function readChunk(code) {
  return code
    .replace(/\r\n/g, "\n")
    .replace(/^\n/, "")
    .replace(/\n\s*$/, "");
}

function navItem(type, href, title) {
  const label = type === "next" ? "Newer" : "Older";
  const className = type === "next" ? "post-next" : "post-prev";
  const linkClass = type === "next" ? "next-post-link" : "prev-post-link";
  const rel = type === "next" ? "next" : "previous";
  const defaultTitle = type === "next" ? "Back to the main feed" : "Back to the main feed";

  return `
<li class="${className}">
<a class="${linkClass}" href="${href}" id="Blog1_blog-pager-${type === "next" ? "newer" : "older"}-link" rel="${rel}">
<div class="post-nav-inner"><span>${label}</span><p>
${title || defaultTitle}
</p></div>
</a>
</li>`.trim();
}

function relatedList(configs, assets, keys) {
  return keys
    .map((key) => {
      const image = assets[key].imageSrc;
      return `<li class="related-item"><a class="post-image-link" href="${key}"><img class="post-thumb lazy-yard" alt="" src="${image}"></a><h2 class="post-title"><a href="${key}">${configs[key].title}</a></h2></li>`;
    })
    .join("");
}

function footerHtml(currentKey, config, configs, assets) {
  return `
<div class="post-labels">
<div class="label-head Label">
<a class="label-link" href="index.html" rel="tag">${config.label}</a>
</div>
</div>
</div>
<div class="post-footer">
<ul class="post-nav">
${navItem("next", config.next.href, config.next.title)}
${navItem("prev", config.prev.href, config.prev.title)}
</ul>
<div class="about-author">
<div class="avatar-container">
<img alt="Kate Studio" class="author-avatar" src="${AUTHOR_AVATAR}">
</div>
<h3 class="author-name">
<span>Posted by</span><a alt="Kate Studio" href="about.html">
Kate Studio</a>
</h3>
<span class="author-description">Short technical stories about automation, observability and everyday Python tooling.</span>
</div>
<div id="related-wrap">
<div class="title-wrap">
<h3>You may like these posts</h3>
</div>
<div class="related-ready"><ul class="related-posts">${relatedList(configs, assets, config.related)}</ul></div>
</div>
</div>
</div>
</div>
</div></div></div></div>`.trim();
}

function articleHtml(key, config, assets, configs) {
  const parts = [
    cover(assets[key].imageSrc, config.coverAlt, config.coverCaption),
    ...config.body,
  ].join("\n");

  return `
<script type="application/ld+json">{
  "@context": "http://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "${key}"
  },
  "headline": "${config.title}","description": "${config.description}","datePublished": "${config.date}",
  "dateModified": "${config.date}","image": {
    "@type": "ImageObject","url": "${assets[key].ogImage}",
    "height": 630,
    "width": 1200},"publisher": {
      "@type": "Organization",
      "name": "Kate Studio",
      "logo": {
        "@type": "ImageObject",
        "url": "https://lh3.googleusercontent.com/ULB6iBuCeTVvSjjjU1A-O8e9ZpVba6uvyhtiWRti_rBAs9yMYOFBujxriJRZ-A=h60",
        "width": 206,
        "height": 60
      }
    },"author": {
      "@type": "Person",
      "name": "Kate Studio"
    }
}</script>
<nav id="breadcrumb"><a href="index.html">Home</a><em class="delimiter"></em><a class="b-label" href="index.html">${config.label}</a><em class="delimiter"></em><span class="current">${config.title}</span></nav>
<script type="application/ld+json">
              {
                "@context": "http://schema.org",
                "@type": "BreadcrumbList",
                "@id": "#Breadcrumb",
                "itemListElement": [{
                  "@type": "ListItem",
                  "position": 1,
                  "item": {
                    "name": "Home",
                    "@id": "index.html"
                  }
                },{
                  "@type": "ListItem",
                  "position": 2,
                  "item": {
                    "name": "${config.label}",
                    "@id": "index.html"
                  }
                },{
                  "@type": "ListItem",
                  "position": 3,
                  "item": {
                    "name": "${config.title}",
                    "@id": "${key}"
                  }
                }]
              }
            </script>
<h1 class="post-title">
${config.title}
</h1>
<div class="post-meta">
<span class="post-author"><a href="about.html" title="Kate Studio">Kate Studio</a></span>
<span class="post-date published" datetime="${config.date}">${config.displayDate}</span>
</div>
<div class="post-body post-content" id="post-body">
${parts}
</div>
${footerHtml(key, config, configs, assets)}`.trim();
}

const chunks = {
  one: readChunk(`
import cv2
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import psycopg2
from datetime import datetime
import streamlit as st
import pandas as pd
import plotly.express as px
import threading
import time
import plotly.graph_objects as go
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

MODEL_CHECKPOINT = "yolov8x.pt"
DATABASE_SETTINGS = {
    "dbname": "NewDataHelp",
    "user": "postgres",
    "password": "admin",
    "host": "localhost",
    "port": "5432",
}
  `),
  two: readChunk(`
def read_frame_or_restart(capture):
    ok, frame = capture.read()
    if not ok:
        capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
        return None
    return frame
  `),
  three: readChunk(`
def detect_and_annotate(frame, detector, last_y_by_track, ui_font):
    tracked = detector.track(
        frame,
        persist=True,
        classes=[2, 5, 7],
        conf=0.3,
        iou=0.5,
        imgsz=1280,
        verbose=False,
    )
    rows_to_store = []

    if tracked[0].boxes.id is not None:
        corners = tracked[0].boxes.xyxy.int().cpu().numpy()
        track_ids = tracked[0].boxes.id.int().cpu().tolist()
        class_ids = tracked[0].boxes.cls.int().cpu().tolist()
        centers = tracked[0].boxes.xywh.cpu().numpy()
        canvas = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        painter = ImageDraw.Draw(canvas)
  `),
  four: readChunk(`
        for corner, object_id, class_id, center in zip(corners, track_ids, class_ids, centers):
            left, top = corner[0], corner[1]
            center_x, center_y = int(center[0]), int(center[1])
            vehicle_name = detector.names[class_id].upper()
            estimated_speed = round(abs(center_y - last_y_by_track.get(object_id, center_y)) * 2.5, 1)
            last_y_by_track[object_id] = center_y
            rows_to_store.append(
                ("Cam_01", vehicle_name, int(object_id), float(center_x), float(center_y), float(estimated_speed))
            )

            stamp = datetime.now().strftime("%H:%M:%S")
            overlay_text = f" {vehicle_name} ID:{object_id} | {stamp} | {estimated_speed} km/h "
            text_width, text_height = painter.textbbox((0, 0), overlay_text, font=ui_font)[2:]
            painter.rectangle([left, top - text_height - 10, left + text_width, top], fill=(255, 100, 0))
            painter.text((left, top - text_height - 7), overlay_text, font=ui_font, fill=(255, 255, 255))

        frame = cv2.cvtColor(np.array(canvas), cv2.COLOR_RGB2BGR)
    return rows_to_store, frame
  `),
  five: readChunk(`
def write_live_rows(cursor, connection, pending_rows):
    for record in pending_rows:
        try:
            cursor.execute(
                """
                INSERT INTO mart.current_traffic
                (camera_id, vehicle_type, track_id, x_coord, y_coord, avg_speed, count, last_update)
                VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                """,
                (record[0], record[1], record[2], record[3], record[4], record[5], 1),
            )
            connection.commit()
        except Exception:
            connection.rollback()
  `),
  six: readChunk(`
def rollup_hourly_history():
    while True:
        try:
            db = psycopg2.connect(**DATABASE_SETTINGS)
            cursor = db.cursor()
            cursor.execute(
                """
                INSERT INTO mart.traffic_history (report_hour, camera_id, vehicle_type, avg_speed, intensity, density)
                SELECT date_trunc('hour', last_update), camera_id, vehicle_type, AVG(avg_speed), COUNT(*), AVG(count)
                FROM mart.current_traffic
                GROUP BY 1, 2, 3
                ON CONFLICT (report_hour, camera_id, vehicle_type)
                DO UPDATE SET avg_speed = EXCLUDED.avg_speed, intensity = EXCLUDED.intensity, density = EXCLUDED.density;
                """
            )
            db.commit()
            cursor.close()
            db.close()
            time.sleep(5)
        except Exception:
            time.sleep(5)
  `),
  seven: readChunk(`
def process_stream():
    detector = YOLO(MODEL_CHECKPOINT)
    capture = cv2.VideoCapture("test.MP4")
    last_y_by_track = {}

    try:
        ui_font = ImageFont.truetype("arial.ttf", 20)
    except Exception:
        ui_font = ImageFont.load_default()

    while capture.isOpened():
        db = psycopg2.connect(**DATABASE_SETTINGS)
        cursor = db.cursor()
        frame = read_frame_or_restart(capture)

        if frame is not None:
            rows_to_store, frame = detect_and_annotate(frame, detector, last_y_by_track, ui_font)
            if rows_to_store:
                write_live_rows(cursor, db, rows_to_store)

        cursor.close()
        db.close()
  `),
  eight: readChunk(`
if "stream_worker_booted" not in st.session_state:
    threading.Thread(target=process_stream, daemon=True).start()
    threading.Thread(target=rollup_hourly_history, daemon=True).start()
    st.session_state.stream_worker_booted = True

st.set_page_config(page_title="ITS Analytics Hub", layout="wide")
st.title("ITS Traffic Analytics")


@st.cache_data(ttl=5)
def load_history_frame():
    db = psycopg2.connect(**DATABASE_SETTINGS)
    data = pd.read_sql(
        "SELECT * FROM mart.traffic_history ORDER BY report_hour DESC LIMIT 1000",
        db,
    )
    db.close()
    return data
  `),
  nine: readChunk(`
try:
    history_frame = load_history_frame()
    if history_frame.empty:
        st.info("Waiting for data...")
    else:
        history_frame["report_hour"] = pd.to_datetime(history_frame["report_hour"])
        st.sidebar.header("Filters")
        selected_camera = st.sidebar.selectbox("Camera", history_frame["camera_id"].unique())
        selected_types = st.sidebar.multiselect(
            "Vehicle types",
            history_frame["vehicle_type"].unique(),
            default=history_frame["vehicle_type"].unique(),
        )

        filtered_frame = history_frame[
            (history_frame["camera_id"] == selected_camera)
            & (history_frame["vehicle_type"].isin(selected_types))
        ]

        if not filtered_frame.empty:
            current_row = filtered_frame.iloc[0]
            st.subheader("Current state and short forecast")
            metric_1, metric_2, metric_3, metric_4, metric_5 = st.columns(5)
            metric_1.metric("Intensity", f"{int(current_row['intensity'])} vehicles/hour")
            metric_2.metric("Average speed", f"{current_row['avg_speed']:.0f} km/h")
            metric_3.metric("Forecast 30m", f"{int(current_row['intensity'] * 1.15)} vehicles")
            metric_4.metric("Forecast 60m", f"{int(current_row['intensity'] * 1.25)} vehicles")
            metric_5.metric("Forecast 120m", f"{int(current_row['intensity'] * 1.35)} vehicles")

            st.subheader("Traffic structure overview")
            left_col, right_col = st.columns(2)
            hourly_frame = filtered_frame.groupby(
                filtered_frame["report_hour"].dt.hour
            )["intensity"].mean().reset_index()
            hourly_frame.columns = ["hour", "intensity"]
            left_col.plotly_chart(
                px.line(hourly_frame, x="hour", y="intensity", title="Load by hour"),
                use_container_width=True,
            )
            peak_hours = hourly_frame.nlargest(3, "intensity")["hour"].tolist()
            left_col.info(f"Peak hours: {', '.join([f'{hour}:00' for hour in peak_hours])}")
            vehicle_mix = filtered_frame.groupby("vehicle_type")["intensity"].sum().reset_index()
            right_col.plotly_chart(
                px.pie(vehicle_mix, values="intensity", names="vehicle_type", title="Vehicle mix", hole=0.4),
                use_container_width=True,
            )
  `),
  ten: readChunk(`
            st.subheader("Forecast model evaluation")
            full_history = load_history_frame()
            if len(full_history) > 10:
                full_history["hour"] = pd.to_datetime(full_history["report_hour"]).dt.hour
                train_slice = full_history.iloc[: int(len(full_history) * 0.8)]
                test_slice = full_history.iloc[int(len(full_history) * 0.8) :]

                model = GradientBoostingRegressor().fit(train_slice[["hour"]], train_slice["intensity"])
                predicted = model.predict(test_slice[["hour"]])

                metric_left, metric_right = st.columns(2)
                metric_left.metric("MAE", f"{mean_absolute_error(test_slice['intensity'], predicted):.1f}")
                metric_right.metric("RMSE", f"{np.sqrt(mean_squared_error(test_slice['intensity'], predicted)):.1f}")

                validation_chart = go.Figure()
                validation_chart.add_trace(go.Scatter(y=test_slice["intensity"].values, name="Actual"))
                validation_chart.add_trace(
                    go.Scatter(y=predicted, name="Forecast", line=dict(dash="dash"))
                )
                validation_chart.update_layout(
                    title="Forecast vs actual on validation data",
                    xaxis_title="Ordered validation intervals",
                    yaxis_title="Traffic intensity (vehicles/hour)",
                )
                st.plotly_chart(validation_chart, use_container_width=True)
            else:
                st.info(f"More rows are needed before training the model (current volume: {len(full_history)})")
  `),
  eleven: readChunk(`
            st.subheader("Dispatcher notes")
            if current_row["intensity"] > 200:
                st.warning("High density detected. Consider lowering the speed limit to 40 km/h.")

            if current_row["avg_speed"] < 30:
                st.error("Congestion detected. Activate the warning board.")
                st.sidebar.subheader("Monitoring")

                db = psycopg2.connect(**DATABASE_SETTINGS)
                cursor = db.cursor()
                cursor.execute(
                    "CREATE TABLE IF NOT EXISTS mart.quality_log (id SERIAL PRIMARY KEY, issue INT, ts TIMESTAMP DEFAULT NOW())"
                )
                live_count = pd.read_sql("SELECT COUNT(*) AS c FROM mart.current_traffic", db)["c"].iloc[0]
                st.sidebar.metric("Rows in live stream", live_count)

                issue_count = pd.read_sql(
                    "SELECT COUNT(*) AS c FROM mart.quality_log WHERE ts > NOW() - INTERVAL '1 hour'",
                    db,
                )["c"].iloc[0]
                st.sidebar.metric("Issues in the last hour", issue_count)
                db.close()

    time.sleep(5)
    st.rerun()
except Exception as error:
    st.error(f"Error: {error}")
  `),
};

const seedKeys = {
  "post10.html": "post4.html",
  "post11.html": "post5.html",
  "post12.html": "post6.html",
  "post13.html": "post7.html",
  "post14.html": "post8.html",
  "post15.html": "post9.html",
};

const configs = {
  "post10.html": {
    title: "Lay Out a Traffic Intelligence File Before the First Frame Arrives",
    description:
      "A practical walkthrough for shaping the imports, runtime settings and frame bootstrap of a single-file traffic analytics service.",
    snippet:
      "A grounded article about building the import surface, runtime settings and frame bootstrap of a traffic analytics script before the detector starts.",
    cardTag: "Python",
    label: "Python",
    date: "2026-04-04T19:05:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Python bootstrap for a traffic analytics script",
    coverCaption:
      "Suggested cover: a one-file traffic analytics service being arranged into imports, settings and a clean frame bootstrap.",
    nextKey: "post11.html",
    prevKey: null,
    related: ["post11.html", "post12.html", "post13.html"],
    body: [
      heading(2, "A large file still needs a calm opening section"),
      paragraph(
        "The top of a traffic analytics script decides what the rest of the file will feel like. If imports, runtime settings and naming are sloppy, every later function inherits that noise. If the first screen is calm, the rest of the pipeline becomes easier to reason about."
      ),
      paragraph(
        "This kind of file often blends computer vision, storage, charting and UI. That is already a lot of responsibility, so the opening should not add more cognitive weight than necessary. It should simply tell the reader which libraries matter and which runtime constants shape the rest of the system."
      ),
      paragraph(
        "A restart-friendly frame helper belongs in the same early zone. It is a small thing, but it defines how the rest of the loop behaves when the capture source reaches the end or briefly stops returning frames."
      ),
      table(
        ["Bootstrap term", "Meaning", "Why it helps later"],
        [
          ["Import surface", "The libraries made visible at the top of the file.", "It tells the reader the true shape of the service before any function body appears."],
          ["Runtime setting", "A value that configures the detector or database connection.", "It prevents configuration details from being scattered across the file."],
          ["Frame restart", "A small rule for what happens when capture.read() fails.", "It lets the processing loop stay simple because failure handling is already defined."],
        ]
      ),
      heading(3, "A small bootstrap helper before the first recoverable slice"),
      codeBlock(
        `
def build_runtime_options():
    return {
        "checkpoint": "yolov8x.pt",
        "poll_seconds": 5,
        "camera_label": "Cam_01",
    }


RUNTIME_OPTIONS = build_runtime_options()
        `,
        "This alternative component stays outside the recoverable sequence and simply gives the article a second way to introduce runtime settings.",
        "plum"
      ),
      paragraph(
        "That helper is intentionally boring. Boring bootstrap code is valuable because it makes later changes feel local instead of global."
      ),
      codeBlock(
        `
runtime_profile = "traffic-core"

# note: after 1 bootstrap review, this fragment begins.
${chunks.one}
# note: 1 bootstrap review later, this fragment ends.

runtime_profile = runtime_profile.upper()
        `,
        "The first marked slice carries the import surface and the runtime settings, so it establishes the vocabulary of the rest of the file.",
        "rose"
      ),
      paragraph(
        "Once the checkpoint name and database settings are visible in one place, every later function can stay more honest. It no longer needs to pretend that configuration is somebody else's problem."
      ),
      paragraph(
        "This is also the point where translation matters. The original code can speak one language, but the article should still read smoothly in another, which is why the names here are rephrased without changing the architectural role they play."
      ),
      heading(3, "Alternative component: a tiny capture probe before the rewind logic"),
      codeBlock(
        `
def probe_capture(capture):
    position = int(capture.get(cv2.CAP_PROP_POS_FRAMES))
    return {"position": position, "ready": capture.isOpened()}
        `,
        "This side block sits near the restart helper and reads like a neighboring component rather than part of the main recoverable chain.",
        "plum"
      ),
      paragraph(
        "Putting the recovery rule after some explanation keeps it from becoming the first thing the reader sees. That matters here because the function is useful, but it should not define the tone of the whole article."
      ),
      codeBlock(
        `
capture_mode = "looping"

# note: after 2 frame checks, this fragment begins.
${chunks.two}
# note: 2 frame checks later, this fragment ends.

capture_mode = capture_mode.strip()
        `,
        "The second marked slice is small on purpose. It captures the frame rewind behavior without dragging the detection logic in too early.",
        "rose"
      ),
      list([
        "Keep imports and runtime values in one visible zone so the file announces its stack immediately.",
        "Treat end-of-stream behavior as part of the design, not as an afterthought tucked inside the main loop.",
        "Let tiny helpers stay tiny because their value is usually in the rule they encode, not in their size.",
      ]),
      blockquote(
        "A readable top section does not make the system smaller. It makes the complexity arrive in the right order."
      ),
    ],
  },
  "post11.html": {
    title: "Track Vehicles Frame by Frame and Paint a Calm Overlay in PIL",
    description:
      "A practical article about turning tracked detections into annotated frames without losing the logic that prepares rows for storage.",
    snippet:
      "A practical walkthrough for turning tracked detections into annotated frames, speed estimates and storage-ready rows in one steady function.",
    cardTag: "Vision",
    label: "Computer Vision",
    date: "2026-04-04T19:35:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Vehicle tracking and PIL overlay",
    coverCaption:
      "Suggested cover: tracked vehicles receiving labels, timestamps and speed overlays on a live frame.",
    nextKey: "post12.html",
    prevKey: "post10.html",
    related: ["post10.html", "post12.html", "post14.html"],
    body: [
      heading(2, "Detection code becomes clearer when it splits setup from drawing"),
      paragraph(
        "A detection function usually wants to do too much. It talks to the model, unwraps tensors, computes speeds, formats text and paints the frame. The healthiest version is not a shorter version. It is a version where those responsibilities are grouped in a way the eye can follow."
      ),
      paragraph(
        "The first half of the function should prepare the scene. It asks the detector for tracked objects, converts the returned structures into Python-friendly arrays and opens a drawing surface. Only after that does it make sense to talk about per-object overlays."
      ),
      paragraph(
        "That split also helps when the code is reused in an article. A reader can pause after the setup slice, understand the data shape, and then continue into the loop that turns raw results into readable annotations."
      ),
      codeBlock(
        `
def format_overlay_line(vehicle_name, object_id, clock_text, estimated_speed):
    return f" {vehicle_name} ID:{object_id} | {clock_text} | {estimated_speed} km/h "
        `,
        "This alternative component intentionally isolates the display string so the later recoverable fragment can focus on model output and image preparation.",
        "plum"
      ),
      paragraph(
        "That helper is a good example of a neighboring component. It belongs to the same idea, but it is not part of the main stored slice."
      ),
      codeBlock(
        `
overlay_stage = "prepare"

# note: after 3 detector passes, this fragment begins.
${chunks.three}
# note: 3 detector passes later, this fragment ends.

overlay_stage = overlay_stage.title()
        `,
        "The third marked slice stops just before the per-object loop, which makes it a clean breakpoint for anyone reconstructing the file later.",
        "rose"
      ),
      paragraph(
        "Stopping there is useful because it preserves the boundary between model output and visual annotation. The first part explains what has been collected. The second part explains what will be done with it."
      ),
      table(
        ["Overlay concern", "What the code needs", "Why the split helps"],
        [
          ["Tracked boxes", "Coordinates, ids and class ids from the detector.", "It gives the loop enough structure before any text is drawn."],
          ["Drawing surface", "A PIL image plus an ImageDraw handle.", "It keeps annotation code separate from OpenCV tensor handling."],
          ["Speed context", "A previous y-position per tracked object.", "It turns motion into a cheap derived signal without a second model."],
        ]
      ),
      heading(3, "Alternative component: keep the text box math separate"),
      codeBlock(
        `
def make_label_box(drawer, left, top, overlay_text, ui_font):
    text_width, text_height = drawer.textbbox((0, 0), overlay_text, font=ui_font)[2:]
    return {
        "box": [left, top - text_height - 10, left + text_width, top],
        "text": (left, top - text_height - 7),
    }
        `,
        "This lilac block is intentionally adjacent to the recoverable material, but the color shift signals that it is a neighboring solution rather than part of the numbered sequence.",
        "plum"
      ),
      paragraph(
        "The actual loop is easier to absorb after the geometry has been discussed in plain English. That keeps the main rose slice from feeling like a wall of micro-decisions."
      ),
      codeBlock(
        `
overlay_policy = "steady"

# note: after 4 overlay drafts, this fragment begins.
${chunks.four}
# note: 4 overlay drafts later, this fragment ends.

overlay_policy = overlay_policy.lower()
        `,
        "The fourth marked slice covers the per-object work: speed estimation, row assembly, overlay text and the final BGR conversion.",
        "rose"
      ),
      paragraph(
        "This is where the function earns its keep. It does not merely detect objects. It transforms them into a story the operator can read and into rows the database can store."
      ),
      list([
        "Prepare all detector outputs before the per-object loop starts.",
        "Let the overlay logic describe one object at a time instead of juggling all concerns at once.",
        "Convert back to OpenCV's color space only after the drawing work is complete.",
      ]),
    ],
  },
  "post12.html": {
    title: "Persist Live Detections and Roll Them Into an Hourly Mart",
    description:
      "A practical article about writing live rows into PostgreSQL and promoting them into an hourly history table on a repeating cadence.",
    snippet:
      "A clear guide for persisting live detections in PostgreSQL and rolling them into an hourly mart without burying the retry behavior.",
    cardTag: "Data",
    label: "Data",
    date: "2026-04-04T20:05:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Live detections flowing into PostgreSQL",
    coverCaption:
      "Suggested cover: live detection rows landing in PostgreSQL before an hourly aggregation step promotes them into history.",
    nextKey: "post13.html",
    prevKey: "post11.html",
    related: ["post11.html", "post13.html", "post14.html"],
    body: [
      heading(2, "Persistence becomes easier to trust when write paths stay narrow"),
      paragraph(
        "The database side of a live computer vision script only feels messy when multiple concerns are hidden inside the same write path. In practice there are two jobs here: save the current rows, then roll them up into a calmer historical shape."
      ),
      paragraph(
        "Those jobs can live in the same file without becoming the same function. The live insert path should stay close to the row structure already produced by the detector, while the mart refresh can stay close to SQL and timing."
      ),
      paragraph(
        "That division matters even more in articles because it lets the reader separate the operational write loop from the analytical history layer. One supports immediacy. The other supports reporting."
      ),
      codeBlock(
        `
def pack_stream_record(camera_id, vehicle_name, object_id, x_coord, y_coord, speed_value):
    return (camera_id, vehicle_name, object_id, x_coord, y_coord, speed_value, 1)
        `,
        "This adjacent component shows the row shape in isolation so the real insert path does not have to explain its tuple structure at the same time.",
        "plum"
      ),
      paragraph(
        "A small packing helper like that is not required, but it highlights a useful mental model: if the row shape is stable, the write function can remain small."
      ),
      codeBlock(
        `
write_mode = "live-stream"

# note: after 5 commit cycles, this fragment begins.
${chunks.five}
# note: 5 commit cycles later, this fragment ends.

write_mode = write_mode.replace("-", "_")
        `,
        "The fifth marked slice is the narrow write path. It keeps the insert statement visible and leaves the transaction rule in one easy-to-find place.",
        "rose"
      ),
      table(
        ["Persistence term", "Meaning", "Why it belongs here"],
        [
          ["Current table", "The table that stores fresh tracked rows.", "It is the operational landing zone for the live pipeline."],
          ["History table", "The rolled-up hourly view of the same traffic.", "It gives dashboards a steadier reporting layer."],
          ["Rollback", "The fallback after a failed insert attempt.", "It keeps a bad write from poisoning the next one."],
        ]
      ),
      heading(3, "Alternative component: a tiny transaction wrapper"),
      codeBlock(
        `
def commit_or_reset(connection, action):
    try:
        action()
        connection.commit()
    except Exception:
        connection.rollback()
        raise
        `,
        "This component is intentionally nearby and color-separated. It reads like a neighboring design option rather than part of the stored numbered flow.",
        "plum"
      ),
      paragraph(
        "The hourly rollup deserves its own stage because it has a different rhythm. It is not called for every object or even for every frame. It turns a live stream into a reporting cadence."
      ),
      codeBlock(
        `
mart_refresh = "hourly-rollup"

# note: after 6 mart updates, this fragment begins.
${chunks.six}
# note: 6 mart updates later, this fragment ends.

mart_refresh = mart_refresh.upper()
        `,
        "The sixth marked slice keeps the SQL-heavy refresh logic together, including the repeat cadence and the upsert behavior.",
        "rose"
      ),
      paragraph(
        "This pairing works because the first function writes what is happening now, while the second keeps history queryable later. They belong to the same pipeline, but they speak to different time horizons."
      ),
      list([
        "Keep the live insert path close to the row shape produced by the detector.",
        "Let history refresh logic stay mostly SQL so the mart rule remains inspectable.",
        "Use a simple cadence for rollups because operational clarity often beats micro-optimization here.",
      ]),
    ],
  },
  "post13.html": {
    title: "Start the Workers Once and Cache the First History Pull",
    description:
      "A practical article about booting background workers one time, opening the UI, and caching the first history query for a single-file dashboard.",
    snippet:
      "A steady walkthrough for starting worker threads once, opening the Streamlit page and caching the first history pull without clutter.",
    cardTag: "Streamlit",
    label: "Streamlit",
    date: "2026-04-04T20:40:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Worker boot and cached history load",
    coverCaption:
      "Suggested cover: background workers starting once while a dashboard opens and caches its first history pull.",
    nextKey: "post14.html",
    prevKey: "post12.html",
    related: ["post12.html", "post14.html", "post15.html"],
    body: [
      heading(2, "A one-file service still needs a clean handoff into the UI"),
      paragraph(
        "After the detector and database layers are present, the next challenge is startup discipline. A single-file system can feel chaotic if threads begin on every refresh or if the UI code is forced to remember whether the backend is already alive."
      ),
      paragraph(
        "The usual cure is small and effective: put a session flag in front of the worker startup, then keep the first data fetch behind a cache boundary. That gives the page a practical memory of what has already been done."
      ),
      paragraph(
        "This is also one of the best places to add supporting code around the main fragments. Startup behavior benefits from extra explanatory snippets because it blends control flow, state and timing."
      ),
      codeBlock(
        `
def choose_font_or_default():
    try:
        return ImageFont.truetype("arial.ttf", 20)
    except Exception:
        return ImageFont.load_default()
        `,
        "This neighboring component echoes the font fallback idea without stepping into the numbered recovery chain too early.",
        "plum"
      ),
      paragraph(
        "That fallback is useful as a side note because it reminds the reader that startup code is not only about threads. It is also where tiny environmental assumptions should be handled gracefully."
      ),
      codeBlock(
        `
worker_stage = "video-loop"

# note: after 7 worker checks, this fragment begins.
${chunks.seven}
# note: 7 worker checks later, this fragment ends.

worker_stage = worker_stage.title()
        `,
        "The seventh marked slice holds the streaming loop that opens the detector, capture and font fallback before handing rows to the database layer.",
        "rose"
      ),
      paragraph(
        "Notice how the loop stays readable because earlier responsibilities were already defined. The frame helper, annotation function and write function do the heavy lifting, so the worker loop mostly orchestrates."
      ),
      heading(3, "Alternative component: describe the refresh contract explicitly"),
      codeBlock(
        `
def dashboard_refresh_contract(ttl_seconds):
    return {
        "cache_ttl": ttl_seconds,
        "starts_workers_once": True,
        "refreshes_from_history": True,
    }
        `,
        "This side block reads like an architectural note. The color shift keeps it separate from the numbered slices while still reinforcing the same section of the file.",
        "plum"
      ),
      paragraph(
        "Only after the worker loop is clear does it make sense to show the session gate and the cached data pull. That ordering helps because the UI startup now feels like a handoff instead of a collision."
      ),
      codeBlock(
        `
startup_guard = "boot-once"

# note: after 8 startup guards, this fragment begins.
${chunks.eight}
# note: 8 startup guards later, this fragment ends.

startup_guard = startup_guard.replace("-", " ")
        `,
        "The eighth marked slice holds the one-time thread startup, page title and cached history loader, which together form the bridge into the dashboard.",
        "rose"
      ),
      list([
        "Guard worker startup with session state so rerenders do not spawn duplicate loops.",
        "Cache the first history pull because dashboards usually need stable, recent data more than they need constant raw queries.",
        "Let the worker loop orchestrate helpers instead of duplicating their logic inline.",
      ]),
      blockquote(
        "Startup code feels lighter when it remembers what has already been started."
      ),
    ],
  },
  "post14.html": {
    title: "Filter a Streamlit Traffic Dashboard Without Turning the Layout Into Glue",
    description:
      "A practical article about filtering traffic history, presenting KPI cards and drawing the first chart layer in a Streamlit dashboard.",
    snippet:
      "A practical guide for filtering traffic history, surfacing KPI cards and drawing the first chart layer in a Streamlit dashboard.",
    cardTag: "Analytics",
    label: "Analytics",
    date: "2026-04-04T21:15:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Filtered traffic dashboard in Streamlit",
    coverCaption:
      "Suggested cover: a Streamlit dashboard selecting camera and vehicle filters before drawing KPI cards and first charts.",
    nextKey: "post15.html",
    prevKey: "post13.html",
    related: ["post13.html", "post15.html", "post12.html"],
    body: [
      heading(2, "The first dashboard layer should answer simple questions quickly"),
      paragraph(
        "Once the history frame is available, the dashboard has a straightforward job: pick a camera, pick vehicle types, show the current summary, then draw the first charts. That sequence is more valuable than it looks because it matches how people naturally read monitoring pages."
      ),
      paragraph(
        "The temptation is to jump straight into charts. A better move is to establish the filter scope and KPI cards first. Charts make more sense when the reader already knows which slice of the data they are looking at."
      ),
      paragraph(
        "This section is also where a large file can begin to feel sticky. Layout code, metrics and filtering can cling to each other if the structure is not intentional. A small amount of narrative scaffolding keeps the reading order intact."
      ),
      table(
        ["Dashboard term", "Meaning", "Why it stays practical"],
        [
          ["Filter scope", "The selected camera and set of vehicle types.", "It defines the exact slice the rest of the UI is allowed to talk about."],
          ["KPI card", "A small metric block summarizing the latest row.", "It gives readers orientation before they inspect charts."],
          ["Shape chart", "A chart that describes how traffic is distributed.", "It adds pattern recognition after the summary layer is already in place."],
        ]
      ),
      codeBlock(
        `
def scaled_forecast(base_value, factor):
    return int(base_value * factor)
        `,
        "This alternative component keeps the forecast-card arithmetic in a quiet corner so the main recoverable slice can stay focused on dashboard flow.",
        "plum"
      ),
      paragraph(
        "Tiny helpers like that are especially useful in dashboards because they peel arithmetic away from layout code without creating a second abstraction maze."
      ),
      codeBlock(
        `
dashboard_scope = "current-window"

# note: after 9 dashboard passes, this fragment begins.
${chunks.nine}
# note: 9 dashboard passes later, this fragment ends.

dashboard_scope = dashboard_scope.upper()
        `,
        "The ninth marked slice covers the filter selection, the latest-row KPI layer and the first two chart families, which makes it the real dashboard spine.",
        "rose"
      ),
      paragraph(
        "That spine is strong because it respects the reading order. The sidebar narrows the scope, the cards establish the current state, and only then do the charts explain shape and timing."
      ),
      heading(3, "Alternative component: keep peak-hour extraction self-contained"),
      codeBlock(
        `
def top_hour_labels(hourly_frame):
    hours = hourly_frame.nlargest(3, "intensity")["hour"].tolist()
    return ", ".join([f"{hour}:00" for hour in hours])
        `,
        "This neighboring block is deliberately color-separated. It belongs beside the KPI slice, but it is not part of the numbered chain you may want to recover later.",
        "plum"
      ),
      paragraph(
        "Putting a helper like that next to the main slice keeps the article full without pushing more inline detail into the recoverable fragment than it needs."
      ),
      list([
        "Resolve the filter scope before any KPI or chart logic runs.",
        "Let the newest row drive the summary cards because that is the fastest route to context.",
        "Keep the first charts tied to clear questions such as load by hour and vehicle mix.",
      ]),
    ],
  },
  "post15.html": {
    title: "Validate a Forecasting Loop and Surface Dispatcher Warnings Without Noise",
    description:
      "A practical article about validating a lightweight forecasting model and surfacing operational warnings and monitoring signals in the same file.",
    snippet:
      "A calm technical walkthrough for validating a lightweight forecasting model and surfacing operational warnings without drowning the page.",
    cardTag: "Operations",
    label: "Operations",
    date: "2026-04-04T21:50:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Forecast validation and dispatcher warnings",
    coverCaption:
      "Suggested cover: forecast validation metrics, a comparison chart and dispatcher warnings appearing on one operational dashboard.",
    nextKey: null,
    prevKey: "post14.html",
    related: ["post14.html", "post13.html", "post12.html"],
    body: [
      heading(2, "A dashboard feels more complete when it can explain both confidence and risk"),
      paragraph(
        "The last layer of the file is where reporting turns into operations. The script stops being only a viewer of history and starts making small claims about the future, then reacts to thresholds that matter to the operator."
      ),
      paragraph(
        "Forecast validation matters here because a predicted value is only useful when the page can also show how that prediction behaves against held-out data. At the same time, operator warnings matter because insight without action tends to stall on the screen."
      ),
      paragraph(
        "Keeping those concerns close together works surprisingly well. One section measures how trustworthy the forecasting step is, and the next section translates the current slice into warnings and lightweight monitoring."
      ),
      codeBlock(
        `
def split_history_frame(frame, ratio=0.8):
    boundary = int(len(frame) * ratio)
    return frame.iloc[:boundary], frame.iloc[boundary:]
        `,
        "This neighboring component turns the train-test split into a separate idea so the model-validation fragment can stay centered on metrics and plotting.",
        "plum"
      ),
      paragraph(
        "That side helper is not necessary for the actual system, but it is useful in the article because it keeps the validation fragment from carrying every small decision inside one rose block."
      ),
      codeBlock(
        `
validation_mode = "forecast-check"

# note: after 10 validation rounds, this fragment begins.
${chunks.ten}
# note: 10 validation rounds later, this fragment ends.

validation_mode = validation_mode.lower()
        `,
        "The tenth marked slice covers model training, error metrics and the comparison chart, which together form the validation story of the file.",
        "rose"
      ),
      paragraph(
        "Validation becomes persuasive when the page shows both the summary metrics and the curve. Numbers answer how wrong the model is on average, while the chart answers how it behaves across the sequence."
      ),
      heading(3, "Alternative component: make alert thresholds explicit"),
      codeBlock(
        `
ALERT_RULES = {
    "high_density": 200,
    "slow_flow": 30,
}
        `,
        "This muted block sits next to the operational warning slice as a visibly different design option for threshold management.",
        "plum"
      ),
      paragraph(
        "Once the validation story is complete, the warning path feels earned. The page has already shown how it sees the data, so operational alerts no longer look arbitrary."
      ),
      codeBlock(
        `
alert_surface = "dispatcher"

# note: after 11 alert checks, this fragment begins.
${chunks.eleven}
# note: 11 alert checks later, this fragment ends.

alert_surface = alert_surface.title()
        `,
        "The eleventh marked slice closes the series with dispatcher guidance, lightweight monitoring and the rerun behavior that keeps the page live.",
        "rose"
      ),
      paragraph(
        "That ending is strong because it combines analytics and operations without pretending they are the same thing. Validation explains confidence. Warnings explain urgency. Monitoring explains system health."
      ),
      list([
        "Show validation metrics and a comparison chart together so the forecast has both a score and a shape.",
        "Keep warning thresholds close to the UI that surfaces them because operators care about visible rules.",
        "Close the file with a live rerun path and a clean error surface so the script remains usable after the happy path ends.",
      ]),
      blockquote(
        "An operational dashboard becomes credible when it can measure itself before it tries to advise anyone else."
      ),
    ],
  },
};

for (const key of Object.keys(configs)) {
  const config = configs[key];
  config.next = config.nextKey
    ? { href: config.nextKey, title: configs[config.nextKey].title }
    : { href: "index.html", title: "Back to the main feed" };
  config.prev = config.prevKey
    ? { href: config.prevKey, title: configs[config.prevKey].title }
    : { href: "index.html", title: "Back to the main feed" };
}

function ensureLoaderFile(path) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${path}</title>
  <script src="posts-data.js"></script>
  <script src="post-template.js"></script>
  <script src="post-render.js"></script>
</head>
<body>
  <noscript>Please enable JavaScript to view this article.</noscript>
</body>
</html>
`;

  fs.writeFileSync(path, html, "utf8");
}

function numericPostSort(left, right) {
  const leftNumber = Number((left.match(/\d+/) || ["0"])[0]);
  const rightNumber = Number((right.match(/\d+/) || ["0"])[0]);
  return leftNumber - rightNumber;
}

function updateSearchScript(posts) {
  const searchEntries = Object.keys(posts)
    .filter((key) => /^post\d+\.html$/.test(key))
    .sort(numericPostSort)
    .map((key) => ({
      title: posts[key].pageTitle,
      url: key,
      meta: key,
    }));

  let raw = fs.readFileSync(SEARCH_PATH, "utf8");
  raw = raw.replace(
    /var posts = \[[\s\S]*?\n  \];/,
    `var posts = ${JSON.stringify(searchEntries, null, 4)};`
  );
  fs.writeFileSync(SEARCH_PATH, raw, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildIndexCard(key, config, asset) {
  return `
<div class="blog-post hentry index-post">
<div class="index-post-inside-wrap">
<div class="post-image-wrap">
<a class="post-image-link" href="${key}">
<img alt="${escapeHtml(config.title)}" class="post-thumb lazy-yard" src="${asset.imageSrc}">
</a>
</div>
<div class="post-info-wrap">
<div class="post-info">
<a class="post-tag" href="${key}">
${config.cardTag}
</a>
<h2 class="post-title">
<a href="${key}">${config.title}</a>
</h2>
</div>
<div class="index-post-footer">
<div class="post-meta">
<span class="post-author"><a href="about.html" title="Kate Studio">Kate Studio</a></span>
<span class="post-date published" datetime="${config.date}">${config.displayDate}</span>
</div>
<p class="post-snippet">${config.snippet}</p>
<a class="read-more" href="${key}">Read more</a>
</div>
</div>
</div>
</div>`.trim();
}

function updateIndex(configs, assets) {
  let raw = fs.readFileSync(INDEX_PATH, "utf8");
  const keys = Object.keys(configs).sort(numericPostSort);
  const cardsHtml = keys.map((key) => buildIndexCard(key, configs[key], assets[key])).join("\n");
  const block = `${INDEX_MARKER_START}\n${cardsHtml}\n${INDEX_MARKER_END}`;

  if (raw.includes(INDEX_MARKER_START) && raw.includes(INDEX_MARKER_END)) {
    raw = raw.replace(
      new RegExp(`${escapeRegExp(INDEX_MARKER_START)}[\\s\\S]*?${escapeRegExp(INDEX_MARKER_END)}`),
      block
    );
  } else {
    const anchorPattern = /<\/div>\r?\n<\/div>\r?\n<div class="blog-pager container" id="blog-pager">/;
    if (!anchorPattern.test(raw)) {
      throw new Error("Unable to find the index insertion point.");
    }
    raw = raw.replace(
      anchorPattern,
      `${block}\r\n</div>\r\n</div>\r\n<div class="blog-pager container" id="blog-pager">`
    );
  }

  fs.writeFileSync(INDEX_PATH, raw, "utf8");
}

function main() {
  const posts = readPosts();
  const assets = {};

  for (const key of Object.keys(configs)) {
    const seed = seedKeys[key];
    const seedPost = posts[seed];
    const current = posts[key] || {};

    if (!seedPost) {
      throw new Error(`Missing seed post data for ${seed}`);
    }

    assets[key] = {
      commentsFeed: current.commentsFeed || seedPost.commentsFeed,
      imageSrc: current.imageSrc || seedPost.imageSrc,
      ogImage: current.ogImage || seedPost.ogImage,
    };
  }

  for (const key of Object.keys(configs)) {
    const config = configs[key];

    posts[key] = {
      pageTitle: config.title,
      canonical: key,
      commentsFeed: assets[key].commentsFeed,
      imageSrc: assets[key].imageSrc,
      ogUrl: key,
      ogTitle: config.title,
      ogDescription: config.description,
      ogImage: assets[key].ogImage,
      articleHtml: articleHtml(key, config, assets, configs),
    };

    ensureLoaderFile(key);
  }

  writePosts(posts);
  updateSearchScript(posts);
  updateIndex(configs, assets);

  console.log("Updated post10-post15 article content, search entries, index cards, and loader files.");
}

main();
