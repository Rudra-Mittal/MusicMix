/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'yt3.ggpht.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'i.ytimg.com',
          port: '',
          pathname: '/**',
        },
        {
          protocol:"https",
          hostname:"*",
          port:'',
          pathname:'/**'
        }
      ],
    },
      webpack:(config)=>{
        config.resolve.fallback={fs:false}
        return config;
      },
      reactStrictMode:false
};
export default nextConfig;
