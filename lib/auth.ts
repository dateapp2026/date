import { API_BASE_URL } from "@/constants/api";
import { clearToken as clearStoredToken, getToken as getStoredToken, setToken as setStoredToken } from "@/lib/tokenStorage";

const TOKEN_KEY = "auth_token";

export type User = {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  birthday: string;
  gender: string;
  profile_picture_url: string | null;
  bio: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseJsonResponse(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, body?.error ?? "Something went wrong. Please try again.");
  }
  return body;
}

export async function login(username: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const body = await parseJsonResponse(response);
  await setStoredToken(TOKEN_KEY, body.token);
  return body.user as User;
}

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  birthday: string; // YYYY-MM-DD
  gender: string;
};

export async function register(payload: RegisterPayload): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await parseJsonResponse(response);
  return body.user as User;
}

export async function getToken(): Promise<string | null> {
  return getStoredToken(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  await clearStoredToken(TOKEN_KEY);
}
