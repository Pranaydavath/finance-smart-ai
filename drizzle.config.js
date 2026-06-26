import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from your local environment file
dotenv.config({
  path: ".env.local",
});

export default defineConfig({
  dialect: "postgresql",
  schema: "./utils/schema.jsx",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DATABASE_URL,
  },
});