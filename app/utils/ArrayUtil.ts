import Correction from '../model/Correction';

/* eslint-disable import/prefer-default-export */
export function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

export function zipCorrectionsAndMapToTime(rows: Correction[][]): number[][] {
  if (rows === undefined || rows.length === 0) {
    return [];
  }
  const max = Math.max(...rows.map((r) => r.length));
  const index = rows.findIndex((c) => c.length === max);
  const array: Correction[] = rows[index];
  const num = array.map((_, c) =>
    rows.map((row) => {
      if (
        c !== undefined &&
        row !== undefined &&
        row[c] !== undefined &&
        row[c].timeElapsed !== undefined
      ) {
        return row[c].timeElapsed as number;
      }
      return 0;
    })
  );
  return num;
}
