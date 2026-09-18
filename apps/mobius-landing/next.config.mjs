/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@builder.io/react"]
  },
  async rewrites() {
    // C-437 Root Discovery Bridge: Cycle 0 and the Virtue Accord are
    // canonically owned and rendered by Browser Shell
    // (chambers.mobius-substrate.com/canon/*). These apex paths proxy that
    // content so an agent arriving at the front door can discover it
    // without the content being duplicated into this app. Do not add
    // content here — extend Browser Shell's canon-sources/ and this list
    // instead. See docs/00-START-HERE/FIVE_SURFACES.md "Domain topology".
    return [
      {
        source: "/canon/cycle-0",
        destination: "https://chambers.mobius-substrate.com/canon/cycle-0",
      },
      {
        source: "/canon/cycle-0.json",
        destination: "https://chambers.mobius-substrate.com/canon/cycle-0.json",
      },
      {
        source: "/canon/virtue-accord",
        destination: "https://chambers.mobius-substrate.com/canon/virtue-accord",
      },
    ];
  }
};

export default nextConfig;
