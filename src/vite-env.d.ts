/// <reference types="vite/client" />

declare global {
  interface Window extends globalThis.Window {}
  interface ErrorEvent extends globalThis.ErrorEvent {}
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}
