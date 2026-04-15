(function () {
  const catalog = Array.isArray(window.CALORIE_FOOD_CATALOG) && window.CALORIE_FOOD_CATALOG.length
    ? window.CALORIE_FOOD_CATALOG.map((food) => ({ ...food }))
    : Array.isArray(window.FOOD_DB)
      ? window.FOOD_DB.map((food) => ({ ...food }))
      : [];

  if (!catalog.length) return;

  const foodMap = new Map(catalog.map((food) => [food.id, { ...food }]));

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
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildPlaceholder(label) {
    const safeLabel = String(label || "🍽").slice(0, 2);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f5d5e0"/><stop offset="1" stop-color="#7b337e"/></linearGradient></defs><rect width="160" height="160" rx="34" fill="url(#g)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="60">${safeLabel}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function getFallbackImage(food) {
    return buildPlaceholder(food?.badge || food?.name?.slice(0, 1) || "🍽");
  }

  function findCatalogFood(input) {
    if (!input) return null;
    if (typeof input === "string") {
      return foodMap.get(input) || catalog.find((food) => food.name === input) || null;
    }
    return foodMap.get(input.id) || catalog.find((food) => food.name === input.name) || null;
  }

  function normalizeFood(food) {
    if (!food) return null;
    const catalogFood = findCatalogFood(food);
    const merged = { ...(catalogFood || {}), ...food };
    if (!merged.image) merged.image = getFallbackImage(merged);
    if (!merged.badge) merged.badge = "🍽";
    if (!merged.type) merged.type = "Продукт";
    if (!merged.servingGrams) merged.servingGrams = 100;
    if (!merged.servingLabel) merged.servingLabel = `${merged.servingGrams} г`;
    if (!Array.isArray(merged.keywords)) merged.keywords = [];
    return merged;
  }

  function enrichEntry(entry) {
    if (!entry) return null;
    const food = normalizeFood(findCatalogFood({ id: entry.foodId, name: entry.name }) || entry);
    const count = Math.max(1, Number(entry.count || 1));
    const gramsPerUnit = Math.max(1, Number(entry.gramsPerUnit || food?.servingGrams || entry.grams || 100));
    const totalGrams = round1Local(Number(entry.totalGrams || gramsPerUnit * count || 0));
    const nutrition = typeof window.calculateEntryNutrition === "function"
      ? window.calculateEntryNutrition(food, totalGrams)
      : {
          totalKcal: Number(entry.totalKcal || 0),
          protein: Number(entry.protein || 0),
          carbs: Number(entry.carbs || 0),
          fats: Number(entry.fats || 0),
          fiber: Number(entry.fiber || 0)
        };

    return {
      ...entry,
      ...food,
      id: entry.id,
      meal: entry.meal,
      foodId: entry.foodId || food.id,
      count,
      gramsPerUnit,
      totalGrams,
      totalKcal: Number(entry.totalKcal ?? nutrition.totalKcal ?? 0),
      protein: Number(entry.protein ?? nutrition.protein ?? 0),
      carbs: Number(entry.carbs ?? nutrition.carbs ?? 0),
      fats: Number(entry.fats ?? nutrition.fats ?? 0),
      fiber: Number(entry.fiber ?? nutrition.fiber ?? 0),
      createdAt: entry.createdAt || Date.now(),
      image: entry.image || food.image || getFallbackImage(food)
    };
  }

  function hydrateFallbackImages(root) {
    (root || document).querySelectorAll("img[data-fallback-src]").forEach((img) => {
      if (img.dataset.fallbackBound === "1") return;
      img.dataset.fallbackBound = "1";
      img.addEventListener("error", () => {
        if (!img.dataset.fallbackSrc || img.src === img.dataset.fallbackSrc) return;
        img.src = img.dataset.fallbackSrc;
      });
    });
  }

  function scoreFood(food, query) {
    if (!query) return 1;
    const name = String(food.name || "").toLowerCase();
    const haystack = `${food.name || ""} ${food.type || ""} ${(food.keywords || []).join(" ")}`.toLowerCase();
    if (name === query) return 200;
    if (name.startsWith(query)) return 130;

    let score = haystack.includes(query) ? 80 : 0;
    query.split(/\s+/).filter(Boolean).forEach((token) => {
      if (name.includes(token)) score += 25;
      else if (haystack.includes(token)) score += 10;
    });
    return score;
  }

  function getSearchResults(query) {
    const lowered = String(query || "").trim().toLowerCase();
    return catalog
      .map((food) => normalizeFood(food))
      .map((food) => ({ food, score: scoreFood(food, lowered) }))
      .filter(({ score }) => (lowered ? score > 0 : true))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.food.name.localeCompare(b.food.name, "uk");
      })
      .slice(0, 24)
      .map(({ food }) => food);
  }

  const originalGetFoodById = typeof window.getFoodById === "function" ? window.getFoodById : null;
  window.getFoodById = function (id) {
    return normalizeFood(findCatalogFood(id) || (originalGetFoodById ? originalGetFoodById(id) : null));
  };

  const originalGetFoodFromEntry = typeof window.getFoodFromEntry === "function" ? window.getFoodFromEntry : null;
  window.getFoodFromEntry = function (entry) {
    const baseFood = originalGetFoodFromEntry ? originalGetFoodFromEntry(entry) : entry;
    return normalizeFood({ ...(baseFood || {}), ...(entry || {}) });
  };

  const originalFindEntry = typeof window.findEntry === "function" ? window.findEntry : null;
  window.findEntry = function (entryId, dateKey) {
    const entry = originalFindEntry ? originalFindEntry(entryId, dateKey) : null;
    return entry ? enrichEntry(entry) : null;
  };

  const originalGetEntriesTotals = typeof window.getEntriesTotals === "function" ? window.getEntriesTotals : null;
  window.getEntriesTotals = function (dateKey) {
    const base = originalGetEntriesTotals
      ? originalGetEntriesTotals(dateKey)
      : { entries: typeof window.loadEntries === "function" ? window.loadEntries(dateKey) : [] };
    const entries = Array.isArray(base.entries) ? base.entries.map(enrichEntry).filter(Boolean) : [];
    const mealMap = {};
    if (base.mealMap && typeof base.mealMap === "object") {
      Object.keys(base.mealMap).forEach((key) => {
        mealMap[key] = [];
      });
    }

    let kcal = 0;
    entries.forEach((entry) => {
      kcal += Number(entry.totalKcal || 0);
      if (!mealMap[entry.meal]) mealMap[entry.meal] = [];
      mealMap[entry.meal].push(entry);
    });

    return { ...base, entries, mealMap, kcal };
  };

  const originalCalculateMacrosFromEntries = typeof window.calculateMacrosFromEntries === "function"
    ? window.calculateMacrosFromEntries
    : null;
  window.calculateMacrosFromEntries = function (entries) {
    const normalizedEntries = Array.isArray(entries) ? entries.map(enrichEntry).filter(Boolean) : [];
    if (originalCalculateMacrosFromEntries) {
      return originalCalculateMacrosFromEntries(normalizedEntries);
    }

    return normalizedEntries.reduce((acc, entry) => ({
      protein: round1Local(acc.protein + Number(entry.protein || 0)),
      carbs: round1Local(acc.carbs + Number(entry.carbs || 0)),
      fats: round1Local(acc.fats + Number(entry.fats || 0)),
      fiber: round1Local(acc.fiber + Number(entry.fiber || 0))
    }), { protein: 0, carbs: 0, fats: 0, fiber: 0 });
  };

  const originalOpenRecordModalWithFood = typeof window.openRecordModalWithFood === "function"
    ? window.openRecordModalWithFood
    : null;
  if (originalOpenRecordModalWithFood) {
    window.openRecordModalWithFood = function (food, options = {}) {
      const normalizedFood = normalizeFood(food);
      originalOpenRecordModalWithFood(normalizedFood, options);
      window.requestAnimationFrame(() => {
        const gramsInput = document.getElementById("recordGramsInput");
        const recordMeta = document.getElementById("recordFoodMeta");
        const recordImage = document.getElementById("recordFoodImage");

        if (recordImage && normalizedFood) {
          recordImage.dataset.fallbackSrc = getFallbackImage(normalizedFood);
          hydrateFallbackImages(document.getElementById("recordModal") || document);
        }

        if (gramsInput && !options.entry && normalizedFood?.servingGrams) {
          gramsInput.value = String(Math.round(normalizedFood.servingGrams));
        }

        if (recordMeta && normalizedFood) {
          recordMeta.textContent = `${normalizedFood.kcal100} ккал / 100 г • Б ${formatNumberLocal(normalizedFood.protein100)} • Ж ${formatNumberLocal(normalizedFood.fats100)} • В ${formatNumberLocal(normalizedFood.carbs100)} • ${normalizedFood.servingLabel}`;
        }

        if (typeof window.renderRecordPreview === "function") {
          window.renderRecordPreview();
        }
      });
    };
  }

  window.renderMealsSearch = function () {
    const list = document.getElementById("searchResultsList");
    const input = document.getElementById("foodSearchInput");
    if (!list || !input) return;

    const results = getSearchResults(input.value);
    if (!results.length) {
      list.innerHTML = '<div class="search-empty-state"><strong>Нічого не знайдено</strong><span>Спробуй іншу назву продукту або напою.</span></div>';
      return;
    }

    list.innerHTML = results.map((food) => {
      const fallback = getFallbackImage(food);
      return `
        <div class="search-row">
          <img src="${escapeHtmlLocal(food.image)}" alt="${escapeHtmlLocal(food.name)}" loading="lazy" data-fallback-src="${fallback}">
          <div class="search-row-body">
            <div class="search-row-top">
              <div class="search-row-title">${escapeHtmlLocal(food.name)} <span class="search-row-tag">${escapeHtmlLocal(food.badge)}</span></div>
              <div class="search-row-serving">${escapeHtmlLocal(food.servingLabel)}</div>
            </div>
            <div class="search-row-sub">${food.kcal100} ккал / 100 г • Б ${formatNumberLocal(food.protein100)} • Ж ${formatNumberLocal(food.fats100)} • В ${formatNumberLocal(food.carbs100)}</div>
          </div>
          <button class="search-plus" type="button" data-food-id="${escapeHtmlLocal(food.id)}">＋</button>
        </div>`;
    }).join("");

    list.querySelectorAll(".search-plus").forEach((button) => {
      button.addEventListener("click", () => {
        const food = normalizeFood(findCatalogFood(button.dataset.foodId));
        if (food && typeof window.openRecordModalWithFood === "function") {
          window.openRecordModalWithFood(food);
        }
      });
    });

    hydrateFallbackImages(list);
  };

  function renderOverviewSummary() {
    const summary = document.getElementById("todayMealsSummary");
    if (!summary || typeof window.getEntriesTotals !== "function") return;

    const totals = window.getEntriesTotals();
    const entries = Array.isArray(totals.entries)
      ? [...totals.entries].sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))
      : [];

    summary.classList.add("food-overview-host");

    if (!entries.length) {
      summary.innerHTML = '<div class="food-overview-empty"><strong>Ще немає записів за день</strong><span>Додай продукт через пошук, і тут одразу з’являться фото, порції та калорії.</span></div>';
      return;
    }

    const macros = typeof window.calculateMacrosFromEntries === "function"
      ? window.calculateMacrosFromEntries(entries)
      : { protein: 0, fats: 0, carbs: 0 };

    summary.innerHTML = `
      <div class="food-overview-board">
        <div class="food-overview-head">
          <strong>${entries.length} записів • ${totals.kcal} ккал</strong>
          <span class="food-overview-caption">Б ${formatNumberLocal(macros.protein)} • Ж ${formatNumberLocal(macros.fats)} • В ${formatNumberLocal(macros.carbs)}</span>
        </div>
        <div class="food-overview-strip">
          ${entries.slice(0, 6).map((entry) => {
            const food = normalizeFood(entry);
            const fallback = getFallbackImage(food);
            return `
              <button class="food-overview-item" type="button" data-overview-entry="${escapeHtmlLocal(entry.id)}">
                <img src="${escapeHtmlLocal(food.image)}" alt="${escapeHtmlLocal(food.name)}" loading="lazy" data-fallback-src="${fallback}">
                <span class="food-overview-item-name">${escapeHtmlLocal(food.name)}</span>
                <span class="food-overview-item-meta">${formatNumberLocal(entry.totalGrams)} г • ${escapeHtmlLocal(entry.meal || "Прийом їжі")}</span>
                <span class="food-overview-item-kcal">${entry.totalKcal} ккал</span>
              </button>`;
          }).join("")}
        </div>
      </div>`;

    summary.querySelectorAll("[data-overview-entry]").forEach((button) => {
      button.addEventListener("click", () => {
        const entry = typeof window.findEntry === "function" ? window.findEntry(button.dataset.overviewEntry) : null;
        if (!entry || typeof window.openRecordModalWithFood !== "function") return;
        const food = typeof window.getFoodFromEntry === "function" ? window.getFoodFromEntry(entry) : entry;
        window.openRecordModalWithFood(food, { entry });
      });
    });

    hydrateFallbackImages(summary);
  }

  function scheduleSearchRedirect() {
    window.setTimeout(() => {
      if (typeof window.openSearchScreen === "function") {
        window.openSearchScreen();
      }
      if (typeof window.renderMealsSearch === "function") {
        window.renderMealsSearch();
      }
    }, 0);
  }

  function bindDelayedSearchRedirect(element) {
    if (!element || element.dataset.foodFlowRedirect === "1") return;
    element.dataset.foodFlowRedirect = "1";
    element.addEventListener("click", scheduleSearchRedirect);
  }

  function bindSearchRefresh(element) {
    if (!element || element.dataset.foodFlowRefresh === "1") return;
    element.dataset.foodFlowRefresh = "1";
    element.addEventListener("click", () => {
      window.requestAnimationFrame(() => {
        if (typeof window.renderMealsSearch === "function") {
          window.renderMealsSearch();
        }
      });
    });
  }

  function bindPostRecordSync(element) {
    if (!element || element.dataset.foodFlowPostSync === "1") return;
    element.dataset.foodFlowPostSync = "1";
    element.addEventListener("click", () => {
      window.setTimeout(() => {
        if (typeof window.renderMealsSearch === "function") {
          window.renderMealsSearch();
        }
        renderOverviewSummary();
      }, 0);
    });
  }

  function enhanceInteractiveZones() {
    document.querySelectorAll(".meal-plus-btn, [data-add-meal], [data-add-now]").forEach(bindDelayedSearchRedirect);
    bindDelayedSearchRedirect(document.getElementById("menuQuickAdd"));
    bindSearchRefresh(document.getElementById("quickSearchBtn"));
    bindSearchRefresh(document.getElementById("openMealsScreenBtn"));
    bindSearchRefresh(document.getElementById("cancelSearchBtn"));
    bindPostRecordSync(document.getElementById("saveRecordBtn"));
    bindPostRecordSync(document.getElementById("recordDeleteBtn"));

    const searchInput = document.getElementById("foodSearchInput");
    if (searchInput && searchInput.dataset.foodFlowInput !== "1") {
      searchInput.dataset.foodFlowInput = "1";
      searchInput.addEventListener("input", () => {
        if (typeof window.renderMealsSearch === "function") {
          window.renderMealsSearch();
        }
      });
    }
  }

  const originalRenderAll = typeof window.renderAll === "function" ? window.renderAll : null;
  if (originalRenderAll) {
    window.renderAll = function () {
      originalRenderAll();
      enhanceInteractiveZones();
      if (typeof window.renderMealsSearch === "function") {
        window.renderMealsSearch();
      }
      renderOverviewSummary();
    };
  }

  enhanceInteractiveZones();
  if (typeof window.renderMealsSearch === "function") {
    window.renderMealsSearch();
  }
  renderOverviewSummary();
})();
