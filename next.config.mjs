/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://api:${process.env.API_PORT}/:path*`,
      },
    ];
  },
};

export default nextConfig;
