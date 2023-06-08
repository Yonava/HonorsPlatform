import { useSheetManager } from './store/useSheetManager';

export const addActions = {
  STUDENTS: async () => await useSheetManager().addItem(),
  GRADUATES: async () => await useSheetManager().addItem(),
  MODULES: async () => null,
  COMPLETED_MODULES: async () => null,
  THESES: async () => null,
} as const;