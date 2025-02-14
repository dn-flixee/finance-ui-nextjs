  "use client"

  import { useEffect, useState } from "react"
  import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, FileTextIcon, UserCircleIcon } from "lucide-react"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
  import { PieChart, Pie, Cell } from 'recharts'
  import ExpenseService from "@/components/ExpenseService"
  import { string } from "zod"
import NavBar from "@/components/NavBar"


  const financeData = {
    weekly: [
      { name: 'Mon', income: 500, spending: 300 },
      { name: 'Tue', income: 600, spending: 400 },
      { name: 'Wed', income: 550, spending: 350 },
      { name: 'Thu', income: 700, spending: 450 },
      { name: 'Fri', income: 800, spending: 500 },
      { name: 'Sat', income: 750, spending: 600 },
      { name: 'Sun', income: 900, spending: 700 },
    ],
    monthly: [
      { name: 'May', income: 3000, spending: 2500 },
      { name: 'Jun', income: 3800, spending: 3000 },
      { name: 'Jul', income: 3500, spending: 4000 },
      { name: 'Aug', income: 4500, spending: 3500 },
      { name: 'Sep', income: 5500, spending: 3000 },
      { name: 'Oct', income: 4800, spending: 4800 },
      { name: 'Nov', income: 5200, spending: 2500 },
      { name: 'Dec', income: 4700, spending: 4000 },
    ],
    yearly: [
      { name: '2016', income: 30000, spending: 25000 },
      { name: '2017', income: 38000, spending: 30000 },
      { name: '2018', income: 35000, spending: 40000 },
      { name: '2019', income: 45000, spending: 35000 },
      { name: '2020', income: 55000, spending: 30000 },
      { name: '2021', income: 48000, spending: 48000 },
      { name: '2022', income: 52000, spending: 25000 },
      { name: '2023', income: 47000, spending: 40000 },
    ],
  }

  const expenseData1 = {
    "NA": [
    {
      "name": "NA",
      "value": 0
    }
    ]
  }
  interface ExpenseEntry {
    name: string;
    value: number;
  }

  interface ExpenseData {
    [month: string]: ExpenseEntry[];
  }


  const COLORS = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#FFCD56', '#4CAF50',
    '#F44336', '#2196F3', '#FFEB3B', '#00BCD4'
  ];

  export default function FinanceDashboard() {
    let [expenseData, setExpenseData] = useState(expenseData1)
    const [financeTimeframe, setFinanceTimeframe] = useState("monthly") 
    const [expenseMonth, setExpenseMonth] = useState("NA")

    useEffect(() => {
      ExpenseService.getExpenseFromLastYear()
      .then((Response) => {
        console.log(Response.data)
        setExpenseData(Response.data)
        // Update the expenseMonth state if the response data has different months
        const newMonthNames = Object.keys(Response.data)
        if (newMonthNames.length > 0) {
          setExpenseMonth(newMonthNames[0])
        }

      }).catch(error => {
        console.log(error)
      })
    }, [])

    return (
      <>
      <NavBar/>
      <div className="min-h-screen bg-gray-900 text-white">
        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹ 54,432</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹ 36,675</div>
                <p className="text-xs text-gray-400">This Week's income</p>
                <div className="text-green-500 text-sm mt-1 flex items-center">
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                  12.23%
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹ 12,252</div>
                <p className="text-xs text-gray-400">This Week's expense</p>
                <div className="text-red-500 text-sm mt-1 flex items-center">
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                  11.56%
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2 bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Finance Statistic</CardTitle>
                  <Select value={financeTimeframe} onValueChange={setFinanceTimeframe}>
                    <SelectTrigger className="w-[180px] bg-gray-700">
                      <SelectValue placeholder="Select a timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financeData[financeTimeframe]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="spending" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Expense</CardTitle>
                  <Select value={expenseMonth} onValueChange={setExpenseMonth}>
                    <SelectTrigger className="w-[180px] bg-gray-700">
                      <SelectValue placeholder="Select a month" />
                    </SelectTrigger>
                    <SelectContent>
                    {expenseData && Object.keys(expenseData).map((month) => (
                                      <SelectItem key={month} value={month}>{month}</SelectItem>
                                    ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expenseData[expenseMonth]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseData[expenseMonth].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {expenseData[expenseMonth].map((item, index) => (
                    <div key={item.name} className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Manage</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      </>
    )
  }