const tg = window.Telegram.WebApp;
tg.expand();

const btn = document.getElementById("testBtn");
const result = document.getElementById("result");

btn.addEventListener("click", () => {
  const grams = prompt("Скільки грам?");
  const kcal100 = prompt("Скільки ккал на 100г?");

  if (!grams || !kcal100) {
    result.textContent = "Введи значення";
    return;
  }

  const total = Math.round((grams * kcal100) / 100);

  result.textContent = `Калорії: ${total} ккал`;

  // ВІДПРАВКА В БОТА
  tg.sendData(JSON.stringify({
    grams,
    kcal100,
    total
  }));
});
