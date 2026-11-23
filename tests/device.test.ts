import { describe, expect, it } from 'vitest';
import { formatDimensions, readDevice, type DeviceEnvironment } from '../src/device';

function environment(dark: boolean, online: boolean): DeviceEnvironment {
  return {
    screen: { width: 1920, height: 1080 },
    innerWidth: 1100,
    innerHeight: 700,
    matchMedia: (query) => ({ matches: query === '(prefers-color-scheme: dark)' && dark }),
    navigator: { onLine: online },
  };
}

describe('this device', () => {
  it('keeps screen dimensions separate from the viewport', () => {
    expect(readDevice(environment(false, true), 'Europe/London')).toEqual({
      screenWidth: 1920,
      screenHeight: 1080,
      viewportWidth: 1100,
      viewportHeight: 700,
      appearance: 'Light',
      timeZone: 'Europe/London',
      online: true,
    });
  });

  it('reports dark appearance and offline state', () => {
    const details = readDevice(environment(true, false), 'America/New_York');
    expect(details.appearance).toBe('Dark');
    expect(details.online).toBe(false);
    expect(details.timeZone).toBe('America/New_York');
  });

  it('labels unknown timezone and readable dimensions', () => {
    expect(readDevice(environment(false, true), '').timeZone).toBe('Unknown');
    expect(formatDimensions(390, 844)).toBe('390 × 844');
  });
});
