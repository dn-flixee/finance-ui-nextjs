import { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/lib/withTypes";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

interface Transfer {
    transferId: number;
    name: string;
    fromAccount: number;
    toAccount: number;
    amount: number;
    date: Date;
}

interface NewTransfer {
    name: string;
    fromAccount: number;
    toAccount: number;
    amount: number;
    date: Date;
}

interface TransferState {
    transfers: Transfer[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const intialState: TransferState = {
    status: "idle",
    transfers: [],
    error: null,
};

const TRANSFER_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/transfer";

export const fetchTransfers = createAppAsyncThunk(
    "transfer/fetchTransfers",
    async () => {
        const res = await axios.get(TRANSFER_API_BASE_URL);
        return res.data.map((transfer: Transfer) => {
            return {
                transferId : transfer.transferId,
                name : transfer.name,
                fromAccount : transfer.fromAccount,
                toAccount : transfer.toAccount,
                amount : transfer.amount,
                date : new Date(transfer.date)
            };
        });
    }
);

export const saveTransfer = createAppAsyncThunk(
    "transfer/saveTransfer",
    async (transfer: NewTransfer) => {
        const res = await axios.post(TRANSFER_API_BASE_URL, transfer);
        return res.data;
    }
);

export const updateTransfer = createAppAsyncThunk(
    "transfer/updateTransfer",
    async (transfer: Transfer) => {
        const res = await axios.put(
            `${TRANSFER_API_BASE_URL}/${transfer.transferId}`,
            transfer
        );
        return res.data;
    }
);
export const deleteTransfer = createAppAsyncThunk(
    "transfer/deleteTransfer",
    async (transferid: number) => {
        console.log("Delete Transfer:")
        console.log(transferid)
        const res = await axios.delete(`${TRANSFER_API_BASE_URL}/${transferid}`);
        return transferid;
    }
);

export const transferSlice = createSlice({
    name: "transfers",
    initialState: intialState,
    reducers: {},
    extraReducers: (builder) => {
        // fetchTransfers builder
        builder.addCase(fetchTransfers.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(fetchTransfers.fulfilled, (state, action) => {
            (state.status = "succeeded"), (state.transfers = action.payload);
        });
        builder.addCase(fetchTransfers.rejected, (state, action) => {
            (state.status = "failed"),
                (state.error = action.error.message ?? "Unknown Error");
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with fetching transfer data.",
            });
        });

        // saveTransfers builder
        builder.addCase(saveTransfer.fulfilled, (state, action) => {
            state.transfers.push({
                transferId : action.payload.transferId,
                name : action.payload.name,
                fromAccount : action.payload.fromAccount,
                toAccount : action.payload.toAccount,
                amount : action.payload.amount,
                date : new Date(action.payload.date)
            });
            toast({
                description: "Transfer saved successfully!",
              })
        });
        builder.addCase(saveTransfer.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // updateTransfers builder
        builder.addCase(updateTransfer.fulfilled, (state, action) => {
                (state.transfers = state.transfers.map((transfer) => {
                    if (transfer.transferId === action.payload.transferId) {
                        return {
                            transferId : action.payload.transferId,
                            name : action.payload.name,
                            fromAccount : action.payload.fromAccount,
                            toAccount : action.payload.toAccount,
                            amount : action.payload.amount,
                            date : new Date(action.payload.date)
                        }
                    } else {
                        return {
                            transferId : transfer.transferId,
                            name : transfer.name,
                            fromAccount : transfer.fromAccount,
                            toAccount : transfer.toAccount,
                            amount : transfer.amount,
                            date : new Date(transfer.date)
                        }

                    }
                }));
                toast({
                    description: "Transfer updated successfully!",
                  })
        });
        builder.addCase(updateTransfer.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });

        // deleteTransfers builder
        builder.addCase(deleteTransfer.fulfilled, (state, action) => {
            state.transfers = state.transfers.filter((transfer) => 
                transfer.transferId !== action.payload
            );
            toast({
                description: "Transfer deleted successfully!",
              })
        });
        builder.addCase(deleteTransfer.rejected, (state, action) => {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Uh oh! Something went wrong.",
                description: action.error.message ?? "Unknown Error",
            });
        });
    },
});

export const selectTransfers = (state: RootState) => state.transfers;
export default transferSlice.reducer;
