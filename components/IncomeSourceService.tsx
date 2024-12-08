import axios from "axios";

const INCOME_SOURCE_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL + "/api/v1/incomeSource";

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
  updateIncomeSource = async (id:number , incomeSource : IncomeSource)=>{
    return axios.put(`${INCOME_SOURCE_API_BASE_URL}/${id}` , incomeSource )
  }

  deleteIncomeSource = async (id:number) => {
    return  axios.delete(`${INCOME_SOURCE_API_BASE_URL}/${id}`)
    
  }

}
export default new IncomeSourceService();