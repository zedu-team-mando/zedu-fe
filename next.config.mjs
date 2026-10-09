const isDev = process.env.NODE_ENV === "development";

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

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async redirects() {
    return [
      {
        source: "/instagram",
        destination: "https://instagram.com/zedu.chat",
        permanent: false,
      },
      {
        source: "/tiktok",
        destination: "https://tiktok.com/@zedu.chat",
        permanent: false,
      },
      {
        source: "/facebook",
        destination: "https://facebook.com/zedu.chat",
        permanent: false,
      },
      {
        source: "/x",
        destination: "https://x.com/zedu.chat",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
