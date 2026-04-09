const tg = window.Telegram.WebApp;
tg.expand();

const DEFAULT_GOALS = {
  calories: 2200,
  protein: 140,
  fat: 70,
  carbs: 230
};

const mealLabels = {
  breakfast: "Сніданок",
  lunch: "Обід",
  dinner: "Вечеря",
  snack: "Перекус"
};

const foodDatabase = {
  recent: [
    { name: "Сир моцарела", kcal100: 280, protein: 18, fat: 22, carbs: 3, defaultGrams: 30 },
    { name: "Банан", kcal100: 89, protein: 1.1, fat: 0.3, carbs: 22.8, defaultGrams: 120 },
    { name: "Куряче філе", kcal100: 165, protein: 31, fat: 3.6, carbs: 0, defaultGrams: 150 },
    { name: "Рис варений", kcal100: 130, protein: 2.7, fat: 0.3, carbs: 28, defaultGrams: 180 }
  ],
  favorites: [
    { name: "Яйце варене", kcal100: 155, protein: 13, fat: 11, carbs: 1.1, defaultGrams: 60 },
    { name: "Вівсянка", kcal100: 68, protein: 2.4, fat: 1.4, carbs: 12, defaultGrams: 200 },
    { name: "Грецький йогурт", kcal100: 97, protein: 9, fat: 5, carbs: 3.6, defaultGrams: 150 }
  ],
  myfoods: [
    { name: "Шаурма домашня", kcal100: 210, protein: 11, fat: 9, carbs: 20, defaultGrams: 250 },
    { name: "Сендвіч з шинкою", kcal100: 240, protein: 12, fat: 10, carbs: 24, defaultGrams: 180 }
  ],
  recipes: [
    { name: "Омлет з овочами", kcal100: 140, protein: 9, fat: 9, carbs: 4, defaultGrams: 220 },
    { name: "Салат з куркою", kcal100: 120, protein: 14, fat: 5, carbs: 4, defaultGrams: 250 },
    { name: "Сирники запечені", kcal100: 180, protein: 13, fat: 6, carbs: 18, defaultGrams: 180 }
  ]
};

const recipesCollection = [
  { name: "Омлет з овочами", text: "2 яйця, овочі, трохи сиру. Легкий сніданок.", kcal: 320 },
  { name: "Курка з рисом", text: "Куряче філе, рис і овочі. Хороший обід.", kcal: 540 },
  { name: "Салат з тунцем", text: "Тунець, яйце, зелень, овочі. Білковий варіант.", kcal: 410 }
];

const screens = {
  diary: document.getElementById("screenDiary"),
  add: document.getElementById("screenAdd"),
  recipes: document.getElementById("screenRecipes"),
  profile: document.getElementById("screenProfile")
};

const navButtons = document.querySelectorAll(".nav-btn");
const tabButtons = document.querySelectorAll(".tab-btn");
const miniAddButtons = document.querySelectorAll(".mini-add-btn");

const todayDateEl = document.getElementById("todayDate");
const dayCaloriesEl = document.getElementById("dayCalories");
const goalTextEl = document.getElementById("goalText");
const remainingTextEl = document.getElementById("remainingText");

const proteinTotalEl = document.getElementById("proteinTotal");
const fatTotalEl = document.getElementById("fatTotal");
const carbsTotalEl = document.getElementById("carbsTotal");

const proteinGoalViewEl = document.getElementById("proteinGoalView");
const fatGoalViewEl = document.getElementById("fatGoalView");
const carbsGoalViewEl = document.getElementById("carbsGoalView");

const proteinBarEl = document.getElementById("proteinBar");
const fatBarEl = document.getElementById("fatBar");
const carbsBarEl = document.getElementById("carbsBar");

const calorieRingEl = document.getElementById("calorieRing");

const breakfastCaloriesEl = document.getElementById("breakfastCalories");
const lunchCaloriesEl = document.getElementById("lunchCalories");
const dinnerCaloriesEl = document.getElementById("dinnerCalories");
const snackCaloriesEl = document.getElementById("snackCalories");

