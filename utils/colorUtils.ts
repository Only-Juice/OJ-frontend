import chroma from "chroma-js";

export function Gradient({ value }: { value: number }) {
  const start = "#D64545"; // 紅
  const end = "#3A9D23"; // 綠

  // clamp 0~100
  const v = Math.max(0, Math.min(100, value)) / 100;

  // chroma.scale 支援多種色彩空間，這裡用 'lab' 或 'hsl'
  const scale = chroma.scale([start, end]).mode("lab");

  const color = scale(v).css();

  return color;
}
