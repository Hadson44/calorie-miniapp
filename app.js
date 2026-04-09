const tg = window.Telegram.WebApp;
tg.expand();

const todayDateEl = document.getElementById("todayDate");
const dayTotalEl = document.getElementById("dayTotal");

const breakfastTotalEl = document.getElementById("breakfastTotal");
const lunchTotalEl = document.getElementById("lunchTotal");
const dinnerTotalEl = document.getElementById("dinnerTotal");
const snackTotalEl = document.getElementById("snackTotal");

const mealTypeEl = document.getElementById("mealType");
const foodNameEl = document.getElementById("foodName");
const gramsEl = document.getElementById("grams");
const kcal100El = document.getElementById("kcal100");
const addBtn = document.getElementById("addBtn");
const resetBtn = document.getElementById("resetBtn");
const resultEl = document.getElementById("result");
const entriesListEl = document.getElementById("entriesList");

const mealNames = {
  breakfast: "Сніданок",
  lunch: "Обід",
  dinner: "Вечеря",
  snack: "Перекус"
};

function getTodayKey() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayLabel() {
  const d = new Date();
  return d.toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit"
  });
}

function getStorageKey() {
  return "calorie_app_" + getTodayKey();
}

function loadEntries() {
  const raw = localStorage.getItem(getStorageKey());
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(getStorageKey(), JSON.stringify(entries));
}

function calculateTotals(entries) {
  const totals = {
    day: 0,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0
  };

  for (const item of entries) {
    totals.day += item.total;
    totals[item.mealType] += item.total;
  }

  return totals;
}

function render() {
  todayDateEl.textContent = getTodayLabel();

  const entries = loadEntries();
  const totals = calculateTotals(entries);

  dayTotalEl.textContent = totals.day;
  breakfastTotalEl.textContent = totals.breakfast + " ккал";
  lunchTotalEl.textContent = totals.lunch + " ккал";
  dinnerTotalEl.textContent = totals.dinner + " ккал";
  snackTotalEl.textContent = totals.snack + " ккал";

  if (!entries.length) {
    entriesListEl.innerHTML = `<div class="empty-text">Поки що нічого не додано</div>`;
    return;
  }

  entriesListEl.innerHTML = entries
    .slice()
    .reverse()
    .map(item => `
      <div class="entry-item">
        <div class="entry-top">
          <div class="entry-name">${item.foodName}</div>
          <div class="entry-kcal">${item.total} ккал</div>
        </div>
        <div class="entry-meta">
          ${mealNames[item.mealType]} • ${item.grams} г • ${item.kcal100} ккал/100г
        </div>
      </div>
    `)
    .join("");
}

addBtn.addEventListener("click", () => {
  const mealType = mealTypeEl.value;
  const foodName = foodNameEl.value.trim() || "Без назви";
  const grams = Number(gramsEl.value);
  const kcal100 = Number(kcal100El.value);

  if (!grams || !kcal100) {
    resultEl.textContent = "Введи грами і ккал на 100 г";
    return;
  }

  const total = Math.round((grams * kcal100) / 100);

  const entries = loadEntries();
  entries.push({
    mealType,
    foodName,
    grams,
    kcal100,
    total
  });

  saveEntries(entries);
  render();

  resultEl.textContent = `Додано ${total} ккал`;
  foodNameEl.value = "";
  gramsEl.value = "";
  kcal100El.value = "";

  try {
    tg.sendData(JSON.stringify({
      type: "meal_added",
      mealType,
      foodName,
      grams,
      kcal100,
      total
    }));
  } catch (e) {}
});

resetBtn.addEventListener("click", () => {
  localStorage.removeItem(getStorageKey());
  render();
  resultEl.textContent = "День очищено";
});

render();
