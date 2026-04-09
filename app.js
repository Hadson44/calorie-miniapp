const tg = window.Telegram.WebApp;
tg.expand();

const DEFAULT_GOALS = {
  calories: 2200,
  protein: 140,
  fat: 70,
  carbs: 230,
  water: 2000
};

const DEFAULT_PROFILE = {
  name: "",
  gender: "male",
  age: 30,
  height: 175,
  weight: 80,
  targetWeight: 75,
  activity: 1.2,
  goal: "lose",
  autoGoals: true,
  isOnboardingDone: false,
  avatar: null
};

const ACTIVITY_LABELS = {
  "1.2": "Сидяча активність",
  "1.375": "Легка активність",
  "1.55": "Середня активність",
  "1.725": "Висока активність"
};

const GOAL_LABELS = {
  lose: "Схуднення",
  maintain: "Підтримка",
  gain: "Набір"
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

/* onboarding */
const onboardingScreenEl = document.getElementById("onboardingScreen");
const mainAppEl = document.getElementById("mainApp");
const progressFillEl = document.getElementById("onboardingProgressFill");
const stepEls = document.querySelectorAll(".step");

const startOnboardingBtn = document.getElementById("startOnboardingBtn");
const toStep3Btn = document.getElementById("toStep3Btn");
const toStep4Btn = document.getElementById("toStep4Btn");
const toStep5Btn = document.getElementById("toStep5Btn");
const finishOnboardingBtn = document.getElementById("finishOnboardingBtn");
const openAppBtn = document.getElementById("openAppBtn");

const userNameInput = document.getElementById("userNameInput");
const userGenderInput = document.getElementById("userGenderInput");
const userAgeInput = document.getElementById("userAgeInput");
const userHeightInput = document.getElementById("userHeightInput");
const userWeightInput = document.getElementById("userWeightInput");
const targetWeightInput = document.getElementById("targetWeightInput");

const resultHelloText = document.getElementById("resultHelloText");
const resultSummaryText = document.getElementById("resultSummaryText");
const resultCalories = document.getElementById("resultCalories");
const resultProtein = document.getElementById("resultProtein");
const resultFat = document.getElementById("resultFat");
const resultCarbs = document.getElementById("resultCarbs");

let onboardingData = { ...DEFAULT_PROFILE };

/* app screens */
const screens = {
  diary: document.getElementById("screenDiary"),
  add: document.getElementById("screenAdd"),
  stats: document.getElementById("screenStats"),
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

/* water */
const waterMlView = document.getElementById("waterMlView");
const waterGoalView = document.getElementById("waterGoalView");
const waterBarFill = document.getElementById("waterBarFill");
const waterButtons = document.querySelectorAll("[data-water-add]");
const resetWaterBtn = document.getElementById("resetWaterBtn");

/* add food */
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

const backToDiaryBtn = document.getElementById("backToDiaryBtn");
const closeAddBtn = document.getElementById("closeAddBtn");
const createFoodBtn = document.getElementById("createFoodBtn");
const scanFoodBtn = document.getElementById("scanFoodBtn");
const openSettingsBtn = document.getElementById("openSettingsBtn");

const mainGreetingTitle = document.getElementById("mainGreetingTitle");

/* stats */
const statsTodayCalories = document.getElementById("statsTodayCalories");
const statsAverageCalories = document.getElementById("statsAverageCalories");
const statsDaysCount = document.getElementById("statsDaysCount");
const statsWaterToday = document.getElementById("statsWaterToday");
const weekChart = document.getElementById("weekChart");
const historyDaysList = document.getElementById("historyDaysList");

/* profile */
const profileAvatar = document.getElementById("profileAvatar");
const avatarInput = document.getElementById("avatarInput");
const changeAvatarBtn = document.getElementById("changeAvatarBtn");

const profileNameView = document.getElementById("profileNameView");
const profileGoalBadge = document.getElementById("profileGoalBadge");
const profileActivityBadge = document.getElementById("profileActivityBadge");

const profileNameInput = document.getElementById("profileNameInput");
const profileGenderInput = document.getElementById("profileGenderInput");
const profileAgeInput = document.getElementById("profileAgeInput");
const profileHeightInput = document.getElementById("profileHeightInput");
const profileWeightInput = document.getElementById("profileWeightInput");
const profileTargetWeightInput = document.getElementById("profileTargetWeightInput");
const profileActivityInput = document.getElementById("profileActivityInput");
const profileGoalInput = document.getElementById("profileGoalInput");

const goalCaloriesEl = document.getElementById("goalCalories");
const goalProteinEl = document.getElementById("goalProtein");
const goalFatEl = document.getElementById("goalFat");
const goalCarbsEl = document.getElementById("goalCarbs");
const waterGoalInput = document.getElementById("waterGoalInput");

const autoGoalsToggle = document.getElementById("autoGoalsToggle");
const recalculateGoalsBtn = document.getElementById("recalculateGoalsBtn");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const clearDayBtn = document.getElementById("clearDayBtn");
const restartOnboardingBtn = document.getElementById("restartOnboardingBtn");
const profileUserInfo = document.getElementById("profileUserInfo");

let currentTab = "recent";

/* keys */
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateKeyFromDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayLabel() {
  const d = new Date();
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long"
  });
}

