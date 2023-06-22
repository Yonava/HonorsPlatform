import { useDocumentCache } from './store/useDocumentCache';

export const addActions = {
  STUDENTS: async () => await useDocumentCache().addItem(),
  GRADUATES: async () => await useDocumentCache().addItem(),
  MODULES: async () => null,
  COMPLETED_MODULES: async () => null,
  THESES: async () => null,
} as const;