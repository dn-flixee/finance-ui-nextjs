# 📊 True Finance & Phantom Expense Reconciliation Specification

> **System Purpose:** Solve the "phantom expense" problem in personal finance by intelligently reconciling bank transactions with Splitwise shared expenses, tracking IOU receivables as assets, settling incoming UPI payments against IOUs rather than false income, and providing a **"True Balance"** financial dashboard.

---

## 1. Executive Summary & Core Concept

When a user fronts a **₹2,000** dinner bill at *"Social Pune"*:
1. **The Bank Feed:** Imports a `-₹2,000` debit transaction.
2. **The Problem:** Standard personal finance trackers count this as a complete ₹2,000 expense, distorting the monthly dining budget when only ₹500 was their actual share.
3. **The Splitwise Reality:** Splitwise records:
   - User share: `₹500` (Actual Dining Expense)
   - Friends' share: `₹1,500` (Receivable / Asset owed to the user)
4. **The Settlement:** When a friend repays `₹1,500` via UPI:
   - Standard apps count `+₹1,500` as **Income**.
   - **This App:** Recognizes it as **Settling an Asset (Pending IOU)**, with ₹0 impact on income.
5. **The Unified Metric (True Balance):**
   $$\text{True Balance} = \text{Bank Balance} + \text{Pending Splitwise IOUs} - \text{Splitwise Debts Owed}$$

---

## 2. Current Codebase Implementation Audit (What Exists Now)

### Existing Database Models (`prisma/schema.prisma`)
* `User`: NextAuth user with Splitwise OAuth tokens (`splitwiseToken`, `splitwiseUserId`).
* `FinanceAccount`: Bank accounts (`balance`, `accountType`, `bankName`, etc.).
* `Expense`: Expense tracking with basic `splitwiseExpenseId` and `isSplitwiseLinked` boolean.
* `Income`: Income records with `amount`, `accountId`, `incomeSourceId`.
* `Transfer`: Internal transfers between accounts.
* `SplitwiseExpense`: Synced Splitwise expense items (`totalAmount`, `userShare`, `participants`).
* `LinkedEmail` & `EmailTransaction`: Stores raw email and parsed transactions.
* `ChatSession`, `ChatMessage`, `FinancialKnowledge`: AI chat with vector embeddings.

### Existing Services & APIs
* `lib/integrations/splitwise.ts`: Basic OAuth 2.0 flow & `syncExpenses` fetching expenses from Splitwise v3.0.
* `app/api/v1/splitwise/`: Endpoints for `callback`, `connection`, `expenses`, `sync`, and basic 1-to-1 `link`.
* `services/email.service.ts` & `email-filter.service.ts`: Filters emails by Indian bank domains and financial keywords.
* `lib/integrations/local-llm.ts`: Local Ollama LLM integration (`http://raspi.dn:11434`, `tinyllama`).
* `app/api/transactions/classify/route.ts`: Rule-based and LLM category classifier.
* `app/dashboard/page.tsx`: Basic dashboard displaying Total Balance, Monthly Income, Monthly Expenses, and Net Income.

---

## 3. What Was Missing (Gap Analysis)

1. **No Split Transaction Support:** `Expense` model only had a single amount; fronting ₹2,000 could not be split into ₹500 budget expense + ₹1,500 IOU asset.
2. **No IOU & Settlement Ledger:** No `PendingIOU` or `IOUSettlement` tables to track who owes what, how much has been repaid, or link UPI credits to settled IOUs.
3. **No Automatic Transaction Matcher:** No heuristic engine to match incoming bank debits with Splitwise expenses based on date window ($\pm 48\text{h}$) and bill amount.
4. **No Splitwise Net Balance / Friends Fetching:** Splitwise API was only fetching expenses, not `get_friends` balances (who owes you vs who you owe).
5. **No Deterministic Indian Bank Parsers:** Alert parsing relied primarily on LLM or generic filters, lacking robust regex patterns for HDFC, SBI, ICICI, Axis, Kotak, and UPI SMS/Emails.
6. **No Statement Dropzone:** No CSV/PDF upload endpoint to ingest bank statements.
7. **No "True Balance" Dashboard:** Dashboard only showed raw bank balances; no toggle for "Bank Balance" vs "True Balance", no IOU receivables breakdown.
8. **No Transfer "Ignore" Rules:** Transfers (like HDFC $\rightarrow$ Zerodha) lacked rules to mute them from spending calculations or reclassify them as investment transfers.

