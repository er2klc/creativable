export const DEFAULT_PLAYER_VARS = {
  autoplay: 0,
  controls: 1,
  modestbranding: 1,
  rel: 0,
  showinfo: 0,
  fs: 0,
  iv_load_policy: 3,
  disablekb: 1,
} as const;

export const PLAYER_STYLES = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
} as const;

export const CONTAINER_STYLES = {
  position: 'relative',
  paddingBottom: '56.25%', // 16:9 aspect ratio
  height: 0,
  overflow: 'hidden',
} as const;