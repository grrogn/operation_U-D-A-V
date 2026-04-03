import cv2, time, json, pandas as pd
from collections import defaultdict
from ultralytics import YOLO
import psycopg2
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import threading
import queue

# ============================================================================
# МОДУЛЬ Б: Анализ и обработка больших данных
# Streamlit дашборд для визуализации
# ============================================================================

# Подключение к БД (PostgreSQL для хранения метрик)
conn = psycopg2.connect(
    dbname="CAR", user="postgres", password="admin",
    host="localhost", port="5432"
)
cur = conn.cursor()

# Классы YOLO для распознавания типов ТС
YOLO_CLASSES = {2: 'car', 3: 'motorcycle', 5: 'bus', 7: 'truck'}

# Очередь для передачи данных в Streamlit
data_queue = queue.Queue()

def get_vehicle_type_id(name):
    """Получение ID типа ТС из БД"""
    cur.execute("SELECT id FROM vehicle_types WHERE name = %s", (name,))
    r = cur.fetchone()
    if r: return r[0]
    cur.execute("INSERT INTO vehicle_types (name, category) VALUES (%s, %s) RETURNING id", (name, name))
    conn.commit()
    return cur.fetchone()[0]

# ----------------------------------------------------------------------------
# ПОТОКОВАЯ ОБРАБОТКА (запускается в отдельном потоке)
# ----------------------------------------------------------------------------

