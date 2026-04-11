const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

const state = {
  onboardingStep: 1,
  selectedDate: getTodayKey(),
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedGender: "male",
  selectedGoal: "lose",
  selectedActivity: 1.2,
  recordMeal: "Сніданок",
  editingFood: null,
  editingEntryId: null,
  birthYearValue: 1994,
  heightValue: 174,
  weightValue: 110,
  targetWeightValue: 85,
};

const DEFAULT_PROFILE = {
  name: "",
  birthYear: 1994,
  height: 174,
  weight: 110,
  targetWeight: 85,
  gender: "male",
  goal: "lose",
  activity: 1.2,
  waterGoalLiters: 3.5,
  avatar: null,
  onboarded: false,
};

const FOOD_DB = [
  { id: "banana", name: "Банан", kcal100: 94, protein100: 1.1, carbs100: 22.8, fats100: 0.3, fiber100: 2.6, type: "Продукт", image: "https://images.unsplash.com/photo-1574226516831-e1dff420e38e?auto=format&fit=crop&w=300&q=80", badge: "🌿" },
  { id: "water", name: "Вода питна", kcal100: 0, protein100: 0, carbs100: 0, fats100: 0, fiber100: 0, type: "Напій", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80", badge: "💧" },
  { id: "coffee", name: "Кава з молоком без цукру", kcal100: 12, protein100: 0.6, carbs100: 1.4, fats100: 0.5, fiber100: 0, type: "Напій", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=300&q=80", badge: "☕" },
  { id: "egg", name: "Яйце куряче сире", kcal100: 151, protein100: 12.6, carbs100: 0.7, fats100: 10.6, fiber100: 0, type: "Продукт", image: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=300&q=80", badge: "🥚" },
  { id: "cucumber", name: "Огірок свіжий", kcal100: 16, protein100: 0.7, carbs100: 3.6, fats100: 0.1, fiber100: 0.5, type: "Продукт", image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=300&q=80", badge: "🌿" },
  { id: "oats", name: "Вівсяні пластівці", kcal100: 400, protein100: 13.2, carbs100: 67.7, fats100: 6.5, fiber100: 10.1, type: "Продукт", image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=300&q=80", badge: "🥣" },
  { id: "rice", name: "Рис білий варений", kcal100: 126, protein100: 2.4, carbs100: 28.7, fats100: 0.3, fiber100: 0.4, type: "Продукт", image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=300&q=80", badge: "🍚" },
  { id: "olive", name: "Оливкова олія", kcal100: 819, protein100: 0, carbs100: 0, fats100: 91, fiber100: 0, type: "Продукт", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80", badge: "🫒" },
  { id: "chicken", name: "Куряче філе", kcal100: 165, protein100: 31, carbs100: 0, fats100: 3.6, fiber100: 0, type: "Продукт", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&q=80", badge: "🍗" },
  { id: "salad", name: "Салат латук", kcal100: 16, protein100: 1.4, carbs100: 2.9, fats100: 0.2, fiber100: 1.3, type: "Продукт", image: "https://images.unsplash.com/photo-1622206151246-4f5f734abf17?auto=format&fit=crop&w=300&q=80", badge: "🥬" }
];

const MEAL_CONFIG = [
  { key: "Сніданок", emoji: "🥣" },
  { key: "Перекус", emoji: "🥪" },
  { key: "Обід", emoji: "🍛" },
  { key: "Другий перекус", emoji: "🥪" },
  { key: "Вечеря", emoji: "🍽" },
  { key: "Третій перекус", emoji: "🍽" },
];

const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const onboardingProgressRing = $("onboardingProgressRing");
const onboardingProgressInner = $("onboardingProgressInner");
const birthYearPicker = $("birthYearPicker");
const heightPicker = $("heightPicker");
const weightPicker = $("weightPicker");
const targetWeightPicker = $("targetWeightPicker");
const WHEEL_PICKERS = [birthYearPicker, heightPicker, weightPicker, targetWeightPicker].filter(Boolean);

function profileKey() { return "neon_calorie_profile"; }
function entriesKey(dateKey = state.selectedDate) { return `neon_calorie_entries_${dateKey}`; }
function waterKey(dateKey = state.selectedDate) { return `neon_calorie_water_${dateKey}`; }
function hintKey() { return "neon_calorie_hint_hidden"; }

function loadProfile() {
  const raw = localStorage.getItem(profileKey());
  if (!raw) return { ...DEFAULT_PROFILE };
  try { return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }; }
  catch { return { ...DEFAULT_PROFILE }; }
}

function saveProfile(profile) { localStorage.setItem(profileKey(), JSON.stringify(profile)); }

function loadEntries(dateKey = state.selectedDate) {
  const raw = localStorage.getItem(entriesKey(dateKey));
  if (!raw) return [];
  try { return JSON.parse(raw); }
  catch { return []; }
}

function saveEntries(entries, dateKey = state.selectedDate) { localStorage.setItem(entriesKey(dateKey), JSON.stringify(entries)); }
function loadWater(dateKey = state.selectedDate) { return Number(localStorage.getItem(waterKey(dateKey))) || 0; }
function saveWater(liters, dateKey = state.selectedDate) { localStorage.setItem(waterKey(dateKey), String(liters)); }
function isHintHidden() { return localStorage.getItem(hintKey()) === "1"; }
function setHintHidden(hidden) { localStorage.setItem(hintKey(), hidden ? "1" : "0"); }

function getTodayKey() { return dateToKey(new Date()); }
function dateToKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function keyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function formatHeaderDate(key) { return keyToDate(key).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" }); }
function formatLongDate(key) { return keyToDate(key).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }); }
function shortWeekDay(date) {
  const days = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];
  let idx = date.getDay() - 1;
  if (idx < 0) idx = 6;
  return days[idx];
}
function monthTitle(month, year) { return new Date(year, month, 1).toLocaleDateString("uk-UA", { month: "long", year: "numeric" }); }
function activityLabel(multiplier) {
  if (multiplier <= 1.2) return "сидячий";
  if (multiplier <= 1.375) return "легкий";
  if (multiplier <= 1.55) return "середній";
  return "високий";
}
function round1(v) { return Math.round(v * 10) / 10; }
function formatNumber(value) {
  const rounded = round1(Number(value) || 0);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, "");
}
function formatMetric(value, unit) { return `${formatNumber(value)} ${unit}`; }
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function getFoodById(id) { return FOOD_DB.find(food => food.id === id) || null; }
function getFoodFromEntry(entry) {
  return getFoodById(entry.foodId) || {
    id: entry.foodId || entry.id,
    name: entry.name,
    kcal100: Number(entry.kcal100 || 0),
    protein100: Number(entry.protein100 || 0),
    carbs100: Number(entry.carbs100 || 0),
    fats100: Number(entry.fats100 || 0),
    fiber100: Number(entry.fiber100 || 0),
    type: entry.type || "Продукт",
    image: entry.image || "",
    badge: entry.badge || "🍽"
  };
}
function calculateEntryNutrition(food, totalGrams) {
  const factor = Math.max(0, Number(totalGrams) || 0) / 100;
  return {
    totalKcal: Math.round(Number(food.kcal100 || 0) * factor),
    protein: round1(Number(food.protein100 || 0) * factor),
    carbs: round1(Number(food.carbs100 || 0) * factor),
    fats: round1(Number(food.fats100 || 0) * factor),
    fiber: round1(Number(food.fiber100 || 0) * factor)
  };
}
function findEntry(entryId, dateKey = state.selectedDate) {
  return loadEntries(dateKey).find(entry => entry.id === entryId) || null;
}

function getAge(profile) { return new Date().getFullYear() - Number(profile.birthYear || 1994); }

function calculatePlan(profile) {
  const age = getAge(profile);
  const weight = Number(profile.weight);
  const height = Number(profile.height);
  const bmr = profile.gender === "female"
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
  const maintain = Math.round(bmr * Number(profile.activity || 1.2));
  const bmrRounded = Math.round(bmr);
  const activityCalories = Math.max(0, maintain - bmrRounded);
  let goalCalories = maintain;
  if (profile.goal === "lose") goalCalories = maintain - 350;
  if (profile.goal === "gain") goalCalories = maintain + 250;
  if (goalCalories < 1200) goalCalories = 1200;
  const protein = Math.round(weight * (profile.goal === "gain" ? 1.9 : 1.7));
  const fats = Math.round(weight * 0.8);
  const carbs = Math.max(0, Math.round((goalCalories - protein * 4 - fats * 9) / 4));
  const fiber = Math.round(goalCalories / 1000 * 14);
  return { bmr: bmrRounded, activityCalories, maintain, goalCalories, protein, fats, carbs, fiber, deficit: maintain - goalCalories };
}

function getEntriesTotals(dateKey = state.selectedDate) {
  const entries = loadEntries(dateKey);
  let kcal = 0;
  const mealMap = {};
  MEAL_CONFIG.forEach(m => mealMap[m.key] = []);
  entries.forEach(item => {
    kcal += Number(item.totalKcal);
    if (!mealMap[item.meal]) mealMap[item.meal] = [];
    mealMap[item.meal].push(item);
  });
  return { kcal, mealMap, entries };
}

function calculateMacrosFromEntries(entries) {
  let protein = 0, carbs = 0, fats = 0, fiber = 0;
  entries.forEach(e => {
    protein += Number(e.protein || 0);
    carbs += Number(e.carbs || 0);
    fats += Number(e.fats || 0);
    fiber += Number(e.fiber || 0);
  });
  return { protein: round1(protein), carbs: round1(carbs), fats: round1(fats), fiber: round1(fiber) };
}
function getPercent(current, total) { return total ? Math.min(100, Math.round((current / total) * 100)) : 0; }

function getForecast(profile) {
  const weight = Number(profile.weight);
  const target = Number(profile.targetWeight || weight);
  const diff = Math.abs(weight - target);
  if (!diff) return { weeks: 0, endDate: formatLongDate(getTodayKey()) };
  const weekly = profile.goal === "lose" ? 0.5 : 0.35;
  const weeks = Math.ceil(diff / weekly);
  const d = new Date();
  d.setDate(d.getDate() + weeks * 7);
  return { weeks, endDate: d.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "2-digit" }) };
}

function getStreakData() {
  let current = 0;
  let tempCurrent = 0;
  let best = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateToKey(d);
    const has = loadEntries(key).length > 0;
    if (i === 0 && has) current = 1;
    if (i > 0 && has && current === i) current++;
  }
  for (let i = 365; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateToKey(d);
    if (loadEntries(key).length > 0) {
      tempCurrent++;
      if (tempCurrent > best) best = tempCurrent;
    } else {
      tempCurrent = 0;
    }
  }
  return { current, best };
}

function openRootScreen(screenId) {
  $$(".tab-screen").forEach(s => s.classList.remove("active"));
  $(screenId).classList.add("active");
  $$(".dock-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.openScreen === screenId));
}

function openMainApp() {
  $("onboardingScreen").classList.remove("active");
  $("mainAppScreen").classList.add("active");
  renderAll();
}

function goToNested(screenId) { openRootScreen(screenId); }
function goBackTo(screenId) { openRootScreen(screenId); }

function updateOnboardingProgress(step) {
  const totalSteps = 9;
  const progressSteps = Math.max(0, Math.min(step - 1, totalSteps - 1));
  const percent = progressSteps / (totalSteps - 1);
  const degrees = Math.round(percent * 360);
  onboardingProgressRing.style.setProperty("--progress-deg", `${degrees}deg`);
  onboardingProgressInner.textContent = "✓";
}

function setOnboardingStep(step) {
  state.onboardingStep = step;
  $$(".onboarding-step").forEach(el => el.classList.toggle("active", Number(el.dataset.step) === step));
  $("onboardingBackBtn").style.visibility = step === 1 ? "hidden" : "visible";
  updateOnboardingProgress(step);
  requestAnimationFrame(() => requestAnimationFrame(refreshVisibleWheelPickers));
}

function setWheelPosition(container, value, behavior = "auto") {
  if (!container || !container.clientHeight) return;
  const target = [...container.querySelectorAll(".wheel-item")].find(item => Number(item.dataset.value) === Number(value));
  if (!target) return;
  const targetTop = Math.max(0, target.offsetTop - (container.clientHeight / 2) + (target.offsetHeight / 2));
  if (behavior === "smooth") {
    container.scrollTo({ top: targetTop, behavior });
    return;
  }
  container.scrollTop = targetTop;
}

function createWheelPicker(container, values, initialValue, onChange) {
  if (!container) return;
  container.innerHTML = "";
  container.dataset.initialValue = initialValue;
  values.forEach(value => {
    const item = document.createElement("div");
    item.className = "wheel-item";
    item.textContent = value;
    item.dataset.value = value;
    container.appendChild(item);
  });

  function updateActive() {
    const items = [...container.querySelectorAll(".wheel-item")];
    if (!items.length || !container.clientHeight) return;
    const center = container.scrollTop + container.clientHeight / 2;
    let closest = null;
    let minDistance = Infinity;
    items.forEach(item => {
      const itemCenter = item.offsetTop + item.offsetHeight / 2;
      const distance = Math.abs(center - itemCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closest = item;
      }
    });
    items.forEach(item => item.classList.remove("active"));
    if (closest) {
      closest.classList.add("active");
      container.dataset.currentValue = closest.dataset.value;
      onChange(Number(closest.dataset.value));
    }
  }

  let scrollTimeout = null;
  container.addEventListener("scroll", () => {
    updateActive();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const active = container.querySelector(".wheel-item.active");
      if (!active) return;
      setWheelPosition(container, Number(active.dataset.value), "smooth");
    }, 80);
  });

  container.__updateWheelActive = updateActive;
  requestAnimationFrame(() => {
    setWheelPosition(container, initialValue);
    updateActive();
  });
}

