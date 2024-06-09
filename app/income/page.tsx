import React from 'react'
import Navbar from '@/components/NavBar'
import Income from './income'
import IncomeSource from './IncomeSource'
import Chat from '@/components/Chat'

async function page() {
 

  return (
        <>
        <Navbar/>
        <div className='flex flex-wrap h-full bg-#232323'>
          
                <Income/>
                <IncomeSource/>            
        </div>
        <Chat/>
        </>

  )
}

export default page