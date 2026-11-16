import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("iochat-theme") || localStorage.getItem("streamify-theme") || "night",
  setTheme: (theme) => {
    localStorage.setItem("iochat-theme", theme);
    set({ theme });
  },
}));
