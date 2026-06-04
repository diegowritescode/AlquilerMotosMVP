/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // react-leaflet / @react-leaflet/core ship ESM; transpile for stable builds.
  transpilePackages: ["react-leaflet", "@react-leaflet/core"],
  images: {
    remotePatterns: [
      // Supabase Storage public/signed URLs (configure your project ref host).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
