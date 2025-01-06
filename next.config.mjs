/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains:
          ['i.ytimg.com', 'www.google.com', 'example.com'],
      },
      webpack:(config)=>{
        config.resolve.fallback={fs:false}
        return config;
      },
      reactStrictMode:false
};
export default nextConfig;
