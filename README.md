# Agri-Dashboard

Agri-Dashboard is an IoT agritech platform for managing organizations, farms, fields, devices, and sensor readings.

The platform combines:

- Spring Boot microservices
- Spring Cloud Gateway
- Eureka service discovery
- JWT-based authentication
- MQTT sensor ingestion
- PostgreSQL persistence
- a Next.js frontend

## Project Overview

Agri-Dashboard is designed to support a multi-tenant agritech workflow:

- `ADMIN` users manage the platform globally
- `MANAGER` and `VIEWER` users work inside an organization scope
- organizations contain farms
- farms contain fields
- fields contain devices
- devices produce sensor readings ingested through MQTT

The frontend exposes the main workflow for:

- authentication
- organization, farm, and field management
- device management
- latest sensor readings and reading history

## Architecture

Main components in the current local platform:

- `frontend`
  Next.js application for authentication, agritech hierarchy management, device management, and readings views
- `scg-api-gateway`
  single API entry point and route dispatcher
- `eureka-discovery-service`
  Eureka server for service discovery
- `auth-service`
  signup, signin, JWT issuance
- `agro-service`
  organizations, farms, fields
- `device-service`
  device CRUD and organization/field ownership checks
- `collection-service`
  MQTT subscriber and sensor reading persistence/query APIs
- `alert-service`
  alert and legacy inventory/dashboard endpoints
- MQTT broker
  Mosquitto or EMQX, used for device data publishing
- PostgreSQL
  local relational database used by the services

## Startup Order

Start services in this order for local development:

1. MQTT broker
2. `eureka-discovery-service`
3. `auth-service`
4. `agro-service`
5. `device-service`
6. `collection-service`
7. `alert-service`
8. `scg-api-gateway`
9. `frontend`

## Local URLs

- Frontend: `http://localhost:3000`
- Gateway: `http://localhost:8080`
- Eureka: `http://localhost:8761`
- MQTT broker: `mqtt://localhost:1883`

Useful service ports in the current setup:

- `auth-service`: `8082`
- `agro-service`: `8083`
- `device-service`: `8084`
- `collection-service`: `8090`
- `alert-service`: `8092`

## Authentication And Roles

The platform currently supports three roles:

- `ADMIN`
  global role with no organization scope
- `MANAGER`
  organization-scoped role
- `VIEWER`
  organization-scoped read-oriented role

### Signup Behavior

There is only one signup page in the frontend.

- `ADMIN`
  requires only:
  - email
  - password
  - confirm password
  - role
- `MANAGER` and `VIEWER`
  require:
  - email
  - password
  - confirm password
  - role
  - organization selection from existing organizations

Important behavior:

- `ADMIN` signup does not ask for organization
- `ADMIN` users are stored with `organizationId = null`
- `MANAGER` and `VIEWER` must belong to an existing organization

## MQTT Ingestion

`collection-service` subscribes to the following topic format:

```text
agri/{organizationId}/{deviceId}/data
```

Important:

- `deviceId` must be the internal device UUID
- do not use `deviceIdentifier` in the MQTT topic

Example topic:

```text
agri/52b7e663-85ba-4201-a94c-3eef6bd11c6e/d58297b8-5e08-4e90-8f1f-8530a8cc3197/data
```

Example payload:

```json
{
  "temperature": 27.9,
  "humidity": 53,
  "soil_moisture": 51,
  "battery_level": 70
}
```

The payload keys above match the JSON fields parsed by `collection-service`.

## MQTT Simulator

A developer/demo MQTT simulator is available at:

```text
tools/mqtt-simulator
```

### Install

```bash
cd tools/mqtt-simulator
npm install
```

### Run Example

```bash
npm run start -- --organizationId 52b7e663-85ba-4201-a94c-3eef6bd11c6e --deviceId d58297b8-5e08-4e90-8f1f-8530a8cc3197
```

What it does:

- publishes fake randomized sensor data every 5 seconds by default
- publishes to `agri/{organizationId}/{deviceId}/data`
- logs the topic, payload, and timestamp of every publish

## End-To-End Demo Scenario

Use the following flow to test the platform from UI to MQTT ingestion:

1. Log in as admin.
2. Create or select an organization.
3. Create a farm inside that organization.
4. Create a field inside that farm.
5. Create a device inside that organization and field.
6. Copy the internal device UUID from the device record.
7. Run the MQTT simulator with the correct `organizationId` and internal `deviceId`.
8. Check `collection-service` logs for successful ingestion and persistence.
9. Open the Readings page in the frontend and refresh the data.

This validates the chain:

`organization -> farm -> field -> device -> MQTT publish -> collection-service -> database -> frontend`

## End-To-End Local Test Steps

1. Start the MQTT broker.
2. Start `eureka-discovery-service`.
3. Start:
   - `auth-service`
   - `agro-service`
   - `device-service`
   - `collection-service`
   - `alert-service`
   - `scg-api-gateway`
4. Start the frontend and open `http://localhost:3000`.
5. Sign in as an admin user.
6. Create or select an organization.
7. Create a farm.
8. Create a field.
9. Create a device.
10. Copy the device internal UUID.
11. Run the simulator:

```bash
cd tools/mqtt-simulator
npm run start -- --organizationId <ORG_UUID> --deviceId <DEVICE_UUID>
```

12. Watch `collection-service` logs.
13. Open the Readings page and refresh if needed.
14. Confirm the new reading appears in the UI and backend.

## Troubleshooting

- `503` from the gateway usually means the downstream service is not registered in Eureka or the route service name does not match the Eureka application name.
- MQTT port `1883` already in use usually means Mosquitto or EMQX is already running.
- If `collection-service` says `deviceId` must be UUID, use `device.id`, not `deviceIdentifier`.
- If readings do not appear:
  - check simulator logs
  - check `collection-service` logs
  - verify the MQTT topic
  - verify `organizationId`
  - verify internal `deviceId`

## Notes

- `agro-service` exposes a public organization list endpoint used by signup:
  - `GET /api/agro/organizations/public`
- most application traffic should go through the gateway at `http://localhost:8080`
- the MQTT simulator is for local development and demo validation before embedded/network modules are available
