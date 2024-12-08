import axios from "axios";


const ACCOUNT_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/account";

interface Account {
    accountId: number;
    name: string;
    balance: number;
  }
  interface NewAccount {
    name: string;
    balance: number;
  }

class AccountService {

    saveAccount = async (account:NewAccount) => {
        return axios.post(ACCOUNT_API_BASE_URL,account)
    }
    getAccount = async ()=>{
        return axios.get(ACCOUNT_API_BASE_URL)
    }
    updateAccount = async (id:number, account:Account) => {
        return axios.put(`${ACCOUNT_API_BASE_URL}/${id}`,account)
    }
    deleteAccount = async (id:number) => {
        return  axios.delete(`${ACCOUNT_API_BASE_URL}/${id}`)
        
    }
}

export default new AccountService();