# WiFi Billing System with Captive Portal

A comprehensive WiFi billing solution using MikroTik RouterOS, RADIUS authentication, and mobile payment integration (Safaricom Daraja API and KCB Buni API).

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Client    │───▶│   MikroTik   │───▶│   RADIUS    │───▶│   Billing    │
│  Devices    │    │   RouterOS   │    │   Server    │    │   Backend    │
└─────────────┘    │ (Captive     │    │(FreeRADIUS)│    │  (Node.js)   │
                   │  Portal)     │    └─────────────┘    └──────────────┘
                   └──────────────┘                              │
                          │                                      │
                          ▼                                      ▼
                   ┌──────────────┐                    ┌──────────────┐
                   │   Frontend   │                    │   Database   │
                   │  (React/Vue) │                    │(PostgreSQL)  │
                   └──────────────┘                    └──────────────┘
                          │                                      │
                          ▼                                      ▼
                   ┌──────────────┐                    ┌──────────────┐
                   │   Payment    │                    │   Admin      │
                   │  Gateways    │                    │  Dashboard   │
                   │(Daraja/Buni) │                    └──────────────┘
                   └──────────────┘
```

## Components

- **Backend**: Node.js/Express API server for billing, user management, and payment processing
- **Frontend**: React-based captive portal for user interaction
- **RADIUS Server**: FreeRADIUS integration for authentication and accounting
- **Database**: PostgreSQL for storing user data, billing plans, and accounting records
- **MikroTik Integration**: API utilities for router management

## Features

- 🏠 Captive portal with package selection
- 💳 Mobile money integration (M-Pesa STK Push, KCB Buni)
- 👤 User registration and management
- 📊 Real-time usage tracking and billing
- 📈 Admin dashboard with analytics
- 🔒 RADIUS-based authentication
- 🌐 MikroTik RouterOS integration

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Set up database: `npm run db:migrate`
5. Start development server: `npm run dev`

## Payment APIs

### Safaricom Daraja API
- STK Push for M-Pesa payments
- Real-time payment callbacks
- Transaction status queries

### KCB Buni API
- Mobile banking integration
- Payment processing
- Transaction verification

## Installation & Setup

See [docs/installation.md](docs/installation.md) for detailed setup instructions.

## Configuration

See [docs/configuration.md](docs/configuration.md) for system configuration details.

## License

MIT License