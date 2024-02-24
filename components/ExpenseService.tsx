import axios from "axios";
import { Interface } from "readline";
import { number } from "zod";

interface Expense {
    name: string;
    amount: number;
    date: Date;
    accountName: string;
    expenseSourceName: string;
}

const EXPENSE_API_BASE_URL = "http://localhost:8082/api/v1/expense";

class ExpenseService {

    saveExpense = async (expense: Expense ) => {
        return axios.post(EXPENSE_API_BASE_URL,expense)
    }
    updateExpense = async (expenseid:number, expense:Expense) => {
        return axios.put(`http://localhost:8082/api/v1/Expense/${expenseid}`,expense)
    }

    getExpense = async () => {
        return axios.get(EXPENSE_API_BASE_URL)
    }
    fetchExpenseTotalById = async (expenseSourceId:number) => {
        return axios.get(`http://localhost:8082/api/v1/Expense/${expenseSourceId}/total`);
    }
    deleteExpense = async (expenseId:number) => {
        return axios.delete(`http://localhost:8082/api/v1/Expense/${expenseId}` )
    }
}
export default new ExpenseService();