def run_stream_thread():
    """Потоковая обработка видеоданных с отправкой данных в очередь"""
    model = YOLO("yolo12x.pt")
    cap = cv2.VideoCapture("video.mp4")
    tracks = {}
    frame = 0
    colors = {'car': (0,255,0), 'truck': (0,0,255), 'bus': (255,0,0), 'motorcycle': (0,255,255)}
    
    while cap.isOpened():
        ret, f = cap.read()
        if not ret: break
        
        frame += 1
        t = time.time()
        res = model.track(f, persist=True, verbose=False)
        
        if res[0].boxes.id is not None:
            stats = defaultdict(lambda: [0, 0])
            
            for box, tid, cls in zip(res[0].boxes.xyxy.cpu().numpy(), 
                                      res[0].boxes.id.cpu().numpy(), 
                                      res[0].boxes.cls.cpu().numpy()):
                x1, y1, x2, y2 = map(int, box[:4])
                cx, cy = (x1+x2)//2, (y1+y2)//2
                name = YOLO_CLASSES.get(int(cls), 'unknown')
                
                if tid in tracks:
                    spd = ((cx - tracks[tid][0])**2 + (cy - tracks[tid][1])**2)**0.5
                    stats[name][1] += spd
                
                tracks[tid] = (cx, cy, name)
                stats[name][0] += 1
            
            # Сохраняем в БД и отправляем в очередь для Streamlit
            for name, (cnt, spd_sum) in stats.items():
                avg_spd = spd_sum / (cnt + 1)
                cur.execute("INSERT INTO stream_metrics (time, vehicle_type_id, vehicle_class, intensity, avg_speed) VALUES (to_timestamp(%s), %s, %s, %s, %s)", 
                           (t, get_vehicle_type_id(name), name, cnt, avg_spd))
                
                # Отправляем данные в очередь
                data_queue.put({
                    "time": t,
                    "datetime": datetime.now(),
                    "vehicle_type": name,
                    "intensity": cnt,
                    "avg_speed": avg_spd,
                    "frame": frame
                })
            
            conn.commit()
            
            # Отрисовка и отображение (опционально, можно отключить для Streamlit)
            for name, (cnt, spd_sum) in stats.items():
                avg_spd = spd_sum / (cnt + 1)
                y = 30
                cv2.putText(f, f"Frame: {frame}", (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)
                y += 25
                cv2.putText(f, f"{name}: {cnt} (spd:{avg_spd:.1f})", (10, y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255,255,255), 1)
        
        # Очистка старых треков
        if frame % 150 == 0:
            tracks = {k: v for k, v in tracks.items() if time.time() - t < 5}
    
    cap.release()
    cv2.destroyAllWindows()

# ----------------------------------------------------------------------------
# STREAMLIT ДАШБОРД
# ----------------------------------------------------------------------------

def create_dashboard():
    """Создание интерактивной аналитической панели"""
    
    st.set_page_config(
        page_title="Traffic Analytics Dashboard",
        page_icon="🖕",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Заголовок
    st.title("🚦 Аналитика транспортных потоков")
    st.markdown("---")
    
    # Боковая панель с фильтрами
    with st.sidebar:
        st.header("📊 Настройки")
        
        # Выбор типа ТС
        vehicle_types = ['car', 'motorcycle', 'bus', 'truck', 'all']
        selected_vehicles = st.multiselect(
            "Типы транспортных средств",
            vehicle_types,
            default=['car', 'bus', 'truck']
        )
        
        # Временной диапазон
        time_range = st.selectbox(
            "Временной диапазон",
            ["Последние 5 минут", "Последние 15 минут", "Последний час", "Все данные"],
            index=1
        )
        
        # Обновление в реальном времени
        auto_refresh = st.checkbox("Автообновление", value=True)
        refresh_rate = st.slider("Частота обновления (сек)", 1, 10, 3) if auto_refresh else 0
        
        st.markdown("---")
        st.caption("Данные обновляются в реальном времени из видеопотока")
    
    # Основная область - метрики KPI
    col1, col2, col3, col4 = st.columns(4)
    
    # Placeholder для метрик
    kpi_placeholders = {
        "total": col1.empty(),
        "avg_speed": col2.empty(),
        "peak_hour": col3.empty(),
        "congestion": col4.empty()
    }
    
    # Графики
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        st.subheader("📈 Интенсивность потока по типам ТС")
        intensity_chart = st.empty()
    
    with col_chart2:
        st.subheader("📉 Средняя скорость по типам ТС")
        speed_chart = st.empty()
    
    # Дополнительные графики
    st.subheader("🔄 Тренды и распределение")
    col3, col4 = st.columns(2)
    with col3:
        distribution_chart = st.empty()
    with col4:
        correlation_chart = st.empty()
    
    # Таблица с последними данными
    st.subheader("📋 Последние события")
    data_table = st.empty()
    
    # Функция обновления дашборда
    def update_dashboard():
        # Определяем временной интервал
        if time_range == "Последние 5 минут":
            time_filter = datetime.now() - timedelta(minutes=5)
        elif time_range == "Последние 15 минут":
            time_filter = datetime.now() - timedelta(minutes=15)
        elif time_range == "Последний час":
            time_filter = datetime.now() - timedelta(hours=1)
        else:
            time_filter = datetime.now() - timedelta(days=365)
        
        # Загрузка данных из БД
        query = """
            SELECT sm.time, vt.name as vehicle_type, sm.intensity, sm.avg_speed
            FROM stream_metrics sm
            JOIN vehicle_types vt ON sm.vehicle_type_id = vt.id
            WHERE sm.time >= %s
            ORDER BY sm.time DESC
            LIMIT 1000
        """
        df = pd.read_sql(query, conn, params=(time_filter,))
        
        if df.empty:
            return
        
        df["time"] = pd.to_datetime(df["time"])
        
        # Фильтрация по типам ТС
        if 'all' not in selected_vehicles:
            df = df[df["vehicle_type"].isin(selected_vehicles)]
        
        # Расчет KPI
        total_vehicles = df["intensity"].sum()
        avg_speed_all = df["avg_speed"].mean()
        
        # Часовой пик
        df["hour"] = df["time"].dt.hour
        peak_hour = df.groupby("hour")["intensity"].sum().idxmax()
        
        # Оценка загруженности
        congestion_level = "🟢 Низкая" if total_vehicles < 100 else "🟡 Средняя" if total_vehicles < 300 else "🔴 Высокая"
        
        # Обновление KPI
        kpi_placeholders["total"].metric("🚗 Всего ТС", f"{total_vehicles:,}")
        kpi_placeholders["avg_speed"].metric("⚡ Средняя скорость", f"{avg_speed_all:.1f} px/сек")
        kpi_placeholders["peak_hour"].metric("⏰ Час пик", f"{peak_hour}:00")
        kpi_placeholders["congestion"].metric("📊 Загруженность", congestion_level)
        
        # График интенсивности
        if not df.empty:
            intensity_agg = df.groupby(["time", "vehicle_type"])["intensity"].sum().reset_index()
            fig_intensity = px.line(
                intensity_agg, 
                x="time", 
                y="intensity", 
                color="vehicle_type",
                title="Интенсивность транспортного потока",
                labels={"intensity": "Количество ТС", "time": "Время"}
            )
            intensity_chart.plotly_chart(fig_intensity, use_container_width=True)
            
            # График скорости
            speed_agg = df.groupby(["time", "vehicle_type"])["avg_speed"].mean().reset_index()
            fig_speed = px.line(
                speed_agg,
                x="time",
                y="avg_speed",
                color="vehicle_type",
                title="Средняя скорость",
                labels={"avg_speed": "Скорость (px/сек)", "time": "Время"}
            )
            speed_chart.plotly_chart(fig_speed, use_container_width=True)
            
            # Распределение по типам ТС (круговая диаграмма)
            type_distribution = df.groupby("vehicle_type")["intensity"].sum().reset_index()
            fig_pie = px.pie(
                type_distribution,
                values="intensity",
                names="vehicle_type",
                title="Распределение по типам ТС"
            )
            distribution_chart.plotly_chart(fig_pie, use_container_width=True)
            
            # Корреляция интенсивности и скорости
            corr = df[["intensity", "avg_speed"]].corr().iloc[0, 1]
            fig_corr = go.Figure()
            fig_corr.add_trace(go.Scatter(
                x=df["intensity"],
                y=df["avg_speed"],
                mode="markers",
                marker=dict(size=8, color=df["intensity"], colorscale="Viridis"),
                text=df["vehicle_type"]
            ))
            fig_corr.update_layout(
                title=f"Корреляция: интенсивность vs скорость (r={corr:.3f})",
                xaxis_title="Интенсивность",
                yaxis_title="Средняя скорость"
            )
            correlation_chart.plotly_chart(fig_corr, use_container_width=True)
            
            # Таблица последних данных
            display_df = df.head(10)[["time", "vehicle_type", "intensity", "avg_speed"]]
            display_df.columns = ["Время", "Тип ТС", "Количество", "Средняя скорость"]
            data_table.dataframe(display_df, use_container_width=True)
    
    # Цикл обновления
    if auto_refresh:
        placeholder = st.empty()
        while True:
            update_dashboard()
            time.sleep(refresh_rate)
    else:
        update_dashboard()
        st.button("🔄 Обновить", on_click=update_dashboard)

# ----------------------------------------------------------------------------
# ЗАПУСК ПОТОКОВОЙ ОБРАБОТКИ И STREAMLIT
# ----------------------------------------------------------------------------

def run_stream():
    """Запуск потоковой обработки в отдельном потоке"""
    stream_thread = threading.Thread(target=run_stream_thread, daemon=True)
    stream_thread.start()
    
    # Запуск Streamlit дашборда
    create_dashboard()

def run_batch():
    """Пакетная обработка"""
    df = pd.read_sql("SELECT sm.time, vt.name, sm.intensity, sm.avg_speed FROM stream_metrics sm JOIN vehicle_types vt ON sm.vehicle_type_id = vt.id ORDER BY sm.time", conn)
    
    if not df.empty:
        df["time"] = pd.to_datetime(df["time"])
        pivot = df.set_index("time").groupby("name").resample("1min").agg({
            "intensity": "sum",
            "avg_speed": "mean"
        }).reset_index().pivot_table(index="time", columns="name", values="intensity", fill_value=0)
        
        pivot.to_csv("dwh_metrics.csv")
        print(pivot.head())
    else:
        print("No data")

def cleanup():
    """Закрытие соединения с БД"""
    cur.close()
    conn.close()

# ----------------------------------------------------------------------------
# ТОЧКА ВХОДА
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    try:
        MODE = "stream"
        if MODE == "stream":
            # Для запуска Streamlit используйте команду:
            # streamlit run script_name.py
            run_stream()
        else:
            run_batch()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cleanup()