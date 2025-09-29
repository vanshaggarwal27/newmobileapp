export interface UserProfile {
  id?: string;
  first?: string;
  last?: string;
  email?: string;
  phone?: string;
  role?: "citizen" | "admin" | "authority";
}

export interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string; // e.g. 'en', 'hi'
}

const USER_KEY = "app:user";
const SETTINGS_KEY = "app:settings";

export const userStore = {
  get(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  },
  save(profile: UserProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  },
  clear() {
    localStorage.removeItem(USER_KEY);
  },
};

export const settingsStore = {
  get(): UserSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw) as UserSettings;
    } catch {}
    return {
      notifications: { email: true, push: true, sms: false },
      language: "en",
    };
  },
  save(s: UserSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  },
  clear() {
    localStorage.removeItem(SETTINGS_KEY);
  },
};

export const auth = {
  signOut() {
    userStore.clear();
    // keep settings optionally
  },
  deleteAccount() {
    userStore.clear();
    settingsStore.clear();
    try {
      localStorage.removeItem("app:snaps");
    } catch {}
  },
};