function entriesKey(dateKey = getTodayKey()) {
  return `calorie_entries_${dateKey}`;
}

function waterKey(dateKey = getTodayKey()) {
  return `calorie_water_${dateKey}`;
}

function goalsKey() {
  return "calorie_goals_value";
}

function profileKey() {
  return "calorie_user_profile";
}

/* storage */
function loadEntries(dateKey = getTodayKey()) {
  const raw = localStorage.getItem(entriesKey(dateKey));
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntries(entries, dateKey = getTodayKey()) {
  localStorage.setItem(entriesKey(dateKey), JSON.stringify(entries));
}

function loadWater(dateKey = getTodayKey()) {
  return Number(localStorage.getItem(waterKey(dateKey))) || 0;
}

function saveWater(value, dateKey = getTodayKey()) {
  localStorage.setItem(waterKey(dateKey), String(value));
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

function loadProfile() {
  const raw = localStorage.getItem(profileKey());
  if (!raw) return null;
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(profileKey(), JSON.stringify(profile));
}

/* helpers */
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

function getProfileDistance(profile) {
  const current = Number(profile.weight);
  const target = Number(profile.targetWeight);
  if (!current || !target) return "";
  const diff = Math.abs(current - target);
  if (diff === 0) return "Цільова вага досягнута";
  return `До цілі: ${diff} кг`;
}

function calculateGoalsFromProfile(profile) {
  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const age = Number(profile.age);
  const activity = Number(profile.activity);

  let bmr = 0;
  if (profile.gender === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }

  let calories = Math.round(bmr * activity);

  if (profile.goal === "lose") calories -= 400;
  if (profile.goal === "gain") calories += 300;
  if (calories < 1200) calories = 1200;

  let protein = 0;
  let fat = 0;

  if (profile.goal === "lose") {
    protein = Math.round(weight * 1.8);
    fat = Math.round(weight * 0.8);
  } else if (profile.goal === "gain") {
    protein = Math.round(weight * 1.8);
    fat = Math.round(weight * 1.0);
  } else {
    protein = Math.round(weight * 1.6);
    fat = Math.round(weight * 0.9);
  }

  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbs = Math.max(0, Math.round((calories - proteinCalories - fatCalories) / 4));

  return {
    calories,
    protein,
    fat,
    carbs,
    water: DEFAULT_GOALS.water
  };
}

function prettyDate(dateKey) {
  const [y, m, d] = dateKey.split("-");
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long"
  });
}

function shortDay(dateKey) {
  const [y, m, d] = dateKey.split("-");
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString("uk-UA", { weekday: "short" });
}

/* onboarding */
function showStep(step) {
  stepEls.forEach(el => {
    el.classList.toggle("active", Number(el.dataset.step) === step);
  });

  const progressMap = { 1: 0, 2: 20, 3: 40, 4: 60, 5: 80, 6: 100 };
  progressFillEl.style.width = `${progressMap[step] || 0}%`;
}

