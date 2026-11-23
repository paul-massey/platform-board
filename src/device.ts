export interface DeviceDetails {
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  appearance: 'Light' | 'Dark';
  timeZone: string;
  online: boolean;
}

export interface DeviceEnvironment {
  screen: { width: number; height: number };
  innerWidth: number;
  innerHeight: number;
  matchMedia: (query: string) => { matches: boolean };
  navigator: { onLine: boolean };
}

export function readDevice(
  environment: DeviceEnvironment = window,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
): DeviceDetails {
  return {
    screenWidth: environment.screen.width,
    screenHeight: environment.screen.height,
    viewportWidth: environment.innerWidth,
    viewportHeight: environment.innerHeight,
    appearance: environment.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light',
    timeZone: timeZone || 'Unknown',
    online: environment.navigator.onLine,
  };
}

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}
