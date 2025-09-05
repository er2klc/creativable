export interface ScanState {
  isLoading: boolean;
  scanProgress: number;
  currentFile?: string;
  isSuccess: boolean;
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