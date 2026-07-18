# 🎯 Error Handling System - Complete Overview

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      YC Discord Bot                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Global Error Handlers (index.ts)             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ • process.on('uncaughtException')                       │   │
│  │ • process.on('unhandledRejection')                      │   │
│  │ • process.on('error')                                  │   │
│  │ • process.on('SIGINT')                                 │   │
│  │                    ↓                                    │   │
│  │              errorLogger.error()                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Command/Event Handlers (with wrappers)          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ interactionCreate.ts:                                   │   │
│  │  • executeCommandSafely() ← Commands                    │   │
│  │  • executeInteractionSafely() ← Buttons/Modals         │   │
│  │  • executeEventSafely() ← Events                        │   │
│  │                    ↓                                    │   │
│  │         commandErrorWrapper.ts                          │   │
│  │  • Try → Execute handler                                │   │
│  │  • Catch → Log error & Notify                           │   │
│  │  • Finally → Reply user                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Error Logger System (errorLogger.ts)         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────────────┐      │   │
│  │ │ File Log │  │ Console  │  │ Discord Channel  │      │   │
│  │ │ errors.  │  │ Output   │  │ Notification     │      │   │
│  │ │   log    │  │ (colors) │  │   (Embed)        │      │   │
│  │ └──────────┘  └──────────┘  └──────────────────┘      │   │
│  │                                                         │   │
│  │ Context included in all:                               │   │
│  │ • User ID                                              │   │
│  │ • Command Name                                         │   │
│  │ • Guild ID                                             │   │
│  │ • Stack Trace                                          │   │
│  │ • Additional Data                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Retry System (retryHandler.ts)                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ • retry() - Basic retry with exponential backoff       │   │
│  │ • retryAsync() - For async functions                   │   │
│  │ • retryUntilSuccess() - Retry forever (with timeout)   │   │
│  │ • retryUntil() - Conditional retry                     │   │
│  │                                                         │   │
│  │ Configurable:                                          │   │
│  │ • maxAttempts (default: 3)                            │   │
│  │ • delay (default: 1000ms)                             │   │
│  │ • backoffMultiplier (default: 2x)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Admin Commands (For Management)                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ • /yc-view-errors [lines] - See recent errors          │   │
│  │ • /yc-clear-error-logs - Clear all logs                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                PM2 Process Manager (Deployment)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ecosystem.config.js                                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • Auto restart khi crash (max 10 times)                 │  │
│  │ • Min uptime check (10s)                                 │  │
│  │ • Memory limit (500MB)                                  │  │
│  │ • Graceful shutdown (5s)                                 │  │
│  │ • Log rotation                                           │  │
│  │ • Multi-process monitor                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│              Bot Crash → PM2 Detect → Auto Restart             │
│                          ↓                                      │
│                   Bot Back Online (30s)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Error Flow Timeline

### **Scenario: User executes command that throws error**

```
T=0.00s: User enters /mine command
         ↓
T=0.01s: interactionCreate event fires
         ↓
T=0.02s: executeCommandSafely() wrapper activated
         ↓
T=0.03s: Command executes → ERROR THROWN
         ↓
T=0.04s: Catch block triggers
         ├─ errorLogger.error() called
         ├─ Log entry written to logs/errors.log
         ├─ Console.error() with color
         └─ Discord notification sent
         ↓
T=0.05s: User receives ephemeral error message
         ↓
T=0.10s: Admin sees embed in #bot-errors channel
         ↓
T=1.00s: Bot continues running normally (NO CRASH!)
```

---

## 🔥 Error Levels & Handling

### **Level 1: Command/Handler Errors** ✅
```
Error in user command execution
├─ Caught by: executeCommandSafely/executeInteractionSafely
├─ Action: Log + Notify Discord + Reply to user
├─ Result: Bot continues running ✓
└─ Example: Null reference, validation fail, etc.
```

