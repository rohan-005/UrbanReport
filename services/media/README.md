# UrbanReports Media Service

NestJS microservice handling MongoDB Atlas GridFS image storage, metadata persistence, SHA-256 checksum integrity, dimension extraction, and controlled streaming media retrieval.

## Environment Variables

```env
PORT=3003
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/?retryWrites=true&w=majority
MEDIA_DB_NAME=urbanreports_media
GRIDFS_BUCKET=complaint_media
MAX_IMAGE_SIZE=10485760
JWT_SECRET=urbanreports_super_secret_jwt_key_2026
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

- `POST /media`: Upload complaint evidence photo (`multipart/form-data`)
- `GET /media/:id`: Stream binary photo content with controlled access headers
- `GET /media/:id/metadata`: Fetch media metadata record (JSON)
- `POST /media/:id/associate`: Associate uploaded media with a complaint ID
- `DELETE /media/:id`: Delete GridFS binary and metadata (Owner / Admin authorized)
- `GET /health`: Service health check
