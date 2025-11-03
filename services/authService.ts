import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/config";
import type { AuthResponse } from "../types/user";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName?: string;
}

export async function login(data: LoginDto): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_URL}/auth/login`, data);
  const token = res.data?.token;
  if (!token) throw new Error("Hiányzó token a válaszban");
  await SecureStore.setItemAsync("token", token);
  return res.data;
}

export async function register(data: RegisterDto): Promise<AuthResponse> {
  const res = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data);
  const token = res.data?.token;
  if (token) await SecureStore.setItemAsync("token", token);
  return res.data;
}

export async function logout() {
  await SecureStore.deleteItemAsync("token");
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync("token");
}
