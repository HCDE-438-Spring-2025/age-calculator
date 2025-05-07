# Age Calculator App - Step-by-Step Class Activities

Below are 5 hands-on activities to walk through with your students to help them better understand Firebase integration with React.

## TODO 1: Firebase Project Setup & Configuration

**Goal:** Initialize Firebase in the project and understand the configuration process.

**Steps:**

1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable the Authentication service and set up Email/Password sign-in method.
3. Create a Firestore database in test mode.
4. Get your Firebase configuration:
   - Click on the gear icon (⚙️) next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - Copy the Firebase config object
5. Create or update the `src/services/firebase.js` file with your configuration:

```javascript
// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
```

6. Explain to students how the Firebase configuration connects your web app to your Firebase project.

## TODO 2: Implement User Registration & Authentication State

**Goal:** Understand how Firebase Authentication works with React.

**Steps:**

1. **Examine the Authentication Context:**
   - Open `src/context/AuthContext.jsx`
   - Discuss the `AuthProvider` component and how it manages user authentication state
   - Explain how `onAuthStateChanged` works as a listener for authentication state changes

2. **Enhance User Registration:**
   - Open `src/pages/Register/Register.jsx`
   - Modify the registration form to include a name field:
   
```javascript
// Add this to the state
const [name, setName] = useState("");

// Add this field to the form (after the email input)
<div className="form-group">
  <label htmlFor="name">Name</label>
  <input
    type="text"
    id="name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    required
  />
</div>
```

3. **Update User Profile after Registration:**
   - Modify the `handleSubmit` function in `Register.jsx` to update the user profile:

```javascript
import { updateProfile } from "firebase/auth";

// Inside handleSubmit, after successful registration
if (user) {
  try {
    await updateProfile(user, {
      displayName: name
    });
    navigate("/dashboard");
  } catch (err) {
    setError("Failed to update profile. Please try again.");
  }
}
```

4. **Test the Registration Process:**
   - Run the application and test creating a new user
   - Verify in the Firebase console that the user was created with the display name

## TODO 3: Implement Real-time Data Updates with Firestore

**Goal:** Understand how to use Firestore for real-time updates.

**Steps:**

1. **Modify the Firestore Service:**
   - Open `src/services/firestore.js`
   - Add a function for real-time updates:

```javascript
// Add these imports at the top
import { onSnapshot } from "firebase/firestore";

// Add this function
export const subscribeToUserCalculations = (userId, callback) => {
  const q = query(
    collection(db, "calculations"),
    where("userId", "==", userId),
    orderBy("calculatedAt", "desc")
  );
  
  // Return the unsubscribe function
  return onSnapshot(q, (querySnapshot) => {
    const calculations = [];
    querySnapshot.forEach((doc) => {
      calculations.push({
        id: doc.id,
        ...doc.data(),
        calculatedAt: doc.data().calculatedAt.toDate(),
        dateOfBirth: doc.data().dateOfBirth
      });
    });
    callback(calculations);
  });
};
```

2. **Update the CalculationHistory Component:**
   - Open `src/components/CalculationHistory/CalculationHistory.jsx`
   - Replace the current `useEffect` with real-time subscription:

```javascript
// Replace the useEffect with this
useEffect(() => {
  if (!currentUser) return;

  setLoading(true);
  
  // Set up real-time listener
  const unsubscribe = subscribeToUserCalculations(
    currentUser.uid,
    (calculations) => {
      setCalculations(calculations);
      setLoading(false);
      setError("");
    }
  );
  
  // Clean up listener on unmount
  return () => unsubscribe();
}, [currentUser]);
```

3. **Test Real-time Updates:**
   - Open the application in two browser windows
   - Log in with the same account in both
   - Calculate an age in one window
   - Observe how the calculation history updates automatically in the other window

## TODO 4: Add Data Visualization for Calculation History

**Goal:** Implement a simple chart to visualize calculation patterns.

