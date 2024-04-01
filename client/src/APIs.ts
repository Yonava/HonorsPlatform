import { local, localKeys } from '@locals';
import axios, { type AxiosRequestConfig, type Method } from 'axios';

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

export const callProtectedResources = async <T = any, TData = any>(reqOptions: RequestOptions<TData>) => {
  console.log('getting protected resources')
  try {
    const { data } = await axios<T>({
      ...reqOptions,
      ...requestHeaders(),
    });
    return data;
  } catch (e) {
    console.log('error getting protected resources')
    console.log(e);
    console.log(e.message)
    console.log(e.response)
  }
}
