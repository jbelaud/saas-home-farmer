ALTER TABLE "harvest" ALTER COLUMN "market_price_per_kg" SET DATA TYPE numeric(10, 4);--> statement-breakpoint
ALTER TABLE "harvest" ALTER COLUMN "calculated_value_eur" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "invoice" ALTER COLUMN "amount_ht" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "invoice" ALTER COLUMN "vat_rate" SET DATA TYPE numeric(5, 4);--> statement-breakpoint
ALTER TABLE "invoice" ALTER COLUMN "vat_rate" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "invoice" ALTER COLUMN "amount_ttc" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
CREATE INDEX "garden_client_organization_id_idx" ON "garden_client" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "garden_client_is_active_idx" ON "garden_client" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "garden_client_created_at_idx" ON "garden_client" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "harvest_organization_id_idx" ON "harvest" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "harvest_garden_client_id_idx" ON "harvest" USING btree ("garden_client_id");--> statement-breakpoint
CREATE INDEX "harvest_date_idx" ON "harvest" USING btree ("harvest_date");--> statement-breakpoint
CREATE INDEX "harvest_org_client_idx" ON "harvest" USING btree ("organization_id","garden_client_id");--> statement-breakpoint
CREATE INDEX "intervention_organization_id_idx" ON "intervention" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "intervention_garden_client_id_idx" ON "intervention" USING btree ("garden_client_id");--> statement-breakpoint
CREATE INDEX "intervention_scheduled_date_idx" ON "intervention" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "intervention_status_idx" ON "intervention" USING btree ("status");--> statement-breakpoint
CREATE INDEX "intervention_org_date_idx" ON "intervention" USING btree ("organization_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "invoice_organization_id_idx" ON "invoice" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invoice_garden_client_id_idx" ON "invoice" USING btree ("garden_client_id");--> statement-breakpoint
CREATE INDEX "invoice_status_idx" ON "invoice" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_issue_date_idx" ON "invoice" USING btree ("issue_date");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_number_org_unique" ON "invoice" USING btree ("invoice_number","organization_id");