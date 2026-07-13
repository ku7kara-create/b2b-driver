/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  turbopack: false,
};

export default nextConfig;
