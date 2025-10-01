import { auth, db } from "../config/firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const registerUser = async (email, password, userName, userRole) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Salvar informações adicionais do usuário no Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: userName,
      email: email,
      role: userRole, // 'institution', 'scout', 'responsible'
      createdAt: new Date(),
    });
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

