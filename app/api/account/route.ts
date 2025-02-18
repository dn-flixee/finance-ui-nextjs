

import { account } from '@/src/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';

export const dynamic = 'force-static'
 
export async function GET() {
  const db = drizzle(process.env.DATABASE_URL!)
  try {
    const allAccounts = await db.select().from(account);
    
      return new Response(JSON.stringify({allAccounts}));
  } catch (error: any) {
    console.error("Error fetching accounts:", error);
    return new Response("Error")
  }
}

