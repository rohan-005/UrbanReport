# UrbanReports API Gateway

NestJS microservice acting as the unified public API entry point for UrbanReports, featuring GraphQL schema exposure, REST proxy routing, centralized JWT authentication boundary, identity propagation (`x-user-id`, `x-user-role`), request correlation IDs (`X-Request-ID`), rate limiting, and error normalization.

## Environment Variables

```env
PORT=3005
GATEWAY_PORT=3005
USERS_SERVICE_URL=http://localhost:3001
COMPLAINTS_SERVICE_URL=http://localhost:3002
MEDIA_SERVICE_URL=http://localhost:3003
MAPS_SERVICE_URL=http://localhost:3004
JWT_SECRET=urbanreports_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:3000
```

## Endpoints

- `GET /graphql` / `POST /graphql`: Public GraphQL playground & query/mutation interface
- `ALL /api/auth/*`: Proxy to Users Service auth endpoints
- `ALL /api/users/*`: Proxy to Users Service user endpoints
- `ALL /api/complaints/*`: Proxy to Complaints Service PostGIS endpoints
- `ALL /api/media/*`: Proxy to Media Service GridFS upload & stream endpoints
- `ALL /api/maps/*`: Proxy to Maps Service MapTiler search & reverse geocoding
- `GET /health`: Gateway health status
