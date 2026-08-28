# UrbanReports Maps Service

NestJS microservice encapsulating MapTiler Cloud geocoding, address search, and reverse-geocoding resolution for the UrbanReports civic platform.

## Environment Variables

```env
PORT=3004
MAPTILER_API_KEY=your_maptiler_api_key_here
MAPTILER_BASE_URL=https://api.maptiler.com/geocoding
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

- `GET /maps/search?q=...`: Search address / place name via MapTiler geocoding
- `GET /maps/reverse?lat=...&lng=...`: Reverse geocode coordinates to human-readable address
- `GET /health`: Microservice health status check
