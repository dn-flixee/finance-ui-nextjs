import axios from "axios";
import { Interface } from "readline";
import { number } from "zod";

interface Expense {
    expenseId: number;
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    expenseSourceName: string;
}
interface NewExpense {
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    expenseSourceName: string;
}
const EXPENSE_API_BASE_URL = "http://localhost:8082/api/v1/expense";

class ExpenseService {

    saveExpense = async (expense: NewExpense ) => {
        return axios.post(EXPENSE_API_BASE_URL,expense)
    }
    updateExpense = async (expenseid:number, expense:Expense) => {
        return axios.put(`${EXPENSE_API_BASE_URL}/${expenseid}`,expense)
    }

    getExpense = async () => {
        const res = await axios.get(EXPENSE_API_BASE_URL)
        const expense:Expense[] = res.data.map( (expense:Expense) => {
            return {
                expenseId: expense.expenseId,
                name: expense.name,
                amount: expense.amount,
                date: new Date(expense.date),
                accountName: expense.accountName,
                expenseSourceName: expense.expenseSourceName
            }
          })
        return expense;
    }

    getExpenseFromLastYear = async () => {
        return axios.get(`${EXPENSE_API_BASE_URL}/last-year`)
    }
    fetchExpenseTotalById = async (expenseSourceId:number) => {
        return axios.get(`${EXPENSE_API_BASE_URL}/${expenseSourceId}/total`);
    }
    deleteExpense = async (expenseId:number) => {
        return axios.delete(`${EXPENSE_API_BASE_URL}/${expenseId}` )
    }
}
export default new ExpenseService();
