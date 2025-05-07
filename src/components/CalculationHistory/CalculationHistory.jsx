import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserCalculations, subscribeToUserCalculations } from "../../services/firestore";
import "./CalculationHistory.css";

const CalculationHistory = ({ refreshTrigger }) => {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const [sortOrder, setSortOrder] = useState("newest");

//   useEffect(() => {
//     if (!currentUser) return;

//     setLoading(true);
//     getUserCalculations(currentUser.uid)
//       .then((response) => {
//         if (response.error) {
//           setError(response.error);
//         } else {
//           // Sort by calculatedAt in descending order (newest first)
//           const sortedCalculations = response.calculations.sort((a, b) => 
//             b.calculatedAt - a.calculatedAt
//           );
//           setCalculations(sortedCalculations);
//           setError("");
//         }
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, [currentUser, refreshTrigger]);

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

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (date) => {
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading your calculation history...</div>;
  }

  if (error) {
    return <div className="error">Error loading calculation history: {error}</div>;
  }

  if (calculations.length === 0) {
    return <div className="no-calculations">You haven't made any calculations yet.</div>;
  }

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

  return (
    <div className="calculation-history">
      <h2>Your Calculation History</h2>
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
      <div className="history-list">
        {calculations.map((calc) => (
          <div key={calc.id} className="history-item">
            <div className="history-date">
              <span>Date of Birth:</span> {formatDate(calc.dateOfBirth)}
            </div>
            <div className="history-result">
              <span>Age:</span> {calc.result.years} years, {calc.result.months} months, {calc.result.days} days
            </div>
            <div className="history-timestamp">
              <span>Calculated on:</span> {formatDateTime(calc.calculatedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculationHistory;