const breakfastListEl = document.getElementById("breakfastList");
const lunchListEl = document.getElementById("lunchList");
const dinnerListEl = document.getElementById("dinnerList");
const snackListEl = document.getElementById("snackList");

const foodListEl = document.getElementById("foodList");
const recipesListEl = document.getElementById("recipesList");
const tabTitleEl = document.getElementById("tabTitle");
const foodSearchEl = document.getElementById("foodSearch");

const selectedMealTypeEl = document.getElementById("selectedMealType");
const foodNameEl = document.getElementById("foodName");
const gramsEl = document.getElementById("grams");
const kcal100El = document.getElementById("kcal100");
const proteinEl = document.getElementById("protein");
const fatEl = document.getElementById("fat");
const carbsEl = document.getElementById("carbs");
const addManualBtn = document.getElementById("addManualBtn");
const addResultEl = document.getElementById("addResult");

const goalCaloriesEl = document.getElementById("goalCalories");
const goalProteinEl = document.getElementById("goalProtein");
const goalFatEl = document.getElementById("goalFat");
const goalCarbsEl = document.getElementById("goalCarbs");

const saveGoalBtn = document.getElementById("saveGoalBtn");
const clearDayBtn = document.getElementById("clearDayBtn");

const backToDiaryBtn = document.getElementById("backToDiaryBtn");
const closeAddBtn = document.getElementById("closeAddBtn");
const createFoodBtn = document.getElementById("createFoodBtn");
const scanFoodBtn = document.getElementById("scanFoodBtn");
const openSettingsBtn = document.getElementById("openSettingsBtn");

let currentTab = "recent";

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
    day: "numeric",
    month: "long"
  });
}

function entriesKey() {
  return `calorie_entries_${getTodayKey()}`;
}

function goalsKey() {
  return "calorie_goals_value";
}

function loadEntries() {
  const raw = localStorage.getItem(entriesKey());
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(entriesKey(), JSON.stringify(entries));
}

function loadGoals() {
  const raw = localStorage.getItem(goalsKey());
  if (!raw) return { ...DEFAULT_GOALS };
  try {
    return { ...DEFAULT_GOALS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_GOALS };
  }
}

function saveGoals(goals) {
  localStorage.setItem(goalsKey(), JSON.stringify(goals));
}

function openScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[name].classList.add("active");

  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === name);
  });
}

function getTotals(entries) {
  const totals = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0
  };

  for (const item of entries) {
    totals.calories += item.totalCalories;
    totals.protein += item.totalProtein;
    totals.fat += item.totalFat;
    totals.carbs += item.totalCarbs;
    totals[item.mealType] += item.totalCalories;
  }

  return totals;
}

function formatNumber(value) {
  return Number(value).toFixed(1).replace(".0", "");
}

function percent(value, goal) {
  if (!goal) return 0;
  return Math.min((value / goal) * 100, 100);
}

function setRingProgress(calories, goal) {
  const progress = Math.min(calories / goal, 1);
  calorieRingEl.style.setProperty("--progress", `${progress}turn`);
}

function fillManualForm(product) {
  foodNameEl.value = product.name;
  gramsEl.value = product.defaultGrams || "";
  kcal100El.value = product.kcal100 || "";
  proteinEl.value = product.protein || "";
  fatEl.value = product.fat || "";
  carbsEl.value = product.carbs || "";
}

function addEntry({
  mealType,
  foodName,
  grams,
  kcal100,
  protein,
  fat,
  carbs
}) {
  const totalCalories = Math.round((grams * kcal100) / 100);
  const totalProtein = Number(((grams * protein) / 100).toFixed(1));
  const totalFat = Number(((grams * fat) / 100).toFixed(1));
  const totalCarbs = Number(((grams * carbs) / 100).toFixed(1));

  const entries = loadEntries();
  entries.push({
    id: Date.now(),
    mealType,
    foodName,
    grams,
    kcal100,
    protein,
    fat,
    carbs,
    totalCalories,
    totalProtein,
    totalFat,
    totalCarbs,
    createdAt: Date.now()
  });

  saveEntries(entries);
  renderDiary();

  try {
    tg.sendData(JSON.stringify({
      type: "meal_added",
      mealType,
      foodName,
      grams,
      kcal100,
      totalCalories
    }));
  } catch (e) {}
}

