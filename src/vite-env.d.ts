/// <reference types="vite/client" />

declare global {
  interface Window {
    location: Location;
    addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
    removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  }
  
  interface ErrorEvent {
    message: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    error?: Error;
  }
  
  function requestAnimationFrame(callback: FrameRequestCallback): number;
}
