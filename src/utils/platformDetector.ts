/**
 * Platform Detection & Auto-Configuration
 * Tự động detect hosting platform và tối ưu config
 */

export enum HostingPlatform {
    BOT_HOSTING_NET = 'bot-hosting.net',
    RAILWAY = 'railway',
    REPLIT = 'replit',
    ORACLE_CLOUD = 'oracle-cloud',
    HEROKU = 'heroku',
    GLITCH = 'glitch',
    AWS = 'aws',
    VERCEL = 'vercel',
    LOCAL = 'local',
    UNKNOWN = 'unknown'
}

export interface PlatformConfig {
    platform: HostingPlatform;
    hasPM2: boolean;
    hasDocker: boolean;
    autoRestart: boolean;
    persistentStorage: boolean;
    logToFile: boolean;
    logToConsole: boolean;
    discordNotifications: boolean;
    memoryLimit: number; // MB
    cpuLimit: number; // cores
    restartDelay: number; // seconds
    maxRestarts: number;
}

class PlatformDetector {
    private static instance: PlatformDetector;
    private detectedPlatform: HostingPlatform = HostingPlatform.UNKNOWN;
    private config: PlatformConfig | null = null;

    private constructor() {}

    static getInstance(): PlatformDetector {
        if (!PlatformDetector.instance) {
            PlatformDetector.instance = new PlatformDetector();
        }
        return PlatformDetector.instance;
    }

    /**
     * Detect hosting platform từ environment variables
     */
    detectPlatform(): HostingPlatform {
        if (this.detectedPlatform !== HostingPlatform.UNKNOWN) {
            return this.detectedPlatform;
        }

        const env = process.env;

        // bot-hosting.net
        if (env.BOT_JS_FILE || env.START_BASH_FILE || env.NODE_PACKAGES) {
            this.detectedPlatform = HostingPlatform.BOT_HOSTING_NET;
        }
        // Railway
        else if (env.RAILWAY_PROJECT_ID || env.RAILWAY_ENVIRONMENT_ID) {
            this.detectedPlatform = HostingPlatform.RAILWAY;
        }
        // Replit
        else if (env.REPL_ID || env.REPLIT_DB_URL) {
            this.detectedPlatform = HostingPlatform.REPLIT;
        }
        // Oracle Cloud
        else if (env.OCI_REGION || env.OCI_TENANCY_OCID) {
            this.detectedPlatform = HostingPlatform.ORACLE_CLOUD;
        }
        // Heroku
        else if (env.DYNO || env.HEROKU_APP_ID) {
            this.detectedPlatform = HostingPlatform.HEROKU;
        }
        // Glitch
        else if (env.PROJECT_DOMAIN || env.GLITCH_PROJECT_ID) {
            this.detectedPlatform = HostingPlatform.GLITCH;
        }
        // AWS
        else if (env.AWS_REGION || env.AWS_LAMBDA_FUNCTION_NAME) {
            this.detectedPlatform = HostingPlatform.AWS;
        }
        // Vercel
        else if (env.VERCEL || env.VERCEL_URL) {
            this.detectedPlatform = HostingPlatform.VERCEL;
        }
        // Local development
        else if (process.cwd().includes('home') || process.cwd().includes('Users') || process.cwd().includes('C:')) {
            this.detectedPlatform = HostingPlatform.LOCAL;
        }
        else {
            this.detectedPlatform = HostingPlatform.UNKNOWN;
        }

        console.log(`🔍 Detected hosting platform: ${this.detectedPlatform}`);
        return this.detectedPlatform;
    }

    /**
     * Get optimized config cho platform
     */
    getPlatformConfig(): PlatformConfig {
        if (this.config) return this.config;

        const platform = this.detectPlatform();

        switch (platform) {
            case HostingPlatform.BOT_HOSTING_NET:
                this.config = {
                    platform,
                    hasPM2: false, // Free tier không support PM2
                    hasDocker: true,
                    autoRestart: true, // Container auto-restart
                    persistentStorage: true, // Volume mounted
                    logToFile: true,
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 512, // Free tier limit
                    cpuLimit: 1,
                    restartDelay: 30, // Container restart delay
                    maxRestarts: 5
                };
                break;

            case HostingPlatform.RAILWAY:
                this.config = {
                    platform,
                    hasPM2: false, // Không cần PM2, Railway handle
                    hasDocker: true,
                    autoRestart: true,
                    persistentStorage: true,
                    logToFile: true,
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 1024,
                    cpuLimit: 1,
                    restartDelay: 10,
                    maxRestarts: 10
                };
                break;

            case HostingPlatform.REPLIT:
                this.config = {
                    platform,
                    hasPM2: false, // Replit handle process management
                    hasDocker: false,
                    autoRestart: true, // Replit auto-restart
                    persistentStorage: true,
                    logToFile: false, // Replit logs to console
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 1024,
                    cpuLimit: 1,
                    restartDelay: 5,
                    maxRestarts: 3
                };
                break;

            case HostingPlatform.ORACLE_CLOUD:
                this.config = {
                    platform,
                    hasPM2: true, // Có thể cài PM2
                    hasDocker: true,
                    autoRestart: false, // Setup PM2 manually
                    persistentStorage: true,
                    logToFile: true,
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 1024,
                    cpuLimit: 2,
                    restartDelay: 5,
                    maxRestarts: 10
                };
                break;

            case HostingPlatform.HEROKU:
                this.config = {
                    platform,
                    hasPM2: false, // Heroku handle process
                    hasDocker: true,
                    autoRestart: true,
                    persistentStorage: false, // Ephemeral storage
                    logToFile: false, // Heroku logs to stdout
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 512,
                    cpuLimit: 1,
                    restartDelay: 10,
                    maxRestarts: 5
                };
                break;

            case HostingPlatform.GLITCH:
                this.config = {
                    platform,
                    hasPM2: false,
                    hasDocker: false,
                    autoRestart: true,
                    persistentStorage: true,
                    logToFile: false,
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 256,
                    cpuLimit: 0.5,
                    restartDelay: 5,
                    maxRestarts: 3
                };
                break;

            case HostingPlatform.AWS:
                this.config = {
                    platform,
                    hasPM2: true,
                    hasDocker: true,
                    autoRestart: true,
                    persistentStorage: true,
                    logToFile: true,
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 1024,
                    cpuLimit: 2,
                    restartDelay: 10,
                    maxRestarts: 10
                };
                break;

            case HostingPlatform.VERCEL:
                this.config = {
                    platform,
                    hasPM2: false,
                    hasDocker: false,
                    autoRestart: true,
                    persistentStorage: false,
                    logToFile: false,
                    logToConsole: true,
                    discordNotifications: false, // Vercel functions short-lived
                    memoryLimit: 1024,
                    cpuLimit: 1,
                    restartDelay: 0,
                    maxRestarts: 0
                };
                break;

            case HostingPlatform.LOCAL:
                this.config = {
                    platform,
                    hasPM2: true, // Có thể cài
                    hasDocker: true, // Có thể có
                    autoRestart: false, // Manual
                    persistentStorage: true,
                    logToFile: true,
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 4096, // Local machine
                    cpuLimit: 4,
                    restartDelay: 0,
                    maxRestarts: 0
                };
                break;

            default:
                // Unknown platform - conservative defaults
                this.config = {
                    platform: HostingPlatform.UNKNOWN,
                    hasPM2: false,
                    hasDocker: false,
                    autoRestart: false,
                    persistentStorage: false,
                    logToFile: true,
                    logToConsole: true,
                    discordNotifications: true,
                    memoryLimit: 512,
                    cpuLimit: 1,
                    restartDelay: 30,
                    maxRestarts: 3
                };
        }

        return this.config;
    }

