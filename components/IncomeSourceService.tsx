import axios from "axios";

const INCOME_SOURCE_API_BASE_URL = "http://localhost:8082/api/v1/incomeSource";

interface IncomeSource {
    incomeSource: number;
    name: string;
    goal: number;
  }

export const IncomeSourceService = async() => {
    return 
}
