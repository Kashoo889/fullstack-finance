# Backend Project Structure

```
backend/
├── config/
│   └── db.js                    # MongoDB connection configuration
│
├── controllers/
│   ├── saudiController.js       # Saudi Hisaab Kitaab CRUD operations
│   ├── specialController.js     # Special Hisaab Kitaab CRUD operations
│   ├── traderController.js      # Trader CRUD operations
│   ├── bankController.js         # Bank CRUD operations
│   └── bankLedgerController.js  # Bank Ledger CRUD operations
│
├── middleware/
│   ├── errorHandler.js          # Global error handling & async wrapper
│   └── validation.js            # Input validation rules
│
├── models/
│   ├── SaudiEntry.js            # Saudi entry schema with balance calculation
│   ├── SpecialEntry.js          # Special entry schema with balance calculation
│   ├── Trader.js                # Trader schema
│   ├── Bank.js                  # Bank schema
│   └── BankLedgerEntry.js       # Bank ledger entry schema
│
├── routes/
│   ├── saudiRoutes.js           # Saudi API routes
│   ├── specialRoutes.js         # Special API routes
│   ├── traderRoutes.js          # Trader API routes (nested with banks)
│   ├── bankRoutes.js            # Bank API routes (nested with ledger)
│   └── bankLedgerRoutes.js      # Bank ledger API routes
│
├── utils/
│   └── calculations.js          # Server-side calculation utilities
│
├── .env                         # Environment variables (create this)
├── .gitignore                   # Git ignore file
├── package.json                 # Dependencies and scripts
├── server.js                    # Express server entry point
├── README.md                    # Setup and API documentation
├── ENV_SETUP.md                 # Environment variable guide
├── API_INTEGRATION.md           # Frontend integration examples
└── PROJECT_STRUCTURE.md         # This file
```

## Key Features

### Server-Side Calculations
- ✅ Saudi balance: `(PKR Amount ÷ Riyal Rate) - Submitted SAR`
- ✅ Special balance: `Name Rupees - Submitted Rupees`
- ✅ Bank ledger running balance (cumulative)
- ✅ Total balances for banks and traders

### Database Optimization
- ✅ Indexes on frequently queried fields
- ✅ Pre-save hooks for automatic balance calculation
- ✅ Efficient nested queries with population

### API Design
- ✅ RESTful routes
- ✅ Nested routes for hierarchical data (traders → banks → ledger)
- ✅ Consistent response format
- ✅ Comprehensive error handling
- ✅ Input validation

### Security & Validation
- ✅ Input validation with express-validator
- ✅ Error handling middleware
- ✅ CORS enabled
- ✅ Request logging (development)

## Database Schema Relationships

```
Trader (1) ──→ (Many) Bank (1) ──→ (Many) BankLedgerEntry
```

## Calculation Flow

1. **Saudi Entry**: Balance calculated in pre-save hook
2. **Special Entry**: Balance calculated in pre-save hook
3. **Bank Ledger**: Remaining amount in pre-save, running balance in controller
4. **Bank Total**: Calculated when fetching bank with entries
5. **Trader Total**: Calculated when fetching trader with banks

All calculations are performed server-side for data integrity.

