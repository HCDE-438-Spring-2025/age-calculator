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
    const totalAvgDays = agesTotalDays.reduce((sum, days) => sum + days, 0) / total;
    
    // Convert back to years, months, days
    const avgYears = Math.floor(totalAvgDays / 365);
    const avgMonths = Math.floor((totalAvgDays % 365) / 30);
    const avgDays = Math.floor((totalAvgDays % 365) % 30);
    
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