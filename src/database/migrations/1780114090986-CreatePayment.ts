import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePayment1780114090986 implements MigrationInterface {
    name = 'CreatePayment1780114090986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payments_billing_cycle_enum" AS ENUM('MONTHLY', 'YEARLY')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "subscription_id" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'VND', "billing_cycle" "public"."payments_billing_cycle_enum" NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'PENDING', "stripe_session_id" character varying, "stripe_payment_intent_id" character varying, CONSTRAINT "UQ_6279d48a63868aaa9827a54340e" UNIQUE ("stripe_session_id"), CONSTRAINT "UQ_94c6e6376625bc6710d7dbb4b6b" UNIQUE ("stripe_payment_intent_id"), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")); COMMENT ON COLUMN "payments"."stripe_session_id" IS 'Dùng để track Stripe Checkout Session'; COMMENT ON COLUMN "payments"."stripe_payment_intent_id" IS 'Mã giao dịch thực tế trên Stripe'`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_427785468fb7d2733f59e7d7d39" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_75848dfef07fd19027e08ca81d2" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_75848dfef07fd19027e08ca81d2"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_427785468fb7d2733f59e7d7d39"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_billing_cycle_enum"`);
    }

}