function refreshVisibleWheelPickers() {
  WHEEL_PICKERS.forEach(container => {
    if (!container || !container.offsetParent) return;
    const value = Number(container.dataset.currentValue || container.dataset.initialValue);
    setWheelPosition(container, value);
    container.__updateWheelActive?.();
  });
}

function initWheelPickers() {
  createWheelPicker(birthYearPicker, Array.from({ length: 80 }, (_, i) => 1950 + i), state.birthYearValue, value => state.birthYearValue = value);
  createWheelPicker(heightPicker, Array.from({ length: 121 }, (_, i) => 100 + i), state.heightValue, value => state.heightValue = value);
  createWheelPicker(weightPicker, Array.from({ length: 221 }, (_, i) => 30 + i), state.weightValue, value => state.weightValue = value);
  createWheelPicker(targetWeightPicker, Array.from({ length: 221 }, (_, i) => 30 + i), state.targetWeightValue, value => state.targetWeightValue = value);
}

function finishOnboarding() {
  const profile = loadProfile();
  profile.name = $("obName").value.trim() || profile.name || "Ед";
  profile.gender = state.selectedGender;
  profile.birthYear = Number(state.birthYearValue) || profile.birthYear;
  profile.height = Number(state.heightValue) || profile.height;
  profile.weight = Number(state.weightValue) || profile.weight;
  profile.targetWeight = Number(state.targetWeightValue) || profile.targetWeight || profile.weight;
  profile.goal = state.selectedGoal;
  profile.activity = state.selectedActivity;
  profile.onboarded = true;
  saveProfile(profile);

  const plan = calculatePlan(profile);
  const forecast = getForecast(profile);
  $("forecastText").textContent = `${profile.targetWeight} кг досягнеш приблизно до ${forecast.endDate}.`;
  $("forecastStartDate").textContent = "сьогодні";
  $("forecastStartWeight").textContent = `${profile.weight} кг`;
  $("forecastEndDate").textContent = forecast.endDate;
  $("forecastTargetWeight").textContent = `${profile.targetWeight} кг`;
  $("planCalories").textContent = `${plan.goalCalories} ккал`;
  $("planProtein").textContent = `${plan.protein} г`;
  $("planCarbs").textContent = `${plan.carbs} г`;
  $("planFat").textContent = `${plan.fats} г`;
  $("planFiber").textContent = `${plan.fiber} г`;
  setOnboardingStep(9);
}

