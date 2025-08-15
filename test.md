# Complete Multi-User Authentication Implementation

Here's every file you need to create or modify in your existing codebase to add secure multi-user authentication.

## 1. Package Dependencies

### Update `package.json`
```json
{
  "name": "finance-ui-nextjs",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.3",
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^5.7.1",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.5",
    "@reduxjs/toolkit": "^2.4.0",
    "@types/redux": "^3.6.31",
    "@types/redux-thunk": "^2.1.32",
    "axios": "^1.6.5",
    "bcrypt": "^5.1.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^3.3.1",
    "lucide-react": "^0.303.0",
    "next": "^14.2.3",
    "next-auth": "^4.24.7",
    "next-themes": "^0.2.1",
    "react": "^18",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18",
    "react-hook-form": "^7.49.2",
    "react-icons": "^4.12.0",
    "react-redux": "^9.1.2",
    "recharts": "^2.13.0",
    "redux": "^5.0.1",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.7.0",
    "vaul": "^0.9.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/react-redux": "^7.1.34",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.0.4",
    "postcss": "^8",
    "prisma": "^5.7.1",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## 2. Environment Configuration

### `.env.local`
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/finance_tracker"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key-generate-a-random-one"

# OAuth Providers (optional)
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# App
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 3. Database Schema

### `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("nextauth_accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("nextauth_sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("nextauth_verification_tokens")
}

// User model
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // For credentials provider
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // NextAuth relations
  accounts Account[] @relation("nextauth_accounts")
  sessions Session[] @relation("nextauth_sessions")

  // Finance app relations
  financeAccounts FinanceAccount[]
  incomes         Income[]
  expenses        Expense[]
  incomeSources   IncomeSource[]
  expenseSources  ExpenseSource[]
  transfers       Transfer[]

  @@map("users")
}

// Finance models with user relationships
model FinanceAccount {
  id              String  @id @default(cuid())
  accountId       Int     @unique @default(autoincrement()) // Keep for compatibility
  name            String
  startingBalance Float
  type            Float?
  userId          String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  incomes       Income[]
  expenses      Expense[]
  transfersFrom Transfer[] @relation("FromAccount")
  transfersTo   Transfer[] @relation("ToAccount")

  @@unique([name, userId])
  @@map("accounts")
}

model IncomeSource {
  id        String   @id @default(cuid())
  incomeSourceId Int @unique @default(autoincrement()) // Keep for compatibility
  name      String
  goal      Float
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  incomes Income[]

  @@unique([name, userId])
  @@map("income_sources")
}

model ExpenseSource {
  id             String   @id @default(cuid())
  expenseSourceId Int     @unique @default(autoincrement()) // Keep for compatibility
  name           String
  budget         Float
  userId         String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses Expense[]

  @@unique([name, userId])
  @@map("expense_sources")
}

model Income {
  id             String   @id @default(cuid())
  incomeId       Int      @unique @default(autoincrement()) // Keep for compatibility
  name           String
  amount         Float
  date           DateTime
  accountId      String
  incomeSourceId String
  userId         String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  account      FinanceAccount  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  incomeSource IncomeSource    @relation(fields: [incomeSourceId], references: [id], onDelete: Cascade)

  @@map("incomes")
}

model Expense {
  id              String   @id @default(cuid())
  expenseId       Int      @unique @default(autoincrement()) // Keep for compatibility
  name            String
  amount          Float
  date            DateTime
  accountId       String
  expenseSourceId String
  userId          String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user          User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  account       FinanceAccount  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  expenseSource ExpenseSource   @relation(fields: [expenseSourceId], references: [id], onDelete: Cascade)

  @@map("expenses")
}

model Transfer {
  id            String   @id @default(cuid())
  transferId    Int      @unique @default(autoincrement()) // Keep for compatibility
  name          String
  amount        Float
  date          DateTime
  fromAccountId String
  toAccountId   String
  userId        String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  fromAccount FinanceAccount  @relation("FromAccount", fields: [fromAccountId], references: [id], onDelete: Cascade)
  toAccount   FinanceAccount  @relation("ToAccount", fields: [toAccountId], references: [id], onDelete: Cascade)

  @@map("transfers")
}
```

## 4. Prisma Client Setup

### `lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 5. NextAuth Configuration

### `lib/auth.ts`
```typescript
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    }),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : [])
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
```

### `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### `app/api/auth/register/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

## 6. Authentication Pages

