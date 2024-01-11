import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

interface Income {
  incomeId: number;
  name: string;
  amount: number;
  date: Date;
  accountName: string;
  incomeSourceName: string;
}


async function getData() {
    const INCOME_API_BASE_URL = "http://localhost:8082/api/v1/income";
    const res = await fetch(INCOME_API_BASE_URL)
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
   
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data')
    }
   
    return res.json()
  }
   
  export default async function Page() {
    const data = await getData()
   console.log(data)
   console.log("hi")
    return <main>{}</main>
  }


