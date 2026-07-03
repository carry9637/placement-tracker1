import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authService } from "../services/authService";
import { getApiErrorMessage } from "../services/apiClient";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const currentUser = await authService.me();
    setUser(currentUser);
    return currentUser;
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const currentUser = await authService.me();
        if (active) setUser(currentUser);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = async (payload) => {
    const data = await authService.login(payload);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (payload) => {
    const updatedUser = await authService.updateMe(payload);
    setUser(updatedUser);
    return updatedUser;
  };

  const uploadResume = async (file) => {
    const updatedUser = await authService.uploadResume(file);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        updateProfile,
        uploadResume,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