function selectChoiceGroup(buttons, activeBtn) {
  buttons.forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

const activityButtons = document.querySelectorAll("[data-activity]");
const goalButtons = document.querySelectorAll("[data-goal]");

activityButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    selectChoiceGroup(activityButtons, btn);
    onboardingData.activity = Number(btn.dataset.activity);
  });
});

goalButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    selectChoiceGroup(goalButtons, btn);
    onboardingData.goal = btn.dataset.goal;
  });
});

function finishOnboardingFlow() {
  const profile = {
    name: onboardingData.name,
    gender: onboardingData.gender,
    age: Number(onboardingData.age),
    height: Number(onboardingData.height),
    weight: Number(onboardingData.weight),
    targetWeight: Number(onboardingData.targetWeight || onboardingData.weight),
    activity: Number(onboardingData.activity),
    goal: onboardingData.goal,
    autoGoals: true,
    isOnboardingDone: true,
    avatar: null
  };

  const goals = calculateGoalsFromProfile(profile);

  saveProfile(profile);
  saveGoals(goals);

  resultHelloText.textContent = `Готово, ${profile.name}`;
  resultSummaryText.textContent = "Я підготував персональні цілі на день. Їх можна редагувати у профілі.";
  resultCalories.textContent = goals.calories;
  resultProtein.textContent = `${goals.protein} г`;
  resultFat.textContent = `${goals.fat} г`;
  resultCarbs.textContent = `${goals.carbs} г`;

  showStep(6);
}

startOnboardingBtn.addEventListener("click", () => showStep(2));

toStep3Btn.addEventListener("click", () => {
  const name = userNameInput.value.trim();
  if (!name) return;
  onboardingData.name = name;
  showStep(3);
});

toStep4Btn.addEventListener("click", () => {
  const age = Number(userAgeInput.value);
  const height = Number(userHeightInput.value);
  const weight = Number(userWeightInput.value);
  const gender = userGenderInput.value;

  if (!age || !height || !weight) return;

  onboardingData.gender = gender;
  onboardingData.age = age;
  onboardingData.height = height;
  onboardingData.weight = weight;

  showStep(4);
});

toStep5Btn.addEventListener("click", () => showStep(5));

finishOnboardingBtn.addEventListener("click", () => {
  const targetWeight = Number(targetWeightInput.value);
  onboardingData.targetWeight = targetWeight || onboardingData.weight;
  finishOnboardingFlow();
});

openAppBtn.addEventListener("click", () => {
  onboardingScreenEl.classList.add("hidden");
  mainAppEl.classList.remove("hidden");
  renderAll();
});

/* app core */
function openScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[name].classList.add("active");

  navButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === name);
  });

  if (name === "stats") {
    renderStats();
  }
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

function addEntry({ mealType, foodName, grams, kcal100, protein, fat, carbs }) {
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
  renderStats();
}

function fillManualForm(product) {
  foodNameEl.value = product.name;
  gramsEl.value = product.defaultGrams || "";
  kcal100El.value = product.kcal100 || "";
  proteinEl.value = product.protein || "";
  fatEl.value = product.fat || "";
  carbsEl.value = product.carbs || "";
}

function renderMealList(container, entries, mealType) {
  const list = entries.filter(item => item.mealType === mealType);

  if (!list.length) {
    container.innerHTML = `<div class="empty-box">Поки що нічого не додано</div>`;
    return;
  }

  container.innerHTML = list.map(item => `
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
  `).join("");
}

function renderWater() {
  const goals = loadGoals();
  const water = loadWater();

  waterMlView.textContent = water;
  waterGoalView.textContent = goals.water || DEFAULT_GOALS.water;
  waterBarFill.style.width = `${percent(water, goals.water || DEFAULT_GOALS.water)}%`;
}

