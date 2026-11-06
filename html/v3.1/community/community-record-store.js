/* Apply this tab's changes to the latest shared demo records. */
(() => {
  'use strict';
  const copy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  function merge(base, desired, latest) {
    if (same(base, desired)) return copy(latest);
    if (Array.isArray(base) && Array.isArray(desired)) {
      const records = [...base, ...desired].every(row => object(row) && typeof row.id === 'string');
      if (records) {
        const before = new Map(base.map(row => [row.id, row]));
        const after = new Map(desired.map(row => [row.id, row]));
        const current = new Map((Array.isArray(latest) ? latest : []).map(row => [row.id, row]));
        for (const id of before.keys()) if (!after.has(id)) current.delete(id);
        for (const [id, row] of after) {
          if (!before.has(id)) current.set(id, copy(row));
          else if (!same(before.get(id), row) && current.has(id)) current.set(id, merge(before.get(id), row, current.get(id)));
        }
        const added = desired.filter(row => !before.has(row.id)).map(row => row.id);
        const order = [...added, ...(Array.isArray(latest) ? latest : []).map(row => row.id), ...desired.map(row => row.id)];
        return [...new Set(order)].filter(id => current.has(id)).map(id => current.get(id));
      }
      if ([...base, ...desired].every(row => typeof row === 'string')) {
        const removed = new Set(base.filter(row => !desired.includes(row)));
        return [...new Set([...(Array.isArray(latest) ? latest : []).filter(row => !removed.has(row)), ...desired.filter(row => !base.includes(row))])];
      }
      return copy(desired);
    }
    if (object(base) && object(desired)) {
      const result = object(latest) ? copy(latest) : {};
      for (const key of new Set([...Object.keys(base), ...Object.keys(desired)])) {
        if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
        if (!Object.hasOwn(desired, key)) delete result[key];
        else if (!Object.hasOwn(base, key)) result[key] = copy(desired[key]);
        else if (!same(base[key], desired[key])) result[key] = merge(base[key], desired[key], result[key]);
      }
      return result;
    }
    return copy(desired);
  }
  window.NEXORA_COMMUNITY_RECORDS = {merge, copy};
})();
