import axios from "axios";

interface Income {
    incomeId: number;
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    incomeSourceName: string;
  }

  interface NewIncome {
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    incomeSourceName: string;
  }

const INCOME_API_BASE_URL =  process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/income";

class IncomeService{

    saveIncome = async (income: NewIncome ) => {
        return axios.post(INCOME_API_BASE_URL,income)
    }
    updateIncome = async (incomeid:number, income:Income) => {
        return axios.put(`${INCOME_API_BASE_URL}/${incomeid}`,income)
    }

    getIncome = async () => {
        const res = await axios.get(INCOME_API_BASE_URL)
        const income:Income[] = res.data.map( (income:Income) => {
            return {
                incomeId: income.incomeId,
                name: income.name,
                amount: income.amount,
                date: new Date(income.date),
                accountName: income.accountName,
                incomeSourceName: income.incomeSourceName
            }
          })
        return income;
    }

    deleteIncome = async (incomeId:number) => {
        return axios.delete(`${INCOME_API_BASE_URL}/${incomeId}` )
    }
}

export default new IncomeService();