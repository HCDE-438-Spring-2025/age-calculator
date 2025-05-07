import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Age Calculator App</h1>
        <p className="home-description">
          Calculate your age in years, months, and days with our simple tool.
          Create an account to save your calculation history.
        </p>
        
        <div className="cta-buttons">
          {currentUser ? (
            <Link to="/dashboard" className="cta-button primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="cta-button primary">
                Login
              </Link>
              <Link to="/register" className="cta-button secondary">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;