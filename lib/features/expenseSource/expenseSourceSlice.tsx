import { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/lib/withTypes";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { ExpenseSource, CreateExpenseSourceInput } from "@/lib/types";

interface ExpenseSourceState {
    expenseSources: ExpenseSource[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const intialState: ExpenseSourceState = {
    status: "idle",
    expenseSources: [],
    error: null,
};

const EXPENSE_SOURCE_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/expenseSource";

export const fetchExpenseSources = createAppAsyncThunk(
    "expenseSource/fetchExpenseSources",
    async () => {
        const res = await axios.get(EXPENSE_SOURCE_API_BASE_URL);
        console.log("fetch expense Source")
        console.log(res.data)
        return res.data.map((expenseSource : ExpenseSource)=>{
            return {
                expenseSourceId: expenseSource.expenseSourceId,
                name: expenseSource.name,
                budget: expenseSource.budget
            }
        })
    }
);

export const saveExpenseSource = createAppAsyncThunk(
    "expenseSource/saveExpenseSources",
    async (expenseSource: CreateExpenseSourceInput) => {
        const res = await axios.post(EXPENSE_SOURCE_API_BASE_URL,expenseSource);
        return res.data;
    }
);

export const updateExpenseSource = createAppAsyncThunk(
    "expenseSource/updateExpenseSource",
    async (expenseSource: ExpenseSource) => {
        const res = await axios.put(
            `${EXPENSE_SOURCE_API_BASE_URL}/${expenseSource.expenseSourceId}`,
            expenseSource
        );
        return res.data;
    }
);
export const deleteExpenseSource = createAppAsyncThunk(
    "expenseSource/deleteExpenseSource",
    async (expenseSourceid: string) => {
        const res = await axios.delete(`${EXPENSE_SOURCE_API_BASE_URL}/${expenseSourceid}`);
        return expenseSourceid;
    }
);

export const expenseSourceSlice = createSlice({
    name: "expenseSources",
    initialState: intialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchExpenseSources builder
        builder.addCase(fetchExpenseSources.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchExpenseSources.fulfilled, (state, action) => {
            (state.status = "succeeded"), (state.expenseSources = action.payload);
        });
        builder.addCase(fetchExpenseSources.rejected, (state, action) => {
            (state.status = "failed"),
                (state.error = action.error.message ?? "Unknown Error");
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with fetching expenseSource data.",
            });
        });

        // saveExpenseSources builder
        builder.addCase(saveExpenseSource.fulfilled, (state, action) => {
            state.expenseSources.push({
                expenseSourceId: action.payload.expenseSourceId,
                name: action.payload.name,
                budget: action.payload.budget,
                userId: action.payload.userId,
                createdAt: action.payload.createdAt,
                updatedAt: action.payload.updatedAt
            });
            toast({
                description: "Expense Source saved successfully!",
              })
        });
        builder.addCase(saveExpenseSource.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // updateExpenseSources builder
        builder.addCase(updateExpenseSource.fulfilled, (state, action) => {
                (state.expenseSources = state.expenseSources.map((expenseSource) => {
                    if (expenseSource.expenseSourceId === action.payload.expenseSourceId) {
                        return {
                            expenseSourceId: action.payload.expenseSourceId,
                            name: action.payload.name,
                            budget : action.payload.budget
                        }
                    } else {
                        return {
                            expenseSourceId: expenseSource.expenseSourceId,
                            name: expenseSource.name,
                            budget : expenseSource.budget
                        }

                    }
                }));
                toast({
                    description: "Expense Source updated successfully!",
                  })
        });
        builder.addCase(updateExpenseSource.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // deleteExpenseSources builder
        builder.addCase(deleteExpenseSource.fulfilled, (state, action) => {
            state.expenseSources = state.expenseSources.filter((expenseSource) => 
                expenseSource.expenseSourceId !== action.payload
            );
            toast({
                description: "Expense Source deleted successfully!",
              })
        });
        builder.addCase(deleteExpenseSource.rejected, (state, action) => {
            console.log(action.error.message)
            if(action.error.message === "Request failed with status code 400"){
                toast({
                    variant: "destructive",
                    duration:5000,
                    title: "Uh oh! Something went wrong.",
                    description: "Can't delete the expense source because there are expenses connected to expense source.",
                })
            }
            else{
                toast({
                    variant: "destructive",
                    duration:5000,
                  title: "Uh oh! Something went wrong.",
                  description: "There was a problem with your request.",
                })}
        });
    },
});

export const selectExpenseSources = (state: RootState) => state.expenseSources;
export default expenseSourceSlice.reducer;
