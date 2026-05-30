import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscription1780110275879 implements MigrationInterface {
    name = 'CreateSubscription1780110275879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "price_month" numeric(12,2) NOT NULL, "price_year" numeric(12,2) NOT NULL, "max_document" integer NOT NULL, CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")); COMMENT ON COLUMN "subscriptions"."name" IS 'Tên gói (VD: Gói Cơ Bản, Gói Pro)'; COMMENT ON COLUMN "subscriptions"."max_document" IS 'Số lượng tài liệu tối đa được lưu'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "subscriptions"`);
    }

}
