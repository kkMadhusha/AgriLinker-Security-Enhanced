# 🌾 AgriLinker – Security-Enhanced Web Application

AgriLinker is a full-stack agricultural marketplace web application that connects **farmers directly with buyers**. The platform also supports **fertilizer suppliers**, an **admin panel**, and AI-powered features.

This repository contains a **security-enhanced version** of the original AgriLinker application. This is an ongoing security-enhancement version of the AgriLinker application. Security improvements are being implemented incrementally, with the current work focusing on authentication, authorization, resource ownership, input validation, and API access control.

---

## 🏗️ Repository Structure

```text
AgriLinker-Security-Enhanced/
├── agrilinker-frontend/     # React.js frontend
├── backend/                 # Spring Boot REST API
├── package.json             # Express.js chatbot server
└── README.md                # Project documentation
```

### Runnable Services

1. **React Frontend** – User-facing web application
2. **Spring Boot Backend** – REST API and business logic
3. **Express.js Server** – Chatbot service

---

## ⚙️ Key Technologies

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Frontend       | React 18, React Router, Tailwind CSS |
| Backend        | Spring Boot 3.5, Java 17, Maven      |
| Database       | MongoDB Atlas                        |
| Authentication | JWT + Spring Security                |
| AI             | Groq, Google Gemini, HuggingFace     |
| HTTP Client    | Axios                                |
| Notifications  | Server-Sent Events (SSE)             |
| PDF            | OpenPDF / jsPDF                      |
| Charts         | Recharts                             |

---

# 🔐 Security Enhancements

The existing application was reviewed to identify common access-control and input-validation issues. Several security improvements were implemented in the backend.

### 1. JWT Authentication

Protected API requests use JWT-based authentication.

The frontend attaches the JWT token to API requests using an Axios interceptor:

```text
Authorization: Bearer <JWT>
```

Spring Security validates the authenticated user before allowing access to protected resources.

---

### 2. Role-Based Authorization

API endpoints are protected according to user roles.

Supported roles include:

* `BUYER`
* `FARMER`
* `FERTILIZERSUPPLIER`
* `ADMIN`

For example, administrative order operations are restricted to users with the appropriate role.

---

### 3. Resource Ownership Checks

Authentication alone is not sufficient to protect user data.

Ownership checks were added to ensure that authenticated users cannot access another user's resources.

Protected resources include:

* User orders
* Individual orders
* Order invoices
* Farmer order information
* Notification streams

For example, a user attempting to access another user's order is rejected with:

```text
403 Forbidden
```

---

### 4. Order Access Control

Order operations were strengthened using both **role checks** and **ownership validation**.

Examples include:

* Buyers can access their own orders.
* Farmers can access relevant farmer orders.
* Administrative order operations require the Admin role.
* Users cannot create orders using another user's identity.
* Unauthorized order updates are rejected.

---

### 5. Invoice Protection

Invoice downloads are protected using the authenticated user's identity.

A user cannot download an invoice belonging to another user.

---

### 6. Notification Protection

The notification stream was protected so that a user cannot request another user's notification stream.

Unauthorized requests are rejected with:

```text
403 Forbidden
```

---

### 7. Server-Side Input Validation

Backend validation was added to reject invalid order data.

Examples include:

* Invalid or negative order quantities
* Negative product prices
* Invalid customer information

Invalid requests return:

```text
400 Bad Request
```

---

### 8. CORS Restriction

CORS configuration was restricted to the authorized frontend origin instead of allowing arbitrary origins.

```text
http://localhost:3000
```

This helps prevent unauthorized browser-based origins from accessing the API.

---

## 🧪 Security Testing

Security controls were tested using **Postman**.

The following scenarios were tested:

| Test                                          | Expected Result   |
| --------------------------------------------- | ----------------- |
| Access another user's orders                  | `403 Forbidden`   |
| Access another user's order by ID             | `403 Forbidden`   |
| Modify another user's order                   | `403 Forbidden`   |
| Access another user's invoice                 | `403 Forbidden`   |
| Access another user's notifications           | `403 Forbidden`   |
| Create an order using another user's identity | `403 Forbidden`   |
| Submit invalid quantity                       | `400 Bad Request` |
| Submit negative price                         | `400 Bad Request` |
| Admin-only order access with Buyer account    | `403 Forbidden`   |

These tests were used to verify that the implemented access-control and validation rules work as expected.

---

# 🗂️ Frontend Structure

```text
agrilinker-frontend/
└── src/
    ├── App.js
    ├── api/
    │   ├── api.js
    │   └── auth.js
    ├── context/
    │   ├── AuthContext.js
    │   ├── CartContext.js
    │   └── NotificationContext.js
    ├── components/
    │   ├── farmer/
    │   ├── Fertilizers/
    │   ├── Advisor/
    │   └── ...
    ├── pages/
    │   ├── admin/
    │   ├── fertilizers/
    │   ├── support/
    │   └── ...
    └── services/
```

The frontend uses protected routes based on user roles.

---

# 🗂️ Backend Structure

```text
backend/src/main/java/com/agrilinker/backend/
├── controller/       # REST API controllers
├── service/          # Business logic
├── model/            # MongoDB models
├── repository/       # MongoDB repositories
├── dto/              # Data transfer objects
├── security/         # JWT authentication and security
├── config/           # Security and web configuration
├── notifications/    # SSE notifications
└── util/             # Utility classes
```

---

# 🌱 Core Features

1. **Authentication** – User registration and JWT login
2. **Marketplace** – Browse and purchase agricultural products
3. **Farmer Portal** – Product management and order management
4. **Fertilizer Supplier Portal** – Fertilizer management
5. **Cart & Checkout** – Shopping cart and order placement
6. **AI Crop Advisor** – Agricultural recommendations
7. **AI Chatbot** – AI-powered assistance
8. **Reviews & Sentiment Analysis** – Product reviews and analysis
9. **Admin Panel** – User and platform management
10. **Support Tickets** – Customer support functionality
11. **MCQ/Polls** – Farmer knowledge features
12. **Notifications** – Real-time notifications using SSE
13. **Invoices** – PDF invoice generation

---

# ▶️ Running the Application

## 1. Backend

Navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application:

```bash
mvn clean spring-boot:run
```

Backend:

```text
http://localhost:8081
```

---

## 2. Frontend

Navigate to the frontend directory:

```bash
cd agrilinker-frontend
```

Install dependencies:

```bash
npm install
```

Start the React application:

```bash
npm start
```

Frontend:

```text
http://localhost:3000
```

---

##  Project Purpose

This project was created to gain practical experience in **web application security** by reviewing an existing full-stack application and implementing security improvements.

The main areas of practical experience include:

* Authentication
* Authorization
* Role-Based Access Control (RBAC)
* Resource Ownership Validation
* Server-Side Input Validation
* CORS Configuration
* API Security Testing
* Postman Security Testing

The project focuses on implementing **practical and explainable security controls** rather than attempting to secure every possible aspect of the application.
