'use client'
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {  CreditCard, PlusCircle } from 'lucide-react'
import AccountSheet from './AccountSheet'
import TransferSheet from './TransferSheet'
import NavBar from '@/components/NavBar'
import AccountService from '@/components/AccountService'
import { useToast } from '@/components/ui/use-toast'

interface Transfer {
  transferId: number;
  name: string;
  fromAccount: number;
  toAccount: number;
  amount: number;
  date: Date;
}

interface Account {
  accountId: number;
  name: string;
  startingBalance: number;
  type: number;
}

export default function Component() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfer, setTransfer] = useState<Transfer[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isTransferSheetOpen, setIsTransferSheetOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null)
  const [isNewAccountSheetOpen, setIsNewAccountSheetOpen] = useState(false)
  const [isNewTransferSheetOpen, setIsNewTransferSheetOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    AccountService.getAccount()
    .then((Response) => {
      console.log(Response.data)
      setAccounts(Response.data)
    }).catch( error => {
      console.log(error)
      toast({
        variant: "destructive",
        duration:5000,
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with fetching expense data.",
      })
    })
  },[])

  const openAccountSheet = (account: Account | null = null) => {
    setSelectedAccount(account)
    setIsAccountSheetOpen(true)
  }

  const closeAccountSheet = () => {
    setIsAccountSheetOpen(false)
    setSelectedAccount(null)
  }

  const openTransferSheet = (transfer: Transfer | null = null) => {
    setSelectedTransfer(transfer)
    setIsTransferSheetOpen(true)
  }

  const closeTransferSheet = () => {
    setIsTransferSheetOpen(false)
    setSelectedTransfer(null)
  }

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]



  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavBar/>
      <main className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-green-500" />
              TRANSFER
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[80px] bg-gray-700">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month)=> (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[80px] bg-gray-700">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2022">2022</SelectItem>
                  {/* Add more years as needed */}
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={openTransferSheet}>
                New
              </Button>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">November 2022</h3>
              {transfer.map((transfer) => (
                <div key={transfer.transferId} className="flex justify-between items-center p-2 hover:bg-gray-700 rounded cursor-pointer" onClick={() => openTransferSheet(transfer)}>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{transfer.name === 'ATM' ? '🏧' : '💸'}</span>
                    <span>{transfer.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{transfer.fromAccount}</span>
                    <span>₹ {transfer.amount}</span>
                    <span>{transfer.toAccount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-green-500" />
              ACCOUNT/CARDS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Select defaultValue="Nov">
                <SelectTrigger className="w-[80px] bg-gray-700">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nov">Nov</SelectItem>
                  {/* Add more months as needed */}
                </SelectContent>
              </Select>
              <Select defaultValue="2022">
                <SelectTrigger className="w-[80px] bg-gray-700">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2022">2022</SelectItem>
                  {/* Add more years as needed */}
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={openAccountSheet}>
                New
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {accounts.map((account) => (
                <div key={account.accountId} className="bg-gray-700 p-4 rounded-lg cursor-pointer" onClick={() => openAccountSheet(account)}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold">{account.name}</span>
                  </div>
                  <div className="text-xl font-bold">₹ {account.startingBalance}</div>
                </div>
              ))}
              <Button variant="outline" className="h-full flex items-center justify-center" onClick={openAccountSheet}>
                <PlusCircle className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <AccountSheet isOpen={isAccountSheetOpen} onClose={closeAccountSheet} accountToEdit={selectedAccount} />
      <TransferSheet isOpen={isTransferSheetOpen} onClose={closeTransferSheet} transferToEdit={selectedTransfer} accountData={accounts} />
      {/* <AccountSheet isOpen={isAccountSheetOpen} onClose={closeAccountSheet} accountToEdit={null} />
      <TransferSheet isOpen={isTransferSheetOpen} onClose={closeTransferSheet} transferToEdit={null} /> */}
    </div>
  )

}