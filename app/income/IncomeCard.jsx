import React, { useState } from 'react'
import IncomeService from '../../components/IncomeService'
import Image from 'next/image'
import {
  Sheet,
  SheetClose,
  SheetFooter,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { format, set } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


function IncomeCard({incomeId,name,incomeAmount,accountName,date,incomeSourceName,account,incomeSource}) {
  const [income, setIncome] = useState({
    incomeId:incomeId,
    name:name,
    amount:incomeAmount,
    date:date,
    accountName:accountName,
    incomeSourceName:incomeSourceName,
  })
  
  const handleChange = (e) => {
    const value = e.target.value;
    setIncome({...income,[e.target.name]: value})
  }
  const handleChangedate = (date) => {
    setIncome({ ...income, date });
 };
  const saveIncome = (e) => {
    e.preventDefault();
    console.log("save button press")
    IncomeService.saveIncome(income).then(Response => {
      console.log(Response)
    }).catch(error => {
      console.log(error)
    })
  }
  const updateIncome = (incomeId,e) => {
    e.preventDefault();
    console.log("Update button press")
    IncomeService.updateIncome(incomeId,income).then(Response => {
      console.log(Response)
    }).catch(error => {
      console.log(error)
    })
  }

  const deleteIncome = (incomeId) =>{
      IncomeService.deleteIncome(incomeId)
      .then(Response => {
        console.log(Response)
      })
      .catch(error =>{
        console.log(error);
      })
  }
  
  return (
    <>{console.log("=====")}
    {console.log(income)}
    <Sheet>
  <SheetTrigger className=''>
    
  <div className='flex flex-row justify-between rounded-md h-10 p-2 mb-2'>
        <div className='flex justify-items-start '>
            <Image src="/income_icon.png" width={25} height={25}/>
            <p className='font-semibold p-1'>{income.name}</p>
        </div>
        <div className='flex justify-around justify-items-end '>
            <div className='p-1'><p className='font-semibold'>₹{income.amount}</p></div>
            <div className='pr-1'><img src="/bank_icon.png" width={25} height={25}></img></div>
            <div className='p-1'><p className='font-semibold'>{income.accountName}</p></div>
        </div>
    </div>

  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit Income</SheetTitle>
      <SheetDescription>
      </SheetDescription>
    </SheetHeader>

    <form onSubmit={updateIncome}> 
              <input type="text" 
                name="name"
                value={income.name}
                onChange={(e) => handleChange(e)}
                className="input input-ghost w-full max-w-xs" required />

              <input type="number" 
                name="amount"
                placeholder="Amount"
                value={income.amount} 
                onChange={(e) => handleChange(e)}
                className="input input-ghost w-full max-w-xs" required/>

              <select   
                name='accountName'
                value={income.accountName}
                onChange={(e) => handleChange(e)}
                className="select select-ghost w-full max-w-xs" required>
                  <option value="" disabled selected hidden> -- Select an Account -- </option>
                  {account.map((option,index) => (
                    <option key={index} value={option.name}>
                      {option.name}
                    </option>
                  ))}
              </select>

              <select 
                name='incomeSourceName'
                value={income.incomeSourceName}
                onChange={(e) => handleChange(e)}
                className="select select-ghost w-full max-w-xs" required>
                  <option value="" disabled selected hidden > -- Select an Income Source -- </option>
                  {incomeSource.map((option,index) => (
                    <option key={index} value={option.name}>
                      {option.name}
                    </option>
                  ))}
              </select>


              <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !income.date && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {income.date ? format(income.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={income.date}
                        onSelect={(e) => handleChangedate(e)}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
                <SheetFooter>
                 <SheetClose asChild>
                  <div>
                    <Button type="submit" className="">Save</Button>
                    {/* <Button variant="destructive" className="" onSelect={deleteIncome(income.incomeId)}>Delete</Button> */}
                  </div>
                  </SheetClose>
                </SheetFooter>
                </form >


  </SheetContent>
</Sheet>
</>
    
  )
}

export default IncomeCard