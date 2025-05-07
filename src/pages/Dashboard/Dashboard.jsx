import { useState } from "react";
import AgeCalculator from "../../components/AgeCalculator/AgeCalculator";
import CalculationHistory from "../../components/CalculationHistory/CalculationHistory";
import "./Dashboard.css";

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCalculate = () => {
    // Trigger a refresh of the calculation history
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="dashboard-container">
      <h1>Your Dashboard</h1>
      <div className="dashboard-content">
        <AgeCalculator onCalculate={handleCalculate} />
        <CalculationHistory refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;