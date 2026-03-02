export interface ElectronAPI {
  saveData: (key: string, data: any) => Promise<boolean>;
  loadData: (key: string) => Promise<any>;
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  onUpdaterEvent: (callback: (message: string, data?: any) => void) => void;
  checkForUpdates: () => Promise<void>;
  quitAndInstall: () => void;
}
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}