function renderWeekStrip() {
  const selected = keyToDate(state.selectedDate);
  const monday = new Date(selected);
  let day = monday.getDay() - 1;
  if (day < 0) day = 6;
  monday.setDate(selected.getDate() - day);
  const wrap = $("weekStrip");
  wrap.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dateToKey(d);
    const item = document.createElement("button");
    item.className = `week-day ${key === state.selectedDate ? "active" : ""}`;
    item.innerHTML = `<span class="week-day-name">${shortWeekDay(d)}</span><span class="week-day-dot">${d.getDate()}</span>`;
    item.addEventListener("click", () => { state.selectedDate = key; renderAll(); });
    wrap.appendChild(item);
  }
}

function renderHeader() { $("headerDateText").textContent = formatHeaderDate(state.selectedDate); }

function renderView() {
  const profile = loadProfile();
  const plan = calculatePlan(profile);
  const totals = getEntriesTotals(state.selectedDate);
  const macros = calculateMacrosFromEntries(totals.entries);
  const percent = getPercent(totals.kcal, plan.goalCalories);
  $("consumedKcal").textContent = `${totals.kcal} ккал`;
  $("activityBurn").textContent = `${plan.activityCalories} ккал`;
  $("ringCurrent").textContent = totals.kcal;
  $("ringGoal").textContent = plan.goalCalories;
  $("ringPercent").textContent = `${percent} %`;
  const deg = Math.max(10, (percent / 100) * 360);
  $("bigRing").style.background = `conic-gradient(var(--neon-orange) 0deg, var(--neon-blue) ${deg}deg, rgba(255,255,255,.08) ${deg}deg)`;
  $("viewProteinCurrent").textContent = `${formatNumber(macros.protein)} г`;
  $("viewCarbsCurrent").textContent = `${formatNumber(macros.carbs)} г`;
  $("viewFatsCurrent").textContent = `${formatNumber(macros.fats)} г`;
  $("viewFiberCurrent").textContent = `${formatNumber(macros.fiber)} г`;
  $("viewProteinGoal").textContent = `${plan.protein} г`;
  $("viewCarbsGoal").textContent = `${plan.carbs} г`;
  $("viewFatsGoal").textContent = `${plan.fats} г`;
  $("viewFiberGoal").textContent = `${plan.fiber} г`;
  renderMealCards(totals.mealMap);
  renderWater();
  renderWeightCard();
  $("viewHintPill").classList.toggle("hidden", isHintHidden() || totals.entries.length > 0);
  $("activityCardText").textContent = `Зараз обрано ${activityLabel(Number(profile.activity || 1.2))} рівень активності (${formatNumber(profile.activity || 1.2)}). Це додає приблизно ${plan.activityCalories} ккал до добових витрат.`;
  $("detailBmr").textContent = `${plan.bmr} ккал`;
  $("detailActivity").textContent = `${plan.activityCalories} ккал`;
  $("detailMaintain").textContent = `${plan.maintain} ккал`;
  $("detailGoalDeltaLabel").textContent = profile.goal === "gain"
    ? "Профіцит калорій"
    : profile.goal === "maintain"
      ? "Різниця до підтримки"
      : "Дефіцит калорій";
  $("detailDeficit").textContent = `${Math.abs(plan.goalCalories - plan.maintain)} ккал`;
  $("detailGoalCalories").textContent = `${plan.goalCalories} ккал`;
  $("detailConsumed").textContent = `${totals.kcal} / ${plan.goalCalories}`;
  $("detailLeft").textContent = `${Math.max(0, plan.goalCalories - totals.kcal)} / ${plan.goalCalories}`;
}

