import type { Store } from 'pinia'

export interface AuthUser {
  id: string | number
  username: string
  email: string
}

export interface AuthState {
  user: AuthUser | null
  isLoggedIn: boolean
}

export interface AuthActions {
  initAuth(): Promise<void>
  login(email: string, password: string): Promise<{ success: boolean; status?: number }>
  register(username: string, email: string, password: string): Promise<{ success: boolean; status?: number; data?: unknown }>
  logout(): Promise<void>
  fetchMe(): Promise<void>
}

export type AuthStore = Store<'auth', AuthState, Record<string, never>, AuthActions>

export declare function useAuthStore(): AuthStore
