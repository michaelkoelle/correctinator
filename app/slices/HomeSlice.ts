import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'home',
  initialState: {
    tabIndex: 0,
  },
  reducers: {
    setTabIndex: (state, action: PayloadAction<number>) => {
      state.tabIndex = action.payload;
    },
  },
});

export const { setTabIndex } = slice.actions;
export const selectTabIndex = (state) => state.home.tabIndex;
export default slice.reducer;
