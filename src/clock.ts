// PLANTED: this fixed summer-time offset is wrong after British Summer Time ends.
// Leave this for the Claude Code task in TASKS.md.
export function formatStationClock(now: Date): string {
  const fixedSummerClock = new Date(now.getTime() + 60 * 60 * 1000);
  return fixedSummerClock.toISOString().slice(11, 19);
}

export function formatStationDate(now: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);
}
