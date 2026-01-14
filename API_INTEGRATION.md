# API Integration Guide

This document provides examples for integrating the backend API with the React frontend.

## Base URL
```
http://localhost:5000/api
```

## Example API Calls

### Saudi Hisaab Kitaab

#### Get All Saudi Entries
```javascript
const response = await fetch('http://localhost:5000/api/saudi');
const data = await response.json();
// Response: { success: true, count: 6, data: [...] }
```

#### Create Saudi Entry
```javascript
const response = await fetch('http://localhost:5000/api/saudi', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2024-12-20',
    time: '09:30 AM',
    refNo: 'SAU-001',
    pkrAmount: 500000,
    riyalRate: 75.50,
    submittedSar: 6000,
    reference2: 'Monthly Transfer'
  })
});
const data = await response.json();
// Response includes calculated balance
```

#### Update Saudi Entry
```javascript
const response = await fetch(`http://localhost:5000/api/saudi/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pkrAmount: 600000,
    riyalRate: 75.75
  })
});
```

### Special Hisaab Kitaab

#### Get All Special Entries
```javascript
const response = await fetch('http://localhost:5000/api/special');
const data = await response.json();
```

#### Create Special Entry
```javascript
const response = await fetch('http://localhost:5000/api/special', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userName: 'Ahmed Khan',
    date: '2024-12-20',
    balanceType: 'Online',
    nameRupees: 150000,
    submittedRupees: 120000
  })
});
```

### Pakistani Hisaab Kitaab

#### Get All Traders
```javascript
const response = await fetch('http://localhost:5000/api/traders');
const data = await response.json();
// Response includes traders with banks and calculated balances
```

#### Get Single Trader
```javascript
const response = await fetch(`http://localhost:5000/api/traders/${traderId}`);
const data = await response.json();
// Response includes trader with all banks and entries
```

#### Create Trader
```javascript
const response = await fetch('http://localhost:5000/api/traders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Sulman Traders',
    shortName: 'ST',
    color: 'from-blue-500 to-blue-600'
  })
});
```

#### Get Banks for Trader
```javascript
const response = await fetch(`http://localhost:5000/api/traders/${traderId}/banks`);
const data = await response.json();
```

#### Create Bank
```javascript
const response = await fetch(`http://localhost:5000/api/traders/${traderId}/banks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'HBL',
    code: 'HBL'
  })
});
```

#### Get Bank Ledger Entries
```javascript
const response = await fetch(
  `http://localhost:5000/api/traders/${traderId}/banks/${bankId}/ledger`
);
const data = await response.json();
// Response includes entries with runningBalance calculated
```

#### Create Bank Ledger Entry
```javascript
const response = await fetch(
  `http://localhost:5000/api/traders/${traderId}/banks/${bankId}/ledger`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: '2024-12-20',
      referenceType: 'Online',
      amountAdded: 500000,
      amountWithdrawn: 200000
    })
  }
);
```

## Response Structure

### Success Response
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": [...] // For validation errors
}
```

## Important Notes

1. **Balances are calculated server-side** - No need to calculate on frontend
2. **Running balances** are included in bank ledger responses
3. **All amounts** should be sent as numbers (not strings)
4. **Riyal Rate** must always be provided by user (never auto-fetched)
5. **Validation errors** return 400 status with detailed error messages
6. **CORS is enabled** - Frontend can directly call the API

## Using with React Query

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch Saudi entries
const { data, isLoading } = useQuery({
  queryKey: ['saudi'],
  queryFn: async () => {
    const res = await fetch('http://localhost:5000/api/saudi');
    const data = await res.json();
    return data.data; // Extract data array
  }
});

// Create Saudi entry
const mutation = useMutation({
  mutationFn: async (newEntry) => {
    const res = await fetch('http://localhost:5000/api/saudi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    });
    return res.json();
  }
});
```

