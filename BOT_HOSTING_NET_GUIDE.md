# Deploy Guide for bot-hosting.net (Docker Hosting)

## 🎯 Overview

bot-hosting.net uses Docker containers to host bots. Your bot runs in an isolated environment with automatic dependency installation and restart capabilities.

---

## 📋 Pre-Deployment Checklist

- [ ] All code compiled and tested locally
- [ ] `.env` file configured correctly
  - [ ] `DISCORD_TOKEN` set
  - [ ] `CLIENT_ID` set
  - [ ] `GUILD_ID` set
  - [ ] `DATABASE_URL=file:./dev.db`
  - [ ] `ERROR_CHANNEL_ID` (optional, for Discord alerts)
- [ ] Run `npm run build` succeeds
- [ ] No TypeScript errors

---

## 🚀 Deployment Steps

### **Step 1: Create Deployment Package**

```bash
# Option A: Use automated script (Recommended)
bash deploy.sh

# Option B: Manual packaging
npm run build
mkdir -p temp_deploy
cp -r dist prisma assets package.json package-lock.json .env temp_deploy/
cd temp_deploy
zip -r ../deployment.zip .
cd ..
rm -rf temp_deploy
```

This creates `deployment.zip` containing:
- ✅ `dist/` - Compiled JavaScript
- ✅ `prisma/` - Database schema
- ✅ `assets/` - Images, GIFs, data files
- ✅ `package.json` - Dependencies list
- ✅ `package-lock.json` - Locked versions
- ✅ `.env` - Configuration

### **Step 2: Upload to bot-hosting.net**

1. Go to your bot's control panel
2. Find "File Manager" or "Upload Files"
3. Upload `deployment.zip`
4. Bot-hosting.net will auto-unzip (usually takes 5-10s)

### **Step 3: Start Bot**

1. In control panel, click "Start" or "Restart"
2. Wait for startup (check logs):
   ```
   npm install
   (builds dependencies)
   ↓
   node dist/index.js
   (bot starts)
   ```

### **Step 4: Verify Startup**

Watch the logs for:
```
Successfully loaded XX commands.
Successfully loaded X events.
YC Bot đã sẵn sàng!
```

✅ If you see this, bot is online!

---

## 🔄 Docker Container Lifecycle

### **Container Start Sequence**
```
1. Container starts
   ↓
2. Auto run npm install (if package.json changed)
   ↓
3. Run /usr/local/node /home/container/dist/index.js
   ↓
4. Bot connects to Discord
   ↓
5. Error logger initializes
```

### **Container Restart (Auto or Manual)**
```
1. Detect crash / Manual restart / Scheduled
   ↓
2. Container stops gracefully (5s timeout)
   ↓
3. All state lost (cache cleared)
   ↓
4. Container restarts from Step 1
   ↓
5. Bot reconnects to Discord
```

---

## ⚙️ Configuration in bot-hosting.net

Your bot-hosting.net panel likely has these settings:

### **Startup Command**
Usually pre-configured as:
```
/usr/local/bin/node /home/container/dist/index.js
```

Or with a custom script:
```
SET START_BASH_FILE=start.sh
```

### **Environment Variables**
Set these in bot-hosting.net panel (or in .env file):
```
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
DATABASE_URL=file:./dev.db
ERROR_CHANNEL_ID=optional_for_alerts
```

### **Resource Limits**
Most free tiers limit:
- Memory: 256-512MB
- CPU: Shared
- Storage: 1-5GB
- Auto-restart: Every crash or scheduled daily

---

## 📊 Monitoring in Docker Environment

### **View Logs**
- Go to bot-hosting.net panel → Logs
- Watch real-time output
- Check for errors

### **File Structure**
```
/home/container/
├── dist/               (Your compiled code)
├── node_modules/       (Dependencies)
├── prisma/             (Database)
├── assets/             (Images & data)
├── logs/
│   ├── errors.log      (Error history)
│   └── *.log           (Other logs)
├── dev.db              (SQLite database)
├── package.json
└── .env
```

### **Database File**
- Location: `/home/container/dev.db`
- Persists across restarts: ✅ Yes (volume mounted)
- Size: Check in file manager

---

## 🔄 Updating Your Bot

### **Update Process**

1. **Make code changes locally**
   ```bash
   # Edit files
   npm run build
   bash deploy.sh
   ```

