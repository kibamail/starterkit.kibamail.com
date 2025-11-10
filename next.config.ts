import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

import "./env/schema";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

const withMDX = createMDX({
  configPath: "source.config.ts",
});

export default withMDX(nextConfig);
