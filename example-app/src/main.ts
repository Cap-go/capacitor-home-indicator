import "./style.css";
import { Capacitor } from "@capacitor/core";
import { HomeIndicator } from "@capgo/home-indicator";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("App root element not found");
}

app.innerHTML = `
  <main class="layout">
    <section class="card">
      <h1>Capacitor Home Indicator</h1>
      <p class="intro">
        This sample toggles the native home indicator on iOS devices using the
        <code>@capgo/home-indicator</code> plugin. Run it on a device to see the
        indicator appear and disappear.
      </p>
      <dl class="status-grid">
        <div>
          <dt>Platform</dt>
          <dd data-platform>loading…</dd>
        </div>
        <div>
          <dt>Indicator</dt>
          <dd data-status>checking…</dd>
        </div>
        <div>
          <dt>Plugin version</dt>
          <dd data-version>fetching…</dd>
        </div>
      </dl>
    </section>

    <section class="card">
      <h2>Controls</h2>
      <div class="controls">
        <button data-action="hide">Hide indicator</button>
        <button data-action="show">Show indicator</button>
        <button data-action="toggle">Toggle indicator</button>
        <button data-action="refresh">Refresh status</button>
      </div>
      <p class="note">
        The native calls only succeed when running inside a Capacitor iOS container.
        On the web they will throw, which is expected.
      </p>
      <p class="error" data-error hidden></p>
    </section>

    <section class="card">
      <h2>Activity log</h2>
      <ul class="log" data-log></ul>
    </section>
  </main>
`;

const platformLabel = app.querySelector<HTMLElement>("[data-platform]");
const statusLabel = app.querySelector<HTMLElement>("[data-status]");
const versionLabel = app.querySelector<HTMLElement>("[data-version]");
const errorLabel = app.querySelector<HTMLParagraphElement>("[data-error]");
const logList = app.querySelector<HTMLUListElement>("[data-log]");
const buttons = Array.from(
  app.querySelectorAll<HTMLButtonElement>("button[data-action]"),
);

if (
  !platformLabel ||
  !statusLabel ||
  !versionLabel ||
  !errorLabel ||
  !logList
) {
  throw new Error("Failed to initialize UI");
}

const platform = Capacitor.getPlatform();
platformLabel.textContent = platform;

if (platform === "web") {
  appendLog(
    "Running on the web. Native calls will reject because the plugin is only available on device.",
    "warn",
  );
}

function setBusy(isBusy: boolean): void {
  buttons.forEach((button) => {
    button.disabled = isBusy;
    button.ariaBusy = String(isBusy);
  });
}

function appendLog(
  message: string,
  level: "info" | "error" | "warn" = "info",
): void {
  const item = document.createElement("li");
  item.dataset.level = level;
  const timestamp = new Date().toLocaleTimeString();
  item.textContent = `[${timestamp}] ${message}`;
  logList.prepend(item);
}

function showError(error: unknown): void {
  const message =
    error instanceof Error ? error.message : JSON.stringify(error, null, 2);
  errorLabel.textContent = message;
  errorLabel.hidden = false;
  appendLog(message, "error");
}

function clearError(): void {
  errorLabel.hidden = true;
  errorLabel.textContent = "";
}

async function refreshStatus(): Promise<void> {
  try {
    const { hidden } = await HomeIndicator.isHidden();
    statusLabel.textContent = hidden ? "Hidden" : "Visible";
    appendLog(`Indicator is ${hidden ? "hidden" : "visible"}.`);
  } catch (error) {
    statusLabel.textContent = "Unknown";
    showError(error);
  }
}

async function refreshVersion(): Promise<void> {
  try {
    const { version } = await HomeIndicator.getPluginVersion();
    versionLabel.textContent = version || "Unavailable";
  } catch (error) {
    versionLabel.textContent = "Unavailable";
    showError(error);
  }
}

async function perform(
  action: () => Promise<void>,
  label: string,
): Promise<void> {
  clearError();
  setBusy(true);
  appendLog(`${label}…`);
  try {
    await action();
    appendLog(`${label} complete.`);
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
    await refreshStatus();
  }
}

async function toggleIndicator(): Promise<void> {
  try {
    const { hidden } = await HomeIndicator.isHidden();
    if (hidden) {
      await HomeIndicator.show();
      appendLog("Toggled: showing indicator.");
    } else {
      await HomeIndicator.hide();
      appendLog("Toggled: hiding indicator.");
    }
  } catch (error) {
    showError(error);
  } finally {
    await refreshStatus();
  }
}

app.addEventListener("click", (event) => {
  const target = event.target as HTMLElement | null;
  if (!target || target.tagName !== "BUTTON") {
    return;
  }

  const action = target.getAttribute("data-action");
  switch (action) {
    case "hide":
      void perform(() => HomeIndicator.hide(), "Hiding indicator");
      break;
    case "show":
      void perform(() => HomeIndicator.show(), "Showing indicator");
      break;
    case "toggle":
      void toggleIndicator();
      break;
    case "refresh":
      void refreshStatus();
      void refreshVersion();
      break;
    default:
      break;
  }
});

void refreshStatus();
void refreshVersion();
