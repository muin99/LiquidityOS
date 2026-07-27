import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifications: Repository<Notification>,
  ) {}
  create(dto: CreateNotificationDto) {
    return this.notifications.save(this.notifications.create(dto));
  }
  findAll(userId: string, status?: string) {
    return this.notifications.find({
      where: {
        userId,
        ...(status && { status: status as Notification['status'] }),
      },
      order: { createdAt: 'DESC' },
    });
  }
  async read(id: string, userId: string) {
    const notification = await this.notifications.findOneBy({ id, userId });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.status = 'read';
    notification.readAt = new Date();
    return this.notifications.save(notification);
  }
  async readAll(userId: string) {
    await this.notifications
      .createQueryBuilder()
      .update(Notification)
      .set({ status: 'read', readAt: new Date() })
      .where('userId = :userId AND status != :status', {
        userId,
        status: 'read',
      })
      .execute();
    return { message: 'All notifications marked as read' };
  }
}
