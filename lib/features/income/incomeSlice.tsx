import { RootState } from "@/lib/store";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Income {
    incomeId: number;
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    incomeSourceName: string;
  }
  interface IncomeState {
    incomes: Income[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

  interface NewIncome {
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    incomeSourceName: string;
  }

const intialState:IncomeState = {
    status: 'idle',
    incomes:[],
    error:null
}

const INCOME_API_BASE_URL =  process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/income";

export const fetchIncomes = createAsyncThunk('income/fetchIncomes',async ()=>{
    const res = await axios.get(INCOME_API_BASE_URL);
    console.log("fetch Incomes",res.data);
    return res.data.map((income: Income) => {
        return {
            incomeId: income.incomeId,
            name: income.name,
            amount: income.amount,
            date: new Date(income.date),
            accountName: income.accountName,
            incomeSourceName: income.incomeSourceName
        };
    });
}) 

export const incomeSlice = createSlice({
    name: 'income',
    initialState: intialState,
    reducers:{
        addIncome: (state,action) =>{
            const income:Income = {
                incomeId:action.payload.incomeId,
                name:action.payload.name,
                amount:action.payload.amount,
                date:action.payload.date,
                accountName:action.payload.accountName,
                incomeSourceName:action.payload.incomeSourceName
            }
            state.incomes.push(income)
        },
        updateIncome: (state,action) =>{
            state.incomes = state.incomes.filter((income) => {
                if(income.incomeId == action.payload.id){
                    income.name = action.payload.name
                    income.amount = action.payload.amount
                    income.date = action.payload.date
                    income.accountName = action.payload.accountName
                    income.incomeSourceName = action.payload.incomeSourceName
                }
            })
        },
        removeIncome: (state,action) =>{
            state.incomes = state.incomes.filter((income) => {
                income.incomeId !== action.payload.id
            })
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchIncomes.pending,(state)=>{
            state.status = 'loading'
        })
        builder.addCase(fetchIncomes.fulfilled,(state,action)=>{
            state.status = 'succeeded',
            state.incomes = action.payload
        })
        builder.addCase(fetchIncomes.rejected,(state,action)=>{
            state.status = 'failed',
            state.error = action.error.message ?? 'Unknown Error'
        })
        
    }
})

export const { addIncome, updateIncome, removeIncome} = incomeSlice.actions
export const selectIncomes = (state: RootState) => state.incomes
export default incomeSlice.reducer