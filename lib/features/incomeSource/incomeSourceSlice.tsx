import { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/lib/withTypes";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { IncomeSource,CreateIncomeSourceInput,UpdateIncomeSourceInput } from "@/lib/types";


interface IncomeSourceState {
    incomeSources: IncomeSource[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const intialState: IncomeSourceState = {
    status: "idle",
    incomeSources: [],
    error: null,
};

const INCOME_SOURCE_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/incomeSource";

export const fetchIncomeSources = createAppAsyncThunk(
    "incomeSource/fetchIncomeSources",
    async () => {
        const res = await axios.get(INCOME_SOURCE_API_BASE_URL);
        console.log("fetch income Source")
        console.log(res.data)
        return res.data.map((incomeSource : IncomeSource) =>{
            return {
                incomeSourceId: incomeSource.incomeSourceId,
                name: incomeSource.name,
                goal: incomeSource.goal,
            };
        });
    }
);

export const saveIncomeSource = createAppAsyncThunk(
    "incomeSource/saveIncomeSources",
    async (incomeSource: CreateIncomeSourceInput) => {
        const res = await axios.post(INCOME_SOURCE_API_BASE_URL,incomeSource);
        return res.data;
    }
);

export const updateIncomeSource = createAppAsyncThunk(
    "incomeSource/updateIncomeSource",
    async (incomeSource: UpdateIncomeSourceInput) => {
        const res = await axios.put(
            `${INCOME_SOURCE_API_BASE_URL}/${incomeSource.incomeSourceId}`,
            incomeSource
        );
        return res.data;
    }
);
export const deleteIncomeSource = createAppAsyncThunk(
    "incomeSource/deleteIncomeSource",
    async (incomeSourceid: string) => {
        const res = await axios.delete(`${INCOME_SOURCE_API_BASE_URL}/${incomeSourceid}`);
        return incomeSourceid;
    }
);

export const incomeSourceSlice = createSlice({
    name: "incomeSources",
    initialState: intialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchIncomeSources builder
        builder.addCase(fetchIncomeSources.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchIncomeSources.fulfilled, (state, action) => {
            (state.status = "succeeded"), (state.incomeSources = action.payload);
        });
        builder.addCase(fetchIncomeSources.rejected, (state, action) => {
            (state.status = "failed"),
                (state.error = action.error.message ?? "Unknown Error");
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with fetching incomeSource data.",
            });
        });

        // saveIncomeSources builder
        builder.addCase(saveIncomeSource.fulfilled, (state, action) => {
            state.incomeSources.push({
                incomeSourceId: action.payload.incomeSourceId,
                name: action.payload.name,
                goal : action.payload.goal
            });
            toast({
                description: "Income Source saved successfully!",
              })
        });
        builder.addCase(saveIncomeSource.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // updateIncomeSources builder
        builder.addCase(updateIncomeSource.fulfilled, (state, action) => {
                (state.incomeSources = state.incomeSources.map((incomeSource) => {
                    if (incomeSource.incomeSourceId === action.payload.incomeSourceId) {
                        return {
                            incomeSourceId: action.payload.incomeSourceId,
                            name: action.payload.name,
                            goal : action.payload.goal
                        }
                    } else {
                        return {
                            incomeSourceId: incomeSource.incomeSourceId,
                            name: incomeSource.name,
                            goal : incomeSource.goal
                        }

                    }
                }));
                toast({
                    description: "Income Source updated successfully!",
                  })
        });
        builder.addCase(updateIncomeSource.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // deleteIncomeSources builder
        builder.addCase(deleteIncomeSource.fulfilled, (state, action) => {
            state.incomeSources = state.incomeSources.filter((incomeSource) => 
                incomeSource.incomeSourceId !== action.payload
            );
            toast({
                description: "Income Source deleted successfully!",
              })
        });
        builder.addCase(deleteIncomeSource.rejected, (state, action) => {
            console.log(action.error.message)
            if(action.error.message === "Request failed with status code 400"){
                toast({
                    variant: "destructive",
                    duration:5000,
                    title: "Uh oh! Something went wrong.",
                    description: "Can't delete the income source because there are incomes connected to income source.",
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

export const selectIncomeSources = (state: RootState) => state.incomeSources;
export default incomeSourceSlice.reducer;
