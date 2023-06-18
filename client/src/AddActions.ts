import { useDocumentCache } from './store/useDocumentCache';

export const addActions = {
  STUDENTS: async () => await useDocumentCache().addItemToCache(),
  GRADUATES: async () => await useDocumentCache().addItemToCache(),
  MODULES: async () => null,
  COMPLETED_MODULES: async () => null,
  THESES: async () => null,
} as const;