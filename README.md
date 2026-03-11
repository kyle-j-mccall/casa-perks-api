# CasaPerks API

A RESTful API for the CasaPerks rewards dashboard, built with Express.js, TypeScript, and Prisma. This API allows residents to view their points balance, transaction history, and redeem points for gift cards.

## 📋 Features

- **Resident Management**: View resident profiles and points balances
- **Transaction History**: Track earned, bonus, redeemed, and expired points
- **Gift Card Catalog**: Browse available rewards with filtering
- **Redemption System**: Redeem points for gift cards with atomic transactions
- **Security**: Bearer token authentication and rate limiting
- **Database**: Persistent storage with Prisma + SQLite

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Language**: TypeScript 5.8.2
- **ORM**: Prisma 6.19.2
- **Database**: SQLite
- **Security**: express-rate-limit, custom authentication middleware
- **CORS**: Configured for localhost:3000 frontend

## 📦 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/kyle-j-mccall/casa-pers-api.git
cd casa-pers-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create the database
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

### 4. Configure environment variables (optional)
Create a `.env` file in the root directory:
```env
PORT=4000
CASA_PERKS_API_KEY=your-secret-key-here
DATABASE_URL="file:./prisma/dev.db"
```

### 5. Start the development server
```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## 📁 Project Structure

```
casa-perks-api/
├── prisma/
│   ├── migrations/          # Database migration files
│   ├── schema.prisma        # Database schema definition
│   ├── seed.ts              # Database seeding script
│   └── dev.db               # SQLite database file (gitignored)
├── src/
│   ├── controllers/         # Business logic layer
│   │   ├── residentsController.ts
│   │   ├── giftCardsController.ts
│   │   └── redemptionsController.ts
│   ├── routes/              # API route definitions
│   │   ├── residents.ts
│   │   ├── giftCards.ts
│   │   └── redemptions.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # Bearer token authentication
│   │   ├── rateLimiter.ts   # Rate limiting configuration
│   │   └── validate.ts      # Input validation helpers
│   ├── lib/
│   │   └── prisma.ts        # Prisma client singleton
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── data/
│   │   └── mockData.ts      # Legacy mock data (deprecated)
│   └── app.ts               # Express app configuration
├── server.ts                # Application entry point
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## 🗄 Database Schema

### Resident
```prisma
model Resident {
  id            String        @id           // Format: "resident-XXX"
  name          String
  email         String
  unit          String
  pointsBalance Int
  transactions  Transaction[]
}
```

### Transaction
```prisma
model Transaction {
  id          String    @id              // Format: "txn-{UUID}"
  residentId  String
  type        String                     // "earned" | "bonus" | "redeemed" | "expired"
  points      Int                        // Positive for earned/bonus, negative for redeemed
  description String
  date        DateTime
  giftCardId  String?                    // Present for redemption transactions
  resident    Resident  @relation(fields: [residentId], references: [id])
}
```

### GiftCard
```prisma
model GiftCard {
  id          String  @id                // Format: "gc-XXX"
  brand       String
  description String
  pointsCost  Int
  category    String
  inStock     Boolean
}
```

## 🔌 API Endpoints

### Authentication
All `/api/*` endpoints require Bearer token authentication:
```bash
Authorization: Bearer dev-secret-key
```

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-10T12:00:00.000Z"
}
```

---

### Residents

#### Get Resident Profile
```http
GET /api/residents/:id
```
**Example:**
```bash
curl -H "Authorization: Bearer dev-secret-key" \
  http://localhost:4000/api/residents/resident-001
```
**Response:**
```json
{
  "data": {
    "id": "resident-001",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "unit": "4B",
    "pointsBalance": 10000
  }
}
```

#### Get Transaction History
```http
GET /api/residents/:id/transactions?limit=50&type=earned
```
**Query Parameters:**
- `limit` (optional): Number of transactions to return (1-100, default: 50)
- `type` (optional): Filter by type: `earned`, `bonus`, `redeemed`, or `expired`

**Example:**
```bash
curl -H "Authorization: Bearer dev-secret-key" \
  "http://localhost:4000/api/residents/resident-001/transactions?limit=10&type=earned"
```
**Response:**
```json
{
  "data": [
    {
      "id": "txn-abc123",
      "residentId": "resident-001",
      "type": "earned",
      "points": 500,
      "description": "Rent payment on time",
      "date": "2026-03-01T00:00:00.000Z",
      "giftCardId": null
    }
  ],
  "total": 8
}
```

#### Add Transaction (Manual)
```http
POST /api/residents/:id/transactions
Content-Type: application/json
```
**Request Body:**
```json
{
  "type": "earned",
  "points": 500,
  "description": "Community event participation"
}
```
**Response:**
```json
{
  "message": "Transaction recorded.",
  "data": {
    "transaction": {
      "id": "txn-xyz789",
      "residentId": "resident-001",
      "type": "earned",
      "points": 500,
      "description": "Community event participation",
      "date": "2026-03-10T12:00:00.000Z"
    },
    "newPointsBalance": 10500
  }
}
```

---

### Gift Cards

#### List Available Gift Cards
```http
GET /api/gift-cards?brand=amazon&maxCost=5000
```
**Query Parameters:**
- `brand` (optional): Filter by brand name (case-insensitive partial match)
- `maxCost` (optional): Maximum points cost

**Example:**
```bash
curl -H "Authorization: Bearer dev-secret-key" \
  "http://localhost:4000/api/gift-cards?maxCost=5000"
