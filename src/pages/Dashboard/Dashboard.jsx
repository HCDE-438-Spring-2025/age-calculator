import { useState, useEffect } from "react";
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