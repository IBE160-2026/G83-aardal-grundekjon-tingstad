CREATE TABLE "plan_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_week_id" uuid NOT NULL,
	"version" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_version_week_version" UNIQUE("plan_week_id","version")
);
--> statement-breakpoint
CREATE TABLE "plan_week" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"program_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"current_version" smallint DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_week_program_week_start" UNIQUE("program_id","week_start")
);
--> statement-breakpoint
CREATE TABLE "program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"focus" text NOT NULL,
	"started_on" date NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"fast_short_run_km" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_slot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"plan_week_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_hint" (
	"user_id" text NOT NULL,
	"hint_key" text NOT NULL,
	"dismissed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_hint_user_id_hint_key_pk" PRIMARY KEY("user_id","hint_key")
);
--> statement-breakpoint
CREATE TABLE "version_session" (
	"plan_version_id" uuid NOT NULL,
	"session_slot_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"kind" text NOT NULL,
	"name_key" text NOT NULL,
	"exercises" jsonb,
	"distance_km" double precision,
	CONSTRAINT "version_session_plan_version_id_session_slot_id_pk" PRIMARY KEY("plan_version_id","session_slot_id")
);
--> statement-breakpoint
ALTER TABLE "plan_version" ADD CONSTRAINT "plan_version_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_version" ADD CONSTRAINT "plan_version_plan_week_id_plan_week_id_fk" FOREIGN KEY ("plan_week_id") REFERENCES "public"."plan_week"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_week" ADD CONSTRAINT "plan_week_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_week" ADD CONSTRAINT "plan_week_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program" ADD CONSTRAINT "program_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_slot" ADD CONSTRAINT "session_slot_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_slot" ADD CONSTRAINT "session_slot_plan_week_id_plan_week_id_fk" FOREIGN KEY ("plan_week_id") REFERENCES "public"."plan_week"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_hint" ADD CONSTRAINT "user_hint_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version_session" ADD CONSTRAINT "version_session_plan_version_id_plan_version_id_fk" FOREIGN KEY ("plan_version_id") REFERENCES "public"."plan_version"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version_session" ADD CONSTRAINT "version_session_session_slot_id_session_slot_id_fk" FOREIGN KEY ("session_slot_id") REFERENCES "public"."session_slot"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version_session" ADD CONSTRAINT "version_session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "program_one_current_per_user" ON "program" USING btree ("user_id") WHERE "program"."is_current";--> statement-breakpoint
CREATE INDEX "session_slot_week_idx" ON "session_slot" USING btree ("plan_week_id");