import '@fontsource/doto/latin-600.css';
import '@fontsource/doto/latin-800.css';
import './style.css';
import { formatStationClock, formatStationDate } from './clock';
import { formatDimensions, readDevice } from './device';
import { getDepartures, getStation } from './timetable';
import { formatCountdown } from './timetable';
import { renderApp, renderNext, renderRows } from './render';

const root = document.querySelector<HTMLDivElement>('#app')!;
const stationStorageKey = 'platform-board.station';

function loadStation(): string {
  try {
    return getStation(localStorage.getItem(stationStorageKey) || '').id;
  } catch {
    return getStation('').id;
  }
}

let stationId = loadStation();
let lastDepartureState = '';

function setText(selector: string, value: string): void {
  const element = root.querySelector(selector);
  if (element && element.textContent !== value) element.textContent = value;
}

function refreshDevice(): void {
  const details = readDevice();
  setText('[data-device="screen"]', formatDimensions(details.screenWidth, details.screenHeight));
  setText('[data-device="viewport"]', `${formatDimensions(details.viewportWidth, details.viewportHeight)} viewport`);
  setText('[data-device="appearance"]', details.appearance);
  setText('[data-device="timezone"]', details.timeZone);
  setText('[data-device="network"]', details.online ? 'Online' : 'Offline');
  const network = root.querySelector('[data-device="network"]');
  if (network) network.className = `network-state ${details.online ? 'is-online' : 'is-offline'}`;
}

function refreshClockAndTrains(): void {
  const now = new Date();
  setText('#station-clock', formatStationClock(now));
  setText('#station-date', formatStationDate(now));
  const departures = getDepartures(stationId, now);
  const departureState = departures.map((train) => `${train.id}:${train.departureAt.getTime()}:${train.minutesAway}`).join('|');
  if (departureState === lastDepartureState) return;
  lastDepartureState = departureState;
  const rows = root.querySelector('#departure-rows');
  if (rows) rows.innerHTML = renderRows(departures);
  const next = departures[0];
  const nextElement = root.querySelector('#next-departure');
  if (nextElement && next) nextElement.innerHTML = renderNext(next);
  if (next) setText('#next-announcement', `Next train: ${next.destination}, ${formatCountdown(next.minutesAway)}, platform ${next.platform}.`);
}

function mount(): void {
  root.innerHTML = renderApp({ stationId, now: new Date(), device: readDevice() });
  lastDepartureState = '';
  refreshClockAndTrains();
}

root.addEventListener('change', (event) => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement) || select.id !== 'station-select') return;
  stationId = getStation(select.value).id;
  try {
    localStorage.setItem(stationStorageKey, stationId);
  } catch {
    // The board also works when browser storage is unavailable.
  }
  mount();
  root.querySelector<HTMLSelectElement>('#station-select')?.focus();
});

window.addEventListener('resize', refreshDevice);
window.addEventListener('online', refreshDevice);
window.addEventListener('offline', refreshDevice);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refreshDevice);
window.addEventListener('pageshow', refreshDevice);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    refreshClockAndTrains();
    refreshDevice();
  }
});

mount();
window.setInterval(refreshClockAndTrains, 1000);
