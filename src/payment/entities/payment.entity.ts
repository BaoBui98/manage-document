import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from '../../common/entity.common';
import { User } from '../../user/entities/user.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

export enum PaymentStatus {
  PENDING = 'PENDING', // Đang chờ thanh toán
  SUCCESS = 'SUCCESS', // Thanh toán thành công
  FAILED = 'FAILED',   // Thanh toán thất bại
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY', // Mua theo tháng
  YEARLY = 'YEARLY',   // Mua theo năm
}

@Entity('payments')
export class Payment extends CommonEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ name: 'subscription_id' })
  subscriptionId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 10, default: 'VND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    name: 'billing_cycle'
  })
  billingCycle: BillingCycle;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // CÁC TRƯỜNG DÀNH RIÊNG CHO STRIPE
  @Column({ name: 'stripe_session_id', nullable: true, unique: true, comment: 'Dùng để track Stripe Checkout Session' })
  stripeSessionId: string;

  @Column({ name: 'stripe_payment_intent_id', nullable: true, unique: true, comment: 'Mã giao dịch thực tế trên Stripe' })
  stripePaymentIntentId: string;
}
