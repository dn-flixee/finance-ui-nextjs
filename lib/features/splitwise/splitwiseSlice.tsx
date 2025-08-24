import { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/lib/withTypes";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { CreateSplitwiseExpense, SplitwiseExpense } from "@/lib/types";

interface SplitwiseExpenseState {
    splitwiseExpenses: SplitwiseExpense[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const intialState: SplitwiseExpenseState = {
    status: "idle",
    splitwiseExpenses: [],
    error: null,
};

const SPLITWISE_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/splitwise";

export const fetchSplitwiseExpenses = createAppAsyncThunk(
    "splitwise/fetchSplitwiseExpenses",
    async () => {
        const res = await axios.get(SPLITWISE_API_BASE_URL);
        console.log("splitwise", res.data)
        return res.data.map((splitwiseExpense: SplitwiseExpense) => {
            return splitwiseExpense
        });
    }
);

export const saveSplitwiseExpense = createAppAsyncThunk(
    "splitwise/saveSplitwiseExpense",
    async (splitwiseExpense: CreateSplitwiseExpense) => {
        const res = await axios.post(SPLITWISE_API_BASE_URL, splitwiseExpense);
        return res.data;
    }
);

export const updateSplitwiseExpense = createAppAsyncThunk(
    "splitwise/updateSplitwiseExpense",
    async (splitwiseExpense: SplitwiseExpense) => {
        const res = await axios.put(
            `${SPLITWISE_API_BASE_URL}/${splitwiseExpense.splitwiseId}`,
            splitwiseExpense
        );
        return res.data;
    }
);
export const deleteSplitwiseExpense = createAppAsyncThunk(
    "splitwise/deleteSplitwiseExpense",
    async (splitwiseid: string) => {
        console.log("Delete Splitwise:")
        console.log(splitwiseid)
        const res = await axios.delete(`${SPLITWISE_API_BASE_URL}/${splitwiseid}`);
        return splitwiseid;
    }
);

export const splitwiseExpenseSlice = createSlice({
    name: "splitwiseExpenses",
    initialState: intialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchSplitwises builder
        builder.addCase(fetchSplitwiseExpenses.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchSplitwiseExpenses.fulfilled, (state, action) => {
            (state.status = "succeeded"), (state.splitwiseExpenses = action.payload);
        });
        builder.addCase(fetchSplitwiseExpenses.rejected, (state, action) => {
            (state.status = "failed"),
                (state.error = action.error.message ?? "Unknown Error");
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with fetching splitwise data.",
            });
        });

        // saveSplitwises builder
        builder.addCase(saveSplitwiseExpense.fulfilled, (state, action) => {
            state.splitwiseExpenses.push(action.payload);
            toast({
                description: "Splitwise saved successfully!",
              })
        });
        builder.addCase(saveSplitwiseExpense.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // updateSplitwises builder
        builder.addCase(updateSplitwiseExpense.fulfilled, (state, action) => {
                (state.splitwiseExpenses = state.splitwiseExpenses.map((splitwise:SplitwiseExpense) => {
                    if (splitwise.splitwiseId === action.payload.splitwiseId) {
                        return action.payload
                    } else {
                        return splitwise

                    }
                }));
                toast({
                    description: "Splitwise updated successfully!",
                  })
        });
        builder.addCase(updateSplitwiseExpense.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // deleteSplitwises builder
        builder.addCase(deleteSplitwiseExpense.fulfilled, (state, action) => {
            state.splitwiseExpenses = state.splitwiseExpenses.filter((splitwise:SplitwiseExpense) => 
                splitwise.splitwiseId !== action.payload
            );
            toast({
                description: "Splitwise deleted successfully!",
              })
        });
        builder.addCase(deleteSplitwiseExpense.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });
    },
});

export const selectSplitwises = (state: RootState) => state.splitwiseExpenses;
export default splitwiseExpenseSlice.reducer;
