import axios from "axios";

const EXPENSE_SOURCE_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/expenseSource";

interface ExpenseSource {
  name: string;
  budget: number;
}
class ExpenseSourceService{
  saveExpenseSource = async (expenseSource:ExpenseSource) => {
    return axios.post(EXPENSE_SOURCE_API_BASE_URL,expenseSource)
  }

  getExpenseSource = async () => {
    return axios.get(EXPENSE_SOURCE_API_BASE_URL)
  }
  updateExpenseSource = async (id:number , expenseSource : ExpenseSource)=>{
    return axios.put(`${EXPENSE_SOURCE_API_BASE_URL}/${id}` , expenseSource )
  }

  deleteExpenseSource = async (id:number) => {
    return  axios.delete(`${EXPENSE_SOURCE_API_BASE_URL}/${id}`)
    
  }

}
export default new ExpenseSourceService();