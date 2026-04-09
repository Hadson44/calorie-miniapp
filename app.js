const tg = window.Telegram.WebApp;
tg.expand();

const btn = document.getElementById("testBtn");
const result = document.getElementById("result");

btn.addEventListener("click", () => {
  result.textContent = "Кнопка працює";
});