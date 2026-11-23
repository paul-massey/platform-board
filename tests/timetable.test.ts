import { describe, expect, it } from 'vitest';
import { stations, timetable } from '../src/data/timetable';
import { formatCountdown, getDepartures, getStation } from '../src/timetable';

describe('sample timetable', () => {
  it('contains valid, uniquely identified services for every station', () => {
    expect(new Set(timetable.map((entry) => entry.id)).size).toBe(timetable.length);

    for (const station of stations) {
      const services = timetable.filter((entry) => entry.stationId === station.id);
      expect(services.length).toBeGreaterThanOrEqual(48);
      expect(services.some((entry) => entry.time.startsWith('00:'))).toBe(true);
      expect(services.some((entry) => entry.time.startsWith('23:'))).toBe(true);
    }

    for (const service of timetable) {
      expect(service.time).toMatch(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
      expect(service.callingAt.length).toBeGreaterThan(0);
      expect(service.delayMinutes).toBeGreaterThanOrEqual(0);
      expect(stations.some((station) => station.id === service.stationId)).toBe(true);
    }
  });

  it('falls back to Brighton for an unknown station', () => {
    expect(getStation('missing').id).toBe('BTN');
    expect(getStation('EDB').name).toBe('Edinburgh Waverley');
  });
});

describe('getDepartures', () => {
  it('finds the next six departures for the selected station in departure order', () => {
    const departures = getDepartures('KGX', new Date('2026-11-23T00:00:00Z'));

    expect(departures).toHaveLength(6);
    expect(departures[0]).toMatchObject({
      stationId: 'KGX',
      destination: 'Cambridge',
      time: '00:12',
      minutesAway: 12,
    });
    expect(departures.every((departure) => departure.stationId === 'KGX')).toBe(true);
    expect(departures.map((departure) => departure.departureAt.getTime())).toEqual(
      departures.map((departure) => departure.departureAt.getTime()).sort((a, b) => a - b),
    );
  });

  it('counts down using actual departure times including a delay', () => {
    const [departure] = getDepartures('BTN', new Date('2026-11-23T02:30:30Z'), 1);

    expect(departure).toMatchObject({ time: '02:37', status: 'Delayed', minutesAway: 15 });
    expect(departure.departureAt.toISOString()).toBe('2026-11-23T02:45:00.000Z');
  });

  it('keeps a train due at this instant and removes it once it has departed', () => {
    const [due] = getDepartures('KGX', new Date('2026-11-23T00:12:00Z'), 1);
    const [next] = getDepartures('KGX', new Date('2026-11-23T00:12:01Z'), 1);

    expect(due.time).toBe('00:12');
    expect(due.minutesAway).toBe(0);
    expect(next.time).toBe('00:42');
  });

  it('includes a delayed service from yesterday after midnight', () => {
    const [departure] = getDepartures('BTN', new Date('2026-11-24T00:01:00Z'), 1);

    expect(departure).toMatchObject({ time: '23:58', minutesAway: 5, status: 'Delayed' });
    expect(departure.departureAt.toISOString()).toBe('2026-11-24T00:06:00.000Z');
  });

  it('fills the board with tomorrow services after the final train', () => {
    const departures = getDepartures('EDB', new Date('2026-11-23T23:59:00Z'), 2);

    expect(departures).toHaveLength(2);
    expect(departures[0].time).toBe('00:21');
    expect(departures[0].minutesAway).toBe(22);
    expect(departures[0].departureAt.toISOString()).toBe('2026-11-24T00:21:00.000Z');
  });

  it('interprets station schedules in London time during summer', () => {
    const [departure] = getDepartures('KGX', new Date('2026-07-01T08:00:00Z'), 1);

    expect(departure.time).toBe('09:12');
    expect(departure.minutesAway).toBe(12);
    expect(departure.departureAt.toISOString()).toBe('2026-07-01T08:12:00.000Z');
  });

  it('offers both occurrences of a train in the repeated autumn hour', () => {
    const departures = getDepartures('KGX', new Date('2026-10-25T00:00:00Z'), 5);
    const repeated = departures.filter((departure) => departure.time === '01:12');

    expect(repeated.map((departure) => departure.departureAt.toISOString())).toEqual([
      '2026-10-25T00:12:00.000Z',
      '2026-10-25T01:12:00.000Z',
    ]);
  });

  it('skips local times that do not exist when the clocks go forward', () => {
    const [departure] = getDepartures('KGX', new Date('2026-03-29T00:59:00Z'), 1);

    expect(departure.time).toBe('02:12');
    expect(departure.minutesAway).toBe(13);
    expect(departure.departureAt.toISOString()).toBe('2026-03-29T01:12:00.000Z');
  });

  it('returns an empty list for invalid dates and nonpositive limits', () => {
    expect(getDepartures('BTN', new Date('invalid'))).toEqual([]);
    expect(getDepartures('BTN', new Date('2026-11-23T12:00:00Z'), 0)).toEqual([]);
    expect(getDepartures('BTN', new Date('2026-11-23T12:00:00Z'), -1)).toEqual([]);
  });
});

describe('formatCountdown', () => {
  it.each([
    [-1, 'Due'],
    [0, 'Due'],
    [0.5, '1 min'],
    [1, '1 min'],
    [59, '59 min'],
    [60, '1h 00m'],
    [65, '1h 05m'],
    [125, '2h 05m'],
  ])('formats %s minutes as %s', (minutes, expected) => {
    expect(formatCountdown(minutes)).toBe(expected);
  });
});
