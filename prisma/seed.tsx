// import { PrismaClient } from '@prisma/client'
// import bcrypt from 'bcrypt'

// const prisma = new PrismaClient()

// async function main() {
//   console.log('Seeding database...')
  
//   // Create a demo user
//   const hashedPassword = await bcrypt.hash('demo123', 12)
  
//   const user = await prisma.user.create({
//     data: {
//       name: 'Demo User',
//       email: 'demo@example.com',
//       password: hashedPassword,
//     }
//   })

//   console.log(`Created user: ${user.email}`)

//   // Create demo accounts
//   const checking = await prisma.financeAccount.create({
//     data: {
//       name: 'Checking Account',
//       startingBalance: 5000,
//       type: 1,
//       userId: user.id
//     }
//   })

//   const savings = await prisma.financeAccount.create({
//     data: {
//       name: 'Savings Account',
//       startingBalance: 15000,
//       type: 2,
//       userId: user.id
//     }
//   })

//   console.log(`Created 2 accounts`)

//   // Create demo income sources
//   const salary = await prisma.incomeSource.create({
//     data: {
//       name: 'Salary',
//       goal: 5000,
//       userId: user.id
//     }
//   })

//   // Create demo expense sources
//   const groceries = await prisma.expenseSource.create({
//     data: {
//       name: 'Groceries',
//       budget: 800,
//       userId: user.id
//     }
//   })

//   console.log(`Created income and expense sources`)

//   // Create sample income
//   await prisma.income.create({
//     data: {
//       name: 'Monthly Salary',
//       amount: 4500,
//       date: new Date('2024-01-15'),
//       accountId: checking.accountId,
//       incomeSourceId: salary.incomeSourceId,
//       userId: user.id
//     }
//   })

//   // Create sample expense
//   await prisma.expense.create({
//     data: {
//       name: 'Weekly Groceries',
//       amount: 120,
//       date: new Date('2024-01-10'),
//       accountId: checking.accountId,
//       expenseSourceId: groceries.expenseSourceId,
//       userId: user.id
//     }
//   })

//   console.log('Database seeded successfully!')
//   console.log('Demo user credentials:')
//   console.log('Email: demo@example.com')
//   console.log('Password: demo123')
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
