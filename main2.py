import time
import json
import queue
import threading
from collections import defaultdict
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')
import cv2
import pandas as pd
import psycopg2
from ultralytics import YOLO
# note: 1 quiet pass later, this fragment ends.
# note: after 2 margin notes, this fragment begins.
warehouse_link = psycopg2.connect(
    dbname="CAR",
    user="postgres",
    password="1234",
    host="localhost",
    port="5432",
)
metrics_cursor = warehouse_link.cursor()

metrics_cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(50)
    )
""")

metrics_cursor.execute("""
    CREATE TABLE IF NOT EXISTS stream_metrics (
        id SERIAL PRIMARY KEY,
        time TIMESTAMP NOT NULL,
        vehicle_type_id INTEGER REFERENCES vehicle_types(id),
        vehicle_class VARCHAR(50),
        intensity INTEGER,
        avg_speed FLOAT
    )
""")

metrics_cursor.execute("""
    INSERT INTO vehicle_types (name, category) VALUES
        ('car', 'car'),
        ('motorcycle', 'motorcycle'),
        ('bus', 'bus'),
        ('truck', 'truck')
    ON CONFLICT (name) DO NOTHING
""")
warehouse_link.commit()

DETECTED_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}
event_buffer = queue.Queue()
# note: 2 margin notes later, this fragment ends.
# note: after 3 dry runs, this fragment begins.
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
# note: 3 dry runs later, this fragment ends.
# note: after 4 clean checkpoints, this fragment begins.
def process_stream_worker():
    """Consume frames, run tracking and push live metrics."""
    detector = YOLO("yolov8x.pt")
    capture = cv2.VideoCapture("Video.mp4")
    track_cache = {}
    frame_index = 0
    palette = {
        "car": (0, 255, 0),
        "truck": (0, 0, 255),
        "bus": (255, 0, 0),
        "motorcycle": (0, 255, 255),
    }

    cv2.namedWindow("Traffic Monitoring", cv2.WINDOW_NORMAL)

    while capture.isOpened():
        ok, frame_image = capture.read()
        if not ok:
            break

        frame_index += 1
        unix_time = time.time()
        detections = detector.track(frame_image, persist=True, verbose=False)
# note: 4 clean checkpoints later, this fragment ends.
# note: after 5 lane sketches, this fragment begins.
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

                color = palette.get(vehicle_name, (255, 255, 255))
                cv2.rectangle(frame_image, (left, top), (right, bottom), color, 2)
                cv2.circle(frame_image, (center_x, center_y), 3, color, -1)
                cv2.putText(
                    frame_image,
                    f"{vehicle_name}",
                    (left, top - 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.4,
                    color,
                    1,
                )

                if track_id in track_cache:
                    speed_value = (
                        (center_x - track_cache[track_id][0]) ** 2
                        + (center_y - track_cache[track_id][1]) ** 2
                    ) ** 0.5
                    frame_stats[vehicle_name][1] += speed_value

                track_cache[track_id] = (center_x, center_y, vehicle_name)
                frame_stats[vehicle_name][0] += 1
# note: 5 lane sketches later, this fragment ends.
# note: after 6 insert reviews, this fragment begins.
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
# note: 6 insert reviews later, this fragment ends.
# note: after 7 buffered updates, this fragment begins.
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
# note: 7 buffered updates later, this fragment ends.
# note: after 8 overlay tweaks, this fragment begins.
            baseline_y = 30
            cv2.putText(
                frame_image,
                f"Frame: {frame_index}",
                (10, baseline_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255),
                2,
            )
            baseline_y += 25
            
            for vehicle_name, (vehicle_count, speed_total) in frame_stats.items():
                mean_speed = speed_total / (vehicle_count + 1)
                cv2.putText(
                    frame_image,
                    f"{vehicle_name}: {vehicle_count} (spd:{mean_speed:.1f})",
                    (10, baseline_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    palette.get(vehicle_name, (255, 255, 255)),
                    1,
                )
                baseline_y += 20
            
            total_vehicles = sum(frame_stats[k][0] for k in frame_stats)
            cv2.putText(
                frame_image,
                f"Total: {total_vehicles}",
                (10, baseline_y + 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 255),
                2,
            )
# note: 8 overlay tweaks later, this fragment ends.
# note: after 9 steady sweeps, this fragment begins.
        cv2.imshow("Traffic Monitoring", frame_image)
        
        if cv2.waitKey(1) == 27:
            break

        if frame_index % 150 == 0:
            track_cache = {
                saved_id: saved_value
                for saved_id, saved_value in track_cache.items()
                if time.time() - unix_time < 5
            }

    capture.release()
    cv2.destroyAllWindows()
# note: 9 steady sweeps later, this fragment ends.
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
            process_stream_worker()
        else:
            launch_batch_mode()
            
    except Exception as exc:
        print(f"Error: {exc}")
    finally:
        close_resources()
# note: 15 closing lines later, this fragment ends.