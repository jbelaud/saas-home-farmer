ALTER TABLE "garden_client" ADD COLUMN "access_token" uuid DEFAULT uuid_generate_v4() NOT NULL;--> statement-breakpoint
ALTER TABLE "garden_client" ADD COLUMN "visit_frequency_days" integer DEFAULT 21 NOT NULL;--> statement-breakpoint
ALTER TABLE "garden_client" ADD COLUMN "next_visit_date" timestamp;--> statement-breakpoint
CREATE UNIQUE INDEX "garden_client_access_token_unique" ON "garden_client" USING btree ("access_token");