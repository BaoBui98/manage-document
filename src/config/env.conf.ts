import 'dotenv/config';
import { plainToInstance, Transform, Expose } from 'class-transformer';
import { IsNumber, IsString, IsNotEmpty, validateSync } from 'class-validator';

export class EnvironmentConfig {
    @Expose({ name: 'PORT' })
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    public readonly port!: number;

    // --- Database Configuration (Postgres) ---
    @Expose({ name: 'DB_HOST' })
    @IsString()
    @IsNotEmpty()
    public readonly dbHost!: string;

    @Expose({ name: 'DB_PORT' })
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    public readonly dbPort!: number;

    @Expose({ name: 'DB_USER' })
    @IsString()
    @IsNotEmpty()
    public readonly dbUser!: string;

    @Expose({ name: 'DB_PASSWORD' })
    @IsString()
    @IsNotEmpty()
    public readonly dbPassword!: string;

    @Expose({ name: 'DB_NAME' })
    @IsString()
    @IsNotEmpty()
    public readonly dbName!: string;

    // --- Redis Configuration ---
    @Expose({ name: 'REDIS_HOST' })
    @IsString()
    @IsNotEmpty()
    public readonly redisHost!: string;

    @Expose({ name: 'REDIS_PORT' })
    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    public readonly redisPort!: number;

    // --- JWT Configuration ---
    @Expose({ name: 'JWT_SECRET' })
    @IsString()
    @IsNotEmpty()
    public readonly jwtSecret!: string;

    @Expose({ name: 'JWT_REFRESH_SECRET' })
    @IsString()
    @IsNotEmpty()
    public readonly jwtRefreshSecret!: string;

    @Expose({ name: 'JWT_EXPIRES_IN' })
    @IsString()
    @IsNotEmpty()
    public readonly jwtExpiresIn!: string;

    @Expose({ name: 'JWT_REFRESH_EXPIRES_IN' })
    @IsString()
    @IsNotEmpty()
    public readonly jwtRefreshExpiresIn!: string;
}

export function validateEnv(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(
        EnvironmentConfig,
        config,
        {
            enableImplicitConversion: true,
            excludeExtraneousValues: true,
        }
    );

    // Chạy validate đồng bộ
    const errors = validateSync(validatedConfig, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(`[Env Validation Error]: ${errors.toString()}`);
    }

    return validatedConfig;
}

// Khởi tạo một instance duy nhất để có thể import và dùng trực tiếp ở mọi file (như main.ts)
export const envConfig = validateEnv(process.env as Record<string, unknown>);