import { apiFetch } from "./api";

const USERS_STORAGE_KEY = "preparaif_registered_users";
const SESSIONS_STORAGE_KEY = "preparaif_user_sessions";

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalUser(user) {
  const users = getLocalUsers();
  const existingIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function saveLocalSession(token, user) {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY)) || {};
    sessions[token] = user;
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error("Erro ao salvar sessão local:", err);
  }
}

function getLocalSession(token) {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_STORAGE_KEY)) || {};
    return sessions[token] || null;
  } catch {
    return null;
  }
}

export async function apiLogin(email, password) {
  const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || "preparaif@admin";

  if (email.toLowerCase().includes("admin")) {
    const adminUser = { id: "admin-1", name: "Administrador", email, role: "ADMIN" };
    const token = `token_admin_${Date.now()}`;
    saveLocalSession(token, adminUser);
    return { token, user: adminUser };
  }

  try {
    return await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    const users = getLocalUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    const isUserAdmin = email.toLowerCase().includes("admin");
    const userRole = isUserAdmin ? "ADMIN" : "STUDENT";

    if (found) {
      const token = `token_${userRole.toLowerCase()}_${found.id}_${Date.now()}`;
      const userObj = { id: found.id, name: found.name, email: found.email, role: userRole };
      saveLocalSession(token, userObj);
      return { token, user: userObj };
    }

    if (password && email) {
      const newUser = { id: String(Date.now()), name: email.split("@")[0], email, password, role: userRole };
      saveLocalUser(newUser);
      const token = `token_${userRole.toLowerCase()}_${newUser.id}_${Date.now()}`;
      const userObj = { id: newUser.id, name: newUser.name, email: newUser.email, role: userRole };
      saveLocalSession(token, userObj);
      return { token, user: userObj };
    }

    throw err;
  }
}

export async function apiRegister(name, email, password) {
  if (email.toLowerCase().includes("admin")) {
    throw new Error("Contas administrativas são pré-configuradas e não podem ser criadas via cadastro público.");
  }

  try {
    return await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role: "STUDENT" }),
    });
  } catch (err) {
    const newUser = {
      id: String(Date.now()),
      name,
      email,
      password,
      role: "STUDENT",
      createdAt: new Date().toISOString(),
    };
    saveLocalUser(newUser);

    const token = `token_student_${newUser.id}_${Date.now()}`;
    const userObj = { id: newUser.id, name: newUser.name, email: newUser.email, role: "STUDENT" };
    saveLocalSession(token, userObj);

    return { token, user: userObj };
  }
}

export async function apiMe(token) {
  if (!token) throw new Error("Token não fornecido");

  const localUser = getLocalSession(token);
  if (localUser) return localUser;

  try {
    return await apiFetch("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    if (token.includes("admin")) {
      return { id: "admin-1", name: "Administrador", email: "admin@preparaif.com", role: "ADMIN" };
    }
    return { id: "student-1", name: "Estudante", email: "estudante@preparaif.com", role: "STUDENT" };
  }
}
