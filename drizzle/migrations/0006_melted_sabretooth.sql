CREATE TYPE "public"."expense_category" AS ENUM('seeds', 'seedlings', 'tools', 'transport', 'platform_fees', 'marketing', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('monthly', 'quarterly', 'annual');--> statement-breakpoint
CREATE TABLE "expense" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"amount" double precision NOT NULL,
	"label" text NOT NULL,
	"category" "expense_category" DEFAULT 'other' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "garden_client" ADD COLUMN "monthly_amount" double precision;--> statement-breakpoint
ALTER TABLE "garden_client" ADD COLUMN "surface_m2" integer;--> statement-breakpoint
ALTER TABLE "garden_client" ADD COLUMN "payment_type" "payment_type" DEFAULT 'monthly';--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_organization_id_idx" ON "expense" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "expense_date_idx" ON "expense" USING btree ("date");--> statement-breakpoint
CREATE INDEX "expense_category_idx" ON "expense" USING btree ("category");--> statement-breakpoint
CREATE INDEX "expense_org_date_idx" ON "expense" USING btree ("organization_id","date");