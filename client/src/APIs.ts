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

let currentlyGettingToken = false;

export const callProtectedResources = async <
  TReturn = any,
  TRequestBody = any
>(reqOptions: RequestOptions<TRequestBody>): Promise<TReturn | undefined> => {
  console.log('calling protected resources', reqOptions.method, reqOptions.url)

  if (currentlyGettingToken) {
    console.log('deferring call to protected resources while getting token')
    return new Promise(resolve => setTimeout(() => {
      resolve(callProtectedResources<TReturn, TRequestBody>(reqOptions))
    }, 2000))
  }

  try {
    const { data } = await axios<TReturn>({
      ...reqOptions,
      ...requestHeaders(),
    });
    return data;
  } catch (e) {

    currentlyGettingToken = true;

    const err = e as { response: { data: TokenErrorResponse } };
    const { error } = err.response.data;
    if (error === 'NEW_CLIENT_TOKEN_ISSUED') {
      local.set(localKeys.clientToken, err.response.data.issuedClientToken);
    } else if (error === 'INVALID_CLIENT_TOKEN') {
      await useAuth().authorizeBeforeContinuing();
    } else {
      console.warn('unrecognized error', e);
      currentlyGettingToken = false;
      return;
    }

    currentlyGettingToken = false;

    return callProtectedResources<TReturn, TRequestBody>(reqOptions);
  }
}
