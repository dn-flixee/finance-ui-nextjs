
import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import incomeReducer from './features/income/incomeSlice'
import incomeSourceReducer from './features/incomeSource/incomeSourceSlice'
import expenseReducer from './features/expense/expenseSlice'
import expenseSourceReducer from './features/expenseSource/expenseSourceSlice'
import accountReducer from './features/account/accountSlice'
import transferReducer from './features/transfer/transferSlice'
import splitwiseExpenseReducer from './features/splitwise/splitwiseSlice'
import dashboardReducer from './features/dashboard/dashboardSlice'
export const makeStore = () => {
  return configureStore({
    reducer: {
      incomes: incomeReducer,
      incomeSources: incomeSourceReducer,
      expenses: expenseReducer,
      expenseSources: expenseSourceReducer,
      accounts: accountReducer,
      transfers: transferReducer,
      splitwiseExpenses: splitwiseExpenseReducer,
      dashboard:dashboardReducer
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunk = ThunkAction<void, RootState, unknown, Action>