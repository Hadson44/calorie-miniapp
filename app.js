// Keep the deployment entrypoint in the repository root while the main source lives in src/.
const appEntry = document.createElement("script");
appEntry.src = "./src/scripts/app.js";
appEntry.async = false;
document.body.appendChild(appEntry);
