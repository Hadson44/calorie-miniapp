(function () {
  const RECENTS_KEY = "neon_calorie_recent_foods_v1";
  const RECENT_LIMIT = 8;
  const DEFAULT_MEAL = "Сніданок";
  const MEAL_CHOICES = [
    { key: "Сніданок", emoji: "🥣" },
    { key: "Перекус", emoji: "🥪" },
    { key: "Обід", emoji: "🍛" },
    { key: "Другий перекус", emoji: "🥪" },
    { key: "Вечеря", emoji: "🍽️" },
    { key: "Третій перекус", emoji: "🍽️" }
  ];

  function round1Local(value) {
    return Math.round((Number(value) || 0) * 10) / 10;
  }

  function formatNumberLocal(value) {
    const rounded = round1Local(value);
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, "");
  }

  function escapeHtmlLocal(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildPlaceholder(label) {
    const safeLabel = String(label || "🍽️").slice(0, 2);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f5d5e0"/><stop offset="1" stop-color="#7b337e"/></linearGradient></defs><rect width="160" height="160" rx="34" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="60">${safeLabel}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function hydrateFallbackImages(root) {
    (root || document).querySelectorAll("img[data-fallback-src]").forEach((img) => {
      if (img.dataset.upgradeFallbackBound === "1") return;
      img.dataset.upgradeFallbackBound = "1";
      img.addEventListener("error", () => {
        if (!img.dataset.fallbackSrc || img.src === img.dataset.fallbackSrc) return;
        img.src = img.dataset.fallbackSrc;
      });
    });
  }

  function getMealMeta(mealName) {
    return MEAL_CHOICES.find((item) => item.key === mealName) || { key: mealName || DEFAULT_MEAL, emoji: "🍽️" };
  }

  function getUnitLabel(food) {
    return /мл/i.test(food?.servingLabel || "") ? "мл" : "г";
  }

  function safeGetStateValue(key, fallback) {
    try {
      if (typeof state !== "undefined" && state && typeof state === "object" && state[key] != null) {
        return state[key];
      }
    } catch {
      // Ignore unavailable legacy state binding.
    }
    return fallback;
  }

  function safeSetStateValue(key, value) {
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        state[key] = value;
      }
    } catch {
      // Ignore unavailable legacy state binding.
    }
  }

  function getCurrentMeal() {
    return safeGetStateValue("recordMeal", DEFAULT_MEAL) || DEFAULT_MEAL;
  }

  function getEditingFood() {
    return safeGetStateValue("editingFood", null);
  }

  function readRecents() {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && item.foodId)
        .map((item) => ({
          foodId: item.foodId,
          meal: item.meal || DEFAULT_MEAL,
          gramsPerUnit: Math.max(1, Number(item.gramsPerUnit || 100)),
          count: Math.max(1, Number(item.count || 1)),
          updatedAt: Number(item.updatedAt || 0)
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, RECENT_LIMIT);
    } catch {
      return [];
    }
  }

  function writeRecents(items) {
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(items.slice(0, RECENT_LIMIT)));
    } catch {
      // Ignore storage quota errors.
    }
  }

  function rememberFoodDraft(draft) {
    if (!draft || !draft.foodId) return;
    const nextItem = {
      foodId: draft.foodId,
      meal: draft.meal || DEFAULT_MEAL,
      gramsPerUnit: Math.max(1, Number(draft.gramsPerUnit || 100)),
      count: Math.max(1, Number(draft.count || 1)),
      updatedAt: Date.now()
    };
    const items = readRecents().filter((item) => item.foodId !== nextItem.foodId);
    writeRecents([nextItem, ...items]);
  }

  function rememberCurrentModalDraft() {
    const food = getEditingFood();
    if (!food || !food.id) return;
    const gramsInput = document.getElementById("recordGramsInput");
    const countInput = document.getElementById("recordCountInput");
    rememberFoodDraft({
      foodId: food.id,
      meal: getCurrentMeal(),
      gramsPerUnit: Number(gramsInput?.value || food.servingGrams || 100),
      count: Number(countInput?.value || 1)
    });
  }

  function getRecentItems() {
    return readRecents()
      .map((item) => {
        const food = typeof window.getFoodById === "function" ? window.getFoodById(item.foodId) : null;
        if (!food) return null;
        return { ...item, food };
      })
      .filter(Boolean);
  }

  function syncRecordMealTitle() {
    const title = document.getElementById("recordMealTitle");
    if (!title) return;
    const meal = getMealMeta(getCurrentMeal());
    title.textContent = `${meal.emoji} ${meal.key}`;
  }

  function ensureSection(afterElement, id, className, labelText) {
    if (!afterElement || !afterElement.parentNode) return null;
    let section = document.getElementById(id);
    if (!section) {
      section = document.createElement("div");
      section.id = id;
      section.className = className;
      section.innerHTML = `<div class="record-chip-caption">${labelText}</div><div class="record-chip-row"></div>`;
      afterElement.insertAdjacentElement("afterend", section);
    }
    return section;
  }

  function renderMealSelector() {
    const dateCard = document.querySelector("#recordModal .record-date-card");
    const section = ensureSection(dateCard, "recordMealSwitchSection", "record-chip-section record-meal-section", "Куди записати");
    if (!section) return;

    const row = section.querySelector(".record-chip-row");
    const currentMeal = getCurrentMeal();
    row.innerHTML = MEAL_CHOICES.map((meal) => `
      <button class="record-chip ${meal.key === currentMeal ? "active" : ""}" type="button" data-record-meal="${escapeHtmlLocal(meal.key)}">
        <span>${meal.emoji}</span>
        <span>${escapeHtmlLocal(meal.key)}</span>
      </button>`).join("");

    row.querySelectorAll("[data-record-meal]").forEach((button) => {
      button.addEventListener("click", () => {
        safeSetStateValue("recordMeal", button.dataset.recordMeal);
        syncRecordMealTitle();
        if (typeof window.renderRecordPreview === "function") {
          window.renderRecordPreview();
        }
        renderMealSelector();
      });
    });
  }

  function renderPortionPresets() {
    const inputs = document.querySelector("#recordModal .record-food-inputs");
    const food = getEditingFood();
    if (!inputs || !food) return;

    const section = ensureSection(inputs, "recordPortionSection", "record-chip-section record-portion-section", "Швидкі порції");
    if (!section) return;

    const row = section.querySelector(".record-chip-row");
    const gramsInput = document.getElementById("recordGramsInput");
    const countInput = document.getElementById("recordCountInput");
    const currentGrams = Math.max(1, Number(gramsInput?.value || food.servingGrams || 100));
    const currentCount = Math.max(1, Number(countInput?.value || 1));
    const servingGrams = Math.max(1, Number(food.servingGrams || 100));
    const unit = getUnitLabel(food);
    const hundredLabel = unit === "мл" ? "100 мл" : "100 г";

    const presets = [
      { label: "1/2 порції", count: 1, grams: Math.max(1, Math.round(servingGrams / 2)) },
      { label: "1 порція", count: 1, grams: Math.round(servingGrams) },
      { label: "2 порції", count: 2, grams: Math.round(servingGrams) },
      { label: hundredLabel, count: 1, grams: 100 }
    ];

    row.innerHTML = presets.map((preset) => {
      const isActive = preset.count === currentCount && preset.grams === currentGrams;
      return `<button class="record-chip ${isActive ? "active" : ""}" type="button" data-portion-count="${preset.count}" data-portion-grams="${preset.grams}">${preset.label}</button>`;
    }).join("");

    row.querySelectorAll("[data-portion-count]").forEach((button) => {
      button.addEventListener("click", () => {
        if (countInput) countInput.value = button.dataset.portionCount;
        if (gramsInput) gramsInput.value = button.dataset.portionGrams;
        if (typeof window.renderRecordPreview === "function") {
          window.renderRecordPreview();
        }
        renderPortionPresets();
      });
    });
  }

  function applyRecentDraft(draft) {
    if (!draft) return;
    const countInput = document.getElementById("recordCountInput");
    const gramsInput = document.getElementById("recordGramsInput");
    if (countInput) countInput.value = String(Math.max(1, Number(draft.count || 1)));
    if (gramsInput) gramsInput.value = String(Math.max(1, Number(draft.gramsPerUnit || 100)));
    safeSetStateValue("recordMeal", draft.meal || getCurrentMeal());
    syncRecordMealTitle();
  }

  function refreshRecordEnhancements(options = {}) {
    syncRecordMealTitle();
    renderMealSelector();
    if (options.__recentDraft) {
      applyRecentDraft(options.__recentDraft);
    }
    renderPortionPresets();
    if (typeof window.renderRecordPreview === "function") {
      window.renderRecordPreview();
    }
  }

  function bindRecordControls() {
    const saveButton = document.getElementById("saveRecordBtn");
    if (saveButton && saveButton.dataset.upgradeRecentSave !== "1") {
      saveButton.dataset.upgradeRecentSave = "1";
      saveButton.addEventListener("click", rememberCurrentModalDraft, true);
    }

    ["recordCountInput", "recordGramsInput"].forEach((id) => {
      const input = document.getElementById(id);
      if (!input || input.dataset.upgradePortionSync === "1") return;
      input.dataset.upgradePortionSync = "1";
      input.addEventListener("input", () => {
        window.requestAnimationFrame(() => {
          renderPortionPresets();
        });
      });
    });
  }

  function openRecentFood(recentItem) {
    const food = recentItem?.food;
    if (!food || typeof window.openRecordModalWithFood !== "function") return;
    safeSetStateValue("recordMeal", getCurrentMeal());
    window.openRecordModalWithFood(food, { __recentDraft: recentItem });
  }

  function renderRecentBoard(list, query) {
    if (!list || query) return;
    const recentItems = getRecentItems();
    if (!recentItems.length) return;

    const recentMap = new Map(recentItems.map((item) => [item.food.id, item]));
    const markup = `
      <div class="search-recent-board" id="searchRecentBoard">
        <div class="search-recent-head">
          <strong>Нещодавно додавали</strong>
          <span>Швидко повторюй типові записи без нового пошуку.</span>
        </div>
        <div class="search-recent-strip">
          ${recentItems.map((item) => {
            const fallback = buildPlaceholder(item.food.badge || item.food.name?.slice(0, 1) || "💧");
            const total = formatNumberLocal(item.count * item.gramsPerUnit);
            return `
              <button class="recent-food-card" type="button" data-recent-food="${escapeHtmlLocal(item.food.id)}">
                <img src="${escapeHtmlLocal(item.food.image)}" alt="${escapeHtmlLocal(item.food.name)}" loading="lazy" data-fallback-src="${fallback}">
                <span class="recent-food-name">${escapeHtmlLocal(item.food.name)}</span>
                <span class="recent-food-meta">${escapeHtmlLocal(item.meal)} • ${total} ${getUnitLabel(item.food)}</span>
              </button>`;
          }).join("")}
        </div>
      </div>`;

    list.insertAdjacentHTML("afterbegin", markup);
    const board = list.querySelector("#searchRecentBoard");
    board?.querySelectorAll("[data-recent-food]").forEach((button) => {
      button.addEventListener("click", () => {
        const recentItem = recentMap.get(button.dataset.recentFood);
        if (recentItem) {
          openRecentFood(recentItem);
        }
      });
    });
    hydrateFallbackImages(board);
  }

  function patchSearchRenderer() {
    if (window.__foodFlowUpgradeSearch === "1" || typeof window.renderMealsSearch !== "function") return;
    window.__foodFlowUpgradeSearch = "1";
    const originalRenderMealsSearch = window.renderMealsSearch;
    window.renderMealsSearch = function () {
      originalRenderMealsSearch();
      const list = document.getElementById("searchResultsList");
      const input = document.getElementById("foodSearchInput");
      renderRecentBoard(list, input?.value?.trim());
    };
  }

  function patchRecordModal() {
    if (window.__foodFlowUpgradeRecord === "1" || typeof window.openRecordModalWithFood !== "function") return;
    window.__foodFlowUpgradeRecord = "1";
    const originalOpenRecordModalWithFood = window.openRecordModalWithFood;
    window.openRecordModalWithFood = function (food, options = {}) {
      originalOpenRecordModalWithFood(food, options);
      window.requestAnimationFrame(() => {
        refreshRecordEnhancements(options);
      });
    };
  }

  function patchRenderAll() {
    if (window.__foodFlowUpgradeRenderAll === "1" || typeof window.renderAll !== "function") return;
    window.__foodFlowUpgradeRenderAll = "1";
    const originalRenderAll = window.renderAll;
    window.renderAll = function () {
      originalRenderAll();
      bindRecordControls();
      if (!document.getElementById("recordModal")?.classList.contains("hidden")) {
        refreshRecordEnhancements();
      }
    };
  }

  patchSearchRenderer();
  patchRecordModal();
  patchRenderAll();
  bindRecordControls();

  if (!document.getElementById("recordModal")?.classList.contains("hidden")) {
    refreshRecordEnhancements();
  }
})();
