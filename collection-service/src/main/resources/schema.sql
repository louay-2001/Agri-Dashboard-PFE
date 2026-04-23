CREATE EXTENSION IF NOT EXISTS timescaledb;

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS battery_level double precision;

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS time timestamp with time zone;

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS organization_id uuid;

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS device_id uuid;

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS soil_moisture double precision;

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS temperature double precision;

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS humidity double precision;

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS mqtt_topic varchar(255);

ALTER TABLE IF EXISTS sensor_data
    ADD COLUMN IF NOT EXISTS raw_payload text;

UPDATE sensor_data
SET time = COALESCE(time, NOW())
WHERE time IS NULL;

INSERT INTO sensor_data (
    id,
    organization_id,
    device_id,
    temperature,
    humidity,
    soil_moisture,
    battery_level,
    mqtt_topic,
    raw_payload,
    time
)
SELECT
    sr.id,
    sr.organization_id,
    sr.device_id,
    sr.temperature,
    sr.humidity,
    sr.soil_moisture,
    NULL,
    sr.mqtt_topic,
    sr.raw_payload,
    sr.recorded_at
FROM sensor_readings sr
WHERE NOT EXISTS (
    SELECT 1
    FROM sensor_data sd
    WHERE sd.id = sr.id
);

SELECT create_hypertable('sensor_data', 'time', if_not_exists => TRUE, migrate_data => TRUE);

CREATE INDEX IF NOT EXISTS idx_sensor_data_org_time_desc
    ON sensor_data (organization_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_data_device_time_desc
    ON sensor_data (device_id, time DESC);
