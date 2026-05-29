module.exports = {
  apps: [
    {
      name: "thi-truc-tuyen-be",
      cwd: "./be",
      script: "src/server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
    {
      name: "thi-truc-tuyen-fe",
      cwd: "./fe",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
