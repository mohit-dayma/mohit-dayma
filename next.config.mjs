/** @type {import('next').NextConfig} */

const nextConfig = {
  // Allow ngrok to proxy requests to the dev server (free tier URLs are dynamic)
  allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok.io', 'localhost'],
};

export default nextConfig;
