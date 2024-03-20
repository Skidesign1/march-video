/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, {isServer}) => {
    if(!isServer){
      config.node={
        //ensure windows is not defined in server bundle
        global:false,
      }
    }
    if(isServer){
      config.node={
        //include __dirname for server bundle
        __dirname:true,
        __filename:true
      }
    }
    config.externals.push({
      sharp: "commonjs sharp",
      canvas: "commonjs canvas",
    });
    return config;
  },
};

module.exports = nextConfig;
