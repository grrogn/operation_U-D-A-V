const fs = require("fs");

const POSTS_PATH = "posts-data.js";
const SEARCH_PATH = "post-search.js";
const INDEX_PATH = "index.html";

const AUTHOR_AVATAR =
  "//blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgGEyigbC_aEx_Xxmhi4rrzNna7RtI53QTClI6EOlp7qotFQfcEXdHXC__u4n5QGvhmWdA7IeGSqqufMF_Kn4X5lEtf4BR-LeEDn9ICx3S5qqo78-O9AQytTpyjxDS3IFU/w100/Sora+Blogging+Tips.jpg";

const CODE_BLOCK_STYLE = [
  "background:#081521",
  "border:1px solid #184c80",
  "color:#d7ebff",
  "padding:22px",
  "line-height:1.7",
  "border-radius:4px",
  "box-shadow:inset 0 0 0 1px rgba(95,158,255,.08)",
].join(";");

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
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraph(text) {
  return `<p>${text}</p>`;
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

function codeBlock(code, note) {
  return `
<div class="is-dark">
<pre class="code-box" style="${CODE_BLOCK_STYLE}">${escapeHtml(code.trim())}</pre>
</div>
<p style="margin-top:-6px;margin-bottom:20px;color:#6f7f92;font-size:13px;">${note}</p>`.trim();
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

function relatedList(configs, posts, keys) {
  return keys
    .map((key) => {
      const config = configs[key];
      const image = posts[key].imageSrc;
      return `<li class="related-item"><a class="post-image-link" href="${key}"><img class="post-thumb lazy-yard" alt="" src="${image}"></a><h2 class="post-title"><a href="${key}">${config.title}</a></h2></li>`;
    })
    .join("");
}

function footerHtml(currentKey, config, configs, posts) {
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
<div class="related-ready"><ul class="related-posts">${relatedList(configs, posts, config.related)}</ul></div>
</div>
</div>
</div>
</div>
</div></div></div></div>`.trim();
}

function articleHtml(key, config, posts, configs) {
  const parts = [
    cover(posts[key].imageSrc, config.coverAlt, config.coverCaption),
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
    "@type": "ImageObject","url": "${posts[key].ogImage}",
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
${footerHtml(key, config, configs, posts)}`.trim();
}

const chunks = {
  one: readChunk(`
import time
import json
import queue
import threading
from collections import defaultdict
from datetime import datetime, timedelta

import cv2
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import psycopg2
import streamlit as st
from ultralytics import YOLO
`),
  two: readChunk(`
warehouse_link = psycopg2.connect(
    dbname="CAR",
    user="postgres",
    password="admin",
    host="localhost",
    port="5432",
)
metrics_cursor = warehouse_link.cursor()

DETECTED_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}
event_buffer = queue.Queue()
`),
  three: readChunk(`
def resolve_vehicle_type_id(vehicle_name):
    """Look up or create a vehicle type row."""
    metrics_cursor.execute(
        "SELECT id FROM vehicle_types WHERE name = %s",
        (vehicle_name,),
    )
    existing_row = metrics_cursor.fetchone()
    if existing_row:
        return existing_row[0]

    metrics_cursor.execute(
        "INSERT INTO vehicle_types (name, category) VALUES (%s, %s) RETURNING id",
        (vehicle_name, vehicle_name),
    )
    warehouse_link.commit()
    inserted_row = metrics_cursor.fetchone()
    return inserted_row[0]
`),
  four: readChunk(`
def process_stream_worker():
    """Consume frames, run tracking and push live metrics."""
    detector = YOLO("yolo12x.pt")
    capture = cv2.VideoCapture("video.mp4")
    track_cache = {}
    frame_index = 0
    palette = {
        "car": (0, 255, 0),
        "truck": (0, 0, 255),
        "bus": (255, 0, 0),
        "motorcycle": (0, 255, 255),
    }

    while capture.isOpened():
        ok, frame_image = capture.read()
        if not ok:
            break

        frame_index += 1
        unix_time = time.time()
        detections = detector.track(frame_image, persist=True, verbose=False)
`),
  five: readChunk(`
        if detections[0].boxes.id is not None:
            frame_stats = defaultdict(lambda: [0, 0])

            for box_coords, track_id, class_id in zip(
                detections[0].boxes.xyxy.cpu().numpy(),
                detections[0].boxes.id.cpu().numpy(),
                detections[0].boxes.cls.cpu().numpy(),
            ):
                left, top, right, bottom = map(int, box_coords[:4])
                center_x, center_y = (left + right) // 2, (top + bottom) // 2
                vehicle_name = DETECTED_CLASSES.get(int(class_id), "unknown")

                if track_id in track_cache:
                    speed_value = (
                        (center_x - track_cache[track_id][0]) ** 2
                        + (center_y - track_cache[track_id][1]) ** 2
                    ) ** 0.5
                    frame_stats[vehicle_name][1] += speed_value

                track_cache[track_id] = (center_x, center_y, vehicle_name)
                frame_stats[vehicle_name][0] += 1
`),
  six: readChunk(`
            for vehicle_name, (vehicle_count, speed_total) in frame_stats.items():
                mean_speed = speed_total / (vehicle_count + 1)
                metrics_cursor.execute(
                    "INSERT INTO stream_metrics (time, vehicle_type_id, vehicle_class, intensity, avg_speed) VALUES (to_timestamp(%s), %s, %s, %s, %s)",
                    (
                        unix_time,
                        resolve_vehicle_type_id(vehicle_name),
                        vehicle_name,
                        vehicle_count,
                        mean_speed,
                    ),
                )
`),
  seven: readChunk(`
                event_buffer.put(
                    {
                        "time": unix_time,
                        "datetime": datetime.now(),
                        "vehicle_type": vehicle_name,
                        "intensity": vehicle_count,
                        "avg_speed": mean_speed,
                        "frame": frame_index,
                    }
                )

            warehouse_link.commit()
`),
  eight: readChunk(`
            for vehicle_name, (vehicle_count, speed_total) in frame_stats.items():
                mean_speed = speed_total / (vehicle_count + 1)
                baseline_y = 30
                cv2.putText(
                    frame_image,
                    f"Frame: {frame_index}",
                    (10, baseline_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    1,
                )
                baseline_y += 25
                cv2.putText(
                    frame_image,
                    f"{vehicle_name}: {vehicle_count} (spd:{mean_speed:.1f})",
                    (10, baseline_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    1,
                )
`),
  nine: readChunk(`
        if frame_index % 150 == 0:
            track_cache = {
                saved_id: saved_value
                for saved_id, saved_value in track_cache.items()
                if time.time() - unix_time < 5
            }

    capture.release()
    cv2.destroyAllWindows()
`),
  ten: readChunk(`
def build_dashboard():
    """Render the interactive analytics dashboard."""

    st.set_page_config(
        page_title="Traffic Analytics Dashboard",
        page_icon=":vertical_traffic_light:",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.title("Traffic flow analytics")
    st.markdown("---")

    with st.sidebar:
        st.header("Dashboard settings")
        vehicle_choices = ["car", "motorcycle", "bus", "truck", "all"]
        chosen_vehicles = st.multiselect(
            "Vehicle types",
            vehicle_choices,
            default=["car", "bus", "truck"],
        )

        range_label = st.selectbox(
            "Time range",
            ["Last 5 minutes", "Last 15 minutes", "Last hour", "All data"],
            index=1,
        )

        live_refresh = st.checkbox("Auto refresh", value=True)
        refresh_seconds = (
            st.slider("Refresh interval (sec)", 1, 10, 3) if live_refresh else 0
        )

        st.markdown("---")
        st.caption("The dashboard reads metrics from the live video pipeline.")
`),
  eleven: readChunk(`
    kpi_column_one, kpi_column_two, kpi_column_three, kpi_column_four = st.columns(4)

    metric_slots = {
        "total": kpi_column_one.empty(),
        "avg_speed": kpi_column_two.empty(),
        "peak_hour": kpi_column_three.empty(),
        "congestion": kpi_column_four.empty(),
    }

    trend_column, speed_column = st.columns(2)
    with trend_column:
        st.subheader("Traffic intensity by vehicle type")
        intensity_slot = st.empty()

    with speed_column:
        st.subheader("Average speed by vehicle type")
        speed_slot = st.empty()

    st.subheader("Trends and distribution")
    bottom_left, bottom_right = st.columns(2)
    with bottom_left:
        distribution_slot = st.empty()
    with bottom_right:
        correlation_slot = st.empty()

    st.subheader("Recent events")
    table_slot = st.empty()
`),
  twelve: readChunk(`
    def refresh_dashboard():
        if range_label == "Last 5 minutes":
            time_cutoff = datetime.now() - timedelta(minutes=5)
        elif range_label == "Last 15 minutes":
            time_cutoff = datetime.now() - timedelta(minutes=15)
        elif range_label == "Last hour":
            time_cutoff = datetime.now() - timedelta(hours=1)
        else:
            time_cutoff = datetime.now() - timedelta(days=365)

        query_text = """
            SELECT sm.time, vt.name as vehicle_type, sm.intensity, sm.avg_speed
            FROM stream_metrics sm
            JOIN vehicle_types vt ON sm.vehicle_type_id = vt.id
            WHERE sm.time >= %s
            ORDER BY sm.time DESC
            LIMIT 1000
        """
        report_frame = pd.read_sql(query_text, warehouse_link, params=(time_cutoff,))

        if report_frame.empty:
            return

        report_frame["time"] = pd.to_datetime(report_frame["time"])

        if "all" not in chosen_vehicles:
            report_frame = report_frame[
                report_frame["vehicle_type"].isin(chosen_vehicles)
            ]

        total_flow = report_frame["intensity"].sum()
        mean_speed = report_frame["avg_speed"].mean()
        report_frame["hour"] = report_frame["time"].dt.hour
        busiest_hour = report_frame.groupby("hour")["intensity"].sum().idxmax()
        congestion_label = (
            "Low" if total_flow < 100 else "Medium" if total_flow < 300 else "High"
        )

        metric_slots["total"].metric("Total vehicles", f"{total_flow:,}")
        metric_slots["avg_speed"].metric("Average speed", f"{mean_speed:.1f} px/sec")
        metric_slots["peak_hour"].metric("Peak hour", f"{busiest_hour}:00")
        metric_slots["congestion"].metric("Congestion", congestion_label)
`),
  thirteen: readChunk(`
        if not report_frame.empty:
            intensity_frame = (
                report_frame.groupby(["time", "vehicle_type"])["intensity"]
                .sum()
                .reset_index()
            )
            intensity_figure = px.line(
                intensity_frame,
                x="time",
                y="intensity",
                color="vehicle_type",
                title="Traffic flow intensity",
                labels={"intensity": "Vehicles", "time": "Time"},
            )
            intensity_slot.plotly_chart(intensity_figure, use_container_width=True)

            speed_frame = (
                report_frame.groupby(["time", "vehicle_type"])["avg_speed"]
                .mean()
                .reset_index()
            )
            speed_figure = px.line(
                speed_frame,
                x="time",
                y="avg_speed",
                color="vehicle_type",
                title="Average speed",
                labels={"avg_speed": "Speed (px/sec)", "time": "Time"},
            )
            speed_slot.plotly_chart(speed_figure, use_container_width=True)

            distribution_frame = (
                report_frame.groupby("vehicle_type")["intensity"].sum().reset_index()
            )
            distribution_figure = px.pie(
                distribution_frame,
                values="intensity",
                names="vehicle_type",
                title="Vehicle type distribution",
            )
            distribution_slot.plotly_chart(
                distribution_figure,
                use_container_width=True,
            )

            correlation_value = report_frame[["intensity", "avg_speed"]].corr().iloc[0, 1]
            correlation_figure = go.Figure()
            correlation_figure.add_trace(
                go.Scatter(
                    x=report_frame["intensity"],
                    y=report_frame["avg_speed"],
                    mode="markers",
                    marker=dict(
                        size=8,
                        color=report_frame["intensity"],
                        colorscale="Viridis",
                    ),
                    text=report_frame["vehicle_type"],
                )
            )
            correlation_figure.update_layout(
                title=f"Correlation: intensity vs speed (r={correlation_value:.3f})",
                xaxis_title="Intensity",
                yaxis_title="Average speed",
            )
            correlation_slot.plotly_chart(correlation_figure, use_container_width=True)

            latest_rows = report_frame.head(10)[
                ["time", "vehicle_type", "intensity", "avg_speed"]
            ]
            latest_rows.columns = ["Time", "Vehicle type", "Count", "Average speed"]
            table_slot.dataframe(latest_rows, use_container_width=True)
`),
  fourteen: readChunk(`
    if live_refresh:
        placeholder = st.empty()
        while True:
            refresh_dashboard()
            time.sleep(refresh_seconds)
    else:
        refresh_dashboard()
        st.button("Refresh", on_click=refresh_dashboard)


def launch_stream_mode():
    """Start video processing in a daemon thread."""
    worker = threading.Thread(target=process_stream_worker, daemon=True)
    worker.start()
    build_dashboard()
`),
  fifteen: readChunk(`
def launch_batch_mode():
    """Run a batch export from persisted metrics."""
    batch_frame = pd.read_sql(
        "SELECT sm.time, vt.name, sm.intensity, sm.avg_speed FROM stream_metrics sm JOIN vehicle_types vt ON sm.vehicle_type_id = vt.id ORDER BY sm.time",
        warehouse_link,
    )

    if not batch_frame.empty:
        batch_frame["time"] = pd.to_datetime(batch_frame["time"])
        minute_rollup = (
            batch_frame.set_index("time")
            .groupby("name")
            .resample("1min")
            .agg({"intensity": "sum", "avg_speed": "mean"})
            .reset_index()
            .pivot_table(index="time", columns="name", values="intensity", fill_value=0)
        )

        minute_rollup.to_csv("dwh_metrics.csv")
        print(minute_rollup.head())
    else:
        print("No data")


def close_resources():
    """Close database handles."""
    metrics_cursor.close()
    warehouse_link.close()


if __name__ == "__main__":
    try:
        APP_MODE = "stream"
        if APP_MODE == "stream":
            launch_stream_mode()
        else:
            launch_batch_mode()
    except Exception as exc:
        print(f"Error: {exc}")
    finally:
        close_resources()
`),
};

const configs = {
  "post3.html": {
    oldTitle: "Build a Tiny Python Task Runner for Repetitive Scripts",
    title: "Shape the Import Surface of a Python Analytics Service Before the Live Loop",
    description:
      "A practical Python article about preparing imports, shared handles and small module-level resources before a live analytics loop starts.",
    label: "Python",
    date: "2026-04-04T10:00:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Python analytics service starter",
    coverCaption:
      "Suggested cover: an editor pane with a Python module opening beside a calm operations dashboard.",
    nextKey: "post4.html",
    prevKey: null,
    related: ["post4.html", "post7.html", "post8.html"],
    body: [
      paragraph(
        "Many live Python services become harder to reason about long before the detection loop or dashboard code appears. The first source of friction is usually the import surface: too many hidden dependencies, unclear naming, and shared resources that show up only after several pages of code."
      ),
      paragraph(
        "That is why I like to start with the top of the file. Imports, connection handles and queues tell you what kind of program you are reading. They also make onboarding easier, because a new reader can see whether the module talks to a camera, a database, a dashboard library or all three."
      ),
      table(
        ["Term", "Plain meaning", "Why it matters"],
        [
          ["Import surface", "The set of modules pulled into the file at the top.", "It tells you what the script depends on before you read any logic."],
          ["Module-level handle", "A shared object created once, such as a DB connection.", "It makes later functions shorter, but it also deserves careful naming."],
          ["Queue", "A safe handoff structure between parts of the program.", "It gives the live worker and the UI a clean place to exchange events."],
        ]
      ),
      paragraph(
        "In the article block below, the recoverable slice is surrounded by a couple of harmless setup lines. That keeps the post readable as tutorial code, while your needed fragment still has clean start and end comments."
      ),
      codeBlock(
        `
"""Starter note for a live lane analytics module."""
service_name = "lane-observer"

# Notebook aside: after 1 quiet pass, this fragment begins.
${chunks.one}
# Notebook aside: 1 quiet pass later, this fragment ends.

default_video_source = "video.mp4"
        `,
        "The first fragment keeps the file identity intact: computer vision, analytics, storage and UI are all visible before any function body appears."
      ),
      paragraph(
        "A second small decision is where to place the long-lived resources. For a one-file service, it can be perfectly reasonable to keep the connection cursor, class lookup map and event queue near the top. The point is not purity. The point is being obvious."
      ),
      codeBlock(
        `
runtime_profile = {"mode": "stream", "storage": "postgres"}

# Notebook aside: after 2 margin notes, this fragment begins.
${chunks.two}
# Notebook aside: 2 margin notes later, this fragment ends.

queue_channel_name = "dashboard-events"
        `,
        "Only the blue code block tone changes here. The site layout stays the same, but the Python slice now reads like a focused service bootstrap."
      ),
      list([
        "Group imports by role so the file announces its responsibilities immediately.",
        "Give shared handles calm, literal names because they will appear in many later functions.",
        "Keep the queue visible near the top when another thread or UI will depend on it.",
      ]),
      blockquote(
        "A readable top-of-file section saves more debugging time than a clever one ever will."
      ),
    ],
  },
  "post4.html": {
    oldTitle: "Parse Application Logs with Python and Build a Daily Report",
    title: "Keep PostgreSQL Lookups Cheap While a Vision Worker Boots Up",
    description:
      "A practical article about handling small PostgreSQL lookups and worker startup code before a computer-vision stream begins to flow.",
    label: "PostgreSQL",
    date: "2026-04-04T11:15:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "PostgreSQL lookup before worker startup",
    coverCaption:
      "Suggested cover: a compact SQL panel beside a Python worker boot sequence and a small camera preview.",
    nextKey: "post5.html",
    prevKey: "post3.html",
    related: ["post5.html", "post6.html", "post7.html"],
    body: [
      paragraph(
        "A live analytics script often needs one unglamorous helper before anything impressive happens: a small lookup function that translates a friendly label into a database key. It is not the kind of code people brag about, but the whole pipeline feels clumsy without it."
      ),
      paragraph(
        "The same is true for worker startup. If the camera, tracker and frame counter are initialized clearly, later bugs get easier to isolate. Boot code is not only technical setup. It is also narrative setup for the rest of the file."
      ),
      table(
        ["Term", "Meaning", "Reason to care"],
        [
          ["Lookup table", "A table that maps readable names to stored ids.", "It keeps the main metrics table compact and join-friendly."],
          ["Cursor", "The object used to send SQL statements through a connection.", "It is the narrow point where writes and reads stay explicit."],
          ["Worker bootstrap", "The part that prepares models, video capture and counters.", "A calm bootstrap makes the hot path easier to trust later."],
        ]
      ),
      codeBlock(
        `
vehicle_label_cache = {}

# Notebook aside: after 3 dry runs, this fragment begins.
${chunks.three}
# Notebook aside: 3 dry runs later, this fragment ends.

vehicle_label_cache["last_boot"] = "resolved"
        `,
        "This block disguises the extract inside a tutorial wrapper, but the database helper itself remains a clean, reusable fragment."
      ),
      paragraph(
        "Notice how little policy the lookup helper contains. It asks for an id, inserts the missing row only when needed, commits that small change and returns the result. That narrow scope is what keeps the function useful."
      ),
      codeBlock(
        `
boot_profile = {"model": "yolo12x.pt", "source": "video.mp4"}

# Notebook aside: after 4 clean checkpoints, this fragment begins.
${chunks.four}
# Notebook aside: 4 clean checkpoints later, this fragment ends.

boot_profile["worker_state"] = "warmed"
        `,
        "The second fragment opens the long-running worker without jumping ahead to per-frame math. That separation gives the article a cleaner rhythm."
      ),
      list([
        "Keep lookup helpers boring so they are easy to review and easy to reuse.",
        "Initialize the detector, capture object and counters before you touch the live loop.",
        "Treat worker bootstrap as a readable checkpoint, not a place for hidden side effects.",
      ]),
    ],
  },
  "post5.html": {
    oldTitle: "Validate Environment Variables in Python Before the App Starts",
    title: "Turn YOLO Detections Into Per-Frame Motion Buckets Without Losing the Thread",
    description:
      "A practical article about taking raw YOLO detections, tracking them across frames and turning them into simple per-frame metrics.",
    label: "Computer Vision",
    date: "2026-04-04T12:30:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "YOLO detections and frame buckets",
    coverCaption:
      "Suggested cover: bounding boxes, track ids and a side note showing per-frame counters.",
    nextKey: "post6.html",
    prevKey: "post4.html",
    related: ["post6.html", "post8.html", "post9.html"],
    body: [
      paragraph(
        "The most interesting part of a small traffic pipeline is often not the model call itself. It is the translation step that turns detector output into something the rest of the system can work with, such as counts, rough speed estimates and a stable vehicle label."
      ),
      paragraph(
        "That translation usually happens one frame at a time. Each frame becomes a tiny bucket of observations. The detector gives you coordinates and classes, the tracker gives you continuity, and your code turns both of those into a summary worth storing."
      ),
      table(
        ["Term", "Short explanation", "Why it matters"],
        [
          ["Track id", "The identifier that follows an object across frames.", "It lets you compare the current position with the previous one."],
          ["Centroid", "A simplified center point inside the box.", "It is often enough for a rough movement estimate."],
          ["Frame bucket", "A small per-frame summary structure.", "It keeps writes and charts simpler than storing every pixel-level detail."],
        ]
      ),
      codeBlock(
        `
minimum_debug_confidence = 0.0

# Notebook aside: after 5 lane sketches, this fragment begins.
${chunks.five}
# Notebook aside: 5 lane sketches later, this fragment ends.

minimum_debug_confidence += 0.0
        `,
        "This fragment is the heart of the live loop: it converts tracked boxes into counts and movement estimates without changing the original architecture."
      ),
      paragraph(
        "There is a useful mental model here: the tracker preserves identity, while the frame bucket preserves meaning. Without the first, motion is noisy. Without the second, your dashboard would have to understand raw detector output directly, which is rarely a good bargain."
      ),
      list([
        "Translate detector output into one stable domain vocabulary as early as possible.",
        "Use the track cache only for continuity, not for long-term storage.",
        "Keep the frame summary small so later inserts and UI updates stay cheap.",
      ]),
      blockquote(
        "The detector finds shapes, but your service still has to decide what counts as a useful event."
      ),
    ],
  },
  "post6.html": {
    oldTitle: "Import CSV Files with Python and Catch Bad Rows Early",
    title: "Ship Live Metrics Into PostgreSQL, Fan Them Out, and Keep a Debug Overlay Nearby",
    description:
      "A practical article about writing live metrics to PostgreSQL, pushing them into a queue and preserving a lightweight debug overlay.",
    label: "Data Pipeline",
    date: "2026-04-04T13:45:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "PostgreSQL metrics and debug overlay",
    coverCaption:
      "Suggested cover: a metric insert stream, a queue handoff diagram and a compact on-frame debug overlay.",
    nextKey: "post7.html",
    prevKey: "post5.html",
    related: ["post5.html", "post8.html", "post9.html"],
    body: [
      paragraph(
        "Once a frame summary exists, the script needs to do three things with it quickly. It has to persist the data, make it available to the UI, and keep enough visual feedback nearby that a human can still sanity-check what the system is doing."
      ),
      paragraph(
        "Those three concerns sound different, but they fit well together because they all derive from the same per-frame bucket. A good live pipeline avoids recomputing that summary and simply fans it out to the next consumers."
      ),
      table(
        ["Stage", "What happens", "Why it stays useful"],
        [
          ["Insert", "The frame summary is stored in the metrics table.", "Historical charts and batch exports need a durable record."],
          ["Queue handoff", "The same summary is pushed to a shared queue.", "A UI thread can react without stealing work from the detector loop."],
          ["Overlay", "A small text layer is drawn onto the live frame.", "Operators get immediate feedback during tuning or debugging."],
        ]
      ),
      codeBlock(
        `
storage_target = "stream_metrics"

# Notebook aside: after 6 insert reviews, this fragment begins.
${chunks.six}
# Notebook aside: 6 insert reviews later, this fragment ends.

storage_target = storage_target.upper()
        `,
        "The insert fragment keeps the schema-facing write logic compact, which is helpful when you later need to inspect or replay the stream."
      ),
      codeBlock(
        `
fanout_name = "live-dashboard"

# Notebook aside: after 7 buffered updates, this fragment begins.
${chunks.seven}
# Notebook aside: 7 buffered updates later, this fragment ends.

fanout_name = fanout_name.lower()
        `,
        "Here the same summary crosses the boundary into a queue. The data is still small, readable and close to the original frame context."
      ),
      codeBlock(
        `
overlay_enabled = True

# Notebook aside: after 8 overlay tweaks, this fragment begins.
${chunks.eight}
# Notebook aside: 8 overlay tweaks later, this fragment ends.

# Notebook aside: after 9 steady sweeps, this fragment begins.
${chunks.nine}
# Notebook aside: 9 steady sweeps later, this fragment ends.

overlay_enabled = bool(overlay_enabled)
        `,
        "The last block keeps the human-visible overlay and the worker cleanup together because both belong to the end of the frame cycle."
      ),
      list([
        "Write once from the frame bucket instead of recalculating per consumer.",
        "Push only the fields the UI really needs into the queue.",
        "Keep a tiny overlay around during development because it catches wrong assumptions very quickly.",
      ]),
    ],
  },
  "post7.html": {
    oldTitle: "Design a Small JSON Settings Loader with Defaults and Overrides",
    title: "Sketch a Streamlit Analytics Page With Filters Before the Data Arrives",
    description:
      "A practical article about laying out a Streamlit analytics page with filters, KPI slots and empty chart regions before the refresh logic arrives.",
    label: "Streamlit",
    date: "2026-04-04T15:00:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Streamlit analytics layout sketch",
    coverCaption:
      "Suggested cover: a Streamlit-style dashboard wireframe with filters, cards and chart placeholders.",
    nextKey: "post8.html",
    prevKey: "post6.html",
    related: ["post8.html", "post9.html", "post3.html"],
    body: [
      paragraph(
        "A dashboard becomes easier to maintain when its layout is readable before any query runs. That means naming filters clearly, reserving places for KPIs and charts, and deciding what the reader should notice first."
      ),
      paragraph(
        "This is one of those areas where a little structure pays off immediately. Streamlit makes it easy to sketch the final reading experience first and then fill in the data refresh logic later."
      ),
      table(
        ["UI term", "Meaning", "Why it helps"],
        [
          ["Sidebar filter", "A control group that changes the visible dataset.", "It gives users a clear place to narrow the story."],
          ["Placeholder", "An empty container that can be updated later.", "It lets layout and refresh logic stay loosely coupled."],
          ["KPI card", "A small metric callout for one key number.", "It gives the dashboard a quick visual summary before charts."],
        ]
      ),
      codeBlock(
        `
dashboard_name = "traffic-flow"

# Notebook aside: after 10 sidebar drafts, this fragment begins.
${chunks.ten}
# Notebook aside: 10 sidebar drafts later, this fragment ends.

dashboard_name = dashboard_name.replace("-", " ")
        `,
        "This first dashboard fragment defines the page, title and filters. It reads like article code, but the marked slice still reconstructs cleanly."
      ),
      paragraph(
        "Once the sidebar exists, the next design step is to reserve the reading order. KPI cards come first because they summarize, then trend charts, then deeper plots, and only after that the raw rows."
      ),
      codeBlock(
        `
layout_revision = "v1"

# Notebook aside: after 11 empty panels, this fragment begins.
${chunks.eleven}
# Notebook aside: 11 empty panels later, this fragment ends.

layout_revision = layout_revision.upper()
        `,
        "The second fragment stays focused on layout containers. That separation keeps the eventual refresh function easier to scan."
      ),
      list([
        "Design the reading order before you design the query order.",
        "Use placeholders when the same layout region will refresh many times.",
        "Keep filter labels friendly because they double as lightweight documentation.",
      ]),
    ],
  },
  "post8.html": {
    oldTitle: "Archive Reports with pathlib and Keep Project Folders Tidy",
    title: "Query Recent Telemetry and Draw Plotly Views Without Overcomplicating the Refresh Cycle",
    description:
      "A practical article about querying recent telemetry, calculating KPIs and drawing Plotly views inside a simple refresh function.",
    label: "Analytics",
    date: "2026-04-04T16:15:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Telemetry query and Plotly views",
    coverCaption:
      "Suggested cover: time filters, KPI cards and line charts updating from a recent telemetry query.",
    nextKey: "post9.html",
    prevKey: "post7.html",
    related: ["post9.html", "post7.html", "post6.html"],
    body: [
      paragraph(
        "After the dashboard shell is ready, the refresh function becomes the true center of gravity. It translates a filter selection into a time window, pulls recent rows, trims them to the requested vehicle types and computes the first layer of summary numbers."
      ),
      paragraph(
        "The healthy version of this function is neither tiny nor magical. It is a readable chain of small steps: filter, query, normalize the time column, compute a few KPIs, and only then build the visual layer."
      ),
      table(
        ["Refresh term", "Meaning", "Why it matters"],
        [
          ["Time cutoff", "The earliest timestamp included in the query.", "It keeps the dashboard responsive and the intent easy to explain."],
          ["Aggregation", "Grouping rows into a summary series.", "Charts usually care about patterns, not every raw write."],
          ["Correlation", "A measure of how two values move together.", "It offers a quick sense of whether intensity and speed are linked."],
        ]
      ),
      codeBlock(
        `
refresh_policy = {"window": "recent"}

# Notebook aside: after 12 filter checks, this fragment begins.
${chunks.twelve}
# Notebook aside: 12 filter checks later, this fragment ends.

refresh_policy["window"] = refresh_policy["window"].upper()
        `,
        "This block covers the refresh function up to the KPI layer, which is usually the cleanest place to pause before the chart code starts."
      ),
      codeBlock(
        `
chart_theme_name = "built-in"

# Notebook aside: after 13 chart passes, this fragment begins.
${chunks.thirteen}
# Notebook aside: 13 chart passes later, this fragment ends.

chart_theme_name = chart_theme_name.title()
        `,
        "The chart fragment stays close to Plotly defaults, which helps the article remain readable while your stored slice keeps its original flow."
      ),
      list([
        "Compute the time filter first so the rest of the refresh logic inherits a clear scope.",
        "Update KPI cards before charts because that mirrors how people usually read dashboards.",
        "Keep each chart tied to one obvious aggregation so later edits do not become guesswork.",
      ]),
    ],
  },
  "post9.html": {
    oldTitle: "Write a Safe Retry Helper for Temporary API Failures",
    title: "Switch Between Live Mode, Batch Export, and Safe Shutdown in One Python Entry File",
    description:
      "A practical article about toggling between live processing, batch export and clean shutdown without changing the overall architecture of the file.",
    label: "Operations",
    date: "2026-04-04T17:30:00+03:00",
    displayDate: "April 4, 2026",
    coverAlt: "Live mode, batch mode and shutdown path",
    coverCaption:
      "Suggested cover: a Python entry file branching into live mode, batch export and a clean shutdown routine.",
    nextKey: null,
    prevKey: "post8.html",
    related: ["post8.html", "post7.html", "post6.html"],
    body: [
      paragraph(
        "Most one-file pipelines end with a practical question: how should the script start, and how should it stop? A little entry-point discipline matters here because it becomes the difference between a script you can trust and one that leaves handles open after an exception."
      ),
      paragraph(
        "This is also where two execution styles meet. A live mode feeds the dashboard in real time, while a batch mode rolls historical rows into a file you can inspect later. They are different paths, but they should still feel like one service."
      ),
      table(
        ["Runtime term", "Meaning", "Why it stays useful"],
        [
          ["Daemon thread", "A worker thread that ends when the main program exits.", "It is a practical fit for live background processing in a dashboard script."],
          ["Batch export", "A one-off rollup written to a file.", "It gives the same stored metrics a second life outside the live UI."],
          ["Cleanup", "The final resource shutdown path.", "It prevents the script from leaving database handles behind."],
        ]
      ),
      codeBlock(
        `
entry_mode = "stream"

# Notebook aside: after 14 runtime toggles, this fragment begins.
${chunks.fourteen}
# Notebook aside: 14 runtime toggles later, this fragment ends.

entry_mode = entry_mode.lower()
        `,
        "The first closing fragment keeps the live branch narrow: start the worker, then hand the rest of the reading experience to the dashboard."
      ),
      codeBlock(
        `
export_name = "dwh_metrics.csv"

# Notebook aside: after 15 closing lines, this fragment begins.
${chunks.fifteen}
# Notebook aside: 15 closing lines later, this fragment ends.

export_name = export_name.strip()
        `,
        "The final fragment contains the batch rollup, cleanup path and entry guard, so it gives you the tail of the file in one marked section."
      ),
      list([
        "Let the entry point choose the mode, but keep the actual mode functions separate.",
        "Reuse the stored metrics for batch export instead of rebuilding history from raw frames.",
        "Always close shared resources in a final path, even when the happy path looks simple.",
      ]),
      blockquote(
        "A safe shutdown is not the opposite of speed. It is what makes quick reruns possible."
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

function replaceTitlesInFile(path, replacements) {
  let raw = fs.readFileSync(path, "utf8");
  for (const [from, to] of replacements) {
    raw = raw.split(from).join(to);
  }
  fs.writeFileSync(path, raw, "utf8");
}

function main() {
  const posts = readPosts();
  const replacements = [];

  for (const key of Object.keys(configs)) {
    const config = configs[key];
    replacements.push([config.oldTitle, config.title]);

    posts[key] = {
      ...posts[key],
      pageTitle: config.title,
      canonical: key,
      ogUrl: key,
      ogTitle: config.title,
      ogDescription: config.description,
      articleHtml: articleHtml(key, config, posts, configs),
    };
  }

  writePosts(posts);
  replaceTitlesInFile(SEARCH_PATH, replacements);
  replaceTitlesInFile(INDEX_PATH, replacements);

  console.log("Updated post3-post9 article content, search titles, and index titles.");
}

main();
