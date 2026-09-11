import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./prisma/**/*", "./src/generated/prisma/**/*"],
  },
};

export default withNextIntl(nextConfig);
