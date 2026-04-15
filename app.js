// Keep the deployment entrypoint in the repository root while the main source lives in src/.
function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

async function bootApp() {
  await loadExternalScript("./data/foods.js");

  const response = await fetch("./src/scripts/app.js");
  if (!response.ok) {
    throw new Error(`Failed to load app source: ${response.status}`);
  }

  const source = await response.text();
  const patchedSource = source.replace(
    /const FOOD_DB = \[[\s\S]*?\];\r?\n\r?\nconst MEAL_CONFIG = \[/,
    "const FOOD_DB = window.FOOD_DB || [];\n\nconst MEAL_CONFIG = ["
  );

  const appEntry = document.createElement("script");
  appEntry.textContent = patchedSource;
  document.body.appendChild(appEntry);
}

bootApp().catch((error) => {
  console.error("App bootstrap failed", error);
});
