# Agritech IoT Platform

This repository contains the demo-ready backend and frontend for an agritech IoT platform with:

- organization, farm, and field management
- device registration
- MQTT-based real-time sensor ingestion
- PostgreSQL persistence
- Eureka service discovery
- Spring Cloud Gateway routing

## Core Services

| Service | Purpose | Port | Notes |
| --- | --- | --- | --- |
| `eureka-discovery-service` | Service registry | `8761` | Must start first |
| `scg-api-gateway` | Single API entry point | `8080` | Routes requests to backend services |
| `auth-service` | Authentication service | `8082` | Issues JWTs used by the gateway to protect agritech routes |
| `agro-service` | Organizations, farms, fields | `8083` | Owns the hierarchy `organization -> farm -> field` |
| `device-service` | Device metadata CRUD | `8084` | Devices belong to an organization and field |
| `collection-service` | MQTT ingestion + sensor readings | `8090` | Validates devices and persists readings |
| `frontend` | Demo UI | `3000` | If started with Next.js default dev port |

## Other Repository Services

These service folders are also present in the repository but are not required for the core demo flow described below:

- `alert-service` on `8092`
- `processing-service` on `8091`
- `weather-service`
- `prediction-service`

## Local Infrastructure

- PostgreSQL: `localhost:5433`
- Main local databases currently used by the repository services: `agri_auth`, `agri_device_db`, `iot_alert`
- PostgreSQL username: `postgres`
- PostgreSQL password: `123456789`
- EMQX MQTT broker: `tcp://localhost:1883`

## Startup Order

1. PostgreSQL
2. EMQX
3. `eureka-discovery-service`
4. `auth-service`
5. `scg-api-gateway`
6. `agro-service`
7. `device-service`
8. `collection-service`
9. `frontend`

`auth-service` is now part of the main local flow because the gateway protects the agritech APIs with JWT validation.

## Gateway Security

Public through the gateway:

- `OPTIONS /**`
- `/auth/**`
- `/actuator/**`

Protected through the gateway:

- `/api/agro/**`
- `/devices/**`
- `/api/collection/**`
- `/api/collecte/**`
- `/api/alerts/**`
- `/api/gateways/**`
- `/api/nodes/**`
- `/api/sensors/**`
- `/api/dashboard/**`
- `/api/weather/**`
- `/api/processing/**`
- `/api/traitement/**`
- `/api/prediction/**`

After the gateway validates a JWT, it forwards trusted identity headers to downstream services:

- `X-Auth-Validated: true`
- `X-User-Id`
- `X-User-Email`
- `X-User-Name`
- `X-User-Organization-Id`
- `X-User-Role`
- `X-User-Roles`

Use `POST /auth/signin` first to obtain a Bearer token, then call the protected agritech routes through `http://localhost:8080`.

## Key Gateway Endpoints

Hierarchy:

- `POST /api/agro/organizations`
- `GET /api/agro/organizations`
- `POST /api/agro/farms`
- `GET /api/agro/farms?organizationId={uuid}`
- `POST /api/agro/fields`
- `GET /api/agro/fields?organizationId={uuid}`

Devices:

- `POST /devices`
- `GET /devices?organizationId={uuid}`
- `GET /devices/{id}?organizationId={uuid}`

Readings:

- `GET /api/collection/readings?organizationId={uuid}`
- `GET /api/collection/readings?organizationId={uuid}&deviceId={uuid}`
- `GET /api/collection/readings/latest?organizationId={uuid}&deviceId={uuid}`

All of the endpoints above are available through the gateway on `http://localhost:8080` and require a valid `Authorization: Bearer <token>` header, except the public auth and actuator endpoints documented above.

## MQTT Topic Format

Publish sensor data to:

```text
agri/{organizationId}/{deviceId}/data
```

Sample topic:

```text
agri/11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/data
```

Sample payload:

```json
{
  "temperature": 25.5,
  "humidity": 60,
  "soil_moisture": 30
}
```

Sample publish command:

```powershell
mosquitto_pub -h localhost -p 1883 -t "agri/<ORG_ID>/<DEVICE_ID>/data" -m "{\"temperature\":25.5,\"humidity\":60,\"soil_moisture\":30}"
```

## Demo Flow

1. Create an organization.
2. Create a farm inside that organization.
3. Create a field inside that farm.
4. Create a device linked to that organization and field.
5. Publish MQTT sensor data for that device.
6. Verify the reading was persisted through the collection API.

This demonstrates the full chain:

`organization -> farm -> field -> device -> MQTT publish -> PostgreSQL reading`

## Quick Demo Checklist

- Create organization: `POST /api/agro/organizations`
- Create farm: `POST /api/agro/farms`
- Create field: `POST /api/agro/fields`
- Create device: `POST /devices`
- Publish MQTT message to `agri/{organizationId}/{deviceId}/data`
- Verify persisted reading with `GET /api/collection/readings/latest?organizationId={uuid}&deviceId={uuid}`

## Minimal Demo Requests

A small gateway-focused demo request file is available at [demo.http](</C:/Users/louay/Desktop/PFE/Agri-Dashboard-main/demo.http>).

## Service Notes

- `agro-service` runs on `8083` and is exposed through `/api/agro/**`.
- `device-service` runs on `8084` and is exposed through `/devices/**`.
- `collection-service` runs on `8090`, subscribes to `agri/+/+/data`, and is exposed through `/api/collection/**`.
- `collection-service` validates MQTT topic organization/device ownership by calling `device-service`.

## Demo Scope

Ready now:

- CRUD for organizations, farms, fields, and devices
- Gateway routing
- Eureka discovery
- PostgreSQL persistence
- MQTT ingestion
- Reading verification APIs

Not finalized yet:

- TimescaleDB migration
- production-grade auth across every route
- dashboards and prediction workflows built on top of the ingested readings
