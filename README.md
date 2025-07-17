# Dentistfinder Assessment

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development server
npm run dev
```

**Environment setup**: Update `.env` with mock API credentials:
```bash
MOCK_API_EMAIL=admin@example.com
MOCK_API_PASSWORD=admin123
```

## 📚 Testing the API

### Interactive Documentation
Visit **http://localhost:3000/api-docs** for complete Swagger UI documentation with "Try it out" functionality.

### Postman Collection
Import the included `postman-collection.json` file:
1. Open Postman
2. Import → Upload Files → Select `postman-collection.json`
3. Collection includes all endpoints with pre-configured authentication

## 📁 Project Structure

```
src/
├── controllers/         # Request handlers
├── services/           # Business logic & normalization
├── config/             # Swagger configuration
├── data/               # Mock data files
├── tests/              # Test suites
│   ├── unit/           # Unit tests for services
│   ├── integration/    # API endpoint tests
│   └── setup.ts        # Test configuration
├── types.ts            # Centralized type definitions
└── app.ts              # Express setup
docs/
└── api.yml             # OpenAPI specification
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode for development
npm run test:watch
```

### Test Coverage
- **Unit Tests**: Services and business logic
- **Integration Tests**: API endpoints and HTTP flows
- **Error Scenarios**: Authentication, validation, edge cases
- **Data Validation**: Format detection and normalization

## 🏗️ Architecture Overview


### `/mock-external-api/slots` Endpoint Flow
```
Client Request with Basic Auth
    ↓
Authentication Validation
    ↓
Raw JSON Data Loading
    ↓
Mock Data Service (Format Generation)
    ↓
Random Format Selection (A, B, or C)
    ↓
Messy Response to Client
```

### `/api/available-slots` Endpoint Flow
```
Client Request
    ↓
/api/available-slots (Public)
    ↓
HTTP Call with Basic Auth
    ↓
/mock-external-api/slots (Protected)
    ↓
Messy Data (Formats A, B, C)
    ↓
Normalizer Service
    ↓
Unified Format + Filtering + Pagination
    ↓
Client Response
```

## 🎯 Approach & Assumptions

**Core Approach:** Built a realistic API integration pipeline that simulates consuming inconsistent third-party data and transforming it into a clean, unified format. The architecture demonstrates real-world challenges where external APIs return data in unpredictable structures.

### Key Assumptions:

- Third-party PMS systems return appointment data in 3+ different formats with inconsistent field names and date formats
- Basic Authentication is acceptable for mock external API (production would use OAuth 2.0)
- Internal API should be public-facing with no authentication required
- All appointment slots are 30-minute durations for Format B transformation
- Error resilience is critical - individual record failures shouldn't break entire requests
- Date normalization to YYYY-MM-DD format provides consistency for frontend consumption

---

## 🏗 API Structure

### **Mock External API** (`/mock-external-api/slots`)

**Purpose:** Simulates inconsistent third-party PMS system  
**Authentication:** Basic Auth (`admin@example.com` / `admin123`)  
**Response:** Returns raw appointment data in 3 randomly mixed formats:

- **Format A:** `{date, times[], doctor{name, id}, type}`
- **Format B:** `{available_on, slots[{start, end}], provider, category}`
- **Format C:** `{appointment_day, free_slots[], physician_name, service_type}`

---

### **Internal Unified API** (`/api/available-slots`)

**Purpose:** Consumer-facing API with clean, normalized data  
**Authentication:** Public (no auth required)  
**Features:** Calls mock API → normalizes data → applies filtering/pagination  
**Response:** Unified format `{date, start_time, provider}` with pagination metadata

---

### **Data Flow:**
External messy formats → HTTP integration layer → normalization service → filtered/paginated unified response

