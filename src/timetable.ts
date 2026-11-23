import { stations, timetable, type Station, type TimetableEntry } from './data/timetable';

export type { Station, TimetableEntry } from './data/timetable';

export interface Departure extends TimetableEntry {
  departureAt: Date;
  minutesAway: number;
}

interface LondonTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const londonFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function londonTime(date: Date): LondonTime {
  const parts = Object.fromEntries(
    londonFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function serviceDay(day: LondonTime, offset: number): LondonTime {
  const shifted = new Date(Date.UTC(day.year, day.month - 1, day.day + offset));

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: 0,
    minute: 0,
  };
}

function departureInstants(day: LondonTime, time: string): number[] {
  const [hour, minute] = time.split(':').map(Number);
  const wallTime = Date.UTC(day.year, day.month - 1, day.day, hour, minute);

  // London uses GMT or BST. Validate both candidates against the named zone:
  // the spring gap has no instant and the repeated autumn hour has two.
  return [wallTime - 60 * 60_000, wallTime].filter((candidate) => {
    const local = londonTime(new Date(candidate));
    return local.year === day.year
      && local.month === day.month
      && local.day === day.day
      && local.hour === hour
      && local.minute === minute;
  });
}

export function getStation(id: string): Station {
  return stations.find((station) => station.id === id) ?? stations[0];
}

export function getDepartures(stationId: string, now: Date, limit = 6): Departure[] {
  if (!Number.isFinite(now.getTime()) || !Number.isFinite(limit) || limit <= 0) {
    return [];
  }

  const count = Math.floor(limit);
  const station = getStation(stationId);
  const services = timetable.filter((entry) => entry.stationId === station.id);
  const today = londonTime(now);
  const departures: Departure[] = [];
  const daysAhead = Math.ceil(count / services.length) + 1;

  // Include yesterday because a delayed late service can depart after midnight.
  for (let offset = -1; offset <= daysAhead; offset += 1) {
    const day = serviceDay(today, offset);

    for (const service of services) {
      for (const scheduledAt of departureInstants(day, service.time)) {
        const actualAt = scheduledAt + service.delayMinutes * 60_000;
        if (actualAt < now.getTime()) continue;

        departures.push({
          ...service,
          departureAt: new Date(actualAt),
          minutesAway: Math.ceil((actualAt - now.getTime()) / 60_000),
        });
      }
    }
  }

  return departures
    .sort((a, b) => a.departureAt.getTime() - b.departureAt.getTime())
    .slice(0, count);
}

export function formatCountdown(minutes: number): string {
  if (minutes <= 0) return 'Due';
  const rounded = Math.ceil(minutes);
  if (rounded < 60) return `${rounded} min`;
  return `${Math.floor(rounded / 60)}h ${String(rounded % 60).padStart(2, '0')}m`;
}
