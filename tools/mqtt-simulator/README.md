# MQTT Simulator

Small developer/demo simulator that publishes fake sensor readings to the MQTT topic format expected by `collection-service`.

## Location

`tools/mqtt-simulator/`

## Requirements

- Node.js 18+ recommended
- An MQTT broker running locally or remotely

## Install dependencies

From the simulator folder:

```bash
cd tools/mqtt-simulator
npm install
```

## Run the simulator

```bash
npm start -- --organizationId 11111111-1111-1111-1111-111111111111 --deviceId 22222222-2222-2222-2222-222222222222
```

You can also use `deviceIdentifier` as an alias:

```bash
npm start -- --organizationId 11111111-1111-1111-1111-111111111111 --deviceIdentifier 22222222-2222-2222-2222-222222222222
```

## Options

- `--brokerUrl`
  Default: `mqtt://localhost:1883`
- `--organizationId`
  Required
- `--deviceId`
  Required unless `--deviceIdentifier` is used
- `--deviceIdentifier`
  Alias of `--deviceId`
- `--intervalSeconds`
  Default: `5`
- `--interval`
  Alias of `--intervalSeconds`
- `--username`
  Optional
- `--password`
  Optional

Example with all common options:

```bash
npm start -- --brokerUrl mqtt://localhost:1883 --organizationId 11111111-1111-1111-1111-111111111111 --deviceId 22222222-2222-2222-2222-222222222222 --intervalSeconds 3
```

## Expected topic

The simulator publishes to:

```text
agri/{organizationId}/{deviceId}/data
```

Example:

```text
agri/11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/data
```

## Expected payload

The payload matches the JSON fields parsed by `collection-service`:

```json
{
  "temperature": 25.5,
  "humidity": 60,
  "soil_moisture": 30,
  "battery_level": 90
}
```

Each publish randomizes values within these ranges:

- `temperature`: 20 to 35
- `humidity`: 40 to 80
- `soil_moisture`: 15 to 70
- `battery_level`: 50 to 100

## Console output

Every publish logs:

- timestamp
- topic
- payload

## End-to-end verification

1. Start Eureka.
2. Start backend services, especially:
   - `device-service`
   - `collection-service`
   - `scg-api-gateway`
3. Start an MQTT broker on `localhost:1883` or point the simulator to another broker with `--brokerUrl`.
4. Create the agritech hierarchy and device in the platform:
   - organization
   - farm
   - field
   - device
5. Make sure the `deviceId` and `organizationId` you pass to the simulator match a real registered device.
   `collection-service` validates topic organization/device ownership before saving readings.
6. Run the simulator.
7. Verify the reading appears:
   - in `collection-service` logs
   - in the database table/view used for sensor readings
   - in the frontend readings/dashboard pages

## Notes

- If your broker later requires authentication, pass `--username` and `--password`.
- Stop the simulator with `Ctrl+C`.
