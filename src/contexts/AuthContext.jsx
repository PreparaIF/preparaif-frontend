import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiLogin, apiRegister, apiMe } from "../services/auth";
import { apiGetMyAttempts, apiSaveAttempt, calculateUserEvolution } from "../services/attempts";
import AuthModal from "../components/AuthModal/AuthModal";
import ToastNotification from "../components/Utils/ToastNotification";

const AuthContext = createContext(null);
const STORAGE_KEY = "preparaif_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' | 'register'

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = useCallback((toastData) => {
    setToast(toastData);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // User attempts & evolution
  const [userAttempts, setUserAttempts] = useState([]);

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // Load user attempts when user changes
  useEffect(() => {
    async function loadAttempts() {
      if (user && token) {
        try {
          const attempts = await apiGetMyAttempts(token, user.id);
          setUserAttempts(attempts || []);
        } catch (err) {
          console.error("Erro ao carregar tentativas:", err);
          setUserAttempts([]);
        }
      } else {
        setUserAttempts([]);
      }
    }
    loadAttempts();
  }, [user, token]);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await apiMe(token);
          setUser(userData);
        } catch (error) {
          console.error("Sessão inválida", error);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    showToast({
      type: "success",
      title: "Login Realizado",
      message: `Seja bem-vindo(a) de volta, ${data.user.name || "estudante"}!`,
    });
    return data.user;
  }, [showToast]);

  const register = useCallback(async (name, email, password) => {
    const data = await apiRegister(name, email, password);
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    showToast({
      type: "success",
      title: "Conta Criada",
      message: `Seja bem-vindo(a) ao Prepara IF, ${name}!`,
    });
    return data.user;
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    setUserAttempts([]);
    showToast({
      type: "logout",
      title: "Sessão Encerrada",
      message: "Você saiu da sua conta com sucesso. Até logo!",
    });
  }, [showToast]);

  const recordAttempt = useCallback(
    async (attemptData) => {
      if (!user) return;
      try {
        const saved = await apiSaveAttempt(token, attemptData, user.id);
        setUserAttempts((prev) => [...prev, saved || attemptData]);
      } catch (err) {
        setUserAttempts((prev) => [...prev, attemptData]);
      }
    },
    [token, user]
  );

  const updateUserProfile = useCallback(async (updatedFields) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newUser = { ...prev, ...updatedFields };
      try {
        const sessions = JSON.parse(localStorage.getItem("preparaif_user_sessions")) || {};
        if (token && sessions[token]) {
          sessions[token] = newUser;
          localStorage.setItem("preparaif_user_sessions", JSON.stringify(sessions));
        }
      } catch (e) {
        console.error("Erro ao salvar perfil local:", e);
      }
      return newUser;
    });
    showToast({
      type: "success",
      title: "Perfil Atualizado",
      message: "Suas alterações foram salvas com sucesso!",
    });
  }, [token, showToast]);

  const userEvolution = calculateUserEvolution(userAttempts);
  const isAdmin = user?.role === "ADMIN" || (user?.email && user.email.toLowerCase().includes("admin"));
  const isStudent = !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isStudent,
        login,
        register,
        logout,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        userAttempts,
        userEvolution,
        recordAttempt,
        updateUserProfile,
        showToast,
      }}
    >
      {!loading && (
        <>
          {children}
          <AuthModal />
          <ToastNotification toast={toast} onClose={() => setToast(null)} />
        </>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
