CREATE TYPE "public"."http_method" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE', 'CONNECT');--> statement-breakpoint
CREATE TABLE "webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"method" "http_method" NOT NULL,
	"pathname" text NOT NULL,
	"ip" text NOT NULL,
	"status_code" integer NOT NULL,
	"content_type" text,
	"content_length" integer,
	"query_params" jsonb,
	"headers" jsonb NOT NULL,
	"body" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "status_code_range" CHECK ("webhooks"."status_code" >= 100 AND "webhooks"."status_code" <= 599)
);
