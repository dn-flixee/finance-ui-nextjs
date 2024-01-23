import React from 'react'
import Navbar from '@/components/navbar'
import Income from './income'
import IncomeSource from './IncomeSource'

async function page() {
 

  return (

        <div className='flex flex-wrap h-full bg-#232323'>
                <Income/>
                <IncomeSource/>
              </div>

  )
}

export default page