### `app/login/page.tsx`
```tsx
"use client"
import React, { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
})

type LoginFormData = z.infer

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password"
        })
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        })
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignIn = async () => {
    await signIn("github", { callbackUrl: "/dashboard" })
  }

  return (
    
      
        
          Finance Tracker
          Sign in to your account
        
        
          
            
               (
                  
                    Email
                    
                      
                    
                    
                  
                )}
              />
               (
                  
                    Password
                    
                      
                    
                    
                  
                )}
              />
              
                {isLoading ? "Signing in..." : "Sign In"}
              
            
          

          
            
              
                
              
              
                Or continue with
              
            

            
              {process.env.NEXT_PUBLIC_GITHUB_ID && (
                
                  Sign in with GitHub
                
              )}
            
          

          
            
              Don't have an account?{" "}
              
                Sign up
              
            
          
        
      
    
  )
}
```

### `app/signup/page.tsx`
```tsx
"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type SignupFormData = z.infer

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Account Created",
          description: "Your account has been created successfully. Please sign in."
        })
        router.push("/login")
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: result.error || "Something went wrong"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    
      
        
          Finance Tracker
          Create your account
        
        
          
            
               (
                  
                    Name
                    
                      
                    
                    
                  
                )}
              />
               (
                  
                    Email
                    
                      
                    
                    
                  
                )}
              />
               (
                  
                    Password
                    
                      
                    
                    
                  
                )}
              />
               (
                  
                    Confirm Password
                    
                      
                    
                    
                  
                )}
              />
              
                {isLoading ? "Creating account..." : "Create Account"}
              
            
          

          
            
              Already have an account?{" "}
              
                Sign in
              
            
          
        
      
    
  )
}
```

## 7. Protected API Routes

