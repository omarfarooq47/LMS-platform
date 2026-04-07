docker buildx build --platform linux/amd64,linux/arm64 --tag oaktree.azurecr.io/ot-web:jelus .

docker run -it --name web 3000:3000 ot-web:hero

--no-cache

# Deploy:
```
# Navigate to your project
cd ~/LMS-platform/school-platform

# Install dependencies
npm install

# Build the Next.js app
npm run build

# Start with PM2
pm2 start ecosystem.config.js --name oaktree-web --env production
pm2 start "$(command -v npm)" --name oaktree-web --interpreter bash  --env production -- start

# Save PM2 process list
pm2 save

# Setup PM2 to auto-start on reboot
pm2 startup
```
# Access errors on EC2:

1. Check for running apt processes:
```
sudo lsof /var/lib/apt/lists/lock
sudo lsof /var/lib/dpkg/lock
```
2. Kill any running apt/dpkg processes:
```
sudo killall apt apt-get dpkg 2>/dev/null
```

3. Remove stale lock files:
```
sudo rm -f /var/lib/apt/lists/lock
sudo rm -f /var/cache/apt/archives/lock
sudo rm -f /var/lib/dpkg/lock
sudo rm -f /var/lib/dpkg/lock-frontend
```
4. Reconfigure dpkg:
```
sudo dpkg --configure -a
```
5. Update apt and retry:
```
sudo apt update
sudo curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
```
Alternative: Install Node.js via NVM (Recommended)
If the above doesn't work, use NVM to avoid apt permission issues entirely:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
node --version
```
> Note: The sudo -E bash - (with -E flag) in step 5 preserves environment variables, which is often required for the NodeSource script to work correctly.