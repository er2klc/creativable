
// This file contains type overrides that would normally be in tsconfig.json
// But since tsconfig.json is read-only, we're using module augmentation instead

// Enable allowSyntheticDefaultImports for React and other modules
declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'canvas-confetti' {
  const canvasConfetti: any;
  export default canvasConfetti;
}
