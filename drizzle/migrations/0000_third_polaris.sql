CREATE TYPE "public"."organization_role" AS ENUM('OWNER', 'ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('CODEMAIL_FREE', 'CODEMAIL_PRO', 'CODEMAIL_LIFETIME');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'grace_period', 'canceled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."subscription_types" AS ENUM('subscription', 'payment');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('public', 'user', 'redactor', 'moderator', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."user_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "organization" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"image" text,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now(),
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_organization" (
	"userId" uuid NOT NULL,
	"organizationId" uuid NOT NULL,
	"role" "organization_role" DEFAULT 'MEMBER' NOT NULL,
	"joinedAt" timestamp DEFAULT now(),
	CONSTRAINT "user_organization_userId_organizationId_pk" PRIMARY KEY("userId","organizationId")
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "subscription_plan" DEFAULT 'CODEMAIL_FREE' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"subscription_type" "subscription_types" NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"canceled_at" timestamp,
	"trial_ends_at" timestamp,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"last_billing_date" timestamp,
	"next_billing_date" timestamp,
	"stripe_subscription_id" text,
	"price_id" text,
	"payment_method_id" text,
	"quantity" integer DEFAULT 1,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "account" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" uuid,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" "role_type" NOT NULL,
	"description" text,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now(),
	CONSTRAINT "role_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"userId" uuid NOT NULL,
	"roleId" uuid NOT NULL,
	"assignedAt" timestamp DEFAULT now(),
	"assignedBy" uuid,
	CONSTRAINT "user_role_userId_roleId_pk" PRIMARY KEY("userId","roleId")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"createdat" timestamp DEFAULT now(),
	"updatedat" timestamp DEFAULT now(),
	"image" text,
	"password" text,
	"visibility" "user_visibility" DEFAULT 'private' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "user_organization" ADD CONSTRAINT "user_organization_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_organization" ADD CONSTRAINT "user_organization_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_roleId_role_id_fk" FOREIGN KEY ("roleId") REFERENCES "public"."role"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_assignedBy_user_id_fk" FOREIGN KEY ("assignedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_plan_unique_idx" ON "subscription" USING btree ("user_id","plan");