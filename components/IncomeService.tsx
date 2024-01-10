// import axios from "axios";

// interface Income {
//     incomeId: number;
//     name: string;
//     amount: number;
//     date: Date;
//     accountName: string;
//     incomeSourceName: string;
//   }

// const INCOME_API_BASE_URL = "http://localhost:8082/api/v1/income";

// class IncomeService {

//     saveIncome(income: Income ){
//         return axios.post(INCOME_API_BASE_URL,income)
//     }
//     updateIncome(incomeid:number, income:Income){
//         return axios.put(`http://localhost:8082/api/v1/income/${incomeid}`,income)
//     }

//     getIncome(){
//         return axios.get(INCOME_API_BASE_URL)
//     }
//     fetchIncomeTotalById(incomeSourceId){
//         return axios.get(`http://localhost:8082/api/v1/income/${incomeSourceId}/total`);
//     }
//     deleteIncome(incomeId){
//         return axios.delete(`http://localhost:8082/api/v1/income/${incomeId}` )
//     }
// }

// export default new IncomeService();