
# Microservices Practice Demo

This is a small JavaScript microservices project for learning the basic ideas
behind service boundaries and service-to-service HTTP calls. It is intentionally
simple and is **not** meant to represent a complete company production
architecture.

## Architecture

```text
Client
  |
  v
API Gateway :3000
  |--------------------|
  v                    v
User Service :3001   Product Service :3002
  |                    |
  v                    |
MongoDB              MongoDB
           \          /
            v        v
          Order Service :3003
                 |
                 v
               MongoDB
```

- **API Gateway** exposes one public entry point and forwards requests.
- **User Service** handles registration, login, and user profiles.
- **Product Service** handles products and stock reservations.
- **Order Service** verifies users, reserves stock, and creates orders.
- Each service has its own process and database connection to keep the example
  easy to compare with the architecture.

## Requirements

- Node.js 18 or newer
- MongoDB running locally (or a MongoDB connection string)

## Setup

Install dependencies in each service:

```powershell
cd api-gateway; npm install
cd ..\user-service; npm install
cd ..\product-service; npm install
cd ..\order-service; npm install
```

Copy each `.env.example` to `.env` in the same directory. The default values
are suitable for a local MongoDB instance:

```text
MONGODB_URI=mongodb://127.0.0.1:27017/microservices_demo
```

The gateway also uses these defaults:

```text
USER_SERVICE_URL=http://localhost:3001
PRODUCT_SERVICE_URL=http://localhost:3002
ORDER_SERVICE_URL=http://localhost:3003
```

Run each process in a separate terminal:

```powershell
cd api-gateway; npm run dev
cd user-service; npm run dev
cd product-service; npm run dev
cd order-service; npm run dev
```

Check the gateway and all downstream services:

```text
GET http://localhost:3000/health
GET http://localhost:3000/status
```

The gateway API is available under `/api/users`, `/api/products`, and
`/api/orders`. The service-specific route files show the complete list of
endpoints.

## Learning path

1. Start the services and call `/health` on each one.
2. Register and log in a user through the gateway.
3. Create a product and observe the product service's stock.
4. Create an order and follow the calls from order service to user and product
   services.
5. Cancel the order and observe stock being released.

This project is deliberately a small practice setup: it does not include
containers, orchestration, messaging, distributed tracing, or production
security hardening.
