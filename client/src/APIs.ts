import axios from 'axios';
import type { Method } from 'axios';
import { local, localKeys } from '@locals';
import { useAuth } from '@store/useAuth';

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

type RequestOptions<T> = {
  method: Method,
  url: string,
  data?: T,
}

type TokenErrorResponse = {
  error: 'NEW_CLIENT_TOKEN_ISSUED',
  issuedClientToken: string,
} | {
  error: 'INVALID_CLIENT_TOKEN'
}

export const callProtectedResources = async <
  TReturn = any,
  TRequestBody = any
>(reqOptions: RequestOptions<TRequestBody>): Promise<TReturn | undefined> => {
  try {
    const { data } = await axios<TReturn>({
      ...reqOptions,
      ...requestHeaders(),
    });
    return data;
  } catch (e) {
    const err = e as { response: { data: TokenErrorResponse } };
    const { error } = err.response.data;
    if (error === 'NEW_CLIENT_TOKEN_ISSUED') {
      local.set(localKeys.clientToken, err.response.data.issuedClientToken);
    } else if (error === 'INVALID_CLIENT_TOKEN') {
      await useAuth().authorizeBeforeContinuing();
    } else {
      console.warn('unrecognized error', e)
      return;
    }

    return callProtectedResources<TReturn, TRequestBody>(reqOptions);
  }
}
