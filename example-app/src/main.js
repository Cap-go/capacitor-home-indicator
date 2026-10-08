import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { Capacitor } from '@capacitor/core';
import { HomeIndicator } from '@capgo/capacitor-home-indicator';
import './style.css';

const output = document.getElementById('plugin-output');
const platformLabel = document.getElementById('platform-label');
const versionLabel = document.getElementById('version-label');
const hiddenBadge = document.getElementById('hidden-badge');
const hideButton = document.getElementById('hide-indicator');
const showButton = document.getElementById('show-indicator');
const refreshButton = document.getElementById('refresh-status');
const versionButton = document.getElementById('get-version');

const setOutput = (value) => {
  output.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
};

const setHiddenBadge = (hidden) => {
  if (hidden === null || hidden === undefined) {
    hiddenBadge.textContent = 'Unknown';
    hiddenBadge.dataset.hidden = 'unknown';
    return;
  }
  hiddenBadge.textContent = hidden ? 'Hidden' : 'Visible';
  hiddenBadge.dataset.hidden = hidden ? 'true' : 'false';
};

const formatPlatform = () => {
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') {
    return 'iOS (native)';
  }
  if (platform === 'android') {
    return 'Android (no effect)';
  }
  return 'Web preview (no effect)';
};

platformLabel.textContent = formatPlatform();

async function refreshStatus() {
  try {
    const result = await HomeIndicator.isHidden();
    setHiddenBadge(result.hidden);
    setOutput(result);
  } catch (error) {
    setHiddenBadge(null);
    setOutput(`Error: ${error?.message ?? error}`);
  }
}

async function hideIndicator() {
  try {
    await HomeIndicator.hide();
    await refreshStatus();
    setOutput('hide() resolved. On iOS the home indicator should stay hidden until you swipe up.');
  } catch (error) {
    setOutput(`Error: ${error?.message ?? error}`);
  }
}

async function showIndicator() {
  try {
    await HomeIndicator.show();
    await refreshStatus();
    setOutput('show() resolved. On iOS the home indicator should remain visible.');
  } catch (error) {
    setOutput(`Error: ${error?.message ?? error}`);
  }
}

async function loadVersion() {
  try {
    const result = await HomeIndicator.getPluginVersion();
    versionLabel.textContent = result.version;
    setOutput(result);
  } catch (error) {
    setOutput(`Error: ${error?.message ?? error}`);
  }
}

hideButton.addEventListener('click', hideIndicator);
showButton.addEventListener('click', showIndicator);
refreshButton.addEventListener('click', refreshStatus);
versionButton.addEventListener('click', loadVersion);

refreshStatus();
loadVersion();

if (Capacitor.isNativePlatform()) {
  CapacitorUpdater.notifyAppReady().catch((error) => {
    console.error('Capgo notifyAppReady failed', error);
  });
}
