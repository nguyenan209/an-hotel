module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        process: false,
      };
    }
    return config;
  },
  reactStrictMode: true,
  images: {
    domains: [
      'elasticbeanstalk-ap-southeast-1-897729137768.s3.ap-southeast-1.amazonaws.com',
    ],
  },
}; 