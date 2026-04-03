# Finance Management SaaS Platform

A multi-service platform for managing, tracking, and analyzing financial records, built with an API Gateway routing schema. 

## 🏗 Architecture Choice: Microservices
This backend uses a **Microservice Architecture**. The application is divided into small, autonomous, loosely coupled services logically mapped to specific domains. 
- **Gateway**: A secure central entry point (`http://localhost:5000`) for routing user requests to respective microservices.
- **Auth Service**: Handles registrations, logins, identity verification (JWT), and user authorization / RBAC.
- **Record Service**: Administers the creation, tracking, and deletion of day-to-day granular financial records (incomes and expenses).
- **Dashboard Service**: Generates macro-level aggregate data for performance metrics (net balance, trends, etc.).

**Benefits of using Microservices:**
1. **Scalability:** We could easily scale the Record or Dashboard services heavily during times of high transaction loads without scaling the entire monolith.
2. **Resilience & Fault Isolation:** If the Record service crashes due to a bug or memory leak, the Authentication and Dashboard microservices remain functional.
3. **Agility:** Teams can deploy services independently using differing technologies if needed.

## 🗄 Database Choice: PostgreSQL
We use **PostgreSQL**, a powerful, open-source object-relational database.
**Benefits of PostgreSQL in this context:**
1. **ACID Compliance & Reliability:** Financial records *cannot* afford data corruption or eventual consistency limits. Strict transactions guarantee accurate banking.
2. **Powerful Aggregations:** For the `dashboard-service`, Postgres natively processes extensive data querying logic (like `COALESCE`, `SUM`, and aggregations by strict date strings) highly efficiently within the database layer.
3. **Foreign Keys constraints:** Excellent referential integrity guarantees operations like cascading user deletions are sound and protected.

## 🔐 Authentication Approach
This application relies on **JSON Web Tokens (JWT)** implemented via the Authentication Service. Tokens are generated upon valid login, attached to subsequent API requests as a `Bearer` token in the HTTP `Authorization` header, and verified independently by each microservice using a shared secret key (`finance_management_saas_proj`).

**Trade-offs Considered:**
1. **Stateless Validation (Pro):** Because JWTs cryptographically sign payloads containing the user's `id` and `role`, other microservices (like `record-service` and `dashboard-service`) can locally verify token authenticity without executing expensive network requests to the `auth-service` database every time.
2. **Microservice Autonomy (Pro):** Decouples authorization logic from a central choke point, allowing each service to read roles and process its boundaries instantly.
3. **Token Invalidation Complexity (Con):** The trade-off for utilizing stateless tokens over stateful sessions is that forcefully logging a user out or immediately purging their access before the token organically expires (1 hour) is difficult without implementing a distributed caching layer (like a Redis blocklist).
4. **Shared Secret Risk (Con):** A symmetric shared secret must be securely distributed to all processing microservices, raising the risk vector if any single microservice's environment config is compromised.

---

## ⚙ Setup & Run Instructions

**1. Prerequisites**
- Node.js (v18+)
- PostgreSQL installed and running locally with user `postgres` and password `admin`, alongside a database named `finance`. *(Adjust `Db/connect.js` in your microservices if this varies).*

**2. Installation**
From your project's root folder (`finance_management_saas_proj`), run:
```bash
npm install 
# Make sure to run `npm install` inside each individual microservice folder as well.
```

**3. Running the Stack**
Run all 4 microservices simultaneously using `concurrently` right from the project root!
```bash
npm start
```

---

## 📡 Core API Reference & Postman Examples

All APIs should be routed through the central Gateway running on port `5000`. Bearer JWT tokens retrieved from the login API should be added in Postman under the **Headers** as `Authorization: Bearer <your-token>`.

### 1. Auth Service
*Base Route:* `/api/auth`

#### `POST /register`
**Use Case:** Issue an entirely new user identity.
**Body (RAW JSON):**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "mypassword123",
  "role": "admin"
}
```

#### `POST /login`
**Use Case:** Retrieve a JWT token for authorization purposes.
**Body (RAW JSON):**
```json
{
  "email": "admin@example.com",
  "password": "mypassword123"
}
```

#### `PUT /edit-own-user`
**Use Case:** Allows an authenticated user to update their email and name.
**Headers:** `Authorization: Bearer <token>`
**Body (RAW JSON):**
```json
{
  "name": "Jane User",
  "email": "jane.user@example.com"
}
```

#### `PUT /reset-password`
**Use Case:** Safely update an account password verifying their current password.
**Headers:** `Authorization: Bearer <token>`
**Body (RAW JSON):**
```json
{
  "currentPassword": "mypassword123",
  "newPassword": "newsecurepassword456"
}
```

#### `GET /admin/get-all-users`
**Use Case:** Returns the list of all registered portal users (Admin access required).
**Headers:** `Authorization: Bearer <token>`
**Params / Body:** None required.

#### `DELETE /admin/delete-user`
**Use Case:** Force delete a user account from the system (Admin only. Cannot delete self).
**Headers:** `Authorization: Bearer <token>`
**Query Params:** `?id=5&delete_user=true`

#### `PUT /admin/edit-role`
**Use Case:** Modify a user's RBAC scope (Admin only).
**Headers:** `Authorization: Bearer <token>`
**Query Params:** `?change_role=true`
**Body (RAW JSON):**
```json
{
  "id": 5,
  "role": "viewer"
}
```

---

### 2. Finance Record Service
*Base Route:* `/api/finance-records`

#### `POST /create`
**Use Case:** Document a new income or expense line-item (Admin only).
**Headers:** `Authorization: Bearer <token>`
**Body (RAW JSON):**
```json
{
  "amount": 1400.00,
  "type": "income",
  "category": "freelance",
  "description": "Custom UI design gig",
  "date": "2026-04-03"
}
```

#### `GET /get`
**Use Case:** Retrieve all transaction records including their respective creator data (Admin or Analyst). Can also be filtered dynamically!
**Headers:** `Authorization: Bearer <token>`
**Query Params (Optional):** `?date=YYYY-MM-DD`, `?category=string`, `?type=income|expense`
**Example URL:** `GET http://localhost:5000/api/finance-records/get?type=income`

#### `PUT /update/:id`
**Use Case:** Correct a previous entry's classification, date, or scale (Admin only).
**Headers:** `Authorization: Bearer <token>`
**URL Context:** `PUT http://localhost:5000/api/finance-records/update/12`
**Body (RAW JSON):**
```json
{
  "amount": 1600.00,
  "created_by": 1,
  "type": "income",
  "category": "freelance",
  "description": "Custom UI design gig w/ revisions",
  "date": "2026-04-05"
}
```

#### `DELETE /delete/:id`
**Use Case:** Permanently remove a record logic from the ledger (Admin only).
**Headers:** `Authorization: Bearer <token>`
**URL Context:** `DELETE http://localhost:5000/api/finance-records/delete/12`
**Params / Body:** None required.

---

### 3. Dashboard Analytics Service
*Base Route:* `/api/dashboard`

#### `GET /get-dashboard-data`
**Use Case:** Aggregates and returns summary levels (Net Balance, activity, and patterns) for real-time overview panels (Admin, Analyst, or Viewer).
**Headers:** `Authorization: Bearer <token>`
**Params / Body:** None required.
**Response Snippet:**
```json
{
  "message": "Dashboard summary fetched successfully",
  "summary": {
    "totalIncome": 1400.00,
    "totalExpenses": 0,
    "netBalance": 1400.00
  },
  "categoryWiseTotals": [],
  "recentActivity": [],
  "monthlyTrends": []
}
```
