import { useDocumentCache } from './store/useDocumentCache';

export const addActions = {
  STUDENTS: async () => useDocumentCache().addItem(),
  GRADUATES: async () => useDocumentCache().addItem(),
  GRADUATE_ENGAGEMENTS: async () => useDocumentCache().addItem(),
  MODULES: async () => null,
  COMPLETED_MODULES: async () => null,
  THESES: async () => null,
} as const;