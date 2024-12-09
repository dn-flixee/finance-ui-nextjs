import { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/lib/withTypes";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

export interface Account {
    accountId: number;
    name: string;
    balance: number;
  }
interface AccountState {
    accounts: Account[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

interface NewAccount {
    name: string;
    balance: number;
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
        return res.data;
    }
);

export const saveAccount = createAppAsyncThunk(
    "account/saveAccounts",
    async (account: NewAccount) => {
        const res = await axios.post(ACCOUNT_API_BASE_URL,account);
        return res.data;
    }
);

export const updateAccount = createAppAsyncThunk(
    "account/updateAccount",
    async (account: Account) => {
        const res = await axios.put(
            `${ACCOUNT_API_BASE_URL}/${account.accountId}`,
            account
        );
        return res.data;
    }
);
export const deleteAccount = createAppAsyncThunk(
    "account/deleteAccount",
    async (accountid: number) => {
        const res = await axios.delete(`${ACCOUNT_API_BASE_URL}/${accountid}`);
        return res;
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
                balance : action.payload.balance
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
                            balance : action.payload.balance
                        }
                    } else {
                        return {
                            accountId: account.accountId,
                            name: account.name,
                            balance : account.balance
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
                toast({
                    variant: "destructive",
                    duration:5000,
                  title: "Uh oh! Something went wrong.",
                  description: "There was a problem with your request.",
                })
        });
    },
});

export const selectAccounts = (state: RootState) => state.accounts;
export default accountSlice.reducer;
