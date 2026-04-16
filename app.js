// Keep the deployment entrypoint in the repository root while the main source lives in src/.
const APP_VERSION = "20260416-onboarding-moon-3";
window.__forceOnboardingGreeting = APP_VERSION;

function ensureCriticalOnboardingStyles() {
  [
    `./src/styles/moon-theme.css?v=${APP_VERSION}`,
    `./src/styles/onboarding-moon-refresh.css?v=${APP_VERSION}`
  ].forEach((href) => {
    if (document.querySelector(`link[data-codex-href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.codexHref = href;
    document.head.appendChild(link);
  });
}

const scriptQueue = [
  `./data/foods.js?v=${APP_VERSION}`,
  `./src/scripts/water-image-hotfix.js?v=${APP_VERSION}`,
  `./src/scripts/app.js?v=${APP_VERSION}`,
  `./src/scripts/food-flow-patch.js?v=${APP_VERSION}`,
  `./src/scripts/meal-plus-hotfix.js?v=${APP_VERSION}`,
  `./src/scripts/food-flow-upgrade.js?v=${APP_VERSION}`,
  `./src/scripts/meal-plus-touch-fix.js?v=${APP_VERSION}`,
  `./src/scripts/search-close-fix.js?v=${APP_VERSION}`,
  `./src/scripts/onboarding-refresh.js?v=${APP_VERSION}`,
  `./src/scripts/onboarding-force-start.js?v=${APP_VERSION}`,
  `./src/scripts/onboarding-bootstrap-fix.js?v=${APP_VERSION}`
];

function loadScriptAt(index) {
  if (index >= scriptQueue.length) return;
  const script = document.createElement("script");
  script.src = scriptQueue[index];
  script.async = false;
  script.onload = () => loadScriptAt(index + 1);
  script.onerror = () => loadScriptAt(index + 1);
  document.body.appendChild(script);
}

function startBootstrap() {
  ensureCriticalOnboardingStyles();
  loadScriptAt(0);
}

if (!location.search.includes(`welcome=${APP_VERSION}`)) {
  const url = new URL(location.href);
  url.searchParams.set("welcome", APP_VERSION);
  location.replace(url.toString());
} else {
  startBootstrap();
}
