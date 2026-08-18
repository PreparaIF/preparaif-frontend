import { useState, useCallback, useEffect, useRef } from "react";
import { apiLogin, apiRegister, apiMe, apiUpdateProfile } from "../services/auth";
import { apiGetMyAttempts, apiSaveAttempt, calculateUserEvolution } from "../services/attempts";
import AuthModal from "../components/AuthModal/AuthModal";
import ToastNotification from "../components/Utils/ToastNotification";
import { AuthContext } from "./auth-context";

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
  const toastTimerRef = useRef(null);

  const showToast = useCallback((toastData) => {
    window.clearTimeout(toastTimerRef.current);
    setToast(toastData);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

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
          const attempts = await apiGetMyAttempts(token);
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
          console.warn("Sessão expirada ou token inválido, limpando sessão:", error.message);
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
          setUser(null);
          setUserAttempts([]);
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
      if (!user) throw new Error("Faça login antes de finalizar a prova.");
      const saved = await apiSaveAttempt(token, attemptData);
      setUserAttempts((prev) => [saved, ...prev]);
      return saved;
    },
    [token, user]
  );

  const updateUserProfile = useCallback(async (updatedFields) => {
    try {
      const updatedUser = await apiUpdateProfile(token, updatedFields);
      setUser((prev) => ({ ...(prev || {}), ...updatedUser }));
      showToast({
        type: "success",
        title: "Perfil Salvo no Banco",
        message: "Suas informações pessoais e preferências foram salvas com sucesso!",
      });
      return updatedUser;
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      showToast({
        type: "error",
        title: "Erro ao Salvar",
        message: "Não foi possível atualizar suas informações. Tente novamente.",
      });
      throw err;
    }
  }, [token, showToast]);

  const userEvolution = calculateUserEvolution(userAttempts);
  const isAdmin = user?.role === "ADMIN";
  const isStudent = user?.role === "STUDENT";

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
          <AuthModal key={`${authModalMode}-${isAuthModalOpen}`} />
          <ToastNotification toast={toast} onClose={() => setToast(null)} />
        </>
      )}
    </AuthContext.Provider>
  );
}
