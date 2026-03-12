CREATE TYPE "public"."country" AS ENUM('FR', 'BE', 'CH', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."garden_exposure" AS ENUM('full_sun', 'partial_shade', 'full_shade');--> statement-breakpoint
CREATE TYPE "public"."intervention_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."intervention_type" AS ENUM('maintenance', 'plantation', 'setup', 'harvest_support', 'consultation');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."invoice_type" AS ENUM('quote', 'invoice');--> statement-breakpoint
CREATE TYPE "public"."soil_type" AS ENUM('clay', 'sandy', 'loamy', 'chalky', 'peaty', 'silty');--> statement-breakpoint
CREATE TABLE "farmer_profile" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"company_name" text,
	"siret" text,
	"vat_number" text,
	"address_street" text,
	"address_city" text,
	"address_zip" text,
	"country" "country" DEFAULT 'FR' NOT NULL,
	"is_sap_enabled" boolean DEFAULT false NOT NULL,
	"subscription_start_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "farmer_profile_organization_id_unique" UNIQUE("organization_id")
);
--> statement-breakpoint
CREATE TABLE "garden_client" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"address_street" text NOT NULL,
	"address_city" text NOT NULL,
	"address_zip" text NOT NULL,
	"surface_sqm" double precision,
	"exposure" "garden_exposure",
	"soil_type" "soil_type",
	"has_water_access" boolean DEFAULT false NOT NULL,
	"water_access_notes" text,
	"access_digicode" text,
	"access_portal_code" text,
	"access_key_location" text,
	"access_notes" text,
	"has_tax_advantage" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "harvest" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"garden_client_id" uuid NOT NULL,
	"harvest_date" timestamp NOT NULL,
	"crop_name" text NOT NULL,
	"weight_kg" double precision NOT NULL,
	"market_price_per_kg" double precision NOT NULL,
	"calculated_value_eur" double precision NOT NULL,
	"photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intervention" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"garden_client_id" uuid NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"duration_minutes" double precision,
	"status" "intervention_status" DEFAULT 'scheduled' NOT NULL,
	"type" "intervention_type" DEFAULT 'maintenance' NOT NULL,
	"pro_notes" text,
	"photo_urls" text[] DEFAULT '{}' NOT NULL,
	"checklist_items" text[] DEFAULT '{}' NOT NULL,
	"checklist_done" boolean[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"organization_id" uuid NOT NULL,
	"garden_client_id" uuid NOT NULL,
	"type" "invoice_type" DEFAULT 'invoice' NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"invoice_number" text NOT NULL,
	"issue_date" timestamp NOT NULL,
	"due_date" timestamp,
	"amount_ht" double precision NOT NULL,
	"vat_rate" double precision DEFAULT 0 NOT NULL,
	"amount_ttc" double precision NOT NULL,
	"pdf_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "farmer_profile" ADD CONSTRAINT "farmer_profile_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garden_client" ADD CONSTRAINT "garden_client_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest" ADD CONSTRAINT "harvest_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "harvest" ADD CONSTRAINT "harvest_garden_client_id_garden_client_id_fk" FOREIGN KEY ("garden_client_id") REFERENCES "public"."garden_client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intervention" ADD CONSTRAINT "intervention_garden_client_id_garden_client_id_fk" FOREIGN KEY ("garden_client_id") REFERENCES "public"."garden_client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_garden_client_id_garden_client_id_fk" FOREIGN KEY ("garden_client_id") REFERENCES "public"."garden_client"("id") ON DELETE cascade ON UPDATE no action;