"use client"
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'

interface Income {
  incomeId: number;
  name: string;
  amount: number;
  date: Date;
  accountName: string;
  incomeSourceName: string;
}


import axios from 'axios';

const YourPage = ({data,}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // Use the fetched data in your component
  console.log(data)
  return (
    
    <div>
      {/* {incomes.map( income => (
        <div key={income.incomeId}></div>
      ))} */}
      
    </div>
  );
}

export async function getServerSideProps() {
  try {
    // Fetch data from an API or any other data source
    const INCOME_API_BASE_URL = "http://localhost:8082/api/v1/income";

    const res = await fetch(INCOME_API_BASE_URL)
    const data =  res.json()
    return {props:{data,},}
  } catch (error) {
    console.error('Error fetching data:', error);
    // You can return an error message or redirect the user to an error page
    return {
      props: {
        error: 'Failed to fetch data',
      },
    };
  }
}

export default YourPage;
