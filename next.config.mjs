/** @type {import('next').NextConfig} */
const nextConfig = {
  // تجاهل طلبات service worker و icons غير الموجودة
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/404',
      },
      {
        source: '/icon-:size.png',
        destination: '/404',
      },
      {
        source: '/icon.png',
        destination: '/404',
      },
    ];
  },
};

export default nextConfig;

