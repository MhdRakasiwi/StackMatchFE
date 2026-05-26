import { AxiosInstance, AxiosResponse } from 'axios'

declare const api: AxiosInstance
export default api

export function login(email: string, password: string): Promise<AxiosResponse<{ access_token: string; refresh_token: string }>>
export function register(username: string, email: string, password: string): Promise<AxiosResponse<{ access_token: string; refresh_token: string }>>
export function logout(): Promise<AxiosResponse<Record<string, unknown>>>
export function refreshToken(refresh_token: string): Promise<AxiosResponse<{ access_token: string }>>
export function getMe(): Promise<AxiosResponse<Record<string, unknown>>>

export function recommend(
  query: string,
  top_n?: number,
  lang?: string
): Promise<AxiosResponse<{ results: unknown; query_translated?: string; total?: number }>>

export function search(
  query: string,
  tag?: string | null,
  top_n?: number,
  lang?: string,
  min_score?: number
): Promise<AxiosResponse<{ results: unknown; query_translated?: string; total?: number }>>

export function getTags(): Promise<AxiosResponse<{ tags: string[] }>>
export function getQuestions(
  limit?: number,
  offset?: number,
  tag?: string | null
): Promise<AxiosResponse<Record<string, unknown>>>
export function getRandom(tag?: string | null, n?: number): Promise<AxiosResponse<Record<string, unknown>>>

export function translate(
  text: string,
  target: string,
  source?: string
): Promise<AxiosResponse<{ translated_text: string }>>

export function postFeedback(
  question_id: string | number,
  query: string,
  rating: number,
  comment?: string
): Promise<AxiosResponse<Record<string, unknown>>>
export function getFeedback(question_id: string | number): Promise<AxiosResponse<Record<string, unknown>>>

export function getUsage(limit?: number, offset?: number): Promise<AxiosResponse<Record<string, unknown>>>
export function getHealth(): Promise<AxiosResponse<{ status: string }>>
export function getDetailedHealth(): Promise<AxiosResponse<Record<string, unknown>>>
export function getStats(): Promise<AxiosResponse<Record<string, unknown>>>