function renderDiary() {
  const entries = loadEntries();
  const totals = getTotals(entries);
  const goals = loadGoals();
  const profile = loadProfile();

  todayDateEl.textContent = `Сьогодні, ${getTodayLabel()}`;
  mainGreetingTitle.textContent = profile?.name ? `${profile.name}, щоденник` : "Щоденник";

  dayCaloriesEl.textContent = totals.calories;
  goalTextEl.textContent = `ціль ${goals.calories}`;

  if (totals.calories <= goals.calories) {
    remainingTextEl.textContent = `Залишилось ${goals.calories - totals.calories}`;
    remainingTextEl.style.color = "#cdb8ff";
  } else {
    remainingTextEl.textContent = `Перебір ${totals.calories - goals.calories}`;
    remainingTextEl.style.color = "#ff92ac";
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

  renderWater();
}

function renderFoodCards() {
  const search = foodSearchEl.value.trim().toLowerCase();
  const list = foodDatabase[currentTab] || [];

  const filtered = list.filter(item =>
    item.name.toLowerCase().includes(search)
  );

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

/* stats */
function getLastDaysData(days = 7) {
  const arr = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKeyFromDate(d);
    const entries = loadEntries(key);
    const totals = getTotals(entries);
    const water = loadWater(key);
    arr.push({
      key,
      calories: totals.calories,
      water
    });
  }
  return arr;
}

function renderStats() {
  const week = getLastDaysData(7);
  const today = week[week.length - 1];
  const totalDaysWithData = week.filter(x => x.calories > 0 || x.water > 0).length;
  const avg = totalDaysWithData
    ? Math.round(week.reduce((sum, x) => sum + x.calories, 0) / totalDaysWithData)
    : 0;

  statsTodayCalories.textContent = today.calories;
  statsAverageCalories.textContent = avg;
  statsDaysCount.textContent = totalDaysWithData;
  statsWaterToday.textContent = today.water;

  const maxCalories = Math.max(...week.map(x => x.calories), 1);

  weekChart.innerHTML = week.map(day => {
    const h = Math.max((day.calories / maxCalories) * 130, day.calories > 0 ? 8 : 4);
    return `
      <div class="chart-col">
        <div class="chart-value">${day.calories}</div>
        <div class="chart-bar-wrap">
          <div class="chart-bar" style="height:${h}px"></div>
        </div>
        <div class="chart-day">${shortDay(day.key)}</div>
      </div>
    `;
  }).join("");

  const history = week.slice().reverse();

  historyDaysList.innerHTML = history.map(day => `
    <div class="history-day-card">
      <div class="history-day-top">
        <div class="history-day-date">${prettyDate(day.key)}</div>
        <div class="history-day-kcal">${day.calories} ккал</div>
      </div>
      <div class="history-meta">Вода: ${day.water} мл</div>
    </div>
  `).join("");
}

/* profile */
function renderProfile() {
  const profile = loadProfile() || { ...DEFAULT_PROFILE };
  const goals = loadGoals();

  if (profile.avatar) {
    profileAvatar.innerHTML = `<img src="${profile.avatar}">`;
  } else {
    profileAvatar.textContent = (profile.name || "U").charAt(0).toUpperCase();
  }

  profileNameView.textContent = profile.name || "Користувач";
  profileGoalBadge.textContent = GOAL_LABELS[profile.goal] || "Ціль";
  profileActivityBadge.textContent = ACTIVITY_LABELS[String(profile.activity)] || "Активність";

  profileNameInput.value = profile.name || "";
  profileGenderInput.value = profile.gender || "male";
  profileAgeInput.value = profile.age || "";
  profileHeightInput.value = profile.height || "";
  profileWeightInput.value = profile.weight || "";
  profileTargetWeightInput.value = profile.targetWeight || "";
  profileActivityInput.value = String(profile.activity || 1.2);
  profileGoalInput.value = profile.goal || "lose";

  goalCaloriesEl.value = goals.calories;
  goalProteinEl.value = goals.protein;
  goalFatEl.value = goals.fat;
  goalCarbsEl.value = goals.carbs;
  waterGoalInput.value = goals.water || DEFAULT_GOALS.water;

  autoGoalsToggle.classList.toggle("active", !!profile.autoGoals);
  autoGoalsToggle.textContent = profile.autoGoals ? "Увімкнено" : "Вимкнено";

  profileUserInfo.textContent =
    `${profile.name || "Користувач"} • ${profile.age} р. • ${profile.height} см • ${profile.weight} кг • ${getProfileDistance(profile)}`;
}

function renderAll() {
  renderRecipes();
  renderFoodCards();
  renderDiary();
  renderProfile();
  renderStats();
  openScreen("diary");
}

/* profile actions */
function collectProfileFromInputs() {
  const oldProfile = loadProfile() || { ...DEFAULT_PROFILE };

  return {
    ...oldProfile,
    name: profileNameInput.value.trim() || oldProfile.name || "Користувач",
    gender: profileGenderInput.value,
    age: Number(profileAgeInput.value) || oldProfile.age,
    height: Number(profileHeightInput.value) || oldProfile.height,
    weight: Number(profileWeightInput.value) || oldProfile.weight,
    targetWeight: Number(profileTargetWeightInput.value) || oldProfile.targetWeight,
    activity: Number(profileActivityInput.value) || oldProfile.activity,
    goal: profileGoalInput.value,
    autoGoals: oldProfile.autoGoals !== false,
    isOnboardingDone: true
  };
}

function saveProfileAndMaybeGoals(recalc = false) {
  const profile = collectProfileFromInputs();
  saveProfile(profile);

  if (profile.autoGoals || recalc) {
    const goals = calculateGoalsFromProfile(profile);
    goals.water = Number(waterGoalInput.value) || DEFAULT_GOALS.water;
    saveGoals(goals);
  } else {
    saveGoals({
      calories: Number(goalCaloriesEl.value) || DEFAULT_GOALS.calories,
      protein: Number(goalProteinEl.value) || DEFAULT_GOALS.protein,
      fat: Number(goalFatEl.value) || DEFAULT_GOALS.fat,
      carbs: Number(goalCarbsEl.value) || DEFAULT_GOALS.carbs,
      water: Number(waterGoalInput.value) || DEFAULT_GOALS.water
    });
  }

  renderAll();
}

/* events */
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

/* water events */
waterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const add = Number(btn.dataset.waterAdd);
    const current = loadWater();
    saveWater(current + add);
    renderDiary();
    renderStats();
  });
});

