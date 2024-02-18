import React from 'react'
import Navbar from '@/components/navbar'
import Expense from './expense'
import ExpenseSource from './ExpenseSource'

async function page() {
 

  return (

        <div className='flex flex-wrap h-full bg-#232323'>
                <Expense/>
                <ExpenseSource/>
              </div>

  )
}

export default page