function deleteEntry(id) {
  const entries = loadEntries().filter(item => item.id !== id);
  saveEntries(entries);
  renderDiary();
}

function renderMealList(container, entries, mealType) {
  const list = entries.filter(item => item.mealType === mealType);

  if (!list.length) {
    container.innerHTML = `<div class="empty-box">Поки що нічого не додано</div>`;
    return;
  }

  container.innerHTML = list
    .map(item => `
      <div class="meal-item">
        <div class="meal-item-top">
          <div class="meal-item-name">${item.foodName}</div>
          <div class="meal-item-kcal">${item.totalCalories} ккал</div>
        </div>
        <div class="meal-item-meta">${item.grams} г • ${item.kcal100} ккал/100г</div>
        <div class="meal-item-macros">
          Б: ${formatNumber(item.totalProtein)} • Ж: ${formatNumber(item.totalFat)} • В: ${formatNumber(item.totalCarbs)}
        </div>
        <div class="meal-item-actions">
          <button class="delete-btn" data-id="${item.id}">Видалити</button>
        </div>
      </div>
    `)
    .join("");
}

function renderDiary() {
  const entries = loadEntries();
  const totals = getTotals(entries);
  const goals = loadGoals();

  todayDateEl.textContent = `Сьогодні, ${getTodayLabel()}`;

  dayCaloriesEl.textContent = totals.calories;
  goalTextEl.textContent = `ціль ${goals.calories}`;

  if (totals.calories <= goals.calories) {
    remainingTextEl.textContent = `Залишилось ${goals.calories - totals.calories}`;
    remainingTextEl.style.color = "#6d3ff2";
  } else {
    remainingTextEl.textContent = `Перебір ${totals.calories - goals.calories}`;
    remainingTextEl.style.color = "#d9465f";
  }

  proteinTotalEl.textContent = formatNumber(totals.protein);
  fatTotalEl.textContent = formatNumber(totals.fat);
  carbsTotalEl.textContent = formatNumber(totals.carbs);

  proteinGoalViewEl.textContent = goals.protein;
  fatGoalViewEl.textContent = goals.fat;
  carbsGoalViewEl.textContent = goals.carbs;

  proteinBarEl.style.width = `${percent(totals.protein, goals.protein)}%`;
  fatBarEl.style.width = `${percent(totals.fat, goals.fat)}%`;
  carbsBarEl.style.width = `${percent(totals.carbs, goals.carbs)}%`;

  breakfastCaloriesEl.textContent = `${totals.breakfast} ккал`;
  lunchCaloriesEl.textContent = `${totals.lunch} ккал`;
  dinnerCaloriesEl.textContent = `${totals.dinner} ккал`;
  snackCaloriesEl.textContent = `${totals.snack} ккал`;

  setRingProgress(totals.calories, goals.calories);

  renderMealList(breakfastListEl, entries, "breakfast");
  renderMealList(lunchListEl, entries, "lunch");
  renderMealList(dinnerListEl, entries, "dinner");
  renderMealList(snackListEl, entries, "snack");

  goalCaloriesEl.value = goals.calories;
  goalProteinEl.value = goals.protein;
  goalFatEl.value = goals.fat;
  goalCarbsEl.value = goals.carbs;
}

