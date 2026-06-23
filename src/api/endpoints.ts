import { apiFetch } from './client';
import type {
  LoginResponse,
  DashboardSummary,
  Tropel,
  PaginatedResponse,
  Signal,
  SignalFeedResponse,
  Sector,
  SectorStoryResponse,
} from '../types/api';

export function login(teamCode: string, email: string, password: string) {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ teamCode, email, password }),
  });
}

export function getMe() {
  return apiFetch<LoginResponse['user']>('/auth/me');
}

export function getDashboard() {
  return apiFetch<DashboardSummary>('/dashboard/summary');
}

export function getTropels(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<PaginatedResponse<Tropel>>(`/tropels?${qs}`);
}

export function getTropel(id: string) {
  return apiFetch<Tropel>(`/tropels/${id}`);
}

export function getSignalsFeed(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<SignalFeedResponse>(`/signals/feed?${qs}`);
}

export function getSignal(id: string) {
  return apiFetch<Signal>(`/signals/${id}`);
}

export function updateSignalStatus(id: string, status: 'PROCESANDO' | 'ATENDIDA') {
  return apiFetch<Signal>(`/signals/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getSectors() {
  return apiFetch<Sector[]>('/sectors');
}

export function getSectorStory(id: string) {
  return apiFetch<SectorStoryResponse>(`/sectors/${id}/story`);
}