resetWaterBtn.addEventListener("click", () => {
  saveWater(0);
  renderDiary();
  renderStats();
});

/* avatar */
changeAvatarBtn.addEventListener("click", () => {
  avatarInput.click();
});

avatarInput.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const profile = loadProfile() || { ...DEFAULT_PROFILE };
    profile.avatar = e.target.result;
    saveProfile(profile);
    renderProfile();
  };
  reader.readAsDataURL(file);
});

/* profile buttons */
autoGoalsToggle.addEventListener("click", () => {
  const profile = loadProfile() || { ...DEFAULT_PROFILE };
  profile.autoGoals = !profile.autoGoals;
  saveProfile(profile);
  renderProfile();
});

recalculateGoalsBtn.addEventListener("click", () => {
  const profile = collectProfileFromInputs();
  profile.autoGoals = true;
  saveProfile(profile);
  const goals = calculateGoalsFromProfile(profile);
  goals.water = Number(waterGoalInput.value) || DEFAULT_GOALS.water;
  saveGoals(goals);
  renderAll();
});

saveProfileBtn.addEventListener("click", () => {
  saveProfileAndMaybeGoals(false);
});

clearDayBtn.addEventListener("click", () => {
  localStorage.removeItem(entriesKey());
  localStorage.removeItem(waterKey());
  renderDiary();
  renderStats();
});

restartOnboardingBtn.addEventListener("click", () => {
  localStorage.removeItem(profileKey());
  localStorage.removeItem(goalsKey());
  onboardingData = { ...DEFAULT_PROFILE };
  mainAppEl.classList.add("hidden");
  onboardingScreenEl.classList.remove("hidden");
  userNameInput.value = "";
  userAgeInput.value = "";
  userHeightInput.value = "";
  userWeightInput.value = "";
  targetWeightInput.value = "";
  showStep(1);
});

/* init */
function initApp() {
  const savedProfile = loadProfile();

  if (!savedProfile || !savedProfile.isOnboardingDone) {
    onboardingScreenEl.classList.remove("hidden");
    mainAppEl.classList.add("hidden");
    showStep(1);
  } else {
    onboardingScreenEl.classList.add("hidden");
    mainAppEl.classList.remove("hidden");
    renderAll();
  }
}

renderRecipes();
renderFoodCards();
initApp();
