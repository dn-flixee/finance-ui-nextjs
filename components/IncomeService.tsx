import axios from "axios";

interface Income {
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    incomeSourceName: string;
  }
const INCOME_API_BASE_URL = "http://localhost:8082/api/v1/income";

class IncomeService{

    saveIncome = async (income: Income ) => {
        return axios.post(INCOME_API_BASE_URL,income)
    }
    updateIncome = async (incomeid:number, income:Income) => {
        return axios.put(`${INCOME_API_BASE_URL}/${incomeid}`,income)
    }

    getIncome = async () => {
        return axios.get(INCOME_API_BASE_URL)
    }
    fetchIncomeTotalById = async (incomeSourceId:number) => {
        return axios.get(`${INCOME_API_BASE_URL}/${incomeSourceId}/total`);
    }
    deleteIncome = async (incomeId:number) => {
        return axios.delete(`${INCOME_API_BASE_URL}/${incomeId}` )
    }
}

export default new IncomeService();