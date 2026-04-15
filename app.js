// Keep the deployment entrypoint in the repository root while the main source lives in src/.
const APP_VERSION = "20260415-food-flow-2";
const scriptQueue = [
  `./data/foods.js?v=${APP_VERSION}`,
  `./src/scripts/app.js?v=${APP_VERSION}`,
  `./src/scripts/food-flow-patch.js?v=${APP_VERSION}`
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

loadScriptAt(0);
