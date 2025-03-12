import { IsString, IsUrl, IsUUID } from 'class-validator';

export class PaidOrderDto {
  @IsString()
  orderId: string;

  @IsString()
  @IsUUID()
  stripePaymentIntentId: string;

  @IsString()
  @IsUrl()
  receiptUrl: string;
}
