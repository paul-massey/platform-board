import { describe, expect, it } from 'vitest';
import { formatStationClock, formatStationDate } from '../src/clock';

describe('station clock', () => {
  it('displays a padded 24 hour clock in British Summer Time', () => {
    expect(formatStationClock(new Date('2026-07-15T08:04:09Z'))).toBe('09:04:09');
  });

  it('rolls over to the following day during summer', () => {
    expect(formatStationClock(new Date('2026-07-15T23:30:00Z'))).toBe('00:30:00');
  });

  it('formats the London calendar date independently of the device timezone', () => {
    expect(formatStationDate(new Date('2026-07-15T23:30:00Z'))).toBe('Thursday 16 July');
  });
});
