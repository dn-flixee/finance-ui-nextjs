"use client"

import { useState } from "react"
import { CreditCard, FileText, Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const accounts = [
  { name: "SBI", balance: 40000, icon: "🏦" },
  { name: "HDFC", balance: 50000, icon: "🏛️" },
  { name: "CASH", balance: 40000, icon: "💵" },
]

const transfers = [
  { type: "ATM", from: "HDFC", amount: 1000, to: "CASH" },
]

export default function Dashboard() {
  const [transferMonth, setTransferMonth] = useState("Nov")
  const [transferYear, setTransferYear] = useState("2022")
  const [accountMonth, setAccountMonth] = useState("Nov")
  const [accountYear, setAccountYear] = useState("2022")

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6" />
          <span className="font-bold text-xl">HOME</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>UserName</span>
          <User className="h-6 w-6" />
        </div>
      </header>
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                TRANSFER
              </CardTitle>
              <div className="flex space-x-2">
                <Select value={transferMonth} onValueChange={setTransferMonth}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nov">Nov</SelectItem>
                    <SelectItem value="Dec">Dec</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={transferYear} onValueChange={setTransferYear}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">New</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">November 2022</h3>
                {transfers.map((transfer, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{transfer.type}</span>
                    <span>{transfer.from} ₹ {transfer.amount} {transfer.to}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                ACCOUNT/CARDS
              </CardTitle>
              <div className="flex space-x-2">
                <Select value={accountMonth} onValueChange={setAccountMonth}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nov">Nov</SelectItem>
                    <SelectItem value="Dec">Dec</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={accountYear} onValueChange={setAccountYear}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">New</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <Card key={account.name} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{account.icon} {account.name}</span>
                        <span className="font-bold">₹ {account.balance}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card className="bg-gray-700 border-gray-600 flex items-center justify-center">
                  <CardContent>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-6 w-6" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}