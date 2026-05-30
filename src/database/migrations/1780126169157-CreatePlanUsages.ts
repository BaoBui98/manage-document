import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlanUsages1780126169157 implements MigrationInterface {
    name = 'CreatePlanUsages1780126169157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plan_usages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "subscription_id" uuid, "max_document" integer NOT NULL DEFAULT '0', "used_document" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_e85bce8254683ef5a5660676b2c" UNIQUE ("user_id"), CONSTRAINT "REL_e85bce8254683ef5a5660676b2" UNIQUE ("user_id"), CONSTRAINT "PK_332b2acc6b8adfec228110e04c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "plan_usages" ADD CONSTRAINT "FK_e85bce8254683ef5a5660676b2c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_usages" ADD CONSTRAINT "FK_80dfedd6b650db0f2a75ac4af36" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_usages" DROP CONSTRAINT "FK_80dfedd6b650db0f2a75ac4af36"`);
        await queryRunner.query(`ALTER TABLE "plan_usages" DROP CONSTRAINT "FK_e85bce8254683ef5a5660676b2c"`);
        await queryRunner.query(`DROP TABLE "plan_usages"`);
    }

}
