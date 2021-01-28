import Correction from '../model/Correction';
import Status from '../model/Status';

export function getAverageCorrectionTime(n: number, corrections: Correction[]) {
  let correctionsWithTimes: Correction[] = corrections.filter(
    (c) => c?.timeElapsed !== undefined
  );

  correctionsWithTimes = correctionsWithTimes.slice(
    Math.max(correctionsWithTimes.length - n, 0)
  );

  const timeSum = correctionsWithTimes.reduce(
    (a, c) => a + (c.timeElapsed ? c.timeElapsed : 0),
    0
  );

  return timeSum / Math.max(correctionsWithTimes.length, 1);
}

export function getRemainingCorrectionTime(corrections: Correction[]) {
  const remainingCount = corrections.filter((c) => c.status !== Status.Done)
    .length;
  const avgTime = getAverageCorrectionTime(5, corrections);
  return remainingCount * avgTime;
}

export function msToTime(s) {
  function pad(n, z = 2) {
    return `00${n}`.slice(-z);
  }
  let t = s;
  const ms = t % 1000;
  t = (t - ms) / 1000;
  const secs = t % 60;
  t = (t - secs) / 60;
  const mins = t % 60;
  const hrs = (t - mins) / 60;

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export function formatMillis(millis: number | undefined): string {
  let diff = 0;

  if (millis) {
    diff = millis;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);

  const mins = Math.floor(diff / (1000 * 60));
  diff -= mins * (1000 * 60);

  const seconds = Math.floor(diff / 1000);
  diff -= seconds * 1000;

  return `${hours < 10 ? `0${hours}` : hours}:${
    mins < 10 ? `0${mins}` : mins
  }:${seconds < 10 ? `0${seconds}` : seconds}`;
}

export function formatDifference(
  date1: Date | undefined,
  date2: Date | undefined,
  elapsed: number | undefined
): string {
  const temp: number = elapsed || 0;

  let millis = temp;
  if (date1 !== undefined && date2 !== undefined) {
    millis = date2.getTime() - date1.getTime() + temp;
  }
  return formatMillis(millis);
}
