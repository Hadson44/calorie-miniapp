const tg = window.Telegram.WebApp;
tg.expand();

const btn = document.getElementById("testBtn");
const result = document.getElementById("result");
const gramsInput = document.getElementById("grams");
const kcal100Input = document.getElementById("kcal100");

btn.addEventListener("click", () => {
  const grams = Number(gramsInput.value);
  const kcal100 = Number(kcal100Input.value);

  if (!grams || !kcal100) {
    result.textContent = "Введи дані";
    return;
  }

  const total = Math.round((grams * kcal100) / 100);

  result.textContent = "Калорії: " + total + " ккал";

  tg.sendData(JSON.stringify({
    grams,
    kcal100,
    total
  }));
});
