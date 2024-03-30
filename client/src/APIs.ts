import { local, localKeys } from '@locals';

export const URIs = {
  sheets: '/api/sheets',
  user: '/api/user',
  auth: '/api/auth',
} as const;

export const requestHeaders = () => ({
  headers: {
    Authorization: `Bearer ${local.get(localKeys.clientToken)}`,
  }
})
