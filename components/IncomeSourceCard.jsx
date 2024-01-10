import React,{useState,useEffect} from 'react'
import IncomeService from './IncomeService';
import Image from 'next/image';
import { Progress } from "@/components/ui/progress"


function IncomeSourceCard({id,name,goal}) {

  const [incomeTotal, setIncomeTotal] = useState();

  useEffect(() => {
    IncomeService.fetchIncomeTotalById(id)
    .then((Response) => {
      console.log(Response.data)
      if(Response.data)
      setIncomeTotal(Response.data)
    }).catch(error => {
      console.log(error)
    })
  }, [])

  return (
    <div className="flex flex-col w-64 bg-primary text-black rounded-md">
            <div className="flex flex-row m-2">
              <div className='justify-start '>
                <Image src="/income_icon.png" width={25} height={25}/>  
              </div>
              <div className='ml-2'>{name}</div>
            </div>

            <div className='m-1 ml-2'><p>₹{incomeTotal} / ₹{goal}</p></div>
            
            <div className=" flex flex-nowrap items-center m-1">
            <Progress value={(incomeTotal/goal*100).toFixed(2)}/>{(incomeTotal/goal*100).toFixed(2)}%

            </div>
        </div>
  )
}

export default IncomeSourceCard