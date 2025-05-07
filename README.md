# Age Calculator App with Firebase

This document outlines the project structure and implementation guidelines for a simple Age Calculator application built with React, Firebase Authentication, and Firestore.

## Project Overview

**App Description**: A web application that allows users to:
- Create an account / Log in
- Calculate their age based on date of birth
- View their calculation history
- Log out
- Delete their account

## Tech Stack

- **Frontend**: React (with Vite)
- **Routing**: React Router
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Styling**: CSS (separate files for components)

## Project Structure

```
src/
├── components/
│   ├── AgeCalculator/
│   │   ├── AgeCalculator.jsx
│   │   └── AgeCalculator.css
│   ├── CalculationHistory/
│   │   ├── CalculationHistory.jsx
│   │   └── CalculationHistory.css
│   ├── Navbar/
│   │   ├── Navbar.jsx
│   │   └── Navbar.css
│   └── ProtectedRoute/
│       └── ProtectedRoute.jsx
├── pages/
│   ├── Home/
│   │   ├── Home.jsx
│   │   └── Home.css
│   ├── Login/
│   │   ├── Login.jsx
│   │   └── Login.css
│   ├── Register/
│   │   ├── Register.jsx
│   │   └── Register.css
│   ├── Dashboard/
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.css
│   └── Profile/
│       ├── Profile.jsx
│       └── Profile.css
├── services/
│   ├── firebase.js
│   ├── auth.js
│   └── firestore.js
├── context/
│   └── AuthContext.jsx
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## Firebase Setup Instructions

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Authentication (Email/Password method)
3. Create a Firestore database
4. Get your Firebase configuration from the Firebase console
5. Add the configuration to the `firebase.js` file

## Implementation Steps

1. Set up Firebase Authentication
2. Create user registration and login flows
3. Implement the age calculator component
4. Set up Firestore to store calculation history
5. Add protected routes for authenticated users
6. Implement user profile management (logout and account deletion)

## Database Structure

**Collection**: `users`
- Document ID: `{userId}`
  - Field: `email` - User's email
  - Field: `createdAt` - Timestamp of account creation

**Collection**: `calculations`
- Document ID: `{auto-generated}`
  - Field: `userId` - Reference to the user
  - Field: `dateOfBirth` - Date selected by user
  - Field: `calculatedAt` - Timestamp of calculation
  - Field: `result` - Object containing years, months, days