---

## 4. Milestone Roadmap & Progress Tracker

```
Legend: 
[x] Done
[/] In Progress
[ ] Pending
```

### 🎯 Milestone 1: Core Engine & MVP
- [x] **Architecture & Reference Specification Document**
- [x] **Step 1: Database Schema Expansion (Prisma)**
  - [x] Added `PendingIOU` model (tracks friend name, amount, settled amount, status).
  - [x] Added `IOUSettlement` model (links incoming bank credit to IOU).
  - [x] Added `CategorizationRule` model (patterns for auto-categorization and transfer ignore rules).
  - [x] Enhanced `Expense` model (`userShare`, `iouAmount`, `isReconciled`, `isIgnored`).
  - [x] Enhanced `Income` model (`isSettlement`, `isIgnored`).
  - [x] Expanded `TransactionSource` enum (`SMS_PARSED`, `STATEMENT_PARSED`, `SPLITWISE_SETTLEMENT`).
  - [x] Generated Prisma Client (`prisma generate`).
- [x] **Step 2: Splitwise API Extension**
  - [x] Added `getFriends`, `getCurrentUser`, and `getNetBalances` methods to `SplitwiseService`.
  - [x] Created `/api/v1/splitwise/balances` endpoint.
  - [x] Updated `/api/v1/splitwise/sync` to auto-populate `splitwiseUserId` and return net balances.
- [x] **Step 3: Core Reconciliation Engine Service**
  - [x] Implemented `TransactionMatcher` in `services/reconciliation.service.ts`: Heuristic match on date ($\pm 2$ days) + exact amount + keyword similarity.
  - [x] Implemented `SplitLogic`: Automatically splits fronted bill into actual expense + creates `PendingIOU` records.
  - [x] Implemented `SettlementHandler`: Reconciles incoming UPI credits with active `PendingIOU`s and marks them settled.
  - [x] Created endpoints: `/api/v1/reconciliation/candidates`, `/api/v1/reconciliation/reconcile`, `/api/v1/reconciliation/unreconcile`, `/api/v1/reconciliation/settle`, and `/api/v1/reconciliation/ious`.
  - [x] Upgraded `/api/v1/splitwise/link` to automatically trigger atomic split logic and IOU ledger generation.
- [x] **Step 4: Bank Ingestion Engine**
  - [x] Created deterministic Indian bank alert regex parser `lib/parsers/indian-banks.ts` (HDFC, SBI, ICICI, Axis, and UPI).
  - [x] Created statement upload route `/api/v1/statements/upload` (supporting CSV statements, alert logs, and local Ollama LLM fallback).
- [x] **Step 5: Unified Dashboard ("Bank Balance" vs "True Balance")**
  - [x] Updated `/api/v1/dashboard/stats` to calculate True Balance: $\text{Total Bank Balance} + \text{Pending IOUs} - \text{Splitwise Debts}$, filtering out ignored transactions and settlements from income.
  - [x] Added UI Switch toggle in `app/dashboard/page.tsx` for "Bank Balance" vs "True Balance" with formula breakdown.
  - [x] Added "Pending IOUs (Receivables)" widget displaying outstanding friend amounts.
  - [x] Updated navigation bar in `components/NavBar.tsx` to include Splitwise & IOUs.
- [x] **Step 6: Smart Auto-Categorization & Ignore Rules**
  - [x] Implemented `CategorizationService` in `services/categorization.service.ts`: matches patterns (Zomato $\rightarrow$ Food, Zerodha $\rightarrow$ Ignore/Transfer) and checks for Splitwise candidate alerts.
  - [x] Created CRUD API `/api/v1/rules` for user-defined categorization and ignore rules.
  - [x] Hooked `CategorizationService` into `POST /api/v1/expense` to auto-evaluate rules and flag Splitwise candidates.

---

### 🚀 Future Milestones
* **Milestone 2: Cash Flow & Float Management**
  * Credit Card Due Date vs Splitwise IOU Aging Tracker.
  * 1-Click WhatsApp reminder generator with prefilled UPI link (`upi://pay?pa=...`).
  * "Safe-to-Spend" daily runway indicator.
* **Milestone 3: Wealth & Planning Co-Pilot**
  * Net Worth Engine (Bank + Investments + IOUs - CC Debt - Loans).
  * Envelope Sinking Funds (Emergency Fund, Vacation, Insurance).
  * Automated weekly AI financial debrief via local Ollama.