```
**Response:**
```json
{
  "data": [
    {
      "id": "gc-001",
      "brand": "Amazon",
      "description": "$50 Amazon Gift Card",
      "pointsCost": 5000,
      "category": "Shopping",
      "inStock": true
    }
  ]
}
```

#### Get Gift Card Details
```http
GET /api/gift-cards/:id
```
**Example:**
```bash
curl -H "Authorization: Bearer dev-secret-key" \
  http://localhost:4000/api/gift-cards/gc-001
```
**Response:**
```json
{
  "data": {
    "id": "gc-001",
    "brand": "Amazon",
    "description": "$50 Amazon Gift Card",
    "pointsCost": 5000,
    "category": "Shopping",
    "inStock": true
  }
}
```

---

### Redemptions

#### Redeem Gift Card
```http
POST /api/residents/:id/redeem
Content-Type: application/json
```
**Request Body:**
```json
{
  "giftCardId": "gc-001"
}
```
**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer dev-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"giftCardId":"gc-001"}' \
  http://localhost:4000/api/residents/resident-001/redeem
```
**Success Response (201):**
```json
{
  "message": "Redemption successful.",
  "data": {
    "transaction": {
      "id": "txn-def456",
      "residentId": "resident-001",
      "type": "redeemed",
      "points": -5000,
      "description": "Redeemed: $50 Amazon Gift Card",
      "date": "2026-03-10T12:00:00.000Z",
      "giftCardId": "gc-001"
    },
    "newPointsBalance": 5000
  }
}
```
**Error Response (422 - Insufficient Points):**
```json
{
  "error": "Insufficient points balance.",
  "detail": {
    "required": 5000,
    "available": 2000,
    "shortage": 3000
  }
}
```

## 🔒 Security Features

### 1. Bearer Token Authentication
- All `/api/*` routes require valid Bearer token
- Default token: `dev-secret-key` (override with `CASA_PERKS_API_KEY` env var)
- Returns `401 Unauthorized` if token missing
- Returns `403 Forbidden` if token invalid

### 2. Rate Limiting
- **Global API Limit**: 100 requests per 15 minutes per IP
- **Redemption Limit**: 5 requests per minute per IP (prevents abuse)
- Returns `429 Too Many Requests` when exceeded

### 3. Input Validation
- Resident ID format: `resident-\d+`
- Gift Card ID format: `gc-\d+`
- Transaction type validation: only allowed types accepted
- Points must be valid integers

### 4. CORS Protection
- Only allows requests from `http://localhost:3000`
- Restricts methods to `GET` and `POST`

### 5. Atomic Transactions
- Redemptions use parallel queries to ensure data consistency
- Points are deducted and transactions are recorded atomically

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run production build
```

### Database Management
```bash
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Create and apply new migration
npx prisma db seed             # Re-seed database
npx prisma generate            # Regenerate Prisma Client
```

### Testing Endpoints
Use tools like Postman, Insomnia, or curl to test endpoints. Remember to include the Authorization header:
```bash
Authorization: Bearer dev-secret-key
```

## 📝 Sample Data

The seeded database includes:
- **1 Resident**: Alice Johnson (resident-001) with 10,000 points
- **10 Transactions**: Mix of earned, bonus, redeemed, and expired transactions
- **6 Gift Cards**: Amazon, Starbucks, Target, Netflix, Uber Eats, Home Depot

## 🏗 Architecture Decisions

### MVC Pattern
- **Controllers**: Handle business logic and database operations
- **Routes**: Define URL mappings and apply middleware
- **Middleware**: Separate concerns (auth, validation, rate limiting)

### Prisma ORM
- Type-safe database queries
- Automatic migration generation
- SQLite for simplicity (easy to swap for PostgreSQL/MySQL)

### TypeScript
- Shared types between frontend and backend
- Compile-time error checking
- Better IDE support and autocomplete

## 🚧 Future Enhancements

- [ ] User authentication (JWT-based)
- [ ] Admin dashboard endpoints
- [ ] Gift card inventory management
- [ ] Email notifications for redemptions
- [ ] Points expiration scheduler
- [ ] Comprehensive test suite (Jest)
- [ ] API documentation with Swagger/OpenAPI
- [ ] Deployment configuration (Docker, Railway, Vercel)

## 📄 License

This project is created for the CasaPerks assessment.
