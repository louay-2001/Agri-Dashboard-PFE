# agro-service

`agro-service` owns the agritech hierarchy used by the rest of the platform:

- organization
- farm
- field

The service runs locally on port `8083` and registers in Eureka as `agro-service`.

## Local run

- Database: `agri_device_db`
- Username: `postgres`
- Password: `123456789`

```powershell
cd agro-service
mvn spring-boot:run
```

## Main endpoints

- `POST /api/agro/organizations`
- `GET /api/agro/organizations`
- `GET /api/agro/organizations/{id}`
- `PUT /api/agro/organizations/{id}`
- `DELETE /api/agro/organizations/{id}`
- `POST /api/agro/farms`
- `GET /api/agro/farms?organizationId={uuid}`
- `GET /api/agro/farms/{id}?organizationId={uuid}`
- `PUT /api/agro/farms/{id}?organizationId={uuid}`
- `DELETE /api/agro/farms/{id}?organizationId={uuid}`
- `POST /api/agro/fields`
- `GET /api/agro/fields?organizationId={uuid}`
- `GET /api/agro/fields?organizationId={uuid}&farmId={uuid}`
- `GET /api/agro/fields/{id}?organizationId={uuid}`
- `PUT /api/agro/fields/{id}?organizationId={uuid}`
- `DELETE /api/agro/fields/{id}?organizationId={uuid}`

## Hierarchy notes

- `Farm.organizationId` scopes each farm to one organization.
- `Field.farmId` scopes each field to one farm.
- `device-service` stays compatible because devices already reference `organizationId` and `fieldId` as UUIDs.

## Through gateway

The existing gateway route already maps `/api/agro/**` to `lb://agro-service`, so the same paths work through the gateway on `http://localhost:8080`.

## Testing

Use the direct service base URL:

- `http://localhost:8083/api/agro`

Use the gateway base URL:

- `http://localhost:8080/api/agro`

Sample direct requests:

```http
POST http://localhost:8083/api/agro/organizations
Content-Type: application/json

{
  "name": "Green Valley Cooperative"
}
```

```http
POST http://localhost:8083/api/agro/farms
Content-Type: application/json

{
  "organizationId": "<ORGANIZATION_ID>",
  "name": "North Farm",
  "location": "Nabeul"
}
```

```http
POST http://localhost:8083/api/agro/fields
Content-Type: application/json

{
  "organizationId": "<ORGANIZATION_ID>",
  "farmId": "<FARM_ID>",
  "name": "Field Alpha",
  "cropType": "Tomato",
  "areaHectare": 4.50
}
```

```http
GET http://localhost:8083/api/agro/organizations
GET http://localhost:8083/api/agro/farms?organizationId=<ORGANIZATION_ID>
GET http://localhost:8083/api/agro/fields?organizationId=<ORGANIZATION_ID>
```

There is also a ready-to-run request collection in [local-test.http](</C:/Users/louay/Desktop/PFE/Agri-Dashboard-main/agro-service/local-test.http>).
