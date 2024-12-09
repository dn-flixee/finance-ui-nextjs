
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import incomeReducer from './features/income/incomeSlice'
import incomeSourceReducer from './features/incomeSource/incomeSourceSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      incomes: incomeReducer,
      incomeSources: incomeSourceReducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk = ThunkAction<void, RootState, unknown, Action>