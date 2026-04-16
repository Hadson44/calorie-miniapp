(function () {
  const DEFAULT_MEAL = "Сніданок";
  const MEAL_NAMES = [
    "Сніданок",
    "Перекус",
    "Обід",
    "Другий перекус",
    "Вечеря",
    "Третій перекус"
  ];
  const SUPPRESS_MS = 650;
  let suppressUntil = 0;
  let activeTouch = null;

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function safeHide(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add("hidden");
    }
  }

  function safeCloseOverlay() {
    if (typeof closeOverlay === "function") {
      closeOverlay();
      return;
    }
    safeHide("overlay");
  }

  function safeSetRecordMeal(mealName) {
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        state.recordMeal = mealName || DEFAULT_MEAL;
      }
    } catch {
      // Ignore unavailable legacy state binding.
    }
  }

  function findMealInText(text) {
    const normalized = normalizeText(text).toLowerCase();
    return MEAL_NAMES.find((meal) => normalized.includes(meal.toLowerCase())) || DEFAULT_MEAL;
  }

  function resolveMealFromButton(button) {
    const datasetMeal = button?.dataset?.meal
      || button?.dataset?.addMeal
      || button?.closest?.("[data-meal]")?.dataset?.meal
      || button?.closest?.("[data-add-meal]")?.dataset?.addMeal;
    if (datasetMeal) return datasetMeal;

    const mealCard = button?.closest?.(".meal-card, .meal-card-shell, .meal-block, .meal-section, .meal-row, .card");
    return findMealInText(mealCard?.textContent || "");
  }

  function resolvePlusButton(node) {
    const element = node instanceof Element ? node : null;
    if (!element) return null;

    const button = element.closest("button");
    if (!button) return null;
    if (button.matches(".meal-menu-btn")) return null;
    if (button.id === "mainFabBtn" || button.id === "quickAddBtn" || button.id === "quickWaterBtn" || button.id === "quickBalanceBtn" || button.id === "quickProgressBtn" || button.id === "waterPlusBtn") return null;
    if (button.closest("#addSheet, #mealActionMenu, #searchResultsList, #recordModal, .bottom-dock, .quick-action-row")) return null;
    if (button.matches(".meal-plus-btn")) return button;

    const label = normalizeText(button.textContent).replace(/\s+/g, "");
    if (label !== "+" && label !== "＋") return null;

    const mealCard = button.closest(".meal-card, .meal-card-shell, .meal-block, .meal-section, .meal-row, .card");
    if (!mealCard) return null;

    const cardText = normalizeText(mealCard.textContent);
    const cardHasMeal = MEAL_NAMES.some((meal) => cardText.includes(meal));
    return cardHasMeal ? button : null;
  }

  function getPointFromEvent(event) {
    if (event.changedTouches && event.changedTouches.length) {
      return {
        x: event.changedTouches[0].clientX,
        y: event.changedTouches[0].clientY
      };
    }
    if (typeof event.clientX === "number" && typeof event.clientY === "number") {
      return { x: event.clientX, y: event.clientY };
    }
    return null;
  }

  function resolveButtonFromEvent(event) {
    const direct = resolvePlusButton(event.target);
    if (direct) return direct;

    const point = getPointFromEvent(event);
    if (!point) return null;
    return resolvePlusButton(document.elementFromPoint(point.x, point.y));
  }

  function swallow(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
  }

  function openMealSearch(button) {
    safeSetRecordMeal(resolveMealFromButton(button));
    safeHide("mealActionMenu");
    safeHide("addSheet");
    safeCloseOverlay();

    window.requestAnimationFrame(() => {
      if (typeof openSearchScreen === "function") {
        openSearchScreen();
      }
      if (typeof window.renderMealsSearch === "function") {
        window.renderMealsSearch();
      }
    });
  }

  function tryHandle(event) {
    const button = resolveButtonFromEvent(event);
    if (!button) return false;

    swallow(event);
    const now = Date.now();
    if (now < suppressUntil) return true;

    suppressUntil = now + SUPPRESS_MS;
    openMealSearch(button);
    return true;
  }

  function rememberTouchStart(event) {
    const button = resolveButtonFromEvent(event);
    if (!button) {
      activeTouch = null;
      return;
    }

    const point = getPointFromEvent(event);
    activeTouch = {
      button,
      x: point?.x || 0,
      y: point?.y || 0,
      moved: false
    };
  }

  function trackTouchMove(event) {
    if (!activeTouch) return;

    const point = getPointFromEvent(event);
    if (!point) return;
    if (Math.abs(point.x - activeTouch.x) > 12 || Math.abs(point.y - activeTouch.y) > 12) {
      activeTouch.moved = true;
    }
  }

  function handleTouchEnd(event) {
    if (!activeTouch) {
      tryHandle(event);
      return;
    }

    const button = resolveButtonFromEvent(event) || activeTouch.button;
    const moved = activeTouch.moved;
    activeTouch = null;

    if (!button || moved) return;

    swallow(event);
    const now = Date.now();
    if (now < suppressUntil) return;

    suppressUntil = now + SUPPRESS_MS;
    openMealSearch(button);
  }

  function bindGlobalDelegates() {
    if (document.body.dataset.mealTouchFixBound === "1") return;
    document.body.dataset.mealTouchFixBound = "1";

    document.addEventListener("touchstart", rememberTouchStart, true);
    document.addEventListener("touchmove", trackTouchMove, true);
    document.addEventListener("touchend", handleTouchEnd, true);
    document.addEventListener("pointerup", tryHandle, true);
    document.addEventListener("click", tryHandle, true);
  }

  function markButtons(root) {
    (root || document).querySelectorAll(".meal-plus-btn").forEach((button) => {
      if (button.dataset.mealTouchFix === "1") return;
      button.dataset.mealTouchFix = "1";
      button.setAttribute("type", "button");
      const mealName = resolveMealFromButton(button);
      button.setAttribute("aria-label", `Додати продукт до ${mealName}`);
    });
  }

  bindGlobalDelegates();

  const originalRenderAll = typeof window.renderAll === "function" ? window.renderAll : null;
  if (originalRenderAll && window.__mealPlusTouchFixWrapped !== "1") {
    window.__mealPlusTouchFixWrapped = "1";
    window.renderAll = function () {
      originalRenderAll();
      markButtons(document);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => markButtons(document), { once: true });
  } else {
    markButtons(document);
  }
})();
