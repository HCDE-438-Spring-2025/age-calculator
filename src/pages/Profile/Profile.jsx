import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser, deleteUserAccount } from "../../services/auth";
import { deleteUserCalculations } from "../../services/firestore";
import "./Profile.css";

const Profile = () => {
  const { currentUser } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    setError("");
    setMessage("");
    
    try {
      const { success, error } = await logoutUser();
      
      if (!success) {
        setError(error || "Failed to log out");
        return;
      }
      
      navigate("/");
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const handleDeleteAccount = async () => {
    setError("");
    setMessage("");
    
    // Verify confirmation text
    if (confirmDelete !== "DELETE") {
      setError("Please type DELETE to confirm account deletion");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // First delete all user calculations
      const deleteCalcResult = await deleteUserCalculations(currentUser.uid);
      
      if (!deleteCalcResult.success) {
        setError("Failed to delete user data: " + deleteCalcResult.error);
        setIsDeleting(false);
        return;
      }
      
      // Then delete the user account
      const { success, error } = await deleteUserAccount();
      
      if (!success) {
        setError(error || "Failed to delete account");
        setIsDeleting(false);
        return;
      }
      
      // Redirect to home page
      navigate("/");
    } catch (err) {
      setError("An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Your Profile</h2>
        
        {error && <div className="profile-error">{error}</div>}
        {message && <div className="profile-message">{message}</div>}
        
        <div className="profile-info">
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{currentUser?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{currentUser?.displayName}</span>
          </div>
        </div>
        
        <div className="profile-actions">
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </div>
        
        <div className="danger-zone">
          <h3>Danger Zone</h3>
          <p>
            Deleting your account will permanently remove all your data,
            including your calculation history. This action cannot be undone.
          </p>
          
          <div className="delete-confirmation">
            <label htmlFor="confirmDelete">
              Type <strong>DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              id="confirmDelete"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          
          <button
            onClick={handleDeleteAccount}
            className="delete-button"
            disabled={isDeleting || confirmDelete !== "DELETE"}
          >
            {isDeleting ? "Deleting Account..." : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;