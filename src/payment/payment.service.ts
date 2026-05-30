import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus, BillingCycle } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { SubscriptionService } from '../subscription/subscription.service';
import { PlanUsagesService } from '../plan-usages/plan-usages.service';
import Stripe from 'stripe';
import { envConfig } from '../config/env.conf';

// Mẹo nhỏ: Dùng ReturnType và Awaited để trích xuất chính xác Type từ SDK của Stripe 
// mà không cần lo lắng phiên bản (version) đó export namespace hay không.
type StripeEvent = ReturnType<Stripe.Stripe['webhooks']['constructEvent']>;
type StripeCheckoutSession = Awaited<ReturnType<Stripe.Stripe['checkout']['sessions']['create']>>;

@Injectable()
export class PaymentService {
  private stripe: Stripe.Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    private readonly subscriptionService: SubscriptionService,
    private readonly planUsagesService: PlanUsagesService
  ) {
    // @ts-ignore
    this.stripe = new Stripe(envConfig.stripeSecretKey || 'sk_test_fake', {
      apiVersion: '2026-05-27.dahlia', 
    });
  }

  async createCheckoutSession(userId: string, subscriptionId: string, billingCycle: BillingCycle) {
    const subscription = await this.subscriptionService.findOne(subscriptionId);
    if (!subscription) throw new NotFoundException('Gói cước không tồn tại');

    // Lấy đúng giá tiền theo chu kỳ
    const amount = billingCycle === BillingCycle.MONTHLY ? subscription.priceMonth : subscription.priceYear;
    
    // 1. Tạo bản ghi Payment ở trạng thái PENDING
    const payment = this.paymentRepo.create({
      userId,
      subscriptionId,
      amount,
      billingCycle,
      status: PaymentStatus.PENDING,
      currency: 'VND'
    });
    const savedPayment = await this.paymentRepo.save(payment);

    // 2. Tạo Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'vnd',
            product_data: {
              name: subscription.name,
              description: `Gói ${billingCycle} - ${subscription.name}`,
            },
            unit_amount: Math.round(Number(amount)), // Stripe yêu cầu số nguyên (integer)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${envConfig.stripeSuccessUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: envConfig.stripeCancelUrl,
      client_reference_id: savedPayment.id, // Lưu ID đơn hàng vào Stripe để đối chiếu sau này
    });

    // 3. Cập nhật stripeSessionId vào database
    savedPayment.stripeSessionId = session.id;
    await this.paymentRepo.save(savedPayment);

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    let event: StripeEvent;

    try {
      // Hàm constructEvent cần chuỗi buffer thô (raw payload) và chữ ký để kiểm tra bảo mật
      event = this.stripe.webhooks.constructEvent(payload, signature, envConfig.stripeWebhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as StripeCheckoutSession;
      await this.handlePaymentSuccess(session);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(session: StripeCheckoutSession) {
    const payment = await this.paymentRepo.findOne({ where: { stripeSessionId: session.id } });
    if (!payment) return;

    payment.status = PaymentStatus.SUCCESS;
    payment.stripePaymentIntentId = session.payment_intent as string;
    await this.paymentRepo.save(payment);
    
    console.log(`[Thanh toán thành công] Đơn hàng ${payment.id}`);
    
    // Cập nhật lại PlanUsage cho User
    const subscription = await this.subscriptionService.findOne(payment.subscriptionId);
    if (subscription) {
      await this.planUsagesService.upsertPlanUsage(payment.userId, payment.subscriptionId, subscription.maxDocument);
      console.log(`[Cập nhật gói cước] Đã cộng dồn ${subscription.maxDocument} documents cho User ${payment.userId}`);
    }
  }
}
