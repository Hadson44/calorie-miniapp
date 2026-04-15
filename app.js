// Keep the deployment entrypoint in the repository root while the main source lives in src/.
const APP_VERSION = "20260415-ui-pass-3";
const appEntry = document.createElement("script");
appEntry.src = `./src/scripts/app.js?v=${APP_VERSION}`;
appEntry.async = false;
document.body.appendChild(appEntry);
