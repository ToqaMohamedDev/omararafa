/** @type {import('next').NextConfig} */
const nextConfig = {
  // تجاهل طلبات service worker غير الموجودة
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/404',
      },
    ];
  },
};

export default nextConfig;

