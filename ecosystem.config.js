module.exports = {
  apps: [{
    name: 'school-platform',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/school-platform/current/school-platform',
    instances: 'max',     // cluster mode
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }],

  deploy: {
    production: {
      user: 'ubuntu',
      host: '3.26.150.13',
    //   key: '~/.ssh/oaktree.pem',
      ref: 'origin/main',
      repo: 'git@github.com:omarfarooq47/LMS-platform.git',
      path: '/var/www/school-platform',
      'post-deploy': 'cd school-platform && npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to production..."'
    }
  }
};