function renderMealCards(mealMap) {
  const list = $("mealCardsList");
  list.innerHTML = "";
  MEAL_CONFIG.forEach(meal => {
    const entries = [...(mealMap[meal.key] || [])].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
    const mealKcal = entries.reduce((sum, entry) => sum + Number(entry.totalKcal || 0), 0);
    const row = document.createElement("div");
    row.className = "meal-pill-card";
    row.innerHTML = `
      <div class="meal-card-head">
        <div class="meal-pill-left">
          <div class="meal-emoji">${meal.emoji}</div>
          <div class="meal-title-wrap">
            <div class="meal-name">${meal.key}</div>
            <div class="meal-summary">${entries.length ? `${entries.length} записів • ${mealKcal} ккал` : "Ще немає записів"}</div>
          </div>
        </div>
        <div class="meal-tools">
          <button class="white-circle-btn meal-menu-btn" data-meal="${meal.key}">•••</button>
          <button class="green-circle-btn meal-plus-btn" data-meal="${meal.key}">＋</button>
        </div>
      </div>
      ${entries.length ? `
        <div class="meal-entry-list">
          ${entries.map(entry => {
            const totalGrams = Number(entry.totalGrams || entry.grams || 0);
            return `
              <button class="meal-entry-row" data-entry-id="${entry.id}">
                <div class="meal-entry-main">
                  <div class="meal-entry-name">${escapeHtml(entry.name)}</div>
                  <div class="meal-entry-meta">${formatMetric(totalGrams, "г")} • ${entry.totalKcal} ккал</div>
                  <div class="meal-entry-macros">Б ${formatNumber(entry.protein)} • Ж ${formatNumber(entry.fats)} • В ${formatNumber(entry.carbs)} • Кл ${formatNumber(entry.fiber)}</div>
                </div>
                <span class="meal-entry-edit">✎</span>
              </button>
            `;
          }).join("")}
        </div>
      ` : `<div class="meal-empty">Додай перший продукт до цього прийому їжі.</div>`}`;
    list.appendChild(row);
  });
  $$(".meal-plus-btn").forEach(btn => btn.addEventListener("click", () => { state.recordMeal = btn.dataset.meal; openRecordModalWithFood(FOOD_DB[0]); }));
  $$(".meal-menu-btn").forEach(btn => btn.addEventListener("click", () => { state.recordMeal = btn.dataset.meal; openOverlay(); $("mealActionMenu").classList.remove("hidden"); }));
  $$(".meal-entry-row").forEach(btn => btn.addEventListener("click", () => {
    const entry = findEntry(btn.dataset.entryId);
    if (!entry) return;
    openRecordModalWithFood(getFoodFromEntry(entry), { entry });
  }));
}

