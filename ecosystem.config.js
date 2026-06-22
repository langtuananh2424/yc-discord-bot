/**
 * PM2 Configuration for Auto-Restart
 * 
 * Installation:
 *   npm install pm2 -g
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 monit
 *   pm2 logs
 *   pm2 stop yc-bot
 *   pm2 reload yc-bot
 */

module.exports = {
  apps: [
    {
      name: 'yc-bot',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'production'
      },

      // Auto restart khi process crash
      autorestart: true,
      max_restarts: 10,           // Tối đa 10 lần restart
      min_uptime: '10s',          // Phải chạy tối thiểu 10s mới tính là restart
      max_memory_restart: '500M', // Restart nếu vượt 500MB RAM

      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Watch & reload (optional - chỉ enable trong development)
      // watch: ['src'],
      // ignore_watch: ['node_modules', 'logs', '.git'],
    }
  ],

  // Cluster mode (optional - dùng cho multi-core)
  // instances: 'max',
  // exec_mode: 'cluster',
};
