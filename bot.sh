/usr/bash

# Update repository
git checkout -- .
git clean -fd
git --work-tree=/var/bot/celepolagatorbot --git-dir=/var/bot/celepolagatorbot/.git pull origin master

# Install dependencies
npm install

# Compile TypeScript
tsc

# Run bot
node dist/src/index.js >> /var/log/bot/celepolagatorbot/last.log