function renderWater() {
  const profile = loadProfile();
  const water = loadWater(state.selectedDate);
  const goal = Number(profile.waterGoalLiters || 3.5);
  const percent = getPercent(water, goal);
  $("waterCurrent").textContent = `${water.toFixed(1).replace(".0","")} л`;
  $("waterGoalText").textContent = goal;
  $("waterFill").style.width = `${percent}%`;
}

function renderWeightCard() {
  const profile = loadProfile();
  $("profileWeightMain").textContent = `${profile.weight} кг`;
  $("profileTargetMain").textContent = `${profile.targetWeight} кг`;
}

function renderProgress() {
  const chart = $("chartBars");
  const history = $("historyList");
  chart.innerHTML = "";
  history.innerHTML = "";
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateToKey(d);
    const totals = getEntriesTotals(key);
    const water = loadWater(key);
    data.push({ key, kcal: totals.kcal, water });
  }
  const max = Math.max(1, ...data.map(x => x.kcal));
  const avgKcal = Math.round(data.reduce((s, x) => s + x.kcal, 0) / data.length);
  const avgWater = round1(data.reduce((s, x) => s + x.water, 0) / data.length);
  $("avgCalories7").textContent = avgKcal;
  $("avgWater7").textContent = avgWater;
  data.forEach(item => {
    const d = keyToDate(item.key);
    const height = Math.max(8, Math.round((item.kcal / max) * 140));
    const col = document.createElement("div");
    col.className = "bar-col";
    col.innerHTML = `<div class="bar-value">${item.kcal}</div><div class="bar-track"><div class="bar-fill" style="height:${height}px"></div></div><div class="bar-day">${shortWeekDay(d)}</div>`;
    chart.appendChild(col);
  });
  data.slice().reverse().forEach(item => {
    const row = document.createElement("div");
    row.className = "history-item";
    row.innerHTML = `<div class="history-item-top"><div class="history-date">${formatLongDate(item.key)}</div><div class="history-value">${item.kcal} ккал</div></div><div class="history-meta">Вода: ${item.water.toFixed(1).replace(".0","")} л</div>`;
    history.appendChild(row);
  });
  const streak = getStreakData();
  $("streakCount").textContent = streak.current;
  $("streakBig").textContent = streak.current;
  $("streakModalCount").textContent = streak.current;
  $("streakBestCount").textContent = streak.best;
}

function renderMealsSearch() {
  const list = $("searchResultsList");
  const query = $("foodSearchInput").value.trim().toLowerCase();
  const filtered = FOOD_DB.filter(item => item.name.toLowerCase().includes(query));
  list.innerHTML = "";
  filtered.forEach(item => {
    const row = document.createElement("div");
    row.className = "search-row";
    row.innerHTML = `<img src="${item.image}" alt="${item.name}"><div><div class="search-row-title">${item.name} <span class="search-row-tag">${item.badge}</span></div><div class="search-row-sub">${item.kcal100} ккал / 100г • Б ${formatNumber(item.protein100)} • Ж ${formatNumber(item.fats100)} • В ${formatNumber(item.carbs100)}</div></div><button class="search-plus" data-food-id="${item.id}">＋</button>`;
    list.appendChild(row);
  });
  $$(".search-plus").forEach(btn => btn.addEventListener("click", () => {
    const food = getFoodById(btn.dataset.foodId);
    state.recordMeal = state.recordMeal || "Сніданок";
    openRecordModalWithFood(food);
  }));
}

