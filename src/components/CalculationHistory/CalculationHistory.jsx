import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserCalculations } from "../../services/firestore";
import "./CalculationHistory.css";

const CalculationHistory = ({ refreshTrigger }) => {
  const [calculations, setCalculations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    getUserCalculations(currentUser.uid)
      .then((response) => {
        if (response.error) {
          setError(response.error);
        } else {
          // Sort by calculatedAt in descending order (newest first)
          const sortedCalculations = response.calculations.sort((a, b) => 
            b.calculatedAt - a.calculatedAt
          );
          setCalculations(sortedCalculations);
          setError("");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser, refreshTrigger]);

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

  return (
    <div className="calculation-history">
      <h2>Your Calculation History</h2>
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
