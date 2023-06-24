import { useDocumentCache } from './store/useDocumentCache';

export const addActions = {
  STUDENTS: async () => await useDocumentCache().addItem(),
  GRADUATES: async () => useDocumentCache().addItem(),
  GRADUATE_ENGAGEMENTS: null,
  MODULES: null,
  COMPLETED_MODULES: null,
  THESES: null,
} as const;