# 🚀 VendorBridge — Smart Procurement & Vendor Management Platform

## 🌐 Overview

VendorBridge is a modern enterprise-grade procurement and vendor lifecycle management platform designed to streamline the complete sourcing workflow — from RFQ generation to quotation comparison, approval processing, purchase order creation, and invoice management.

The platform enables organizations to digitize and automate procurement operations with role-based workflows, centralized vendor management, and transparent approval systems.

---

# ✨ Core Features

## 🔐 Authentication & Role Management

* Secure user registration and login
* Role-based access control
* Multi-role system:

  * 👨‍💼 Admin
  * 📦 Procurement Officer
  * 🧑‍💼 Manager
  * 🏢 Vendor

---

## 🏢 Vendor Management

* Vendor onboarding & profile management
* GST & contact information handling
* Vendor categorization
* Active/Inactive vendor tracking
* Vendor CRUD APIs

---

## 📄 RFQ (Request For Quotation) System

* Dynamic RFQ generation
* Product & quantity management
* Deadline-based quotation requests
* Vendor assignment workflows
* RFQ status tracking

---

## 💰 Quotation Management

* Vendor quotation submission
* RFQ-linked quotation handling
* Price & delivery comparison
* Procurement evaluation workflows
* Multi-vendor quotation tracking

---

## ✅ Approval Workflow Engine

* Multi-stage procurement approvals
* Manager decision system
* Approval remarks & audit tracking
* Approval history management
* Procurement governance layer

---

## 🧾 Purchase Order Generation

* Automated PO creation from approved quotations
* Vendor-linked procurement records
* Tax & pricing calculations
* PO lifecycle management

---

## 📑 Invoice Management

* Invoice generation system
* Vendor billing workflows
* Payment tracking
* Invoice status management
* Procurement financial visibility

---

## 📊 Activity Logging & Audit Trails

* System-wide activity tracking
* User action monitoring
* Procurement audit logs
* Operational transparency

---

# 🧠 System Architecture

```text
Frontend (HTML/CSS/JS)
        ↓
Fetch API Layer
        ↓
Spring Boot REST APIs
        ↓
Service Layer
        ↓
Repository Layer (JPA)
        ↓
MySQL Database
```

---

# 🛠️ Tech Stack

## 🎨 Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* Fetch API

---

## ⚙️ Backend

* Java 21
* Spring Boot
* Spring Data JPA
* RESTful APIs
* Maven

---

## 🗄️ Database

* MySQL
* Relational Schema Design
* Foreign Key Constraints
* Enterprise Data Modeling

---

# 🧱 Backend Modules

```text
✔ Authentication Module
✔ Vendor Module
✔ RFQ Module
✔ Quotation Module
✔ Approval Module
✔ Purchase Order Module
✔ Invoice Module
✔ Activity Log Module
```

---

# 📂 Project Structure

```text
vendorBridge-odoothon/
│
├── frontend/
│
├── back/
│   ├── src/main/java/com/vendorbridge/backend/
│   │
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   ├── config/
│   │
│   └── resources/
│
└── README.md
```

---

# 🔌 REST API Architecture

The platform follows a modular REST API architecture:

```text
/api/auth
/api/vendors
/api/rfqs
/api/quotations
/api/approvals
/api/purchase-orders
/api/invoices
/api/logs
```

---

# 🧩 Enterprise Design Principles

* Layered Architecture
* Separation of Concerns
* Modular Backend Design
* RESTful Communication
* Scalable Procurement Workflow
* Relational Database Integrity
* API-Driven Frontend Integration

---

# 🔐 Security Roadmap

## Planned Enhancements

* JWT Authentication
* BCrypt Password Encryption
* API Authorization Middleware
* Session Management
* Refresh Token System

---

# 📈 Future Enhancements

* 📊 Procurement Analytics Dashboard
* 🤖 AI-based Vendor Recommendation
* 📧 Email Notification System
* 📄 PDF Invoice & PO Generation
* 📱 Mobile Responsive UI
* ☁️ Cloud Deployment
* 🔔 Real-time Approval Notifications

---

# 🚀 Local Development Setup

## Backend

```bash
cd back
./mvnw spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

---

## Frontend

Run frontend server separately.

Example:

```text
http://localhost:8087
```

---

# 🧪 API Testing

Recommended Tools:

* Thunder Client
* Postman
* PowerShell Invoke-RestMethod
* Browser DevTools Network Tab

---

# 👨‍💻 Development Workflow

```text
Entity
→ Repository
→ Service
→ Controller
→ REST API
→ Frontend Integration
```

---

# 🎯 Project Goal

VendorBridge aims to provide a scalable, developer-friendly, and enterprise-ready procurement ecosystem that simplifies vendor collaboration, quotation management, procurement approvals, and financial workflows.

---

# 💡 Built With Engineering-Focused Architecture

This project emphasizes:

* Real-world backend engineering
* Enterprise workflow design
* API-first development
* Database normalization
* Scalable modular architecture

---

# 🏁 Conclusion

VendorBridge is not just a CRUD application — it is a structured procurement ERP workflow platform engineered with enterprise backend architecture principles, modular services, and scalable REST API design.
