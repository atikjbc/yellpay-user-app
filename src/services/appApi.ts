import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axiosBaseQuery';

// Change to your backend base URL
export const API_BASE_URL = 'https://api.example.com/v1';

export const appApi = createApi({
  reducerPath: 'appApi',
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Profile'],
  endpoints: builder => ({
    // Example secured endpoint
    getProfile: builder.query<{ id: string; name: string }, void>({
      query: () => ({ url: '/me', method: 'GET' }),
      providesTags: ['Profile'],
    }),

    // Example register call that returns a token
    register: builder.mutation<
      { token: string; userId: string },
      { name: string; email: string }
    >({
      query: body => ({ url: '/auth/register', method: 'POST', data: body }),
    }),
  }),
});

export const { useGetProfileQuery, useRegisterMutation } = appApi;
