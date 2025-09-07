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

  alert.style.opacity = "0";
  alert.style.transition = "opacity 0.3s";
  alertContainer.appendChild(alert);
  requestAnimationFrame(() => {
    alert.style.opacity = "1";
  });

  setTimeout(() => {
    alert.style.opacity = "0";
    alert.addEventListener(
      "transitionend",
      () => {
        if (alert.parentElement === alertContainer) {
          alertContainer.removeChild(alert);
        }
      },
      { once: true }
    );
  }, duration);
}
