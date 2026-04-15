(function () {
  const DEFAULT_MEAL = "Сніданок";

  function setRecordMeal(mealName) {
    if (!mealName) return;
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        state.recordMeal = mealName;
      }
    } catch {
      // Ignore if the legacy state binding is unavailable.
    }
  }

  function hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add("hidden");
    }
  }

  function closeOverlaySafely() {
    if (typeof closeOverlay === "function") {
      closeOverlay();
      return;
    }
    hideElement("overlay");
  }

  function resolveMealName(trigger) {
    if (!trigger) return DEFAULT_MEAL;
    if (trigger.dataset.meal) return trigger.dataset.meal;
    if (trigger.dataset.addMeal) return trigger.dataset.addMeal;
    if (trigger.matches("[data-add-now]")) return DEFAULT_MEAL;
    return DEFAULT_MEAL;
  }

  function collapseLauncherContext(trigger) {
    if (!trigger) return;

    if (trigger.id === "menuQuickAdd" || trigger.closest("#mealActionMenu")) {
      hideElement("mealActionMenu");
      closeOverlaySafely();
      return;
    }

    if (trigger.matches("[data-add-meal], [data-add-now]") || trigger.closest("#addSheet")) {
      hideElement("addSheet");
      closeOverlaySafely();
    }
  }

  function launchMealSearch(trigger) {
    setRecordMeal(resolveMealName(trigger));
    collapseLauncherContext(trigger);

    window.setTimeout(() => {
      if (typeof openSearchScreen === "function") {
        openSearchScreen();
      }
      if (typeof window.renderMealsSearch === "function") {
        window.renderMealsSearch();
      }
    }, 0);
  }

  function bindMealLauncher(element) {
    if (!element || element.dataset.mealPlusHotfix === "1") return;
    element.dataset.mealPlusHotfix = "1";

    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
      launchMealSearch(element);
    }, true);
  }

  function bindMealLaunchers(root) {
    (root || document)
      .querySelectorAll(".meal-plus-btn, [data-add-meal], [data-add-now], #menuQuickAdd")
      .forEach(bindMealLauncher);
  }

  const originalRenderAll = typeof window.renderAll === "function" ? window.renderAll : null;
  if (originalRenderAll && window.__mealPlusHotfixWrapped !== "1") {
    window.__mealPlusHotfixWrapped = "1";
    window.renderAll = function () {
      originalRenderAll();
      bindMealLaunchers(document);
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => bindMealLaunchers(document), { once: true });
  } else {
    bindMealLaunchers(document);
  }
})();
