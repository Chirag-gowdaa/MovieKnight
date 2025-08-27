/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['m.media-amazon.com', 'via.placeholder.com'],
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'query',
            key: 'q',
            value: '(?<query>.*)',
          },
        ],
        destination: '/search?q=:query',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