2. **Upload new deployment.zip**
   - Go to bot-hosting.net file manager
   - Delete old files (optional)
   - Upload new `deployment.zip`
   - Auto-unzip

3. **Restart bot**
   - Click "Restart" in control panel
   - Wait 10-30s for startup

### **Zero-Downtime Updates** (Advanced)

To update without losing Discord session:
1. Deploy with `npm run build`
2. Keep bot running
3. Upload files (doesn't interrupt running process)
4. Restart only when ready
5. Discord reconnects ~30s

---

## ⚠️ Common Issues & Fixes

### **"Cannot find module" Error**

**Problem:** Missing dependencies after upload

**Solution:**
```
1. Delete node_modules folder in file manager (if visible)
2. Restart bot
3. Bot-hosting.net will auto run npm install
```

### **Bot Starts But Offline**

**Problem:** Token invalid or bot not invited to server

**Solution:**
1. Check DISCORD_TOKEN in .env
2. Verify bot invite link: https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot&permissions=8
3. Restart bot

### **Database Error (dev.db locked)**

**Problem:** Multiple processes accessing database

**Solution:**
1. This shouldn't happen in Docker (single process)
2. Restart bot to reset
3. Check file name in DATABASE_URL matches actual file

### **Error Channel Notifications Not Working**

**Problem:** No alerts in Discord even on error

**Solution:**
```
1. Check ERROR_CHANNEL_ID in .env
2. Bot must have permission: Send Messages, Embed Links
3. Channel ID must be numeric, 18 digits
4. Restart bot and trigger test error
```

### **Bot Restarts Too Often**

**Problem:** Container crashes frequently

**Solution:**
```
1. Check logs for error pattern
2. Use /yc-view-errors to see recent errors
3. Check if error is database-related (Prisma schema)
4. Fix code and redeploy
```

---

## 🎯 Bot-hosting.net Specific Tips

### **Container Environment Variables**
If bot-hosting.net exposes these, you can use them:
```
CONTAINER_ID     - Unique container ID
BOT_JS_FILE      - Set to dist/index.js
NODE_PACKAGES    - Additional npm packages
AUTO_UPDATE      - Git auto-pull (if .git exists)
```

### **Custom Startup Script**
Create `start.sh` and upload it:
```bash
#!/bin/bash
echo "📦 Installing dependencies..."
npm install
echo "🚀 Starting bot..."
node dist/index.js
```

Then set in bot-hosting.net:
```
SET START_BASH_FILE=start.sh
```

### **File Manager Tips**
- Use file manager to inspect logs
- Check `dev.db` file size (growing = good)
- Delete old `deployment.zip` files to save space

---

## 📝 Docker-Optimized Error Handling

The error handling system works perfectly in Docker:

✅ **What works:**
- Logging errors to `logs/errors.log`
- Console output visible in bot-hosting.net logs
- Discord notifications (if configured)
- Graceful error handling (no crashes)

❌ **What doesn't work in free tier:**
- PM2 can't be installed globally
- Can't do auto-restart on crash (container auto-restarts instead ~5-60 min)
- Can't run background processes (container is single process)

**Workaround:**
- Every crash, bot-hosting.net restarts container (takes 30-60s)
- Error logger catches errors to prevent unnecessary crashes
- With error handling, your bot rarely crashes anyway!

---

## 🚀 Quick Deploy Workflow

```bash
# 1. Make changes
nano src/commands/economy/mine.ts

# 2. Build & package
npm run build
bash deploy.sh

# 3. Upload to bot-hosting.net
# (Copy deployment.zip to file manager)

# 4. Restart bot
# (Click Restart in control panel)

# 5. Wait & verify
# (Check logs for success)
```

---

## 📚 Resources

- **bot-hosting.net docs**: Check their help panel
- **Docker docs**: https://docs.docker.com/
- **Node.js in Docker**: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

---

## ✅ Summary

**bot-hosting.net + Docker:**
- ✅ Very reliable for hosting bots
- ✅ Auto restarts on crash
- ✅ Persistent database between restarts
- ✅ Free tier available
- ✅ Easy deployment process
- ❌ Limited resources on free tier
- ❌ No custom process management (PM2-like features)

**With our error handling:**
- ✅ Bot rarely crashes
- ✅ Safe error handling
- ✅ Discord notifications
- ✅ Production-ready

---

**You're all set for bot-hosting.net deployment!** 🎉
