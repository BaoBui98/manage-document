import { Entity, Column } from 'typeorm';
import { CommonEntity } from '../../common/entity.common';

@Entity('subscriptions')
export class Subscription extends CommonEntity {
  @Column({ type: 'varchar', length: 255, comment: 'Tên gói (VD: Gói Cơ Bản, Gói Pro)' })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'price_month' })
  priceMonth: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'price_year' })
  priceYear: number;

  @Column({ type: 'int', name: 'max_document', comment: 'Số lượng tài liệu tối đa được lưu' })
  maxDocument: number;
}
