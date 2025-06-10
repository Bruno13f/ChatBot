import dotenv from "dotenv";
import path from "path";

// Load the .env file from the root directory (go up one level from frontend/)
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URI: process.env.BACKEND_URI, // Expose the variable
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
};

export default nextConfig;
