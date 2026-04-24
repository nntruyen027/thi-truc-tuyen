/** @type {import('next').NextConfig} */
const FALLBACK_API_BASE_URL =
  "https://thitructuyen-demo-api.tmqcreator.top/api";

function normalizeApiBaseUrl(value) {
  let url = (value || FALLBACK_API_BASE_URL).trim().replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }

  if (!/\/api$/i.test(url)) {
    url = `${url}/api`;
  }

  return url;
}

function buildRemotePattern(value) {
  const parsed = new URL(value.replace(/\/api\/?$/i, ""));

  return {
    protocol: parsed.protocol.replace(":", ""),
    hostname: parsed.hostname,
    port: parsed.port || undefined,
    pathname: "/uploads/**",
  };
}

const imageSources = [
  buildRemotePattern(normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL)),
  {
    protocol: "http",
    hostname: "localhost",
    port: "8080",
    pathname: "/uploads/**",
  },
];

const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: imageSources,
  },
};

export default nextConfig;
