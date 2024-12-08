
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import incomeReducer from './features/income/incomeSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      incomes: incomeReducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk = ThunkAction<void, RootState, unknown, Action>