import dotenv from "dotenv";
import path from "path";

// Load the .env file from the root directory (go up one level from frontend/)
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URI}/:path*`, // Proxy to Backend API
      },
      {
        source: "/socket-jokes/:path*",
        destination: `${process.env.NEXT_PUBLIC_SOCKET_JOKES_URI}/:path*`, // Proxy to WebSocket API
      },
      {
        source: "/socket-weather/:path*",
        destination: `${process.env.NEXT_PUBLIC_SOCKET_WEATHER_URI}/:path*`, // Proxy to WebSocket API
      },
    ];
  },
  env: {
    NEXT_PUBLIC_BACKEND_URI:
      process.env.NEXT_PUBLIC_BACKEND_URI || "http://localhost:4000/api",
    NEXT_PUBLIC_SOCKET_WEATHER_URI:
      process.env.NEXT_PUBLIC_SOCKET_WEATHER_URI || "http://localhost:4000/",
    NEXT_PUBLIC_SOCKET_JOKES_URI:
      process.env.NEXT_PUBLIC_SOCKET_JOKES_URI || "http://localhost:4001/",
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
};

export default nextConfig;
