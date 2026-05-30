import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToDocument1780048040185 implements MigrationInterface {
    name = 'AddStatusToDocument1780048040185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."documents_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "status" "public"."documents_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "file_url" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "file_url" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."documents_status_enum"`);
    }

}
