import { useDocumentCache } from './store/useDocumentCache';

export const addActions = {
  STUDENTS: async () => await useDocumentCache().addItem(),
  GRADUATES: async () => useDocumentCache().addItem(),
  GRADUATE_ENGAGEMENTS: async () => useDocumentCache().addItem(),
  MODULES: async () => useDocumentCache().addItem(),
  COMPLETED_MODULES: async () => useDocumentCache().addItem(),
  THESES: async () => useDocumentCache().addItem()
} as const;