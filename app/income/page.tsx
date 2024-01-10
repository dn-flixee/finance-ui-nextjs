import React from 'react'
import Navbar from '@/components/navbar'
import IncomeSource from '@/components/incomeSource'
import Income from './income'
import Income1 from './income1'

function IncomeDashboard() {
  
  return (

        <div className='flex flex-wrap h-full bg-#232323'>
                <Income/>
                {/* <IncomeSource/> */}
              </div>

  )
}

export default IncomeDashboard