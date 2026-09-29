// ── Dashboard Types ──────────────────────────────────────────────────────────

export type DateRange = 'today' | '7d' | '30d' | '90d' | 'custom';

export interface DateFilter {
  range: DateRange;
  from?: string;
  to?: string;
}

export interface KpiData {
  id: string;
  label: string;
  value: number;
  unit?: string;
  change: number;
  trend: 'up' | 'down' | 'flat';
  sparkline?: number[];
}

export interface ChartPoint {
  label: string;
  value: number;
  value2?: number;
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  unit?: string;
  data: ChartPoint[];
  colors?: string[];
}

export interface DashboardData {
  kpis: KpiData[];
  charts: ChartData[];
  updatedAt: string;
  period: {
    from: string;
    to: string;
  };
}

export interface DashboardQuery {
  range?: DateRange;
  from?: string;
  to?: string;
}

// ── Auth Types ───────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

// ── Notification Types ───────────────────────────────────────────────────────

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  createdAt: number;
}

export interface EmitNotificationDto {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  roomId?: string;
}

// ── AI Types ─────────────────────────────────────────────────────────────────

export type SummarizeMode = 'brief' | 'detailed' | 'bullets' | 'eli5';

export interface AIUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface StreamChunk {
  type: 'delta' | 'done' | 'error';
  content?: string;
  tokens?: number;
  usage?: AIUsage;
  error?: string;
}

export interface SummarizeResponse {
  summary: string;
  wordCount: number;
  readTime: number;
  tokens: number;
}
