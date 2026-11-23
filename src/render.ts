import { formatStationClock, formatStationDate } from './clock';
import { formatDimensions, type DeviceDetails } from './device';
import { stations } from './data/timetable';
import { formatCountdown, getDepartures, getStation, type Departure } from './timetable';

export const icons = {
  train: '<rect x="5" y="3" width="14" height="15" rx="4"/><path d="M5 11h14M12 3v8M8 18l-2 3m10-3 2 3M8 15h.01M16 15h.01"/>',
  screen: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r=".7"/>',
  leaf: '<path d="M20 3c-9-1-17 3-16 10 1 7 13 8 16-10ZM5 20 16 9"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
};

export function icon(name: keyof typeof icons): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export function renderRows(departures: Departure[]): string {
  return departures.map((train, index) => `
    <tr class="${index === 0 ? 'first-departure' : ''}">
      <td class="train-time">${train.time}</td>
      <td class="train-destination">
        <span>${escapeHtml(train.destination)}</span>
        <small>${escapeHtml(train.operator)}</small>
      </td>
      <td class="train-platform">${escapeHtml(train.platform)}</td>
      <td class="train-status ${train.delayMinutes > 0 ? 'is-delayed' : ''}">${train.delayMinutes > 0 ? `+${train.delayMinutes} min` : 'On time'}</td>
      <td class="train-countdown">${formatCountdown(train.minutesAway)}</td>
    </tr>
  `).join('');
}

export function renderNext(train: Departure): string {
  return `
    <div class="next-route">${icon('train')}<span>Next to leave</span></div>
    <p class="next-countdown">${train.minutesAway < 60 ? `<strong>${train.minutesAway}</strong><span>${train.minutesAway === 1 ? 'minute' : 'minutes'}</span>` : `<strong class="long-countdown">${formatCountdown(train.minutesAway)}</strong>`}</p>
    <h3>${escapeHtml(train.destination)}</h3>
    <p class="next-meta">${train.time} <span>·</span> Platform ${escapeHtml(train.platform)}</p>
    <div class="calling-at">
      <span>Calling at</span>
      <p>${train.callingAt.map(escapeHtml).join(' · ')}</p>
    </div>
    <p class="next-status">${train.delayMinutes > 0 ? `Expected ${train.delayMinutes} minutes late` : 'A little time to take a breath.'}</p>
  `;
}

export interface AppState {
  stationId: string;
  now: Date;
  device: DeviceDetails;
}

