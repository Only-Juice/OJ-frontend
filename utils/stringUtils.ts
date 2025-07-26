/**
 * 將文字截斷到指定長度，必要時加上省略號。
 * @param text 原始文字
 * @param maxLength 最多保留的字元數（預設為 10）
 * @returns 處理後的文字（可能包含省略號）
 */
export function truncateText(text: string, maxLength: number = 10): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}
