import { useSheetManager } from './store/useSheetManager';
import { useDialog } from './store/useDialog';
import { postInRange, Range } from './SheetsAPI';

export const addActions = {
  STUDENTS: async () => {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  },
  GRADUATES: async () => {},
  MODULES: async () => {},
  COMPLETED_MODULES: async () => {},
  THESES: async () => {}
} as const;