**Steps:**

1. **First, add sorting options to the Calculation History:**
   - Open `src/components/CalculationHistory/CalculationHistory.jsx`
   - Add state for sorting:

```javascript
const [sortOrder, setSortOrder] = useState("newest");

// Add this function
const handleSortChange = (e) => {
  setSortOrder(e.target.value);
};

// Add sorting controls before the history-list div
<div className="sort-controls">
  <label htmlFor="sort">Sort by: </label>
  <select 
    id="sort" 
    value={sortOrder} 
    onChange={handleSortChange}
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="youngest">Youngest Age First</option>
    <option value="oldest-age">Oldest Age First</option>
  </select>
</div>

// Add this before the return statement
// Sort calculations based on selected order
const sortedCalculations = [...calculations].sort((a, b) => {
  if (sortOrder === "newest") {
    return b.calculatedAt - a.calculatedAt;
  } else if (sortOrder === "oldest") {
    return a.calculatedAt - b.calculatedAt;
  } else if (sortOrder === "youngest") {
    return (a.result.years * 365 + a.result.months * 30 + a.result.days) - 
           (b.result.years * 365 + b.result.months * 30 + b.result.days);
  } else if (sortOrder === "oldest-age") {
    return (b.result.years * 365 + b.result.months * 30 + b.result.days) - 
           (a.result.years * 365 + a.result.months * 30 + a.result.days);
  }
  return 0;
});

// Then use sortedCalculations instead of calculations in your map function
```

2. **Create a new Calculation Stats Component:**
   - Create a new file `src/components/CalculationStats/CalculationStats.jsx`:

