import { ORDER_ACCOUNT_TYPE } from "@/enums/order.enum";
import { SERVICE_ACCOUNT_STATUS } from "@/enums/service-account.enum";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ServiceAccountService } from "@/modules/service-account/service-account.service";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Prisma } from "generated/prisma";

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serviceAccountService: ServiceAccountService
  ) {}

  private readonly logger = new Logger(TaskService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async releaseSlotAndNotify() {
    // Find the orders that expired yesterday
    const orders = await this.prisma.order.findMany({
      where: {
        endDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000), // Start of yesterday
          lt: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
        },
      },
      select: {
        accountType: true,
        serviceAccount: true,
        customer: { select: { id: true, name: true, personalEmail: true, phone: true } },
      },
    });
    // Update Slot Status
    const updatePromises: Prisma.Prisma__ServiceAccountClient<{ id: number }>[] = [];
    const ordersLength = orders.length;
    for (let i = 0; i < ordersLength; i++) {
      const serviceAccountUpdateData: Prisma.ServiceAccountUncheckedUpdateInput =
        orders[i].accountType === ORDER_ACCOUNT_TYPE.personal
          ? { soldPersonalSlots: { decrement: 1 } }
          : { soldSharedSlots: { decrement: 1 } };
      // If the service account is not disabled, update its status
      if (orders[i].serviceAccount.status !== SERVICE_ACCOUNT_STATUS.disabled) {
        serviceAccountUpdateData.status = this.serviceAccountService.calculateStatus(
          orders[i].serviceAccount
        );
      }
      const promise = this.prisma.serviceAccount.update({
        where: { id: orders[i].serviceAccount.id },
        data: serviceAccountUpdateData,
        select: { id: true },
      });
      updatePromises.push(promise);
    }
    await Promise.all(updatePromises);
    this.logger.debug("Released slots for expired orders: " + orders.length);
    // Send email and sms to customers
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendExpirationReminder() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.logger.debug("Called every 5 seconds1: " + new Date().toISOString());
  }
}
