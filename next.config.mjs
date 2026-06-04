/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Supabase Storage public/signed URLs (configure your project ref host).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
