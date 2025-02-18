CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_expense_source_expense_source_expense_source_id_fk" FOREIGN KEY ("expense_source") REFERENCES "public"."expense_source"("expense_source_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income" ADD CONSTRAINT "income_income_source_income_source_income_source_id_fk" FOREIGN KEY ("income_source") REFERENCES "public"."income_source"("income_source_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_from_account_account_account_id_fk" FOREIGN KEY ("from_account") REFERENCES "public"."account"("account_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer" ADD CONSTRAINT "transfer_to_account_account_account_id_fk" FOREIGN KEY ("to_account") REFERENCES "public"."account"("account_id") ON DELETE no action ON UPDATE no action;