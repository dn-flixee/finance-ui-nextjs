import { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/lib/withTypes";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { Income, CreateIncomeInput, UpdateIncomeInput } from "@/lib/types";


interface IncomeState {
    incomes: Income[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const intialState: IncomeState = {
    status: "idle",
    incomes: [],
    error: null,
};

const INCOME_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/income";

export const fetchIncomes = createAppAsyncThunk(
    "income/fetchIncomes",
    async () => {
        const res = await axios.get(INCOME_API_BASE_URL);
        return res.data.map((income: Income) => {
            return {
                incomeId: income.incomeId,
                name: income.name,
                amount: income.amount,
                date: new Date(income.date),
                accountId: income.accountId,
                incomeSourceId: income.incomeSourceId,
            };
        });
    }
);

export const saveIncome = createAppAsyncThunk(
    "income/saveIncomes",
    async (income: CreateIncomeInput) => {
        const res = await axios.post(INCOME_API_BASE_URL, income);
        return res.data;
    }
);

export const updateIncome = createAppAsyncThunk(
    "income/updateIncome",
    async (income: UpdateIncomeInput) => {
        const res = await axios.put(
            `${INCOME_API_BASE_URL}/${income.incomeId}`,
            income
        );
        return res.data;
    }
);
export const deleteIncome = createAppAsyncThunk(
    "income/deleteIncome",
    async (incomeid: string) => {
        console.log("Delete Income:")
        console.log(incomeid)
        const res = await axios.delete(`${INCOME_API_BASE_URL}/${incomeid}`);
        return incomeid;
    }
);

export const incomeSlice = createSlice({
    name: "incomes",
    initialState: intialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchIncomes builder
        builder.addCase(fetchIncomes.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchIncomes.fulfilled, (state, action) => {
            (state.status = "succeeded"), (state.incomes = action.payload);
        });
        builder.addCase(fetchIncomes.rejected, (state, action) => {
            (state.status = "failed"),
                (state.error = action.error.message ?? "Unknown Error");
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with fetching income data.",
            });
        });

        // saveIncomes builder
        builder.addCase(saveIncome.fulfilled, (state, action) => {
            state.incomes.push({
                incomeId: action.payload.incomeId,
                name: action.payload.name,
                amount: action.payload.amount,
                date: action.payload.date,
                accountId: action.payload.accountId,
                incomeSourceId: action.payload.incomeSourceId,
            });
            toast({
                description: "Income saved successfully!",
              })
        });
        builder.addCase(saveIncome.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // updateIncomes builder
        builder.addCase(updateIncome.fulfilled, (state, action) => {
                (state.incomes = state.incomes.map((income:Income) => {
                    if (income.incomeId === action.payload.incomeId) {
                        return {
                            incomeId: action.payload.incomeId,
                            name: action.payload.name,
                            amount: action.payload.amount,
                            date: action.payload.date,
                            accountId: action.payload.accountId,
                            incomeSourceId: action.payload.incomeSourceId,
                        }
                    } else {
                        return {
                            incomeId: income.incomeId,
                            name: income.name,
                            amount: income.amount,
                            date: income.date,
                            accountId: income.accountId,
                            incomeSourceId: income.incomeSourceId,
                        }

                    }
                }));
                toast({
                    description: "Income updated successfully!",
                  })
        });
        builder.addCase(updateIncome.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // deleteIncomes builder
        builder.addCase(deleteIncome.fulfilled, (state, action) => {
            state.incomes = state.incomes.filter((income) => 
                income.incomeId !== action.payload
            );
            toast({
                description: "Income deleted successfully!",
              })
        });
        builder.addCase(deleteIncome.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });
    },
});

export const selectIncomes = (state: RootState) => state.incomes;
export default incomeSlice.reducer;
