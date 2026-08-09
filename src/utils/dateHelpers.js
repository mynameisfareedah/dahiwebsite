export const OUTREACH_TARGET_ISO = '2026-08-15T10:00:00+01:00';

export function getTimeRemaining(dateString) {
  const now = new Date();
  const targetDate = new Date(dateString);
  let diff = targetDate.getTime() - now.getTime();
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);
  const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
  const days = Math.floor((totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { weeks, days, hours, minutes, seconds };
}

export function getDaysUntil(dateString) {
  const now = new Date();
  const targetDate = new Date(dateString);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((targetDate.getTime() - now.getTime()) / msPerDay));
}