// PLANTED: keep this single renderer over 150 lines for the function-size check.
export function renderApp({ stationId, now, device }: AppState): string {
  const station = getStation(stationId);
  const departures = getDepartures(station.id, now);
  const next = departures[0];
  return `
    <div class="page-shell">
      <a class="skip-link" href="#departure-board">Skip to departures</a>
      <header class="site-header">
        <a class="brand" href="./" aria-label="Platform Board home">
          <span class="brand-mark" aria-hidden="true">
            <i></i><i></i><i></i><i></i>
          </span>
          <span>platform board<span class="brand-period">.</span></span>
        </a>
        <span class="project-tag">
          <span class="tag-symbol" aria-hidden="true">w.</span>
          A WorkOffline test app
        </span>
      </header>

      <main>
        <section class="intro" aria-labelledby="page-title">
          <div>
            <p class="eyebrow">A quieter way to wait</p>
            <h1 id="page-title">Your next train,<br /><em>at a glance.</em></h1>
            <p class="intro-copy">A familiar board. A moment to yourself.</p>
          </div>
          <div class="station-clock">
            <span class="clock-label">Station clock</span>
            <time id="station-clock">${formatStationClock(now)}</time>
            <span id="station-date">${formatStationDate(now)}</span>
            <span class="clock-zone">London time</span>
          </div>
        </section>

        <section class="station-picker" aria-label="Choose a departure station">
          <div class="station-select-wrap">
            <span class="station-pin">${icon('pin')}</span>
            <div class="station-select-field">
              <label for="station-select">Departing from</label>
              <div class="select-control">
                <select id="station-select" name="station">
                  ${stations.map((item) => `<option value="${item.id}"${item.id === station.id ? ' selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}
                </select>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <div class="station-location">
            <span class="station-code">${escapeHtml(station.code)}</span>
            <span>${escapeHtml(station.subtitle)}</span>
          </div>
        </section>

        <div class="dashboard">
          <section class="departures-section" aria-labelledby="departures-title">
            <div class="section-heading">
              <h2 id="departures-title">The departure board</h2>
              <span class="sample-label"><i aria-hidden="true"></i>Sample timetable</span>
            </div>
            <div class="departure-board" id="departure-board" tabindex="-1">
              <div class="board-topline">
                <span>${escapeHtml(station.name)}</span>
                <span>DEPARTURES</span>
              </div>
              <table>
                <caption class="sr-only">Next six sample departures from ${escapeHtml(station.name)}. Times use the daily London timetable.</caption>
                <thead>
                  <tr>
                    <th scope="col" class="train-time">Time</th>
                    <th scope="col" class="train-destination">Destination</th>
                    <th scope="col" class="train-platform"><abbr title="Platform">Plat.</abbr></th>
                    <th scope="col" class="train-status">Status</th>
                    <th scope="col" class="train-countdown">Leaves in</th>
                  </tr>
                </thead>
                <tbody id="departure-rows">
                  ${renderRows(departures)}
                </tbody>
              </table>
              <div class="board-bottomline">
                <span>Have a pleasant journey</span>
                <span class="board-dot" aria-hidden="true">●</span>
              </div>
            </div>
            <div class="board-caption">
              <span class="caption-icon">${icon('train')}</span>
              <p>Little journeys, sample trains.<br class="mobile-break" /> This is a demo, with no live rail data.</p>
            </div>

            <aside class="quiet-note" aria-label="About this board">
              <span>${icon('leaf')}</span>
              <div>
                <h3>All here, on your device.</h3>
                <p>No accounts, no live feeds. Just a small board<br class="desktop-break" /> that keeps ticking, even when you are offline.</p>
              </div>
              <div class="rail-illustration" aria-hidden="true">
                <svg viewBox="0 0 170 85" fill="none">
                  <path d="M0 71h170M15 77h140M33 83h103" stroke="currentColor" stroke-width="1.5" />
                  <rect x="35" y="17" width="100" height="50" rx="13" stroke="currentColor" stroke-width="1.8" />
                  <path d="M35 47h100M47 17v30m25-30v30m26-30v30m25-30v30M51 56h12m45 0h12" stroke="currentColor" stroke-width="1.5" />
                  <circle cx="57" cy="68" r="5" fill="currentColor" />
                  <circle cx="113" cy="68" r="5" fill="currentColor" />
                  <path d="m79 17 4-8h13l4 8M83 9l8-6" stroke="currentColor" stroke-width="1.5" />
                </svg>
              </div>
            </aside>
          </section>

          <aside class="sidebar" aria-label="Next train and device details">
            <section class="next-card" aria-label="Next departure">
              <div id="next-departure">
                ${next ? renderNext(next) : '<p>No departures available.</p>'}
              </div>
              <p id="next-announcement" class="sr-only" aria-live="polite" aria-atomic="true"></p>
            </section>

            <section class="device-card" aria-labelledby="device-title">
              <div class="device-heading">
                <h2 id="device-title">This device</h2>
                <span class="local-badge">Local</span>
              </div>
              <p class="device-description">A little local context.</p>
              <dl class="device-details">
                <div class="device-row">
                  <dt><span>${icon('screen')}</span>Screen</dt>
                  <dd>
                    <span data-device="screen">${formatDimensions(device.screenWidth, device.screenHeight)}</span>
                    <small data-device="viewport">${formatDimensions(device.viewportWidth, device.viewportHeight)} viewport</small>
                  </dd>
                </div>
                <div class="device-row">
                  <dt><span>${icon('sun')}</span>Appearance</dt>
                  <dd data-device="appearance">${device.appearance}</dd>
                </div>
                <div class="device-row">
                  <dt><span>${icon('globe')}</span>Time zone</dt>
                  <dd data-device="timezone">${escapeHtml(device.timeZone)}</dd>
                </div>
                <div class="device-row">
                  <dt><span>${icon('wifi')}</span>Network</dt>
                  <dd>
                    <span data-device="network" class="network-state ${device.online ? 'is-online' : 'is-offline'}">${device.online ? 'Online' : 'Offline'}</span>
                  </dd>
                </div>
              </dl>
              <p class="device-footnote">Read from your browser. Kept on your device.</p>
            </section>
          </aside>
        </div>
      </main>

      <footer class="site-footer">
        <p>A small experiment in making things.</p>
        <p>Made for <span>WorkOffline</span><span class="footer-dot" aria-hidden="true">·</span>Vibe Coding</p>
      </footer>
    </div>
  `;
}
