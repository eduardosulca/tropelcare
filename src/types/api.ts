export interface User {
  id: string;
  displayName: string;
  email: string;
  teamCode: string;
  role: 'OPERATOR';
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface DashboardSummary {
  totalTropels: number;
  criticalTropels: number;
  openSignals: number;
  sectorStabilityAvg: number;
  signalsBySeverity: Record<'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO', number>;
  generatedAt: string;
}

export type Species = 'BLOBITO' | 'CHISPA' | 'GRUNON' | 'DORMILON' | 'GLITCHY';
export type VitalState = 'ESTABLE' | 'HAMBRIENTO' | 'AGITADO' | 'MUTANDO' | 'CRITICO';
export type SignalType = 'HAMBRE' | 'ABANDONO' | 'MUTACION' | 'FUGA' | 'CONFLICTO' | 'REPRODUCCION_MASIVA' | 'SENAL_CORRUPTA';
export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO';
export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA';

export interface SectorBasic {
  id: string;
  name: string;
  sectorCode: string;
}

export interface Tropel {
  id: string;
  name: string;
  species: Species;
  vitalState: VitalState;
  energyLevel: number;
  chaosIndex: number;
  mutationStage: number;
  guardianName: string;
  sector: SectorBasic;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface Signal {
  id: string;
  signalType: SignalType;
  severity: Severity;
  status: SignalStatus;
  rawContent: string;
  tropelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignalFeedResponse {
  items: Signal[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface Sector {
  id: string;
  name: string;
  sectorCode: string;
  climate: string;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
}

export interface StoryMetrics {
  stability: number;
  energy: number;
  alerts: number;
}

export interface SectorStoryStage {
  stageOrder: number;
  title: string;
  narrative: string;
  dominantEvent: string;
  metrics: StoryMetrics;
  assetKey: string;
  colorToken: string;
  progress: number;
}

export interface SectorStoryResponse {
  sector: {
    id: string;
    name: string;
    sectorCode: string;
    climate: string;
  };
  stages: SectorStoryStage[];
}