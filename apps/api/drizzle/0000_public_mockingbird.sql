CREATE TYPE "public"."AssetType" AS ENUM('SNIPPET', 'PROMPT', 'NOTE', 'LINK', 'IMAGE', 'FILE');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"password" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" "AssetType" NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"pinned" boolean DEFAULT false NOT NULL,
	"content" text,
	"language" text,
	"url" text,
	"filePath" text,
	"fileName" text,
	"mimeType" text,
	"fileSize" integer,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"searchVector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))) STORED
);
--> statement-breakpoint
CREATE TABLE "assetCollection" (
	"assetId" text NOT NULL,
	"collectionId" text NOT NULL,
	CONSTRAINT "assetCollection_assetId_collectionId_pk" PRIMARY KEY("assetId","collectionId")
);
--> statement-breakpoint
CREATE TABLE "collection" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"pinned" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jwks" (
	"id" text PRIMARY KEY NOT NULL,
	"publicKey" text NOT NULL,
	"privateKey" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"expiresAt" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "oAuthAccessToken" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"clientId" text NOT NULL,
	"sessionId" text,
	"userId" text,
	"referenceId" text,
	"refreshId" text,
	"scopes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "oAuthAccessToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "oAuthClient" (
	"id" text PRIMARY KEY NOT NULL,
	"clientId" text NOT NULL,
	"clientSecret" text,
	"name" text,
	"icon" text,
	"metadata" jsonb,
	"redirectUris" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"postLogoutRedirectUris" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"type" text,
	"disabled" boolean DEFAULT false NOT NULL,
	"skipConsent" boolean,
	"enableEndSession" boolean,
	"subjectType" text,
	"scopes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"userId" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"uri" text,
	"contacts" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"tos" text,
	"policy" text,
	"softwareId" text,
	"softwareVersion" text,
	"softwareStatement" text,
	"tokenEndpointAuthMethod" text,
	"grantTypes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"responseTypes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"public" boolean,
	"requirePKCE" boolean,
	"referenceId" text,
	CONSTRAINT "oAuthClient_clientId_unique" UNIQUE("clientId")
);
--> statement-breakpoint
CREATE TABLE "oAuthConsent" (
	"id" text PRIMARY KEY NOT NULL,
	"clientId" text NOT NULL,
	"userId" text,
	"referenceId" text,
	"scopes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oAuthRefreshToken" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"clientId" text NOT NULL,
	"sessionId" text,
	"userId" text NOT NULL,
	"referenceId" text,
	"scopes" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"revoked" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now(),
	"updatedAt" timestamp (3) DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset" ADD CONSTRAINT "asset_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assetCollection" ADD CONSTRAINT "assetCollection_assetId_asset_id_fk" FOREIGN KEY ("assetId") REFERENCES "public"."asset"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assetCollection" ADD CONSTRAINT "assetCollection_collectionId_collection_id_fk" FOREIGN KEY ("collectionId") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oAuthAccessToken" ADD CONSTRAINT "oAuthAccessToken_clientId_oAuthClient_clientId_fk" FOREIGN KEY ("clientId") REFERENCES "public"."oAuthClient"("clientId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oAuthAccessToken" ADD CONSTRAINT "oAuthAccessToken_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oAuthClient" ADD CONSTRAINT "oAuthClient_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oAuthConsent" ADD CONSTRAINT "oAuthConsent_clientId_oAuthClient_clientId_fk" FOREIGN KEY ("clientId") REFERENCES "public"."oAuthClient"("clientId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oAuthConsent" ADD CONSTRAINT "oAuthConsent_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oAuthRefreshToken" ADD CONSTRAINT "oAuthRefreshToken_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "asset_user_type_idx" ON "asset" USING btree ("userId","type");--> statement-breakpoint
CREATE INDEX "asset_user_pinned_idx" ON "asset" USING btree ("userId","pinned");--> statement-breakpoint
CREATE INDEX "asset_user_updated_at_idx" ON "asset" USING btree ("userId","updatedAt" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "asset_search_vector_idx" ON "asset" USING gin ("searchVector");--> statement-breakpoint
CREATE INDEX "collection_user_pinned_idx" ON "collection" USING btree ("userId","pinned");--> statement-breakpoint
CREATE INDEX "oauth_access_token_client_id_idx" ON "oAuthAccessToken" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "oauth_access_token_user_id_idx" ON "oAuthAccessToken" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "oauth_client_user_id_idx" ON "oAuthClient" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "oauth_consent_client_id_idx" ON "oAuthConsent" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "oauth_consent_user_id_idx" ON "oAuthConsent" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "oauth_refresh_token_client_id_idx" ON "oAuthRefreshToken" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "oauth_refresh_token_user_id_idx" ON "oAuthRefreshToken" USING btree ("userId");