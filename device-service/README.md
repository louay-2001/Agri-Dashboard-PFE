# device-service

`device-service` is a standalone Spring Boot microservice for IoT device metadata. It registers with Eureka, persists device records in PostgreSQL, and exposes CRUD APIs on `/devices`.

## Stack

- Java 17
- Spring Boot 3.3.3
- Spring Data JPA
- PostgreSQL
- Spring Validation
- Spring Boot Actuator
- Eureka Client
- Spring Security Crypto (`BCryptPasswordEncoder`)

## Local Run

Local development configuration is currently set in `src/main/resources/application.yml`.

- Database name: `agri_device_db`
- Database host: `localhost`
- Database port: `5433`
- Database username: `postgres`
- Database password: `123456789`
- Service port: `8084`
- Eureka URL: `http://localhost:8761/eureka/`

Startup order:

1. Eureka
2. API Gateway
3. `device-service`

Run the service:

```powershell
cd device-service
mvn spring-boot:run
```

The service starts on `http://localhost:8084`.

These credentials are local development defaults only and should be externalized before any shared or production deployment.

## Run tests

```powershell
mvn test
```

## API summary

- `POST /devices`
- `GET /devices?organizationId={uuid}&page=0&size=20`
- `GET /devices/{id}?organizationId={uuid}`
- `PUT /devices/{id}?organizationId={uuid}`
- `DELETE /devices/{id}?organizationId={uuid}`

`organizationId` is currently passed in the request body for create, and as a query parameter for read, update, and delete endpoints.

## Sample create request

```http
POST /devices
Content-Type: application/json

{
  "fieldId": "3a23b12f-f1d1-4efd-89bb-f64384c68c71",
  "organizationId": "11111111-2222-3333-4444-555555555555",
  "firmwareVersion": "1.0.0"
}
```

## Sample create response

```json
{
  "id": "0f311dbd-6fb5-4f8f-8e53-3c96f996818f",
  "fieldId": "3a23b12f-f1d1-4efd-89bb-f64384c68c71",
  "organizationId": "11111111-2222-3333-4444-555555555555",
  "deviceIdentifier": "DEV-7A19C3F2",
  "rawDeviceSecret": "g4xGdQpC3_D5Hbh9-fgN6d4B",
  "firmwareVersion": "1.0.0",
  "status": "ACTIVE",
  "createdAt": "2026-04-18T09:30:00Z"
}
```

The raw device secret is returned only once during creation as `rawDeviceSecret`. Only the BCrypt hash is stored in PostgreSQL.

## Test directly

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8084/devices" `
  -ContentType "application/json" `
  -Body '{"fieldId":"3a23b12f-f1d1-4efd-89bb-f64384c68c71","organizationId":"11111111-2222-3333-4444-555555555555","firmwareVersion":"1.0.0"}'
```

Equivalent `curl` example:

```bash
curl -X POST "http://localhost:8084/devices" \
  -H "Content-Type: application/json" \
  -d '{
    "fieldId": "3a23b12f-f1d1-4efd-89bb-f64384c68c71",
    "organizationId": "11111111-2222-3333-4444-555555555555",
    "firmwareVersion": "1.0.0"
  }'
```

## Test through gateway

After adding the route snippet from [gateway-route-snippet.yml](./gateway-route-snippet.yml), call:

```http
POST http://localhost:8080/devices
GET http://localhost:8080/devices?organizationId=11111111-2222-3333-4444-555555555555
```

The current gateway has a global JWT filter for every non-`/auth` route. If you want to test `/devices/**` without auth for now, you must either send a valid bearer token or temporarily exempt `/devices/**` inside the gateway filter.

Additional ready-to-use curl and Postman examples are available in [http-examples.md](./http-examples.md).