function renderProfileScreens() {
  const profile = loadProfile();
  const plan = calculatePlan(profile);
  const forecast = getForecast(profile);
  if (profile.avatar) {
    $("profileAvatar").innerHTML = `<img src="${profile.avatar}" alt="avatar">`;
  } else {
    $("profileAvatar").textContent = (profile.name || "Е").slice(0, 1).toUpperCase();
  }
  $("profileNameInput").value = profile.name;
  $("profileBirthYearInput").value = profile.birthYear;
  $("profileHeightInput").value = profile.height;
  $("profileWeightInput").value = profile.weight;
  $("profileTargetWeightInput").value = profile.targetWeight;
  $("profileWaterGoalInput").value = profile.waterGoalLiters;
  $("goalForecastText").textContent = `${profile.targetWeight} кг приблизно до ${forecast.endDate}`;
  $("goalScreenStartDate").textContent = "сьогодні";
  $("goalScreenStartWeight").textContent = `${profile.weight} кг`;
  $("goalScreenEndDate").textContent = forecast.endDate;
  $("goalScreenEndWeight").textContent = `${profile.targetWeight} кг`;
  $("goalCaloriesValue").textContent = `${plan.goalCalories} ккал`;
  $("goalProteinValue").textContent = `${plan.protein} г`;
  $("goalCarbsValue").textContent = `${plan.carbs} г`;
  $("goalFatsValue").textContent = `${plan.fats} г`;
  $("goalFiberValue").textContent = `${plan.fiber} г`;
}

function renderCalendar() {
  $("calendarTitle").textContent = monthTitle(state.currentMonth, state.currentYear);
  const grid = $("calendarGrid");
  grid.innerHTML = "";
  const first = new Date(state.currentYear, state.currentMonth, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  for (let i = 0; i < startOffset; i++) grid.appendChild(document.createElement("span"));
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(state.currentYear, state.currentMonth, day);
    const key = dateToKey(date);
    const btn = document.createElement("button");
    btn.textContent = day;
    if (key === state.selectedDate) btn.classList.add("active");
    btn.addEventListener("click", () => { state.selectedDate = key; closeModal("calendarModal"); renderAll(); });
    grid.appendChild(btn);
  }
}

function renderAll() {
  renderHeader();
  renderWeekStrip();
  renderView();
  renderProgress();
  renderMealsSearch();
  renderProfileScreens();
  renderCalendar();
}

function openOverlay() { $("overlay").classList.remove("hidden"); }
function closeOverlay() { $("overlay").classList.add("hidden"); }
function closeAllFloating() {
  closeOverlay();
  resetRecordModal();
  ["addSheet","mealActionMenu","balanceModal","streakModal","calendarModal","recordModal"].forEach(id => $(id).classList.add("hidden"));
}
function closeModal(id) {
  $(id).classList.add("hidden");
  if (id === "recordModal") resetRecordModal();
  closeOverlay();
}

function mealEmoji(name) { return MEAL_CONFIG.find(x => x.key === name)?.emoji || "🍽"; }

function resetRecordModal() {
  state.editingFood = null;
  state.editingEntryId = null;
  $("saveRecordBtn").textContent = "Записати";
  $("recordDeleteBtn").hidden = true;
}

function renderRecordPreview() {
  if (!state.editingFood) return;
  const gramsPerUnit = Math.max(1, Number($("recordGramsInput").value) || 0);
  const count = Math.max(1, Number($("recordCountInput").value) || 1);
  const totalGrams = round1(gramsPerUnit * count);
  const nutrition = calculateEntryNutrition(state.editingFood, totalGrams);
  const existingEntry = state.editingEntryId ? findEntry(state.editingEntryId) : null;
  let projectedDayCalories = getEntriesTotals(state.selectedDate).kcal;
  if (existingEntry) projectedDayCalories -= Number(existingEntry.totalKcal || 0);
  projectedDayCalories += nutrition.totalKcal;

  $("recordPreviewCalories").textContent = `${nutrition.totalKcal} ккал`;
  $("recordPreviewProtein").textContent = `${formatNumber(nutrition.protein)} г`;
  $("recordPreviewFats").textContent = `${formatNumber(nutrition.fats)} г`;
  $("recordPreviewCarbs").textContent = `${formatNumber(nutrition.carbs)} г`;
  $("recordPreviewFiber").textContent = `${formatNumber(nutrition.fiber)} г`;
  $("recordPreviewGrams").textContent = `${formatNumber(totalGrams)} г`;
  $("recordImpactText").textContent = `Після збереження в "${state.recordMeal}" буде додано ${formatMetric(totalGrams, "г")}, а денна сума складе ${projectedDayCalories} ккал.`;
}

function openRecordModalWithFood(food, options = {}) {
  if (!food) return;
  const entry = options.entry || null;
  state.editingFood = food;
  state.editingEntryId = entry?.id || null;
  state.recordMeal = entry?.meal || options.meal || state.recordMeal;
  $("recordMealTitle").textContent = `${mealEmoji(state.recordMeal)} ${state.recordMeal}`;
  $("recordDateValue").textContent = formatLongDate(state.selectedDate);
  $("recordFoodName").textContent = food.name;
  $("recordFoodMeta").textContent = `${food.kcal100} ккал / 100 г • Б ${formatNumber(food.protein100)} • Ж ${formatNumber(food.fats100)} • В ${formatNumber(food.carbs100)} • Кл ${formatNumber(food.fiber100)}`;
  $("recordFoodImage").src = food.image;
  $("recordFoodImage").alt = food.name;
  $("recordCountInput").value = entry?.count || 1;
  $("recordGramsInput").value = Math.round(Number(entry?.gramsPerUnit || entry?.totalGrams || entry?.grams || 120));
  $("saveRecordBtn").textContent = state.editingEntryId ? "Зберегти" : "Записати";
  $("recordDeleteBtn").hidden = !state.editingEntryId;
  renderRecordPreview();
  openOverlay();
  $("recordModal").classList.remove("hidden");
}

