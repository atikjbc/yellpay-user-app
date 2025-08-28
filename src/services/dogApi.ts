import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

const DOG_BASE_URL = 'https://dog.ceo/api';

export type DogBreedsResponse = {
  message: Record<string, string[]>; // { breed: [subbreeds] }
  status: 'success' | 'error';
};

export const dogApi = createApi({
  reducerPath: 'dogApi',
  baseQuery: axiosBaseQuery({ baseUrl: DOG_BASE_URL }),
  endpoints: builder => ({
    getBreeds: builder.query<DogBreedsResponse, void>({
      query: () => ({ url: '/breeds/list/all', method: 'GET' }),
    }),
  }),
});

export const { useGetBreedsQuery } = dogApi;
