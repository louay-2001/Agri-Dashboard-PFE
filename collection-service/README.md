# collection-service

`collection-service` is the MQTT ingestion service for real-time device sensor data.

It subscribes to EMQX-compatible topics in the form:

- `agri/{org_id}/{device_id}/data`

For each incoming message it:

- parses the topic safely
- validates the JSON payload
- checks the device through `device-service`
- persists the sensor reading in PostgreSQL with the TimescaleDB extension enabled

## Local config

- Service name in Eureka: `service-collecte`
- Local port: `8090`
- Database: `agri_device_db`
- Username: `postgres`
- Password: `123456789`
- Required extension: `timescaledb`
- MQTT broker URL: `tcp://localhost:1883`
- MQTT topic filter: `agri/+/+/data`

## Sample topic

```text
agri/11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/data
```

## Sample payload

```json
{
  "temperature": 25.5,
  "humidity": 60,
  "soil_moisture": 30,
  "battery_level": 82
}
```

## Useful local endpoints

- `GET http://localhost:8090/api/collection/readings?organizationId={uuid}`
- `GET http://localhost:8090/api/collection/readings?organizationId={uuid}&deviceId={uuid}`
- `GET http://localhost:8090/api/collection/readings/latest?organizationId={uuid}&deviceId={uuid}`

## Manual test steps

1. Start PostgreSQL.
2. Start Eureka.
3. Start `device-service`.
4. Start EMQX on `tcp://localhost:1883`.
5. Start `collection-service`.
6. Create a device in `device-service` and note its `organizationId` and `id`.
7. Publish a message to `agri/{organizationId}/{deviceId}/data`.
8. Check persisted readings with:
   `GET http://localhost:8090/api/collection/readings?organizationId={organizationId}&deviceId={deviceId}`

Example publish with `mosquitto_pub`:

```powershell
mosquitto_pub -h localhost -p 1883 -t "agri/<ORG_ID>/<DEVICE_ID>/data" -m "{\"temperature\":25.5,\"humidity\":60,\"soil_moisture\":30,\"battery_level\":82}"
```

## TimescaleDB finalization

On startup, `collection-service` now runs `src/main/resources/schema.sql` after JPA creates or updates the base table. That script:

- creates the `timescaledb` extension if it is available
- aligns the physical table name to `sensor_data`
- backfills data from any legacy `sensor_readings` table into `sensor_data`
- converts `sensor_data` into a hypertable on the `time` column
- creates descending time indexes for organization and device queries

Core `sensor_data` columns now match the project spec:

- `time`
- `device_id`
- `soil_moisture`
- `temperature`
- `humidity`
- `battery_level`

Compatibility columns kept for the current APIs and service logic:

- `id`
- `organization_id`
- `mqtt_topic`
- `raw_payload`
