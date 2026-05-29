import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from '../data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      entities: [], // Ghi đè lại để tránh lỗi Node.js strip-only khi parse file .ts lúc runtime
      migrations: [], // Ngăn không cho TypeORM load các file migration .ts lúc runtime gây lỗi ESM/CJS
      autoLoadEntities: true, // Vẫn giữ autoLoadEntities cho NestJS tự động map các module entity
    }),
  ],
})
export class DatabaseModule {}
