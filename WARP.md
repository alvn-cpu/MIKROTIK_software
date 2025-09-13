# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

WiFi Billing System with Captive Portal - A comprehensive solution for managing WiFi access through MikroTik RouterOS, RADIUS authentication, and mobile payment integration (Safaricom Daraja API and KCB Buni API).

### Architecture

The system follows a multi-tier architecture:
- **Backend API**: Node.js/Express server handling billing, authentication, and payment processing
- **Frontend**: React-based captive portal for user interaction
- **RADIUS Integration**: FreeRADIUS server for network authentication and accounting
- **Database**: PostgreSQL for persistent data storage
- **Cache**: Redis for session management and rate limiting
- **Payment Gateways**: Daraja (M-Pesa) and KCB Buni API integrations
- **Network**: MikroTik RouterOS integration for hotspot management

## Development Commands

### Setup and Installation
```bash
# Install all dependencies (root, backend, frontend)
npm run install:all

# Database setup
npm run db:migrate
npm run db:seed
```

### Development
```bash
# Start full development environment (backend + frontend)
npm run dev

# Start backend only
npm run backend:dev

# Start frontend only  
npm run frontend:dev
```

### Database Operations
```bash
# Run migrations
npm run db:migrate

# Rollback last migration
cd backend && npm run db:rollback

# Seed database with initial data
npm run db:seed
```

### Testing
```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Watch mode for backend tests
cd backend && npm run test:watch
```

### Code Quality
```bash
# Lint all code
npm run lint

# Format code
npm run format
```

### Docker Operations
```bash
# Build Docker containers
npm run docker:build

# Start services (PostgreSQL, Redis, FreeRADIUS)
npm run docker:up

# Stop all services
npm run docker:down
```

### Single Test Execution
```bash
# Run specific backend test file
cd backend && npx jest tests/auth.test.js

# Run specific frontend test
cd frontend && npm test -- --testNamePattern="specific test name"
```

## Key Architecture Components

### Backend Structure
- **`server.js`**: Main application entry point with Express setup, middleware, and route mounting
- **`src/config/`**: Database (Knex), Redis, and JWT configuration
- **`src/models/`**: Database models for users, plans, sessions, transactions, etc.
- **`src/routes/`**: API endpoints organized by domain (auth, payments, admin, radius, etc.)
- **`src/services/`**: Business logic services (Daraja payments, MikroTik integration, RADIUS client)
- **`src/middleware/`**: Request validation, error handling, and NAS trust verification
- **`migrations/`**: Database schema migrations managed by Knex
- **`seeds/`**: Initial database data (billing plans, etc.)

### Key Services
- **`darajaService.js`**: Handles M-Pesa STK Push payments, token management, and callbacks
- **`mikrotikService.js`**: MikroTik API integration for hotspot management and user disconnection
- **`radiusClient.js`**: FreeRADIUS communication for authentication and accounting
- **`authService.js`**: JWT token management and user authentication

### Database Schema
Key tables: `users`, `billing_plans`, `transactions`, `sessions`, `nas_stations`, `accounting_records`

### Payment Integration
- **Daraja API**: M-Pesa integration with STK Push for mobile payments
- **KCB Buni**: Alternative mobile banking payment method
- Callback handling for real-time payment verification

### MikroTik Integration  
- Hotspot user management
- Queue configuration
- Real-time user disconnection
- Configuration generation utilities

## Environment Configuration

Copy `.env.example` to `.env` and configure:
- Database connection (PostgreSQL)
- Redis connection
- Daraja API credentials (M-Pesa)
- KCB Buni API credentials
- JWT secrets
- MikroTik router credentials
- RADIUS server settings

## Important Notes

### Payment Processing
- All payment amounts should be validated using `darajaService.validateAmount()`
- Phone numbers are automatically formatted to 254XXXXXXXXX format
- Payment callbacks are processed asynchronously via Socket.IO for real-time updates

### Database Migrations
- Always create migrations for schema changes: `cd backend && npx knex migrate:make migration_name`
- Test migrations with rollback before committing
- Database configuration is shared between runtime (`src/config/database.js`) and Knex CLI (`knexfile.js`)

### RADIUS Integration
- NAS (Network Access Server) authentication is handled via middleware
- Accounting records track user sessions and data usage
- Session management integrates with MikroTik hotspot system

### Error Handling
- Centralized error handling middleware processes all API errors
- Winston logger categorizes logs by type (payment, radius, general)
- Socket.IO provides real-time error notifications to frontend

### Security
- Rate limiting applied to all API routes (100 requests per 15 minutes)
- JWT tokens for authentication with configurable expiration
- Helmet.js for security headers
- Input validation using Joi schemas

## Development Workflow

1. **Database Changes**: Create migration → Test locally → Update models if needed
2. **API Changes**: Update route → Add validation → Update tests → Document endpoint
3. **Payment Integration**: Test in sandbox → Validate callbacks → Handle edge cases
4. **MikroTik Changes**: Test API calls → Validate router state → Handle connection failures

## Testing Strategy

- Unit tests for services and utilities
- Integration tests for API endpoints
- Payment gateway testing in sandbox environment
- Database transaction testing with rollbacks