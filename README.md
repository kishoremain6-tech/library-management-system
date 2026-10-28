# Library Management System (Node.js, Express, MongoDB)

## Setup (Windows PowerShell)
```powershell
cd library-mgmt
npm install
Copy-Item .env.example .env      # then edit .env: MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed                     # creates the admin from .env + 3 clearly labelled "Sample:" books
npm start                        # open http://localhost:3000
```
MongoDB: install locally and keep `mongodb://127.0.0.1:27017/library`, or paste a MongoDB Atlas connection string into `MONGODB_URI`.

## Roles
Registration always creates a **student**. The only admin is the one created by `npm run seed` from your `.env`.

## Rules (set in .env)
Loan length `LOAN_DAYS`, fine per overdue day `FINE_PER_DAY`, max active loans per student `MAX_ACTIVE_LOANS`.
