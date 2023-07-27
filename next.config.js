/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "",
  images: {
    domains: ["media0.giphy.com", "media4.giphy.com", "media3.giphy.com"],
  }
}

module.exports = nextConfig;
