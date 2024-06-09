import axios from "axios";

const ACCOUNT_API_BASE_URL = "http://raspi.dn:8082/api/v1/account";

class AccountService {

    saveAccount = async (account:string) => {

    }

    getAccount = async ()=>{
        return axios.get(ACCOUNT_API_BASE_URL)
    }
}

export default new AccountService();