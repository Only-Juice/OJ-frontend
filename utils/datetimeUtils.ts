// utils/datetimeUtils.ts

/**
 * 將 ISO 時間字串（含時區）轉為 <input type="datetime-local"> 可用格式
 * @param isoString 例如 "2025-06-29T19:50:00+08:00"
 * @returns 例如 "2025-06-29T19:50"
 */
export function toDatetimeLocalString(isoString: string): string {
  const date = new Date(isoString); // 會自動根據時區轉換為本地時間
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000); // 調整為本地時間

  return localDate.toISOString().slice(0, 16); // 截取到分鐘 "YYYY-MM-DDTHH:MM"
}

/**
 * 將 <input type="datetime-local"> 的值轉成含時區的 ISO 格式
 * @param localString 例如 "2025-06-29T19:50"
 * @returns 例如 "2025-06-29T19:50:00+08:00"
 */
export function toISOStringFromLocal(localString: string): string {
  const date = new Date(localString);
  return date.toISOString();
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
    // second: "2-digit",
    hour12: false,
  });
}
