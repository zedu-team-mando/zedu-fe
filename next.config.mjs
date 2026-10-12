/** @type {import('next').NextConfig} */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const isDev = process.env.NODE_ENV === "development";
const configDir = path.dirname(fileURLToPath(import.meta.url));
const homepageRoot = path.join(configDir, "src", "app", "(homepage)");
const pageFilePattern = /^page\.(tsx|ts|jsx|js)$/;

function directoryHasPage(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return false;
  }

  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isFile() && pageFilePattern.test(entry.name)) return true;
    if (entry.isDirectory() && directoryHasPage(fullPath)) return true;
  }

  return false;
}

/** First URL segments for every real route under app/(homepage). */
function collectHomepageSegments(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const segments = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
      segments.push(...collectHomepageSegments(fullPath));
      continue;
    }
    if (entry.name.startsWith("[") || entry.name.startsWith("@")) continue;
    if (directoryHasPage(fullPath)) segments.push(entry.name);
  }

  return segments;
}

const homepageRouteSegments = collectHomepageSegments(homepageRoot).sort();

function hostnameFromEnv(name) {
  const value = process.env[name];
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const imageHostnames = [
  "images.unsplash.com",
  "images.stockcake.com",
  "s3-alpha-sig.figma.com",
  hostnameFromEnv("NEXT_PUBLIC_MEDIA_STAGING_URL"),
  hostnameFromEnv("NEXT_PUBLIC_MEDIA_URL"),
  "lh3.googleusercontent.com",
  "media.tifi.tv",
  "is1-ssl.mzstatic.com",
  "res.cloudinary.com",
  "i.imgur.com",
].filter(Boolean);

const nextConfig = {
  env: {
    NEXT_PUBLIC_HOMEPAGE_ROUTE_SEGMENTS: homepageRouteSegments.join(","),
  },
  reactStrictMode: false,
  output: process.env.VERCEL ? undefined : "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: imageHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      port: "",
      pathname: "/**",
    })),
    unoptimized: true,
  },
  transpilePackages: ["lucide-react"],
  assetPrefix: isDev ? undefined : "/mainapp",
  compiler: {
    removeConsole: isDev ? false : true,
  },
};

export default nextConfig;
