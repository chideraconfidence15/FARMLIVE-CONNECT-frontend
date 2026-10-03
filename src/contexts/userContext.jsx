import { createContext, useState, useContext, useEffect } from "react";
import { api } from "../lib/api";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const saved = localStorage.getItem("farmlive_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (!parsed.token) throw new Error("Session token missing")
          const freshUser = await api.get('/auth/me');
          const verifiedUser = { ...freshUser, token: parsed.token };
          setUser(verifiedUser);
          localStorage.setItem("farmlive_user", JSON.stringify(verifiedUser));
        }
      } catch (error) {
        localStorage.removeItem("farmlive_user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn("Logout error:", e.message);
    }
    localStorage.removeItem("farmlive_user");
    setUser(null);
  }

  async function signup(formData) {
    const res = await api.post('/auth/register', {
      firstname: formData.firstname,
      lastname: formData.lastname,
      name: `${formData.firstname || ''} ${formData.lastname || ''}`.trim(),
      email: formData.email,
      password: formData.password
    });
    localStorage.setItem("farmlive_pending_signup_email", res.email || formData.email);
    return res;
  }

  async function verifySignupOtp(email, code) {
    const response = await api.post('/auth/verify-signup', { email, code });
    const verifiedUser = { ...(response.user || response), token: response.token };
    localStorage.removeItem("farmlive_pending_signup_email");
    localStorage.setItem("farmlive_user", JSON.stringify(verifiedUser));
    setUser(verifiedUser);
    return verifiedUser;
  }

  async function resendSignupOtp(email) {
    return api.post('/auth/resend-signup-code', { email });
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const loggedInUser = { ...(res.user || res), token: res.token };
    localStorage.setItem("farmlive_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function loginWithGoogle(credential) {
    if (!credential) throw new Error('Google did not return a sign-in credential. Please try again.')
    const response = await api.post('/auth/google', { credential })
    const googleUser = { ...(response.user || response), token: response.token }
    localStorage.setItem('farmlive_user', JSON.stringify(googleUser))
    setUser(googleUser)
    return googleUser
  }

  async function verifyEmail() {
    try {
      await api.post('/auth/verify');
      if (user) {
        const updated = { ...user, emailVerification: true };
        setUser(updated);
        localStorage.setItem("farmlive_user", JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("Verify email error:", e);
    }
  }

  async function sendVerificationEmail() {
    return await api.post('/auth/resend-verification');
  }

  async function updateProfile(name) {
    if (user) {
      const updated = { ...user, name };
      setUser(updated);
      localStorage.setItem("farmlive_user", JSON.stringify(updated));
    }
  }

  const contextValue = {
    user,
    loading,
    logout,
    signup,
    verifySignupOtp,
    resendSignupOtp,
    login,
    loginWithGoogle,
    verifyEmail,
    sendVerificationEmail,
    updateProfile
  };

  return (
    <UserContext.Provider value={contextValue}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
