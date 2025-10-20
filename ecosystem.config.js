module.exports = {
  apps: [
    {
      name: 'tcp-app',
      script: 'npm',
      args: 'start',
      cwd: '/path/to/your/tcp_app', // Update this path
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],

  deploy: {
    production: {
      user: 'your-username', // Update this
      host: 'your-vps-ip', // Update this
      ref: 'origin/main',
      repo: 'your-repo-url', // Update this
      path: '/var/www/tcp-app',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
