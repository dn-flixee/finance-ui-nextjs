import { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/lib/withTypes";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

export interface Expense {
    expenseId: number;
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    expenseSourceName: string;
}
interface ExpenseState {
    expenses: Expense[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

interface NewExpense {
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    expenseSourceName: string;
}

const intialState: ExpenseState = {
    status: "idle",
    expenses: [],
    error: null,
};

const EXPENSE_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/expense";

export const fetchExpenses = createAppAsyncThunk(
    "expense/fetchExpenses",
    async () => {
        const res = await axios.get(EXPENSE_API_BASE_URL);
        return res.data.map((expense: Expense) => {
            return {
                expenseId: expense.expenseId,
                name: expense.name,
                amount: expense.amount,
                date: new Date(expense.date),
                accountName: expense.accountName,
                expenseSourceName: expense.expenseSourceName,
            };
        });
    }
);

export const saveExpense = createAppAsyncThunk(
    "expense/saveExpenses",
    async (expense: NewExpense) => {
        const res = await axios.post(EXPENSE_API_BASE_URL, expense);
        return res.data;
    }
);

export const updateExpense = createAppAsyncThunk(
    "expense/updateExpense",
    async (expense: Expense) => {
        const res = await axios.put(
            `${EXPENSE_API_BASE_URL}/${expense.expenseId}`,
            expense
        );
        return res.data;
    }
);
export const deleteExpense = createAppAsyncThunk(
    "expense/deleteExpense",
    async (expenseid: number) => {
        console.log("Delete Expense:")
        console.log(expenseid)
        const res = await axios.delete(`${EXPENSE_API_BASE_URL}/${expenseid}`);
        return expenseid;
    }
);

export const expenseSlice = createSlice({
    name: "expenses",
    initialState: intialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchExpenses builder
        builder.addCase(fetchExpenses.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchExpenses.fulfilled, (state, action) => {
            (state.status = "succeeded"), (state.expenses = action.payload);
        });
        builder.addCase(fetchExpenses.rejected, (state, action) => {
            (state.status = "failed"),
                (state.error = action.error.message ?? "Unknown Error");
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with fetching expense data.",
            });
        });

        // saveExpenses builder
        builder.addCase(saveExpense.fulfilled, (state, action) => {
            state.expenses.push({
                expenseId: action.payload.expenseId,
                name: action.payload.name,
                amount: action.payload.amount,
                date: action.payload.date,
                accountName: action.payload.accountName,
                expenseSourceName: action.payload.expenseSourceName,
            });
            toast({
                description: "Expense saved successfully!",
              })
        });
        builder.addCase(saveExpense.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // updateExpenses builder
        builder.addCase(updateExpense.fulfilled, (state, action) => {
                (state.expenses = state.expenses.map((expense) => {
                    if (expense.expenseId === action.payload.expenseId) {
                        return {
                            expenseId: action.payload.expenseId,
                            name: action.payload.name,
                            amount: action.payload.amount,
                            date: action.payload.date,
                            accountName: action.payload.accountName,
                            expenseSourceName: action.payload.expenseSourceName,
                        }
                    } else {
                        return {
                            expenseId: expense.expenseId,
                            name: expense.name,
                            amount: expense.amount,
                            date: expense.date,
                            accountName: expense.accountName,
                            expenseSourceName: expense.expenseSourceName,
                        }

                    }
                }));
                toast({
                    description: "Expense updated successfully!",
                  })
        });
        builder.addCase(updateExpense.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // deleteExpenses builder
        builder.addCase(deleteExpense.fulfilled, (state, action) => {
            state.expenses = state.expenses.filter((expense) => 
                expense.expenseId !== action.payload
            );
            toast({
                description: "Expense deleted successfully!",
              })
        });
        builder.addCase(deleteExpense.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });
    },
});

export const selectExpenses = (state: RootState) => state.expenses;
export default expenseSlice.reducer;
