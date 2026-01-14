# Project Structure

```
Main-folder/
│
├── frontend/                    # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Page components
│   │   ├── layouts/            # Layout components
│   │   ├── routes/             # Route configuration
│   │   ├── data/               # Data utilities
│   │   ├── hooks/              # Custom hooks
│   │   └── lib/                # Utilities
│   ├── public/                 # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                     # Node.js + Express Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Business logic
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API routes
│   ├── middleware/            # Validation & error handling
│   ├── utils/                 # Calculation utilities
│   ├── server.js              # Express server
│   └── package.json
│
├── README.md                   # Main project documentation
├── .gitignore                  # Git ignore rules
└── PROJECT_STRUCTURE.md        # This file
```

## Quick Commands

### Backend
```bash
cd backend
npm install
npm run dev    # Port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev    # Port 8080
```

## API Endpoints

- Backend: `http://localhost:5000/api`
- Frontend: `http://localhost:8080`

## Features

- ✅ Separated frontend and backend
- ✅ Server-side balance calculations
- ✅ RESTful API
- ✅ Type-safe TypeScript
- ✅ Responsive Tailwind CSS UI

