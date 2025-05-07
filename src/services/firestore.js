import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy,
    getDocs, 
    Timestamp,
    deleteDoc
  } from "firebase/firestore";
  import { db } from "./firebase";
  import { onSnapshot } from "firebase/firestore";

  // Save a calculation to Firestore
  export const saveCalculation = async (userId, dateOfBirth, result) => {
    try {
      const calculationRef = await addDoc(collection(db, "calculations"), {
        userId,
        dateOfBirth,
        calculatedAt: Timestamp.now(),
        result
      });
      return { id: calculationRef.id, error: null };
    } catch (error) {
      return { id: null, error: error.message };
    }
  };
  
  // Get all calculations for a user
  export const getUserCalculations = async (userId) => {
    try {
      const q = query(
        collection(db, "calculations"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const calculations = [];
      
      querySnapshot.forEach((doc) => {
        calculations.push({
          id: doc.id,
          ...doc.data(),
          calculatedAt: doc.data().calculatedAt.toDate(),
          dateOfBirth: doc.data().dateOfBirth
        });
      });
      
      return { calculations, error: null };
    } catch (error) {
      return { calculations: [], error: error.message };
    }
  };
  
  // Delete user's calculations when account is deleted
  export const deleteUserCalculations = async (userId) => {
    try {
      const q = query(
        collection(db, "calculations"),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  export const subscribeToUserCalculations = (userId, callback) => {
    const q = query(
      collection(db, "calculations"),
      where("userId", "==", userId)
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