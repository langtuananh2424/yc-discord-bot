#!/usr/bin/env node

/**
 * Docker Health Check Script for bot-hosting.net
 * 
 * This script helps diagnose bot health in Docker environment.
 * Usage: npx ts-node health-check.ts
 */

import * as fs from 'fs-extra';
import * as path from 'path';

async function runHealthCheck() {
    console.log('🏥 YC Discord Bot - Health Check\n');
    
    const checks: { [key: string]: string[] } = {
        'healthy': [],
        'issues': []
    };

    // 1. Check dist folder
    const distExists = await fs.pathExists('dist');
    if (distExists) {
        checks['healthy'].push('dist/ folder exists');
    } else {
        checks['issues'].push('dist/ folder missing - run: npm run build');
    }

    // 2. Check package.json
    const pkgExists = await fs.pathExists('package.json');
    if (pkgExists) {
        checks['healthy'].push('package.json exists');
    } else {
        checks['issues'].push('package.json missing!');
    }

    // 3. Check .env
    const envExists = await fs.pathExists('.env');
    if (envExists) {
        checks['healthy'].push('.env file exists');
        
        const env = await fs.readFile('.env', 'utf-8');
        
        // Check required vars
        const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
        for (const variable of required) {
            if (env.includes(variable) && !env.includes(`${variable}=`)) {
                checks['issues'].push(`${variable} in .env but no value`);
            }
        }
    } else {
        checks['issues'].push('.env file missing - create from .env.example');
    }

    // 4. Check Prisma schema
    const prismaExists = await fs.pathExists('prisma/schema.prisma');
    if (prismaExists) {
        checks['healthy'].push('prisma/schema.prisma exists');
    } else {
        checks['issues'].push('prisma/schema.prisma missing');
    }

    // 5. Check logs directory
    const logsExists = await fs.pathExists('logs');
    if (logsExists) {
        const errorLog = await fs.pathExists('logs/errors.log');
        if (errorLog) {
            const logSize = (await fs.stat('logs/errors.log')).size;
            checks['healthy'].push(`logs/errors.log exists (${(logSize / 1024).toFixed(2)}KB)`);
        } else {
            checks['healthy'].push('logs/ directory exists (no errors yet)');
        }
    }

    // 6. Check database
    const dbExists = await fs.pathExists('dev.db');
    if (dbExists) {
        const dbSize = (await fs.stat('dev.db')).size;
        checks['healthy'].push(`dev.db exists (${(dbSize / 1024 / 1024).toFixed(2)}MB)`);
    } else {
        checks['healthy'].push('dev.db not created yet (will auto-create)');
    }

    // 7. Check node_modules
    const nodeModulesExists = await fs.pathExists('node_modules');
    if (nodeModulesExists) {
        const count = (await fs.readdir('node_modules')).length;
        checks['healthy'].push(`node_modules exists (${count} packages)`);
    } else {
        checks['issues'].push('node_modules missing - run: npm install');
    }

    // 8. File size summary
    try {
        const distSize = await getDirectorySize('dist');
        if (distSize) {
            checks['✅'].push(`Total dist size: ${(distSize / 1024 / 1024).toFixed(2)}MB`);
        }
    } catch (e) {
        // Ignore
    }

    // Print results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (checks['healthy'].length > 0) {
        console.log('✅ HEALTHY:');
        checks['healthy'].forEach(c => console.log(`   ✓ ${c}`));
        console.log();
    }

    if (checks['issues'].length > 0) {
        console.log('❌ ISSUES DETECTED:');
        checks['issues'].forEach(c => console.log(`   ✗ ${c}`));
        console.log();
    }

    // Summary
    const total = checks['healthy'].length + checks['issues'].length;
    const healthy = checks['healthy'].length;
    const percentage = ((healthy / total) * 100).toFixed(0);

    console.log(`\n📊 Health Score: ${percentage}% (${healthy}/${total} checks passed)\n`);

    if (checks['issues'].length > 0) {
        console.log('⚠️  Fix issues above before deploying to bot-hosting.net');
        process.exit(1);
    } else {
        console.log('🎉 Bot is ready for deployment!');
        process.exit(0);
    }
}

async function getDirectorySize(dir: string): Promise<number> {
    try {
        const files = await fs.readdir(dir);
        let size = 0;
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isDirectory()) {
                size += await getDirectorySize(filePath);
            } else {
                size += stat.size;
            }
        }
        
        return size;
    } catch (e) {
        return 0;
    }
}

// Run health check
runHealthCheck().catch(err => {
    console.error('Health check failed:', err);
    process.exit(1);
});
