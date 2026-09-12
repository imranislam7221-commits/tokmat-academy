module.exports = {
  apps: [{
    name: "tokmat",
    script: "./server.js",
    cwd: "/var/www/tokmat-academy",
    instances: 1,
    exec_mode: "fork",
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
