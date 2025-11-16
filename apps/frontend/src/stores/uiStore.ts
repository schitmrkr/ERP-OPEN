import { create } from "zustand";

interface UIStore {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarCollapsed: true,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
}));
