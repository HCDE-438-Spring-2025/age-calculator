import { useState } from "react";
import AgeCalculator from "../../components/AgeCalculator/AgeCalculator";
import CalculationHistory from "../../components/CalculationHistory/CalculationHistory";
import "./Dashboard.css";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentUser } = useAuth();

  const handleCalculate = () => {
    // Trigger a refresh of the calculation history
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="dashboard-container">
      {currentUser?.displayName && <h1>Welcome {currentUser?.displayName}!</h1>}
      {!currentUser?.displayName && <h1>Your Dashboard</h1>}
      <div className="dashboard-content">
        <AgeCalculator onCalculate={handleCalculate} />
        <CalculationHistory refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
};

export default Dashboard;