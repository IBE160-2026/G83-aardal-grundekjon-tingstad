CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"focus" text NOT NULL,
	"experience" text NOT NULL,
	"sessions_per_week" smallint NOT NULL,
	"main_focus" text,
	"equipment" text,
	"goal" text,
	"longest_run_km" double precision,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profile_sessions_per_week_check" CHECK ("profile"."sessions_per_week" between 2 and 5)
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;