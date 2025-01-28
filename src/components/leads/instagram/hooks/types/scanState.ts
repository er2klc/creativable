export interface ScanState {
  isLoading: boolean;
  scanProgress: number;
  currentFile?: string;
  isSuccess: boolean;
}