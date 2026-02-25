# API Endpoints

## Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

## Listings
- GET /api/listings
- GET /api/listings/:id
- POST /api/listings
- PUT /api/listings/:id
- DELETE /api/listings/:id

## Favorites
- GET /api/favorites
- POST /api/favorites/:listingId
- DELETE /api/favorites/:listingId

## Admin
- GET /api/admin/users
- GET /api/admin/listings
- DELETE /api/admin/users/:id
- DELETE /api/admin/listings/:id