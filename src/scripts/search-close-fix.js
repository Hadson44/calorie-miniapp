(function () {
  const DEFAULT_RETURN_SCREEN = "screenView";

  function getSearchInput() {
    return document.getElementById("foodSearchInput");
  }

  function getCancelButton() {
    return document.getElementById("cancelSearchBtn");
  }

  function getActiveScreenId() {
    const active = document.querySelector("#mainAppScreen .tab-screen.active");
    return active?.id || null;
  }

  function rerenderSearch() {
    if (typeof window.renderMealsSearch === "function") {
      window.renderMealsSearch();
    }
  }

  function blurSearchInput() {
    const input = getSearchInput();
    if (input) {
      input.blur();
    }
    if (document.activeElement && typeof document.activeElement.blur === "function") {
      document.activeElement.blur();
    }
  }

  function rememberReturnScreen(screenId) {
    if (!screenId || screenId === "screenMeals") return;
    window.__searchReturnScreen = screenId;
  }

  function resolveReturnScreen() {
    return window.__searchReturnScreen || DEFAULT_RETURN_SCREEN;
  }

  function closeSearchScreen() {
    const input = getSearchInput();
    if (input) {
      input.value = "";
    }

    blurSearchInput();
    rerenderSearch();

    const target = resolveReturnScreen();
    if (typeof openRootScreen === "function" && target) {
      openRootScreen(target);
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  }

  function interceptCancel(event) {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
    closeSearchScreen();
  }

  function bindCancelButton() {
    const button = getCancelButton();
    if (!button || button.dataset.searchCloseFixBound === "1") return;
    button.dataset.searchCloseFixBound = "1";
    button.setAttribute("type", "button");
    button.addEventListener("touchend", interceptCancel, true);
    button.addEventListener("pointerup", interceptCancel, true);
    button.addEventListener("click", interceptCancel, true);
  }

  const originalOpenSearchScreen = typeof window.openSearchScreen === "function" ? window.openSearchScreen : null;
  if (originalOpenSearchScreen && window.__searchCloseFixWrapped !== "1") {
    window.__searchCloseFixWrapped = "1";
    window.openSearchScreen = function () {
      rememberReturnScreen(getActiveScreenId());
      originalOpenSearchScreen();
      window.requestAnimationFrame(() => {
        rerenderSearch();
        bindCancelButton();
      });
    };
  }

  const originalRenderAll = typeof window.renderAll === "function" ? window.renderAll : null;
  if (originalRenderAll && window.__searchCloseRenderWrapped !== "1") {
    window.__searchCloseRenderWrapped = "1";
    window.renderAll = function () {
      originalRenderAll();
      bindCancelButton();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCancelButton, { once: true });
  } else {
    bindCancelButton();
  }
})();
