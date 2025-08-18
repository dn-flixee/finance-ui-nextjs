import { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/lib/withTypes";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { FinanceAccount, CreateFinanceAccountInput, UpdateFinanceAccountInput } from "@/lib/types";

interface AccountState {
    accounts: FinanceAccount[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}


const intialState: AccountState = {
    status: "idle",
    accounts: [],
    error: null,
};

const ACCOUNT_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/account";

export const fetchAccounts = createAppAsyncThunk(
    "account/fetchAccounts",
    async () => {
        const res = await axios.get(ACCOUNT_API_BASE_URL);
        console.log("fetch expense Source")
        console.log(res.data)
        return res.data.map
        ((account: FinanceAccount) =>{
            return {
                    accountId: account.accountId,
                    name: account.name,
                    startingBalance: account.startingBalance,
                    type: account.type
            }
        });
    }
);

export const saveAccount = createAppAsyncThunk(
    "account/saveAccounts",
    async (account: CreateFinanceAccountInput) => {
        const res = await axios.post(ACCOUNT_API_BASE_URL,account);
        return res.data;
    }
);

export const updateAccount = createAppAsyncThunk(
    "account/updateAccount",
    async (account: UpdateFinanceAccountInput) => {
        const res = await axios.put(
            `${ACCOUNT_API_BASE_URL}/${account.accountId}`,
            account
        );
        return res.data;
    }
);
export const deleteAccount = createAppAsyncThunk(
    "account/deleteAccount",
    async (accountid: string) => {
        await axios.delete(`${ACCOUNT_API_BASE_URL}/${accountid}`);
        return accountid;
    }
);

export const accountSlice = createSlice({
    name: "accounts",
    initialState: intialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchAccounts builder
        builder.addCase(fetchAccounts.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchAccounts.fulfilled, (state, action) => {
            (state.status = "succeeded"), (state.accounts = action.payload);
        });
        builder.addCase(fetchAccounts.rejected, (state, action) => {
            (state.status = "failed"),
                (state.error = action.error.message ?? "Unknown Error");
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with fetching account data.",
            });
        });

        // saveAccounts builder
        builder.addCase(saveAccount.fulfilled, (state, action) => {
            state.accounts.push({
                accountId: action.payload.accountId,
                name: action.payload.name,
                startingBalance : action.payload.balance,
                type: action.payload.type
            });
            toast({
                description: "Account saved successfully!",
              })
        });
        builder.addCase(saveAccount.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // updateAccounts builder
        builder.addCase(updateAccount.fulfilled, (state, action) => {
                (state.accounts = state.accounts.map((account) => {
                    if (account.accountId === action.payload.accountId) {
                        return {
                            accountId: action.payload.accountId,
                            name: action.payload.name,
                            startingBalance : action.payload.balance,
                            type: action.payload.type

                        }
                    } else {
                        return {
                            accountId: account.accountId,
                            name: account.name,
                            startingBalance : account.startingBalance,
                            type: action.payload.type

                        }

                    }
                }));
                toast({
                    description: "Account updated successfully!",
                  })
        });
        builder.addCase(updateAccount.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // deleteAccounts builder
        builder.addCase(deleteAccount.fulfilled, (state, action) => {
            state.accounts = state.accounts.filter((account) => 
                account.accountId !== action.payload
            );
            toast({
                description: "Account deleted successfully!",
              })
        });
        builder.addCase(deleteAccount.rejected, (state, action) => {
            console.log(action.error.message)
            if(action.error.message === "Request failed with status code 400"){
                toast({
                    variant: "destructive",
                    duration:5000,
                    title: "Uh oh! Something went wrong.",
                    description: "Can't delete the account because there are incomes & expenses connected to this account.",
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

export const selectAccounts = (state: RootState) => state.accounts;
export default accountSlice.reducer;
