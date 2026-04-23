# device-service HTTP examples

## curl

Create a device:

```bash
curl -X POST "http://localhost:8084/devices" \
  -H "Content-Type: application/json" \
  -d '{
    "fieldId": "3a23b12f-f1d1-4efd-89bb-f64384c68c71",
    "organizationId": "11111111-2222-3333-4444-555555555555",
    "firmwareVersion": "1.0.0"
  }'
```

Get one device:

```bash
curl "http://localhost:8084/devices/0f311dbd-6fb5-4f8f-8e53-3c96f996818f?organizationId=11111111-2222-3333-4444-555555555555"
```

List devices:

```bash
curl "http://localhost:8084/devices?organizationId=11111111-2222-3333-4444-555555555555&page=0&size=10"
```

## Postman

Create a device:

- Method: `POST`
- URL: `http://localhost:8084/devices`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "fieldId": "3a23b12f-f1d1-4efd-89bb-f64384c68c71",
  "organizationId": "11111111-2222-3333-4444-555555555555",
  "firmwareVersion": "1.0.0"
}
```

Get one device:

- Method: `GET`
- URL: `http://localhost:8084/devices/0f311dbd-6fb5-4f8f-8e53-3c96f996818f?organizationId=11111111-2222-3333-4444-555555555555`

List devices:

- Method: `GET`
- URL: `http://localhost:8084/devices?organizationId=11111111-2222-3333-4444-555555555555&page=0&size=10`
