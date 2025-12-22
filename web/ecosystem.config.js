module.exports = {
    apps: [
      {
        name: "web",
        cwd: "/var/www/your-repo/web",
        script: "node_modules/next/dist/bin/next",
        args: "start -p 3000",
        env: {
          NODE_ENV: "production"
        }
      }
    ]
  }
  