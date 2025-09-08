export function showAlert(
  message: string,
  type: "info" | "success" | "error" = "info",
  duration: number = 3000
) {
  const alertContainer = document.getElementById("alert-container");
  if (!alertContainer) return;

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.role = "alert";
  alert.innerHTML = `<span>${message}</span>`;

  // 設定動畫時間
  alert.style.animation = `alert-fade ${duration / 1000 + 0.6}s ease forwards`;
  // 0.6s 是淡入+淡出時間（10% + 10% of keyframes = 0.2 + 0.4）可調

  // 用 animationend 事件來移除元素
  alert.addEventListener("animationend", () => {
    if (alert.parentElement === alertContainer) {
      alertContainer.removeChild(alert);
    }
  });

  alertContainer.appendChild(alert);
}
