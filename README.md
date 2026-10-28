# Library Management System (Node.js, Express, MongoDB)

## Setup (Windows PowerShell)
```powershell
cd library-mgmt
npm install
Copy-Item .env.example .env      # then edit .env: MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed                     # creates the admin + 1,200 clearly labelled demo books
npm start                        # open http://localhost:3000
```
MongoDB: install locally and keep `mongodb://127.0.0.1:27017/library`, or paste a MongoDB Atlas connection string into `MONGODB_URI`.

## Roles
Library staff creates each **member** at the desk. Public self-registration is disabled. The only admin is the one created by `npm run seed` from your `.env`.

## Physical in-library counter workflow
This is a real-world desk system rather than an online borrowing service. Library staff register each visitor in **Register member**, choose that member and an available book in **Borrowing records**, issue the book at the desk, and mark it returned when the visitor brings it back. Visitors do not create accounts or borrow online; they receive the physical book directly from staff.

## Rules (set in .env)
Loan length `LOAN_DAYS`, fine per overdue day `FINE_PER_DAY`, max active loans per student `MAX_ACTIVE_LOANS`.
