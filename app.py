import psycopg2, psycopg2.extras, pandas as pd, schedule, time, json, logging
from contextlib import contextmanager

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
DB = {"dbname": "CAR", "user": "postgres", "password": "1234", "host": "localhost", "port": "5432"}

class TrafficETL:
    def __init__(self, db_cfg):
        self.db = db_cfg
        self._init_infrastructure()

    @contextmanager
    def _db(self):
        conn = psycopg2.connect(**self.db)
        try: yield conn
        finally: conn.close()

    def _init_infrastructure(self):
        """Г.1.5: Подготовка DWH и служебных таблиц"""
        with self._db() as conn, conn.cursor() as cur:
            cur.execute("CREATE SCHEMA IF NOT EXISTS dwh; CREATE SCHEMA IF NOT EXISTS dwt;")
            cur.execute("""CREATE TABLE IF NOT EXISTS dwh.traffic_vitрина (
                id BIGSERIAL PRIMARY KEY, ts TIMESTAMP, vehicle TEXT, intensity INT,
                avg_speed FLOAT, peak INT, weather TEXT, UNIQUE(ts, vehicle));""")
            cur.execute("CREATE TABLE IF NOT EXISTS dwt.log (ts TIMESTAMP, status TEXT, rows INT);")
            cur.execute("CREATE TABLE IF NOT EXISTS dwt.wm (ts TIMESTAMP);")
            conn.commit()

    def _extract(self, cur):
        """Г.1.2: Инкрементальная загрузка по watermark"""
        cur.execute("SELECT COALESCE(MAX(ts), '2000-01-01') FROM dwt.wm")
        last_ts = cur.fetchone()[0]
        return pd.read_sql("""
            SELECT sm.time, vt.name, sm.intensity, sm.avg_speed 
            FROM stream_metrics sm JOIN vehicle_types vt ON sm.vehicle_type_id = vt.id 
            WHERE sm.time > %s""", cur.connection, params=(last_ts,))

    def _transform(self, df):
        """Г.1.4: Контроль качества + нормализация"""
        if df.empty: return df
        df = df.drop_duplicates().dropna(subset=["intensity", "avg_speed"])
        df = df[df["avg_speed"] <= df["avg_speed"].quantile(0.95)]  # отсечение выбросов
        df["ts"] = pd.to_datetime(df["time"])
        df["vehicle"] = df["name"].str.lower().str.strip()
        df["peak"] = df["ts"].dt.hour.isin([7,8,9,17,18,19]).astype(int)
        return df

    def _enrich(self, df):
        """Г.1.1: Обогащение внешними атрибутами"""
        if df.empty: return df
        ext = pd.DataFrame({"hour": range(24), "weather": ["clear"]*8 + ["rain"]*8 + ["cloudy"]*8})
        return df.merge(ext, left_on=df["ts"].dt.hour, right_on="hour", how="left").drop(columns="hour")

    def _load(self, cur, df):
        """Г.1.5: Выгрузка в DWH (UPSERT)"""
        if df.empty: return 0
        query = """INSERT INTO dwh.traffic_vitрина(ts, vehicle, intensity, avg_speed, peak, weather)
                   VALUES(%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING"""
        psycopg2.extras.execute_batch(cur, query, df[["ts","vehicle","intensity","avg_speed","peak","weather"]].values.tolist())
        return len(df)

    def run(self):
        """Оркестрация DAG: extract → transform → enrich → load"""
        try:
            with self._db() as conn, conn.cursor() as cur:
                df = self._extract(cur)
                df = self._transform(df)
                df = self._enrich(df)
                rows = self._load(cur, df)
                if rows:
                    cur.execute("INSERT INTO dwt.log VALUES(NOW(),'success',%s)", (rows,))
                    cur.execute("INSERT INTO dwt.wm VALUES(NOW())")
                    conn.commit()
                logging.info(f"✅ DAG completed | Rows: {rows}")
                self._report(rows)
        except Exception as e:
            logging.error(f"❌ Pipeline failed: {e}")

    def _report(self, rows):
        rpt = {"dag_steps": ["extract","quality","transform","enrich","load"], "rows_processed": rows, "ts": pd.Timestamp.now().isoformat()}
        with open("Report_G.json", "w") as f: json.dump(rpt, f, ensure_ascii=False)

# Г.2.2: Расписание запуска
if __name__ == "__main__":
    etl = TrafficETL(DB)
    schedule.every(10).seconds.do(etl.run)
    print("🚀 Module G Orchestrator started")
    try:
        while True: schedule.run_pending(); time.sleep(1)
    except KeyboardInterrupt: print("⏹ Graceful shutdown")