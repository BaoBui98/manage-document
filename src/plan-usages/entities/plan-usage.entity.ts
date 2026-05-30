import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CommonEntity } from '../../common/entity.common';
import { User } from '../../user/entities/user.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Entity('plan_usages')
export class PlanUsage extends CommonEntity {

  // Khóa ngoại đến bảng User (unique = true để đảm bảo quan hệ 1-1: Mỗi user chỉ có 1 bản ghi PlanUsage)
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Khóa ngoại đến bảng Subscription (Nhiều PlanUsage có thể tham chiếu chung 1 gói Subscription)
  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId: string;

  @ManyToOne(() => Subscription, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  // Giới hạn tài liệu tối đa của User này
  @Column({ name: 'max_document', type: 'int', default: 0 })
  maxDocument: number;

  // (Mở rộng thêm) Đã gọi là Usage thì nên có cột theo dõi số tài liệu HIỆN TẠI đã dùng
  @Column({ name: 'used_document', type: 'int', default: 0 })
  usedDocument: number;
}
