import { API_URL } from "../config";

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = "Registration failed.";

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item?.msg || "Invalid input")
        .join(", ");
    }

    throw new Error(message);
  }

  return data;
};

export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();

  formData.append("grant_type", "password");
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = "Login failed.";

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => item?.msg || "Invalid input")
        .join(", ");
    }

    throw new Error(message);
  }

  return data;
};

export const getToken = () =>
  localStorage.getItem("devanta_token");

export const getUsername = () =>
  localStorage.getItem("devanta_username");

export const logoutUser = () => {
  localStorage.removeItem("devanta_token");
  localStorage.removeItem("devanta_username");
};
