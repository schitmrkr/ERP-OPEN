set -e

APP_DIR="/home/ubuntu/app"
BACKEND_DIR="$APP_DIR/apps/backend"
FRONTEND_DIR="$APP_DIR/apps/frontend"

printf "
Starting deployment...
"

cd $APP_DIR
echo "Pulling latest repo..."
git reset --hard
git pull origin main

echo "---------------------------------------------"
echo " Backend (NestJS)"
echo "---------------------------------------------"

cd $BACKEND_DIR
echo "Installing backend dependencies..."
npm install --legacy-peer-deps

echo "Loading environment variables..."
export $(grep -v '^#' .env | xargs)

echo "⚡ Generating Prisma client..."
npx prisma generate

echo "🏗️ Building backend..."
npm run build

echo "Restarting backend using PM2..."
pm2 restart backend || pm2 start dist/main.js --name backend


echo "---------------------------------------------"
echo " Frontend (React + Vite)"
echo "---------------------------------------------"


cd $FRONTEND_DIR
echo "Removing package-lock.json and node modules..."
rm -rf node_modules package-lock.json

echo "Installing frontend dependencies..."
npm install --legacy-peer-deps

echo "⚡ Loading frontend environment variables..."
export $(grep -v '^#' .env | xargs)

echo "Building frontend..."
npm run build


echo "Serving frontend via PM2 on port 3000..."
pm2 serve dist 3000 --spa --name frontend || pm2 restart frontend


echo "
Deployment complete!"