// @vitest-environment happy-dom
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const media = Object.assign(new EventTarget(), { matches: false });
const summerMorning = new Date('2026-07-15T08:04:09Z');

function chooseStation(id: string): HTMLSelectElement {
  const select = document.querySelector<HTMLSelectElement>('#station-select')!;
  select.value = id;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return document.querySelector<HTMLSelectElement>('#station-select')!;
}

beforeAll(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(summerMorning);
  localStorage.clear();
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => media });
  Object.defineProperty(window.screen, 'width', { configurable: true, value: 1920 });
  Object.defineProperty(window.screen, 'height', { configurable: true, value: 1080 });
  document.body.innerHTML = '<div id="app"></div>';
  await import('../src/main');
});

beforeEach(() => {
  vi.setSystemTime(summerMorning);
  media.matches = false;
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  chooseStation('BTN');
});

afterAll(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  localStorage.clear();
});

describe('single-page board interactions', () => {
  it('mounts the selected station, six trains, next train and all device fields', () => {
    expect(document.querySelector('h1')?.textContent).toContain('Your next train');
    expect(document.querySelectorAll('#departure-rows tr')).toHaveLength(6);
    expect(document.querySelector('#next-departure h3')?.textContent).toBeTruthy();
    expect(document.querySelector('[data-device="screen"]')?.textContent).toBe('1920 × 1080');
    expect(document.querySelector('[data-device="appearance"]')?.textContent).toBe('Light');
    expect(document.querySelector('[data-device="timezone"]')?.textContent).toBeTruthy();
    expect(document.querySelector('[data-device="network"]')?.textContent).toBe('Online');
  });

  it('switches station, stores the choice and keeps keyboard focus', () => {
    const select = chooseStation('EDB');
    expect(localStorage.getItem('platform-board.station')).toBe('EDB');
    expect(document.querySelector('.board-topline')?.textContent).toContain('Edinburgh Waverley');
    expect(document.activeElement).toBe(select);
    expect(document.querySelectorAll('#departure-rows tr')).toHaveLength(6);
  });

  it('ticks the clock and reduces the next departure countdown', () => {
    const countdown = document.querySelector('.train-countdown:not(th)')?.textContent;
    vi.advanceTimersByTime(60_000);
    expect(document.querySelector('#station-clock')?.textContent).toBe('09:05:09');
    expect(document.querySelector('.train-countdown:not(th)')?.textContent).not.toBe(countdown);
    expect(document.querySelector('#next-announcement')?.textContent).toContain('Next train:');
  });

  it('updates connection state and continues the clock while offline', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    window.dispatchEvent(new Event('offline'));
    expect(document.querySelector('[data-device="network"]')?.textContent).toBe('Offline');
    vi.advanceTimersByTime(1_000);
    expect(document.querySelector('#station-clock')?.textContent).toBe('09:04:10');
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    window.dispatchEvent(new Event('online'));
    expect(document.querySelector('[data-device="network"]')?.textContent).toBe('Online');
  });

  it('responds to system appearance changes', () => {
    media.matches = true;
    media.dispatchEvent(new Event('change'));
    expect(document.querySelector('[data-device="appearance"]')?.textContent).toBe('Dark');
  });

  it('refreshes the viewport without confusing it with screen dimensions', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 844 });
    window.dispatchEvent(new Event('resize'));
    expect(document.querySelector('[data-device="viewport"]')?.textContent).toBe('390 × 844 viewport');
    expect(document.querySelector('[data-device="screen"]')?.textContent).toBe('1920 × 1080');
  });
});
