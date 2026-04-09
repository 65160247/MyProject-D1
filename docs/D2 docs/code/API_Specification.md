
# API Specification

## 1. Authentication

### POST /api/auth/register
- Register a new user
- Body: `{ "username": string, "email": string, "password": string, "role": "user|landlord|admin" }`
- Success: 201 Created, returns user object

### POST /api/auth/login
- Login a user
- Body: `{ "email": string, "password": string }`
- Success: 200 OK, returns `{ token, user }`

### GET /api/auth/profile
- Get current user profile
- Header: `Authorization: Bearer <token>`
- Success: 200 OK, returns user object

## 2. Listings

### GET /api/listings
- Get all listings (optional filters: city, type)
- Success: 200 OK, returns array of listings

### GET /api/listings/:id
- Get a single listing by ID
- Success: 200 OK, returns listing object

### POST /api/listings
- Create a new listing
- Header: `Authorization: Bearer <token>`
- Body: listing data
- Success: 201 Created, returns created listing

### PUT /api/listings/:id
- Update a listing
- Header: `Authorization: Bearer <token>`
- Body: listing data
- Success: 200 OK, returns updated listing

### DELETE /api/listings/:id
- Delete a listing
- Header: `Authorization: Bearer <token>`
- Success: 200 OK, returns success message

## 3. Favorites

### GET /api/favorites
- Get user's favorite listings
- Header: `Authorization: Bearer <token>`
- Success: 200 OK, returns array of favorites

### POST /api/favorites/:listingId
- Add a listing to favorites
- Header: `Authorization: Bearer <token>`
- Success: 200 OK, returns success message

### DELETE /api/favorites/:listingId
- Remove a listing from favorites
- Header: `Authorization: Bearer <token>`
- Success: 200 OK, returns success message

## 4. Admin

### GET /api/admin/users
- Get all users (admin only)
- Header: `Authorization: Bearer <admin token>`
- Success: 200 OK, returns array of users

### GET /api/admin/listings
- Get all listings (admin only)
- Header: `Authorization: Bearer <admin token>`
- Success: 200 OK, returns array of listings

### DELETE /api/admin/users/:id
- Delete a user (admin only)
- Header: `Authorization: Bearer <admin token>`
- Success: 200 OK, returns success message

### DELETE /api/admin/listings/:id
- Delete a listing (admin only)
- Header: `Authorization: Bearer <admin token>`
- Success: 200 OK, returns success message