    /**
     * Check if current platform supports PM2
     */
    canUsePM2(): boolean {
        return this.getPlatformConfig().hasPM2;
    }

    /**
     * Check if should use file logging
     */
    shouldLogToFile(): boolean {
        return this.getPlatformConfig().logToFile;
    }

    /**
     * Get platform-specific memory limit
     */
    getMemoryLimit(): number {
        return this.getPlatformConfig().memoryLimit;
    }

    /**
     * Get platform name for display
     */
    getPlatformName(): string {
        return this.detectedPlatform;
    }

    /**
     * Get all platform info
     */
    getPlatformInfo(): {
        platform: HostingPlatform;
        config: PlatformConfig;
        recommendations: string[];
    } {
        const config = this.getPlatformConfig();
        const recommendations = this.getRecommendations();

        return {
            platform: this.detectedPlatform,
            config,
            recommendations
        };
    }

    /**
     * Get platform-specific recommendations
     */
    private getRecommendations(): string[] {
        const platform = this.detectedPlatform;
        const config = this.getPlatformConfig();

        const recommendations: string[] = [];

        if (!config.persistentStorage) {
            recommendations.push('⚠️  Storage không persistent - backup data thường xuyên');
        }

        if (!config.autoRestart) {
            recommendations.push('⚠️  Không có auto-restart - setup PM2 nếu có thể');
        }

        if (!config.logToFile) {
            recommendations.push('ℹ️  Logs chỉ ra console - monitor thường xuyên');
        }

        if (config.memoryLimit < 512) {
            recommendations.push('⚠️  Memory limit thấp - optimize code');
        }

        // Platform-specific recommendations
        switch (platform) {
            case HostingPlatform.BOT_HOSTING_NET:
                recommendations.push('✅ Docker environment - error handling optimized');
                recommendations.push('ℹ️  Container auto-restart sau crash');
                break;

            case HostingPlatform.RAILWAY:
                recommendations.push('✅ Auto-deploy từ GitHub recommended');
                recommendations.push('ℹ️  Railway handle process management');
                break;

            case HostingPlatform.REPLIT:
                recommendations.push('✅ Web IDE - dễ debug');
                recommendations.push('⚠️  Có thể auto-sleep nếu inactive');
                break;

            case HostingPlatform.ORACLE_CLOUD:
                recommendations.push('✅ Free forever - setup PM2 cho auto-restart');
                recommendations.push('ℹ️  Full control - có thể optimize performance');
                break;

            case HostingPlatform.HEROKU:
                recommendations.push('⚠️  Ephemeral storage - không lưu data persistent');
                recommendations.push('ℹ️  Logs ra stdout - Heroku dashboard monitor');
                break;

            case HostingPlatform.GLITCH:
                recommendations.push('⚠️  Auto-sleep sau 5 phút - keep alive nếu cần');
                recommendations.push('✅ Dễ setup cho beginners');
                break;

            case HostingPlatform.AWS:
                recommendations.push('✅ Enterprise grade - setup PM2 + monitoring');
                recommendations.push('ℹ️  Có thể scale nếu cần');
                break;

            case HostingPlatform.VERCEL:
                recommendations.push('⚠️  Functions short-lived - không phù hợp long-running bot');
                recommendations.push('ℹ️  Chỉ dùng cho API endpoints');
                break;

            case HostingPlatform.LOCAL:
                recommendations.push('✅ Development - setup PM2 cho testing');
                recommendations.push('ℹ️  Test error handling locally trước deploy');
                break;

            default:
                recommendations.push('❓ Unknown platform - conservative settings applied');
                recommendations.push('ℹ️  Check documentation cho platform này');
        }

        return recommendations;
    }
}

// Export singleton
export const platformDetector = PlatformDetector.getInstance();
