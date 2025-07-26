// utils/datetimeUtils.ts

/**
 * 將 ISO 時間字串（含時區）轉為 <input type="datetime-local"> 可用格式
 * @param isoString 例如 "2025-06-29T19:50:00+08:00"
 * @returns 例如 "2025-06-29T19:50"
 */
export function toDatetimeLocal(isoString: string): string {
  const date = new Date(isoString);
  // return toLocalString(date)
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * 將 <input type="datetime-local"> 的值轉成含時區的 ISO 格式
 * @param localString 例如 "2025-06-29T19:50"
 * @returns 例如 "2025-06-29T19:50:00+08:00"
 */
export function toLocalISOString(localString: string): string {
  const date = new Date(localString);
  const tzOffset = -date.getTimezoneOffset(); // minutes
  const sign = tzOffset >= 0 ? "+" : "-";
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");

  const offsetHours = pad(tzOffset / 60);
  const offsetMinutes = pad(tzOffset % 60);

  // 切掉 ".000Z" 並加上時區
  return `${date
    .toISOString()
    .slice(0, 19)}${sign}${offsetHours}:${offsetMinutes}`;
}

/**
 * 將 Date 或 ISO 字串轉為本地 24 小時制、0 填充的字串
 * @param date Date 物件
 * @returns 例如 "2025-06-29 19:50"
 */
export function toSystemDateFormat(date: Date): string {
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
