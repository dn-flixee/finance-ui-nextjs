import axios from "axios";

const INCOME_SOURCE_API_BASE_URL = "http://localhost:8082/api/v1/incomeSource";

interface IncomeSource {
  name: string;
  goal: number;
}
class IncomeSourceService{
 saveIncomeSource = async (incomeSource:IncomeSource) => {
  return axios.post(INCOME_SOURCE_API_BASE_URL,incomeSource)
}

 getIncomeSource = async () => {
  return axios.get(INCOME_SOURCE_API_BASE_URL)
}
}
export default new IncomeSourceService();