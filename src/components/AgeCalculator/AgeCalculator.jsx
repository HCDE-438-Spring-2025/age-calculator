import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { saveCalculation } from "../../services/firestore";
import "./AgeCalculator.css";

const AgeCalculator = ({ onCalculate }) => {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();

  const calculateAge = () => {
    if (!dateOfBirth) {
      setError("Please select a date of birth");
      return;
    }

    setError("");

    // Get the selected date of birth
    const dob = new Date(dateOfBirth);
    // Get current date
    const today = new Date();

    // Calculate difference in years, months, and days
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    // Adjust if current day is less than birth day
    if (days < 0) {
      // Days in the previous month
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
      months--;
    }

    // Adjust if current month is less than birth month
    if (months < 0) {
      months += 12;
      years--;
    }

    const ageResult = { years, months, days };
    setResult(ageResult);

    // Save to Firestore if user is logged in
    if (currentUser) {
      saveCalculation(currentUser.uid, dateOfBirth, ageResult)
        .then((response) => {
          if (response.error) {
            console.error("Error saving calculation:", response.error);
          } else {
            console.log("Calculation saved successfully");
            // Call the onCalculate callback to refresh history
            if (onCalculate) onCalculate();
          }
        });
    }
  };

  return (
    <div className="age-calculator">
      <h2>Calculate Your Age</h2>
      <div className="calculator-form">
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth:</label>
          <input
            type="date"
            id="dateOfBirth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button onClick={calculateAge} className="calculate-button">
          Calculate Age
        </button>
      </div>

      {result && (
        <div className="result">
          <h3>Your Age is:</h3>
          <p>
            <span className="result-number">{result.years}</span> years,{" "}
            <span className="result-number">{result.months}</span> months, and{" "}
            <span className="result-number">{result.days}</span> days
          </p>
        </div>
      )}
    </div>
  );
};

export default AgeCalculator;
