let scriptPromise = null;
let cachedConfig = null;

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function toBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === '') return fallback;
  if (TRUE_VALUES.has(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
}

function parseList(value) {
  if (!value && value !== 0) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getEnv() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env;
  }
  return {};
}

function getGoogleConfig() {
  if (typeof window === 'undefined') {
    return {
      enabled: false,
      reason: 'Google sign-in requires a browser environment.',
      clientId: '',
      origin: '',
    };
  }

  const origin = window.location.origin;
  if (cachedConfig && cachedConfig.origin === origin) {
    return cachedConfig;
  }

  const env = getEnv();
  const clientId = (env.VITE_GOOGLE_CLIENT_ID || '').trim();
  const allowLocalhost = toBoolean(env.VITE_GOOGLE_ALLOW_LOCALHOST, false);
  const allowedOrigins = parseList(
    env.VITE_GOOGLE_AUTHORIZED_ORIGINS || env.VITE_GOOGLE_ALLOWED_ORIGINS
  );

  const hostname = window.location.hostname;
  let enabled = Boolean(clientId);
  let reason = '';

  if (!clientId) {
    enabled = false;
    reason = 'Google sign-in is not configured.';
  } else if (LOCAL_HOSTNAMES.has(hostname) && !allowLocalhost) {
    enabled = false;
    reason =
      'Google sign-in is disabled for local development. Set VITE_GOOGLE_ALLOW_LOCALHOST=true to enable it for this origin.';
  } else if (
    allowedOrigins.length > 0 &&
    !allowedOrigins.includes(origin) &&
    !allowedOrigins.includes(hostname)
  ) {
    enabled = false;
    reason = 'This origin is not authorized for the configured Google client.';
  }

  cachedConfig = { enabled, reason, clientId, origin };
  return cachedConfig;
}

function assertGoogleEnabled() {
  const config = getGoogleConfig();
  if (!config.enabled) {
    throw new Error(
      config.reason || 'Google sign-in is disabled for this environment.'
    );
  }
  return config;
}

function loadGoogleScript() {
  try {
    assertGoogleEnabled();
  } catch (error) {
    return Promise.reject(error);
  }

  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    if (
      typeof window !== 'undefined' &&
      window.google &&
      window.google.accounts
    ) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });

  scriptPromise.catch(() => {
    scriptPromise = null;
  });

  return scriptPromise;
}

function hasGIS() {
  return (
    typeof window !== 'undefined' &&
    window.google &&
    window.google.accounts &&
    window.google.accounts.id
  );
}

function initGoogleId(callback) {
  const config = assertGoogleEnabled();
  if (!hasGIS()) {
    throw new Error('Google Identity not available');
  }
  window.google.accounts.id.initialize({
    client_id: config.clientId,
    callback,
  });
}

export async function signInWithGoogle({ timeoutMs = 60000 } = {}) {
  assertGoogleEnabled();
  await loadGoogleScript();
  return new Promise((resolve, reject) => {
    let settled = false;
    const onCredential = (response) => {
      if (settled) return;
      const cred = response && response.credential;
      if (cred) {
        settled = true;
        resolve(cred);
      }
    };

    try {
      if (!hasGIS()) throw new Error('Google Identity not available');
      initGoogleId(onCredential);
      window.google.accounts.id.prompt((notification) => {
        if (settled) return;
        const type =
          notification &&
          notification.getMomentType &&
          notification.getMomentType();
        const dismissed =
          type === 'display_not_displayed' ||
          type === 'skipped' ||
          type === 'dismissed';
        if (dismissed) {
          // No credential produced; caller can render a dedicated button
        }
      });
    } catch (error) {
      reject(error);
      return;
    }

    if (timeoutMs > 0) {
      setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error('Google sign-in timed out'));
        }
      }, timeoutMs);
    }
  });
}

export function isGoogleSignInAvailable() {
  return getGoogleConfig().enabled;
}

export function getGoogleSignInDisableReason() {
  return getGoogleConfig().reason;
}

export default {
  signInWithGoogle,
  isGoogleSignInAvailable,
};

export async function renderGoogleButton(
  container,
  options = {},
  onCredential
) {
  assertGoogleEnabled();
  await loadGoogleScript();
  const target = container && container.current ? container.current : container;
  if (!target) throw new Error('Missing container element for Google button');
  initGoogleId((response) => {
    try {
      const cred =
        response && response.credential ? response.credential : response;
      if (onCredential && cred) onCredential(cred);
    } catch {}
  });
  const style = {
    type: 'standard',
    theme: options.theme || 'outline',
    size: options.size || 'large',
    text: options.text || 'continue_with',
    shape: options.shape || 'rectangular',
    width: options.width || 320,
    logo_alignment: options.logo_alignment || 'left',
  };
  if (!hasGIS() || !window.google.accounts.id.renderButton) {
    throw new Error('Google Identity not available');
  }
  window.google.accounts.id.renderButton(target, style);
}
