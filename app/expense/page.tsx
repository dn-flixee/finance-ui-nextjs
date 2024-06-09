import React from 'react'
import Navbar from '@/components/NavBar'
import Expense from './expense'
import ExpenseSource from './ExpenseSource'
import Chat from '@/components/Chat'

async function page() {
 

  return (
    <>
      <Navbar />
      <div className='flex flex-wrap h-full bg-#232323'>
        <Expense/>
        <ExpenseSource/>
      </div>
      <Chat/>
    </>

  )
}

export default page