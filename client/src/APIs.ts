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

/**
 * @description The options for a request
 * @param T - The type of the request body
 * @param method - The HTTP method to use
 * @param url - The URL to which the request is to be sent
 * @param data - The data to be sent as the request body
 */
type RequestOptions<T> = {
  /**
   * The HTTP method to use
   */
  method: Method,
  /**
   * The URL to which the request is to be sent
   */
  url: string,
  /**
   * The data to be sent as the request body
   */
  data?: T,
}

/**
 * @description The response response if the client token is invalid or has expired
 * @param NEW_CLIENT_TOKEN_ISSUED - The client token has been updated
 * @param issuedClientToken - The new client token
 * @param INVALID_CLIENT_TOKEN - The client token is invalid and therefore a new token cannot be issued
 */
type TokenErrorResponse = {
  error: 'NEW_CLIENT_TOKEN_ISSUED',
  issuedClientToken: string,
} | {
  error: 'INVALID_CLIENT_TOKEN'
}

/**
 * @description Calls a protected api endpoint (google sheets) with the provided options
 * @param TReturn - The type of the response
 * @param TRequestBody - The type of the request body
 * @param reqOptions - The options for the request
 * @returns The response from the api
 * @example const data = await callProtectedResources<{ name: string }>({ method: 'GET', url: '/api/sheets' });
 */
export const callProtectedResources = async <
  TReturn = any,
  TRequestBody = any
>(reqOptions: RequestOptions<TRequestBody>): Promise<TReturn | undefined> => {

  console.log('calling protected resources', reqOptions.method, reqOptions.url)

  try {
    const { data } = await axios<TReturn>({
      ...reqOptions,
      ...requestHeaders(),
    });
    return data;
  } catch (e) {
    console.error('error from protected resources', e);
    const err = e as { response: { data: TokenErrorResponse } };
    const { error } = err.response.data;
    if (error === 'NEW_CLIENT_TOKEN_ISSUED') {
      local.set(localKeys.clientToken, err.response.data.issuedClientToken);
    } else if (error === 'INVALID_CLIENT_TOKEN') {
      await useAuth().authorizeBeforeContinuing();
    } else {
      console.warn('unrecognized error', e);
      return;
    }

    // TODO add check for max recursive depth
    return callProtectedResources<TReturn, TRequestBody>(reqOptions);
  }
}
