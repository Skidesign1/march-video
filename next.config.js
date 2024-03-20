// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   webpack: (config ) => {
//     config.externals.push({
//       sharp: "commonjs sharp",
//       canvas: "commonjs canvas",
//     });
//     return config;
//   },
// };

// module.exports = nextConfig;
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['canvas'],
    esmExternals: "loose",
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];  // required to make Konva & react-konva work
    return config;
  },
};

module.exports = nextConfig;