(function () {
  const DEFAULT_RETURN_SCREEN = "screenView";
  const SEARCH_SCREEN_ID = "screenMeals";
  const SEARCH_ATTR = "data-search-open";
  const ACTIVE_VALUE = "1";
  const RETRY_DELAYS = [0, 40, 120, 220];
  let searchRetryTimers = [];

  function getSearchInput() {
    return document.getElementById("foodSearchInput");
  }

  function getCancelButton() {
    return document.getElementById("cancelSearchBtn");
  }

  function getSearchScreen() {
    return document.getElementById(SEARCH_SCREEN_ID);
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
    if (!screenId || screenId === SEARCH_SCREEN_ID) return;
    window.__searchReturnScreen = screenId;
  }

  function resolveReturnScreen() {
    return window.__searchReturnScreen || DEFAULT_RETURN_SCREEN;
  }

  function clearSearchRetryTimers() {
    searchRetryTimers.forEach((timerId) => window.clearTimeout(timerId));
    searchRetryTimers = [];
  }

  function setSearchMode(active) {
    [document.body, document.getElementById("app"), getSearchScreen(), getSearchInput(), getCancelButton()].forEach((node) => {
      if (!node) return;
      if (active) {
        node.setAttribute(SEARCH_ATTR, ACTIVE_VALUE);
      } else {
        node.removeAttribute(SEARCH_ATTR);
      }
    });

    const button = getCancelButton();
    if (!button) return;

    if (active) {
      button.hidden = false;
      button.removeAttribute("hidden");
      button.classList.remove("hidden");
      button.style.display = "inline-flex";
      button.style.visibility = "visible";
      button.style.opacity = "1";
      button.style.pointerEvents = "auto";
      return;
    }

    button.style.removeProperty("display");
    button.style.removeProperty("visibility");
    button.style.removeProperty("opacity");
    button.style.removeProperty("pointer-events");
  }

  function focusSearchInput() {
    const input = getSearchInput();
    if (!input) return;

    const anchor = input.closest(".search-shell, .search-head, .search-bar, .search-card, .meals-search, .card") || input;
    if (anchor && typeof anchor.scrollIntoView === "function") {
      try {
        anchor.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" });
      } catch {
        anchor.scrollIntoView();
      }
    }

    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }

    if (typeof input.click === "function") {
      input.click();
    }

    if (typeof input.setSelectionRange === "function") {
      const position = input.value.length;
      try {
        input.setSelectionRange(position, position);
      } catch {
        // Ignore unsupported text range operations.
      }
    }
  }

  function applySearchMode() {
    setSearchMode(true);
    rerenderSearch();
    focusSearchInput();
    bindCancelButton();
  }

  function closeSearchScreen() {
    clearSearchRetryTimers();

    const input = getSearchInput();
    if (input) {
      input.value = "";
    }

    blurSearchInput();
    rerenderSearch();
    setSearchMode(false);

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
    if (!button || button.dataset.searchCloseFixBound === ACTIVE_VALUE) return;
    button.dataset.searchCloseFixBound = ACTIVE_VALUE;
    button.setAttribute("type", "button");
    button.addEventListener("touchend", interceptCancel, true);
    button.addEventListener("pointerup", interceptCancel, true);
    button.addEventListener("click", interceptCancel, true);
  }

  const originalOpenSearchScreen = typeof window.openSearchScreen === "function" ? window.openSearchScreen : null;
  if (originalOpenSearchScreen && window.__searchCloseFixWrapped !== ACTIVE_VALUE) {
    window.__searchCloseFixWrapped = ACTIVE_VALUE;
    window.openSearchScreen = function () {
      rememberReturnScreen(getActiveScreenId());
      originalOpenSearchScreen();
      applySearchMode();
      clearSearchRetryTimers();
      RETRY_DELAYS.forEach((delay) => {
        searchRetryTimers.push(window.setTimeout(applySearchMode, delay));
      });
    };
  }

  const originalRenderAll = typeof window.renderAll === "function" ? window.renderAll : null;
  if (originalRenderAll && window.__searchCloseRenderWrapped !== ACTIVE_VALUE) {
    window.__searchCloseRenderWrapped = ACTIVE_VALUE;
    window.renderAll = function () {
      originalRenderAll();
      bindCancelButton();
      if (document.body?.getAttribute(SEARCH_ATTR) === ACTIVE_VALUE) {
        applySearchMode();
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCancelButton, { once: true });
  } else {
    bindCancelButton();
  }
})();
