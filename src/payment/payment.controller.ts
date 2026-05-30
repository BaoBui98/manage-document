import { Controller, Post, Body, Req, Headers, Get, Query, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentService } from './payment.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../decorator/public.decorator';
import * as requestInterface from 'src/interface/request.interface';


@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post('checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo link thanh toán Stripe' })
  createCheckout(@Body() createCheckoutDto: CreateCheckoutDto, @Req() req: requestInterface.RequestWithUser) {
    const userId = req.user.sub;
    return this.paymentService.createCheckoutSession(userId, createCheckoutDto.subscriptionId, createCheckoutDto.billingCycle);
  }

  @Post('webhook')
  @Public() // Webhook của Stripe phải public
  @ApiOperation({ summary: 'Stripe Webhook (Hệ thống gọi tự động)' })
  handleWebhook(@Headers('stripe-signature') signature: string, @Req() req: RawBodyRequest<Request>) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body for webhook verification');
    }
    // Truyền buffer thô (rawBody) xuống service để check signature
    return this.paymentService.handleWebhook(signature, req.rawBody);
  }

  @Get('success')
  @Public()
  @ApiOperation({ summary: 'Trang trả về khi thanh toán thành công' })
  success(@Query('session_id') sessionId: string) {
    return {
      message: 'Thanh toán thành công! Cảm ơn bạn.',
      sessionId
    };
  }

  @Get('cancel')
  @Public()
  @ApiOperation({ summary: 'Trang trả về khi thanh toán bị hủy' })
  cancel() {
    return {
      message: 'Thanh toán đã bị hủy.'
    };
  }
}
