import axios from "axios";

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

const TRANSFER_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/transfer";

class TransferService {

    saveTransfer = async (transfer: NewTransfer ) => {
        return axios.post(TRANSFER_API_BASE_URL,transfer)
    }
    updateTransfer = async (transferid:number, transfer:Transfer) => {
        return axios.put(`${TRANSFER_API_BASE_URL}/${transferid}`,transfer)
    }

    getTransfer = async () => {
        const res = await axios.get(TRANSFER_API_BASE_URL)
        const transfer: Transfer[] = res.data.map( (transfer:Transfer) => {
            return {
                transferId : transfer.transferId,
                name : transfer.name,
                fromAccount : transfer.fromAccount,
                toAccount : transfer.toAccount,
                amount : transfer.amount,
                date : new Date(transfer.date)
            }
        })
        return transfer;
    }

    deleteTransfer = async (transferId:number) => {
        return axios.delete(`${TRANSFER_API_BASE_URL}/${transferId}` )
    }

}

export default new TransferService();