function saveCurrentRecord() {
  if (!state.editingFood) return;
  const gramsPerUnit = Math.max(1, Number($("recordGramsInput").value) || 0);
  const count = Math.max(1, Number($("recordCountInput").value) || 1);
  const totalGrams = round1(gramsPerUnit * count);
  const nutrition = calculateEntryNutrition(state.editingFood, totalGrams);
  const entries = loadEntries(state.selectedDate);
  const payload = {
    id: state.editingEntryId || `e_${Date.now()}`,
    meal: state.recordMeal,
    foodId: state.editingFood.id,
    name: state.editingFood.name,
    image: state.editingFood.image,
    badge: state.editingFood.badge,
    type: state.editingFood.type,
    count,
    gramsPerUnit,
    totalGrams,
    kcal100: state.editingFood.kcal100,
    protein100: state.editingFood.protein100,
    carbs100: state.editingFood.carbs100,
    fats100: state.editingFood.fats100,
    fiber100: state.editingFood.fiber100,
    totalKcal: nutrition.totalKcal,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fats: nutrition.fats,
    fiber: nutrition.fiber,
    createdAt: Date.now()
  };
  if (state.editingEntryId) {
    const index = entries.findIndex(entry => entry.id === state.editingEntryId);
    if (index >= 0) {
      payload.createdAt = entries[index].createdAt || payload.createdAt;
      entries[index] = payload;
    } else {
      entries.unshift(payload);
    }
  } else {
    entries.unshift(payload);
  }
  saveEntries(entries, state.selectedDate);
  closeModal("recordModal");
  renderAll();
}

function deleteCurrentRecord() {
  if (!state.editingEntryId) {
    closeModal("recordModal");
    return;
  }
  const entries = loadEntries(state.selectedDate).filter(entry => entry.id !== state.editingEntryId);
  saveEntries(entries, state.selectedDate);
  closeModal("recordModal");
  renderAll();
}

function openAddSheet() {
  openOverlay();
  $("addSheet").classList.remove("hidden");
}

function openBalanceModal() {
  openOverlay();
  $("balanceModal").classList.remove("hidden");
}

function openSearchScreen() {
  openRootScreen("screenMeals");
  requestAnimationFrame(() => $("foodSearchInput").focus());
}

