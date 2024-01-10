"use client"
import React,{useState,useEffect} from 'react'
import IncomeSourceCard from './IncomeSourceCard'
import IncomeSourceService from './IncomeSourceService';
import Image from 'next/image';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

  import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
  
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function IncomeSource() {

  const [incomeSourceCard,setIncomeSourceCard] = useState([])

  const [incomeSource, setIncomeSource] = useState({
    name:"",
    goal:"",
  })

  useEffect(() => {
    IncomeSourceService.getIncomeSource()
    .then((Response) => {
      console.log(Response.data)
      setIncomeSourceCard(Response.data)
    }).catch(error => {
      console.log(error)
    })
  }, [])

  const handleChange = (e) => {
    const value = e.target.value;
    setIncomeSource({...incomeSource,[e.target.name]: value})
  }

  const saveIncome = (e) => {
    e.preventDefault();
    console.log("save button press")
    IncomeSourceService.saveIncomeSource(incomeSource).then(Response => {
      console.log(Response)
    }).catch(error => {
      console.log(error)
    })
  }
  
  return (
    <div className='flex-1 border rounded-2xl border-primary m-6'>

        <div className='flex m-4'>
          <Image className='m-2' src="/wallet_icon.png" width={30} height={30}/>
          <p className="text-bold m-2 text-2xl text-primary">I N C O M E </p>
          <p className="text-bold m-2 text-2xl text-primary">S O U R C E</p>
        </div>

      <div className="container p-4">
       <div className="flex flex-row">
        <div className="flex flex-grow">
        <div className="mr-2">
        <Select className=" bg-primary ">
            <SelectTrigger className="max-w-28">
                <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="est">Jan</SelectItem>
                <SelectItem value="cst">Feb</SelectItem>
                <SelectItem value="mst">Mar</SelectItem>
                <SelectItem value="pst">Apr</SelectItem>
                <SelectItem value="akst">May</SelectItem>
            </SelectContent>
        </Select>
        </div>
        <div className="mr-2">
        <Select>
            <SelectTrigger className="max-w-28">
                <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="est">2021</SelectItem>
                <SelectItem value="cst">2022</SelectItem>
                <SelectItem value="mst">2023</SelectItem>
                <SelectItem value="pst">2024</SelectItem>
                <SelectItem value="akst">2025</SelectItem>
            </SelectContent>
        </Select>
        </div>
        </div>
          <div className='flex'>

          <Sheet>
                <SheetTrigger><Button className="bg-blue-600">New</Button></SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle></SheetTitle>
                    <SheetDescription>
                    </SheetDescription>
                    </SheetHeader>

              <input type="text" 
                name="name"
                value={incomeSource.name}
                onChange={(e) => handleChange(e)}
                placeholder="Name" 
                className="input input-ghost w-full max-w-xs" />

              <input type="number" 
                name="goal"
                placeholder="goal"
                value={incomeSource.goal} 
                onChange={(e) => handleChange(e)}
                className="input input-ghost w-full max-w-xs" />

              
                <div className="modal-action">
                  <button onClick={saveIncome} className="btn">Save</button>
                </div>
                </SheetContent>
            </Sheet>

          </div>
        </div>
        <hr className='mt-2 mb-8'/>
          <div className="flex flex-wrap gap-3 ">
            {incomeSourceCard.map( incomeSource =>(
            <IncomeSourceCard id={incomeSource.incomeSourceId} name={incomeSource.name} goal={incomeSource.goal} />
            ))}
          </div>
      </div>
      </div>
  )
}

export default IncomeSource