# Project Structure

## Architecture Overview
LEVEL UP S&A CENTER follows a monorepo architecture with separate frontend and backend workspaces, enabling independent development while maintaining unified dependency management.

## Directory Structure

```
admin_gym/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React Context providers (Auth, etc.)
│   │   ├── pages/         # Route-based page components
│   │   ├── services/      # API communication layer
│   │   ├── utils/         # Helper functions and utilities
│   │   ├── App.jsx        # Main application component
│   │   ├── main.jsx       # Application entry point
│   │   └── index.css      # Global styles and Tailwind imports
│   ├── public/            # Static assets
│   ├── vite.config.js     # Vite build configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   ├── postcss.config.js  # PostCSS configuration
│   └── package.json       # Frontend dependencies
│
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── config/        # Database and environment configuration
│   │   ├── controllers/   # Request handlers and business logic
│   │   ├── middleware/    # Express middleware (auth, validation)
│   │   ├── models/        # Database models and queries
│   │   ├── routes/        # API route definitions
│   │   ├── utils/         # Helper functions
│   │   └── index.js       # Server entry point
│   └── package.json       # Backend dependencies
│
├── .amazonq/              # Amazon Q configuration
│   └── rules/
│       └── memory-bank/   # Project documentation
│
├── package.json           # Root workspace configuration
├── README.md              # Project overview
└── INSTALACION.md         # Installation instructions
```

## Core Components

### Frontend Architecture

**Component Layer**
- Reusable UI components for forms, tables, modals, and layouts
- Component-based design for maintainability
- Shared components across different modules

**Context Layer**
- Authentication context for user session management
- Global state management using React Context API
- Centralized state for cross-component data sharing

**Pages Layer**
- Route-specific page components
- Module-based organization (students, classes, payments, etc.)
- Dashboard and reporting views

**Services Layer**
- API client configuration with Axios
- Centralized HTTP request handling
- Authentication token management
- Error handling and response parsing

**Utils Layer**
- Date formatting and manipulation
- Data validation helpers
- Common utility functions

### Backend Architecture

**Config Layer**
- Database connection setup (PostgreSQL)
- Environment variable management
- Schema definitions (SQL)

**Controllers Layer**
- Business logic implementation
- Request validation
- Response formatting
- Error handling

**Middleware Layer**
- JWT authentication verification
- Request validation using express-validator
- Error handling middleware
- CORS configuration

**Models Layer**
- Database query functions
- Data access layer
- SQL query builders
- Transaction management

**Routes Layer**
- RESTful API endpoint definitions
- Route grouping by module
- Middleware application per route

**Utils Layer**
- Password hashing (bcrypt)
- JWT token generation and verification
- Common helper functions

## Database Schema

### Core Tables
- **usuarios**: Admin users with authentication
- **estudiantes**: Student profiles with medical records
- **representantes_legales**: Legal guardians for minors
- **profesores**: Instructor profiles
- **clases**: Class definitions with schedules (JSONB)
- **inscripciones**: Student enrollments with payment modality
- **pagos**: Payment records per enrollment
- **transacciones_contables**: Accounting transactions (income/expenses)

### Relationships
- Students → Legal Guardians (many-to-one)
- Classes → Professors (many-to-one)
- Enrollments → Students + Classes (many-to-many junction)
- Payments → Enrollments (many-to-one)
- Accounting Transactions → Payments (optional one-to-one)

## Architectural Patterns

### Frontend Patterns
- **Component-Based Architecture**: Modular UI components
- **Context API Pattern**: Global state management without Redux
- **Service Layer Pattern**: Separation of API logic from components
- **Route-Based Code Splitting**: Pages organized by routes

### Backend Patterns
- **MVC Pattern**: Model-View-Controller separation
- **Repository Pattern**: Data access abstraction through models
- **Middleware Chain**: Request processing pipeline
- **RESTful API Design**: Resource-based endpoints

### Data Flow
1. User interaction in React component
2. Service layer makes API call
3. Backend route receives request
4. Middleware validates and authenticates
5. Controller processes business logic
6. Model executes database queries
7. Response flows back through layers

## Module Organization

### Student Module
- Student CRUD operations
- Medical record management
- Legal guardian association
- Photo upload handling

### Class Module
- Class scheduling with JSONB horarios
- Capacity management
- Instructor assignment
- Pricing configuration

### Enrollment Module
- Student-class registration
- Payment modality selection
- Enrollment status tracking

### Payment Module
- Payment recording per enrollment
- Due date calculation
- Payment method tracking
- Historical records

### Accounting Module
- Income/expense categorization
- Transaction recording
- Financial reporting
- Payment linkage

### Authentication Module
- JWT-based authentication
- User session management
- Protected route handling
