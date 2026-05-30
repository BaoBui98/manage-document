import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommonEntity } from '../../common/entity.common';
import { User } from '../../user/entities/user.entity';

export enum DocumentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('documents')
export class Document extends CommonEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @Column({ name: 'file_url', length: 500, nullable: true }) // Có thể null lúc đang pending
  file_url: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