function bindEvents() {
  $("onboardingBackBtn").addEventListener("click", () => { if (state.onboardingStep > 1) setOnboardingStep(state.onboardingStep - 1); });
  $$('[data-next-step]').forEach(btn => btn.addEventListener('click', () => setOnboardingStep(Number(btn.dataset.nextStep))));
  $("skipTargetBtn")?.addEventListener("click", () => { state.targetWeightValue = state.weightValue || DEFAULT_PROFILE.targetWeight; setOnboardingStep(8); });
  $$('.choice-card[data-gender]').forEach(btn => btn.addEventListener('click', () => {
    state.selectedGender = btn.dataset.gender;
    $$('.choice-card[data-gender]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
  }));
  $$('.choice-card[data-goal]').forEach(btn => btn.addEventListener('click', () => {
    state.selectedGoal = btn.dataset.goal;
    $$('.choice-card[data-goal]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
  }));
  $$('.choice-detail-card[data-activity]').forEach(btn => btn.addEventListener('click', () => {
    state.selectedActivity = Number(btn.dataset.activity);
    $$('.choice-detail-card[data-activity]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
  }));
  $("finishOnboardingBtn").addEventListener("click", finishOnboarding);
  $("startAppBtn").addEventListener("click", openMainApp);
  $$('.dock-btn').forEach(btn => btn.addEventListener('click', () => openRootScreen(btn.dataset.openScreen)));
  $("mainFabBtn").addEventListener("click", openAddSheet);
  $("quickAddBtn").addEventListener("click", openAddSheet);
  $("openAddSheetBtn").addEventListener("click", openAddSheet);
  $("quickSearchBtn").addEventListener("click", openSearchScreen);
  $("quickProgressBtn").addEventListener("click", () => openRootScreen("screenProgress"));
  $("openProgressScreenBtn").addEventListener("click", () => openRootScreen("screenProgress"));
  $("quickBalanceBtn").addEventListener("click", openBalanceModal);
  $$('[data-close-sheet]').forEach(btn => btn.addEventListener('click', () => { $(btn.dataset.closeSheet).classList.add('hidden'); closeOverlay(); }));
  $$('[data-close-modal]').forEach(btn => btn.addEventListener('click', () => closeModal(btn.dataset.closeModal)));
  $("overlay").addEventListener("click", closeAllFloating);
  $("openBalanceModalBtn").addEventListener("click", openBalanceModal);
  $("streakInfoBtn").addEventListener("click", () => { openOverlay(); $("streakModal").classList.remove("hidden"); });
  $("openStreakModalBtn").addEventListener("click", () => { openOverlay(); $("streakModal").classList.remove("hidden"); });
  $("openCalendarBtn").addEventListener("click", () => { openOverlay(); $("calendarModal").classList.remove("hidden"); });
  $("prevMonthBtn").addEventListener("click", () => { state.currentMonth--; if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; } renderCalendar(); });
  $("nextMonthBtn").addEventListener("click", () => { state.currentMonth++; if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; } renderCalendar(); });
  $("foodSearchInput").addEventListener("input", renderMealsSearch);
  $("cancelSearchBtn").addEventListener("click", () => {
    $("foodSearchInput").value = "";
    renderMealsSearch();
    $("foodSearchInput").blur();
  });
  $("hideHintBtn").addEventListener("click", () => {
    setHintHidden(true);
    $("viewHintPill").classList.add("hidden");
  });
  $("saveRecordBtn").addEventListener("click", saveCurrentRecord);
  $("recordDeleteBtn").addEventListener("click", deleteCurrentRecord);
  $("recordCountInput").addEventListener("input", renderRecordPreview);
  $("recordGramsInput").addEventListener("input", renderRecordPreview);
  $("menuQuickAdd").addEventListener("click", () => { $("mealActionMenu").classList.add("hidden"); openRecordModalWithFood(FOOD_DB[0]); });
  $$('[data-add-meal]').forEach(btn => btn.addEventListener('click', () => { state.recordMeal = btn.dataset.addMeal; $("addSheet").classList.add("hidden"); openRecordModalWithFood(FOOD_DB[0]); }));
  $$('[data-add-now]').forEach(btn => btn.addEventListener('click', () => { state.recordMeal = 'Сніданок'; $("addSheet").classList.add("hidden"); openRecordModalWithFood(FOOD_DB[0]); }));
  $("quickWaterChip").addEventListener("click", () => { const current = loadWater(state.selectedDate); saveWater(round1(current + 0.25), state.selectedDate); closeModal("addSheet"); renderAll(); });
  $("quickWaterBtn").addEventListener("click", () => { const current = loadWater(state.selectedDate); saveWater(round1(current + 0.25), state.selectedDate); renderAll(); });
  $("quickWeightChip").addEventListener("click", () => { goToNested("screenProfileDetail"); closeModal("addSheet"); });
  $("waterPlusBtn").addEventListener("click", () => { const current = loadWater(state.selectedDate); saveWater(round1(current + 0.25), state.selectedDate); renderAll(); });
  $("editProfileBtn").addEventListener("click", () => goToNested("screenProfileDetail"));
  $("openProfileScreenBtn").addEventListener("click", () => goToNested("screenProfileDetail"));
  $("openGoalScreenBtn").addEventListener("click", () => goToNested("screenGoalDetail"));
  $("openGoalFromActivityBtn").addEventListener("click", () => goToNested("screenGoalDetail"));
  $("openPremiumBtn").addEventListener("click", () => goToNested("screenPremium"));
  $("openPremiumScreenBtn").addEventListener("click", () => goToNested("screenPremium"));
  $$('[data-back-to]').forEach(btn => btn.addEventListener('click', () => goBackTo(btn.dataset.backTo)));
  $("saveProfileBtn").addEventListener("click", () => {
    const profile = loadProfile();
    profile.name = $("profileNameInput").value.trim() || profile.name;
    profile.birthYear = Number($("profileBirthYearInput").value) || profile.birthYear;
    profile.height = Number($("profileHeightInput").value) || profile.height;
    profile.weight = Number($("profileWeightInput").value) || profile.weight;
    profile.targetWeight = Number($("profileTargetWeightInput").value) || profile.targetWeight;
    profile.waterGoalLiters = Number($("profileWaterGoalInput").value) || profile.waterGoalLiters;
    saveProfile(profile);
    renderAll();
    goBackTo("screenMore");
  });
  $("changeAvatarBtn").addEventListener("click", () => $("avatarInput").click());
  $("avatarInput").addEventListener("change", () => {
    const file = $("avatarInput").files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const profile = loadProfile();
      profile.avatar = e.target.result;
      saveProfile(profile);
      renderProfileScreens();
    };
    reader.readAsDataURL(file);
  });
}

function init() {
  const profile = loadProfile();
  state.selectedDate = getTodayKey();
  state.currentMonth = new Date().getMonth();
  state.currentYear = new Date().getFullYear();
  $("obName").value = profile.name || "";
  state.birthYearValue = profile.birthYear || 1994;
  state.heightValue = profile.height || 174;
  state.weightValue = profile.weight || 110;
  state.targetWeightValue = profile.targetWeight || 85;
  state.selectedGender = profile.gender;
  state.selectedGoal = profile.goal;
  state.selectedActivity = profile.activity;
  bindEvents();
  initWheelPickers();
  updateOnboardingProgress(1);
  if (profile.onboarded) {
    $("onboardingScreen").classList.remove("active");
    $("mainAppScreen").classList.add("active");
    renderAll();
    openRootScreen("screenView");
  } else {
    setOnboardingStep(1);
  }
}

init();
