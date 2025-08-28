import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RegistrationState {
  name: string | null;
  email: string | null;
  token: string | null; // saved for all future requests
  registeredAt: string | null;
}

const initialState: RegistrationState = {
  name: null,
  email: null,
  token: null,
  registeredAt: null,
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setRegistration: (
      state,
      action: PayloadAction<{ name: string; email: string; token: string }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.registeredAt = new Date().toISOString();
    },
    clearRegistration: () => initialState,
  },
});

export const { setRegistration, clearRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;
