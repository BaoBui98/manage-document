import { DataSource, DataSourceOptions } from 'typeorm';
import { envConfig } from '../config/env.conf';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: envConfig.dbHost,
    port: envConfig.dbPort,
    username: envConfig.dbUser,
    password: envConfig.dbPassword,
    database: envConfig.dbName,
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: false, // Tắt synchronize để dùng migration
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
