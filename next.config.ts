import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SQLite runs as WASM in Node; keep it out of the server bundle so it can find its .wasm file.
  serverExternalPackages: ["node-sqlite3-wasm"],
  experimental: {
    serverActions: {
      // Recipe photos and avatars are uploaded through Server Actions.
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
