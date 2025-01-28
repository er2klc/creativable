export interface ScanState {
  isLoading: boolean;
  scanProgress: number;
  mediaProgress: number;
  currentFile?: string;
  currentPhase: 1 | 2;
  isPhaseOneComplete: boolean;
  isSuccess: boolean;
  isMediaProcessingActive: boolean;
}

export interface MediaProcessingState {
  totalFiles: number;
  processedFiles: number;
  isActive: boolean;
}

export interface PollingState {
  isActive: boolean;
  lastProgress: number;
  simulationInterval: NodeJS.Timeout | null;
}