```javascript
import { useState, useEffect } from "react";
import "./CalculationStats.css";

const CalculationStats = ({ calculations }) => {
  const [stats, setStats] = useState({
    total: 0,
    averageAge: { years: 0, months: 0, days: 0 },
    oldestAge: { years: 0, months: 0, days: 0 },
    youngestAge: { years: 0, months: 0, days: 0 },
    mostCommonAgeRange: "",
  });

  useEffect(() => {
    if (calculations.length === 0) return;

    // Calculate stats
    const total = calculations.length;
    
    // Convert all ages to days for easier calculation
    const agesTotalDays = calculations.map(calc => 
      calc.result.years * 365 + calc.result.months * 30 + calc.result.days
    );
    
    // Average age in days
    const avgDays = agesTotalDays.reduce((sum, days) => sum + days, 0) / total;
    
    // Convert back to years, months, days
    const avgYears = Math.floor(avgDays / 365);
    const avgMonths = Math.floor((avgDays % 365) / 30);
    const avgDays = Math.floor((avgDays % 365) % 30);
    
    // Find oldest and youngest
    const oldestIdx = agesTotalDays.indexOf(Math.max(...agesTotalDays));
    const youngestIdx = agesTotalDays.indexOf(Math.min(...agesTotalDays));
    
    // Age ranges (0-18, 19-35, 36-50, 51+)
    const ageRanges = {
      "0-18": 0,
      "19-35": 0,
      "36-50": 0,
      "51+": 0
    };
    
    calculations.forEach(calc => {
      const { years } = calc.result;
      if (years <= 18) ageRanges["0-18"]++;
      else if (years <= 35) ageRanges["19-35"]++;
      else if (years <= 50) ageRanges["36-50"]++;
      else ageRanges["51+"]++;
    });
    
    // Find most common age range
    let mostCommonRange = "";
    let maxCount = 0;
    
    for (const [range, count] of Object.entries(ageRanges)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonRange = range;
      }
    }
    
    setStats({
      total,
      averageAge: { 
        years: avgYears, 
        months: avgMonths, 
        days: avgDays 
      },
      oldestAge: calculations[oldestIdx].result,
      youngestAge: calculations[youngestIdx].result,
      mostCommonAgeRange: mostCommonRange,
      ageRanges
    });
    
  }, [calculations]);

  if (calculations.length === 0) {
    return null;
  }

  return (
    <div className="calculation-stats">
      <h3>Calculation Statistics</h3>
      
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Total Calculations</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Average Age</div>
          <div className="stat-value">
            {stats.averageAge.years}y {stats.averageAge.months}m {stats.averageAge.days}d
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Oldest Age</div>
          <div className="stat-value">
            {stats.oldestAge.years}y {stats.oldestAge.months}m {stats.oldestAge.days}d
          </div>
        </div>
        
        <div className="stat-item">
          <div className="stat-label">Youngest Age</div>
          <div className="stat-value">
            {stats.youngestAge.years}y {stats.youngestAge.months}m {stats.youngestAge.days}d
          </div>
        </div>
      </div>
      
      <div className="age-distribution">
        <h4>Age Distribution</h4>
        <div className="distribution-bars">
          {stats?.ageRanges ? (
            Object.entries(stats.ageRanges).map(([range, count]) => (
              <div key={range} className="distribution-item">
                <div className="range-label">{range}</div>
                <div className="range-bar-container">
                  <div 
                    className="range-bar" 
                    style={{ 
                      width: `${(count / stats.total) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p>No age distribution data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculationStats;
```

3. **Create the CSS for the Stats Component:**
   - Create `src/components/CalculationStats/CalculationStats.css`:

```css
.calculation-stats {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
}

.calculation-stats h3 {
  margin-top: 0;
  color: #4a55a2;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 500;
  color: #4a55a2;
}

.age-distribution {
  margin-top: 1.5rem;
}

.age-distribution h4 {
  margin-bottom: 1rem;
  color: #4a55a2;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.range-label {
  width: 50px;
  font-size: 0.9rem;
  color: #666;
}

.range-bar-container {
  flex: 1;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.range-bar {
  height: 100%;
  background-color: #7895cb;
  border-radius: 10px;
  transition: width 0.3s ease;
}

.range-count {
  width: 30px;
  text-align: right;
  font-size: 0.9rem;
  color: #666;
}
```

4. **Add the Stats Component to the Dashboard:**
   - Update `src/pages/Dashboard/Dashboard.jsx` to include the stats component:

```javascript
import { useState } from "react";
import AgeCalculator from "../../components/AgeCalculator/AgeCalculator";
import CalculationHistory from "../../components/CalculationHistory/CalculationHistory";
import CalculationStats from "../../components/CalculationStats/CalculationStats";
import { useAuth } from "../../context/AuthContext";
import { getUserCalculations } from "../../services/firestore";
import "./Dashboard.css";

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [calculations, setCalculations] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchCalculations = async () => {
      const { calculations, error } = await getUserCalculations(currentUser.uid);
      if (!error) {
        setCalculations(calculations);
      }
    };
    
    fetchCalculations();
  }, [currentUser, refreshTrigger]);

  const handleCalculate = () => {
    // Trigger a refresh of the calculation history
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="dashboard-container">
      <h1>Your Dashboard</h1>
      <div className="dashboard-content">
        <div className="dashboard-left">
          <AgeCalculator onCalculate={handleCalculate} />
          <CalculationStats calculations={calculations} />
        </div>
        <div className="dashboard-right">
          <CalculationHistory 
            refreshTrigger={refreshTrigger}
            onCalculationsLoaded={setCalculations} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

5. **Update the Dashboard CSS:**
   - Modify `src/pages/Dashboard/Dashboard.css` to adjust the layout:

```css
.dashboard-container {
  padding: 2rem;
  background-color: #f5f7fa;
  min-height: calc(100vh - 70px);
}

.dashboard-container h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #4a55a2;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-left, .dashboard-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .dashboard-content {
    flex-direction: row;
  }
  
  .dashboard-left {
    flex: 1;
  }
  
  .dashboard-right {
    flex: 1;
  }
}
```