function renderFoodCards() {
  const search = foodSearchEl.value.trim().toLowerCase();
  const list = foodDatabase[currentTab] || [];

  const filtered = list.filter(item => item.name.toLowerCase().includes(search));

  const titles = {
    recent: "Недавні продукти",
    favorites: "Обране",
    myfoods: "Мої продукти",
    recipes: "Рецепти"
  };

  tabTitleEl.textContent = titles[currentTab];

  if (!filtered.length) {
    foodListEl.innerHTML = `<div class="empty-box">Нічого не знайдено</div>`;
    return;
  }

  foodListEl.innerHTML = filtered.map((item, index) => `
    <div class="food-card">
      <div class="food-card-top">
        <div>
          <div class="food-name">${item.name}</div>
          <div class="food-meta">${item.kcal100} ккал • ${item.defaultGrams} г</div>
          <div class="food-macros">
            <span class="macro-pill">Б: ${item.protein}</span>
            <span class="macro-pill">Ж: ${item.fat}</span>
            <span class="macro-pill">В: ${item.carbs}</span>
          </div>
        </div>
        <button class="plus-btn" data-tab="${currentTab}" data-index="${index}">+</button>
      </div>
    </div>
  `).join("");
}

function renderRecipes() {
  recipesListEl.innerHTML = recipesCollection.map(recipe => `
    <div class="recipe-card">
      <div class="recipe-card-top">
        <div>
          <div class="recipe-name">${recipe.name}</div>
          <div class="recipe-meta">${recipe.text}</div>
          <div class="food-macros" style="margin-top:12px;">
            <span class="macro-pill">${recipe.kcal} ккал</span>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

navButtons.forEach(btn => {
  btn.addEventListener("click", () => openScreen(btn.dataset.screen));
});

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentTab = btn.dataset.tab;
    tabButtons.forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    renderFoodCards();
  });
});

miniAddButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedMealTypeEl.value = btn.dataset.meal;
    openScreen("add");
  });
});

foodSearchEl.addEventListener("input", renderFoodCards);

foodListEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".plus-btn");
  if (!btn) return;

  const tab = btn.dataset.tab;
  const index = Number(btn.dataset.index);
  const item = foodDatabase[tab][index];

  fillManualForm(item);
  addResultEl.textContent = `Заповнено дані для: ${item.name}`;
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  deleteEntry(id);
});

addManualBtn.addEventListener("click", () => {
  const mealType = selectedMealTypeEl.value;
  const foodName = foodNameEl.value.trim();
  const grams = Number(gramsEl.value);
  const kcal100 = Number(kcal100El.value);
  const protein = Number(proteinEl.value || 0);
  const fat = Number(fatEl.value || 0);
  const carbs = Number(carbsEl.value || 0);

  if (!foodName || !grams || !kcal100) {
    addResultEl.textContent = "Заповни назву, грами і ккал";
    return;
  }

  addEntry({
    mealType,
    foodName,
    grams,
    kcal100,
    protein,
    fat,
    carbs
  });

  addResultEl.textContent = `Додано: ${foodName}`;
  foodNameEl.value = "";
  gramsEl.value = "";
  kcal100El.value = "";
  proteinEl.value = "";
  fatEl.value = "";
  carbsEl.value = "";

  openScreen("diary");
});

saveGoalBtn.addEventListener("click", () => {
  const goals = {
    calories: Number(goalCaloriesEl.value) || DEFAULT_GOALS.calories,
    protein: Number(goalProteinEl.value) || DEFAULT_GOALS.protein,
    fat: Number(goalFatEl.value) || DEFAULT_GOALS.fat,
    carbs: Number(goalCarbsEl.value) || DEFAULT_GOALS.carbs
  };

  saveGoals(goals);
  renderDiary();
});

clearDayBtn.addEventListener("click", () => {
  localStorage.removeItem(entriesKey());
  renderDiary();
});

backToDiaryBtn.addEventListener("click", () => openScreen("diary"));
closeAddBtn.addEventListener("click", () => openScreen("diary"));

createFoodBtn.addEventListener("click", () => {
  addResultEl.textContent = "Заповни форму нижче і додай свій продукт";
});

scanFoodBtn.addEventListener("click", () => {
  addResultEl.textContent = "Скан їжі можна додати наступним етапом";
});

openSettingsBtn.addEventListener("click", () => {
  openScreen("profile");
});

renderRecipes();
renderFoodCards();
renderDiary();
openScreen("diary");
