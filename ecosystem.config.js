module.exports = {
  apps: [
    {
      name: "thi-truc-tuyen-be",
      cwd: "./be",
      script: "src/server.js",
      interpreter: "node",
      node_args: "--max-old-space-size=1024",
      max_memory_restart: "1200M",
      restart_delay: 5000,
      kill_timeout: 5000,
      exp_backoff_restart_delay: 200,
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
        PUBLIC_RANKINGS_CACHE_TTL_MS: 120000,
        MAX_RANKING_CACHE_ENTRIES: 30,
        MAX_PUBLIC_RANKINGS_CACHE_ENTRIES: 10,
        MAX_TRACKED_PATHS: 500,
        MAX_TRACKED_UNIQUE_IPS: 5000,
      },
    },
    {
      name: "thi-truc-tuyen-fe",
      cwd: "./fe",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      interpreter: "node",
      node_args: "--max-old-space-size=512",
      max_memory_restart: "700M",
      restart_delay: 5000,
      kill_timeout: 5000,
      exp_backoff_restart_delay: 200,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
