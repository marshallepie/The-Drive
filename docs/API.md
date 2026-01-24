# API Documentation

## Base URL

```
Development: http://localhost:4000/api/v1
Production: https://api.drive.com/api/v1
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Common Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "PUBLIC",
  "phone": "+1234567890"
}
```

**Response:** 201 Created
```json
{
  "user": { ... },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** 200 OK
```json
{
  "user": { ... },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/wallet-auth
Authenticate using Web3 wallet signature.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "signature": "0x...",
  "message": "Sign this message to authenticate"
}
```

**Response:** 200 OK

---

### Vehicles

#### GET /vehicles
List vehicles with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `make` (string): Filter by make
- `model` (string): Filter by model
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `condition` (enum): NEW, USED, CERTIFIED_PRE_OWNED
- `sortBy` (string): price, year, mileage, createdAt
- `sortOrder` (string): asc, desc

**Response:** 200 OK
```json
{
  "vehicles": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

#### GET /vehicles/:id
Get vehicle details by ID.

**Response:** 200 OK
```json
{
  "id": "uuid",
  "make": "Toyota",
  "model": "Camry",
  ...
}
```

#### POST /vehicles
Create a new vehicle listing (requires authentication).

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "vin": "1HGBH41JXMN109186",
  "condition": "USED",
  "mileage": 15000,
  "price": 25000,
  "currency": "USD",
  "fuelType": "PETROL",
  "transmission": "AUTOMATIC",
  "color": "Silver",
  "description": "Well maintained vehicle",
  "features": ["Bluetooth", "Backup Camera"],
  "images": ["url1", "url2"],
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "zipCode": "94102"
  }
}
```

**Response:** 201 Created

---

### Transactions

#### POST /transactions/initiate
Initiate a new transaction.

**Request Body:**
```json
{
  "vehicleId": "uuid",
  "paymentMode": "FIAT" | "WEB3",
  "walletAddress": "0x..." // Required for WEB3 mode
}
```

**Response:** 201 Created
```json
{
  "transactionId": "uuid",
  "status": "INITIATED",
  "clientSecret": "stripe_secret" // For FIAT mode
}
```

#### GET /transactions/:id
Get transaction details.

**Response:** 200 OK

#### POST /transactions/:id/confirm
Confirm a transaction condition has been met.

**Request Body:**
```json
{
  "condition": "INSPECTION_PASSED" | "DOCUMENTS_VERIFIED" | "BUYER_CONFIRMED" | "SELLER_CONFIRMED",
  "proof": "optional_proof_url"
}
```

**Response:** 200 OK

---

### Finance

#### POST /finance/applications
Submit a finance application.

**Request Body:**
```json
{
  "vehicleId": "uuid",
  "requestedAmount": 20000,
  "downPayment": 5000,
  "loanTerm": 60,
  "employmentStatus": "Full-time",
  "annualIncome": 75000
}
```

**Response:** 201 Created

#### GET /finance/applications/:id
Get application details.

**Response:** 200 OK

#### PUT /finance/applications/:id/review
Review a finance application (Banker role only).

**Request Body:**
```json
{
  "approved": true,
  "notes": "Approved with conditions",
  "interestRate": 4.5
}
```

**Response:** 200 OK

---

### Messages

#### GET /messages/conversations
Get user's conversations.

**Response:** 200 OK
```json
{
  "conversations": [ ... ]
}
```

#### GET /messages/conversations/:id
Get messages in a conversation.

**Response:** 200 OK

#### POST /messages/conversations/:id/messages
Send a message in a conversation.

**Request Body:**
```json
{
  "content": "Is this vehicle still available?"
}
```

**Response:** 201 Created

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `501 Not Implemented` - Endpoint not yet implemented

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Authenticated users: 1000 requests per 15 minutes
- Rate limit headers included in responses

## Webhooks

### Stripe Webhook
POST /transactions/webhook/stripe

Handles Stripe payment events for fiat transactions.