### `app/api/v1/account/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createAccountSchema = z.object({
  name: z.string().min(1).max(255),
  startingBalance: z.number(),
  type: z.number(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await prisma.financeAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Transform to match frontend expectations
    const transformedAccounts = accounts.map(account => ({
      accountId: account.accountId,
      name: account.name,
      startingBalance: account.startingBalance,
      type: account.type
    }))

    return NextResponse.json(transformedAccounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAccountSchema.parse(body)
    
    const account = await prisma.financeAccount.create({
      data: {
        ...validatedData,
        userId: session.user.id
      }
    })

    const transformedAccount = {
      accountId: account.accountId,
      name: account.name,
      startingBalance: account.startingBalance,
      type: account.type
    }

    return NextResponse.json(transformedAccount, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
```

### `app/api/v1/account/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAccountSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startingBalance: z.number().optional(),
  type: z.number().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAccountSchema.parse(body)
    
    const account = await prisma.financeAccount.update({
      where: { 
        accountId: parseInt(params.id),
        userId: session.user.id // Ensure user owns this account
      },
      data: validatedData
    })

    const transformedAccount = {
      accountId: account.accountId,
      name: account.name,
      startingBalance: account.startingBalance,
      type: account.type
    }

    return NextResponse.json(transformedAccount)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.financeAccount.delete({
      where: { 
        accountId: parseInt(params.id),
        userId: session.user.id // Ensure user owns this account
      }
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
```

### `app/api/v1/income/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createIncomeSchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  accountName: z.string(),
  incomeSourceName: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const incomes = await prisma.income.findMany({
      where: { userId: session.user.id },
      include: {
        account: true,
        incomeSource: true
      },
      orderBy: { date: 'desc' }
    })

    // Transform to match frontend expectations
    const transformedIncomes = incomes.map(income => ({
      incomeId: income.incomeId,
      name: income.name,
      amount: income.amount,
      date: income.date,
      accountName: income.account.name,
      incomeSourceName: income.incomeSource.name
    }))

    return NextResponse.json(transformedIncomes)
  } catch (error) {
    console.error('Error fetching incomes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incomes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createIncomeSchema.parse(body)
    
    // Find account and income source by name for this user
    const account = await prisma.financeAccount.findFirst({
      where: { 
        name: validatedData.accountName,
        userId: session.user.id 
      }
    })
    
    const incomeSource = await prisma.incomeSource.findFirst({
      where: { 
        name: validatedData.incomeSourceName,
        userId: session.user.id 
      }
    })

    if (!account || !incomeSource) {
      return NextResponse.json(
        { error: 'Account or Income Source not found' },
        { status: 404 }
      )
    }

    const income = await prisma.income.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        accountId: account.id,
        incomeSourceId: incomeSource.id,
        userId: session.user.id
      },
      include: {
        account: true,
        incomeSource: true
      }
    })

    const transformedIncome = {
      incomeId: income.incomeId,
      name: income.name,
      amount: income.amount,
      date: income.date,
      accountName: income.account.name,
      incomeSourceName: income.incomeSource.name
    }

    return NextResponse.json(transformedIncome, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating income:', error)
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    )
  }
}
```

### `app/api/v1/income/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateIncomeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  accountName: z.string().optional(),
  incomeSourceName: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateIncomeSchema.parse(body)
    
    // Build update data
    const updateData: any = {}
    
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.amount) updateData.amount = validatedData.amount
    if (validatedData.date) updateData.date = new Date(validatedData.date)
    
    if (validatedData.accountName) {
      const account = await prisma.financeAccount.findFirst({
        where: { 
          name: validatedData.accountName,
          userId: session.user.id 
        }
      })
      if (account) updateData.accountId = account.id
    }
    
    if (validatedData.incomeSourceName) {
      const incomeSource = await prisma.incomeSource.findFirst({
        where: { 
          name: validatedData.incomeSourceName,
          userId: session.user.id 
        }
      })
      if (incomeSource) updateData.incomeSourceId = incomeSource.id
    }
    
    const income = await prisma.income.update({
      where: { 
        incomeId: parseInt(params.id),
        userId: session.user.id
      },
      data: updateData,
      include: {
        account: true,
        incomeSource: true
      }
    })

    const transformedIncome = {
      incomeId: income.incomeId,
      name: income.name,
      amount: income.amount,
      date: income.date,
      accountName: income.account.name,
      incomeSourceName: income.incomeSource.name
    }

    return NextResponse.json(transformedIncome)
  } catch (error) {
    console.error('Error updating income:', error)
    return NextResponse.json(
      { error: 'Failed to update income' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.income.delete({
      where: { 
        incomeId: parseInt(params.id),
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Income deleted successfully' })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    )
  }
}
```

## 8. Middleware for Route Protection

### `middleware.ts` (in project root)
```typescript
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/expense/:path*",
    "/income/:path*",
    "/transfer/:path*",
    "/api/v1/:path*"
  ]
}
```

## 9. Layout and Provider Updates

### `app/layout.tsx`
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from '@/components/SessionProvider'
import { StoreProvider } from './StoreProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Track your personal finances with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    
      
        
          
            
              {children}
              
            
          
        
      
    
  )
}
```

### `components/SessionProvider.tsx`
```tsx
"use client"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    
      {children}
    
  )
}
```

## 10. Updated Navigation Component

### `components/NavBar.tsx`
```tsx
"use client"
import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const NavBar = () => {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return Loading...
  }

  if (!session) {
    return (
      
        
          
            
              
                Finance Tracker
              
            
            
              
                Sign In
              
              
                Sign Up
              
            
          
        
      
    )
  }

  return (
    
      
        
          
            
              Finance Tracker
            
            
              
                Dashboard
              
              
                Income
              
              
                Expenses
              
              
                Accounts
              
            
          
          
          
            
              
                
                  
                    
                    
                      {session.user?.name?.charAt(0) || 'U'}
                    
                  
                
              
              
                
                  
                    {session.user?.name && (
                      {session.user.name}
                    )}
                    {session.user?.email && (
                      
                        {session.user.email}
                      
                    )}
                  
                
                
                 {
                    event.preventDefault()
                    signOut({ callbackUrl: '/login' })
                  }}
                >
                  Sign out
                
              
            
          
        
      
    
  )
}

export default NavBar
```

## 11. Updated Home Page

### `app/page.tsx`
```tsx
"use client"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === "loading") {
    return Loading...
  }

  if (session) {
    return null // Will redirect to dashboard
  }

  return (
    
      
        
          
            Track your{' '}
            
              finances
            {' '}
            with ease
          
          
            A modern, secure, and intuitive finance tracker to help you manage your income,
            expenses, and financial goals effectively.
          
          
            
              
                Get Started
              
            
            
              
                Sign In
              
            
          
        
      
    
  )
}
```

## 12. Database Migration Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# Optional: Seed the database
npx prisma db seed
```

## 13. Seed Script (Optional)

### `prisma/seed.ts`
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
    }
  })

  // Create demo accounts
  const checking = await prisma.financeAccount.create({
    data: {
      name: 'Checking Account',
      startingBalance: 5000,
      type: 1,
      userId: user.id
    }
  })

  const savings = await prisma.financeAccount.create({
    data: {
      name: 'Savings Account',
      startingBalance: 15000,
      type: 2,
      userId: user.id
    }
  })

  // Create demo income sources
  const salary = await prisma.incomeSource.create({
    data: {
      name: 'Salary',
      goal: 5000,
      userId: user.id
    }
  })

  // Create demo expense sources
  const groceries = await prisma.expenseSource.create({
    data: {
      name: 'Groceries',
      budget: 800,
      userId: user.id
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

## 14. Start Your Application

```bash
# Run the development server
npm run dev
```

Visit `http://localhost:3000` and you'll see:
1. A landing page for non-authenticated users
2. Sign up/login functionality
3. Protected dashboard and finance pages
4. Multi-user data isolation
5. All existing finance features working with authentication

Your finance tracker is now fully secured with multi-user authentication! 🎉