### **Level 2: Database/Network Errors** ✅
```
Error in Prisma query or Axios request
├─ Caught by: executeDatabaseSafely + retry logic
├─ Action: Retry → If still fails: Log + Notify
├─ Result: Bot continues running ✓
└─ Example: Connection timeout, query failed, etc.
```

### **Level 3: Unexpected/Global Errors** ✅
```
Uncaught exception or unhandled rejection
├─ Caught by: process.on('uncaughtException', 'unhandledRejection')
├─ Action: Log + Notify Discord
├─ Then: PM2 detects crash & restarts bot
├─ Result: Bot back online in ~30s ✓
└─ Example: Memory leak, null pointer, etc.
```

---

## 📊 Error Information Captured

**Whenever an error happens, we capture:**

| Info | Example | Level |
|------|---------|-------|
| Timestamp | 2026-04-07T10:30:45.123Z | Always |
| Error Message | Cannot read property 'guild' | Always |
| Error Stack | TypeError at line 45 in mine.ts | Always |
| User ID | 123456789012345678 | When available |
| Command | /mine | When available |
| Guild ID | 987654321098765432 | When available |
| Additional Data | { itemId: 'diamond', ... } | Optional |

**Output to:**
- 📝 File: `logs/errors.log`
- 💻 Console: Colored & formatted
- 📢 Discord: Rich embed with all info

---

## ⚙️ Setup Comparison

### **Before (Without Error System)**
```
Bot starts → User error → Bot crashes 💥
  ↓
Can't see error → Can't debug
  ↓
Admin has to manually restart (if notices)
  ↓
DAT Risk!
```

### **After (With Error System)**
```
Bot starts → User error → Log + Notify + Continue ✅
  ↓
Admin sees Discord notification immediately 🔔
  ↓
PM2 auto restarts if needed 🔄
  ↓
SAFE & MANAGEABLE!
```

---

## 📈 Metrics You Can Track

**Via admin commands & logs:**

1. **Error Frequency**
   ```
   /yc-view-errors 100 → See last 100 errors
   ```

2. **Error Types**
   ```
   logs/errors.log → Search pattern
   Most common: Database timeout? Command X?
   ```

3. **Affected Users**
   ```
   Error logs include User IDs
   Find which user has most errors
   ```

4. **Peak Error Times**
   ```
   Timestamp in logs
   When do errors happen most?
   ```

5. **Bot Uptime**
   ```
   pm2 monit → See restarts
   logs/pm2-error.log → See when crashed
   ```

---

## 🎓 Learning Resources

**Files to understand:**

1. **`src/utils/errorLogger.ts`** (50 lines)
   - How errors are logged & notified
   - ErrorContext structure

2. **`src/utils/retryHandler.ts`** (80 lines)
   - Exponential backoff logic
   - Retry patterns

3. **`src/utils/commandErrorWrapper.ts`** (70 lines)
   - Safe execution wrappers
   - Error handling patterns

4. **`src/events/interactionCreate.ts`** (Modified)
   - How wrappers are used
   - Real-world examples

5. **`ecosystem.config.js`** (Simple)
   - PM2 configuration
   - Auto-restart logic

---

## 🆚 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| **Bot crash on error** | ❌ Yes | ✅ No |
| **Error logging** | ❌ None | ✅ File + Console |
| **Discord notification** | ❌ No | ✅ Yes |
| **Auto restart** | ❌ No | ✅ Yes (PM2) |
| **Retry logic** | ❌ No | ✅ Yes |
| **Context capture** | ❌ Basic | ✅ Full |
| **Error commands** | ❌ No | ✅ Yes |
| **Monitoring** | ❌ Manual | ✅ Automatic |

---

## 🚀 Next Steps

1. ✅ [Setup in 5 minutes](QUICK_START.md)
2. ✅ [Full documentation](ERROR_HANDLING_GUIDE.md)
3. ✅ [Technical details](IMPLEMENTATION_SUMMARY.md)

---

**Your bot is now enterprise-ready with professional error handling!** 🎉
