import { sendExpirationAlertEmail } from "@/email/templates/ExpirationAlert";
import { sendExpirationReminderEmail } from "@/email/templates/ExpirationReminder";
import { ORDER_ACCOUNT_TYPE } from "@/enums/order.enum";
import { SERVICE_ACCOUNT_STATUS } from "@/enums/service-account.enum";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ServiceAccountService } from "@/modules/service-account/service-account.service";
import { sendExpirationSMS } from "@/utils/sms";

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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: "Asia/Dhaka" })
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
        service: true,
        serviceAccount: true,
        customer: { select: { id: true, name: true, personalEmail: true, phone: true } },
      },
    });
    // Update Slot Status
    const updatePromises: Prisma.Prisma__ServiceAccountClient<{ id: number }>[] = [];
    const customerPhonesServices: {
      name: string;
      phone: string;
      email: string | null;
      serviceName: string;
    }[] = [];
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
      customerPhonesServices.push({
        name: orders[i].customer.name,
        phone: orders[i].customer.phone,
        email: orders[i].customer.personalEmail || null,
        serviceName: orders[i].service.name,
      });
    }
    await Promise.all(updatePromises);
    this.logger.debug("Released slots for expired orders: " + orders.length);
    // Send SMS and Email to customers
    for (let i = 0; i < customerPhonesServices.length; i++) {
      await Promise.all([
        sendExpirationSMS(customerPhonesServices[i]),
        customerPhonesServices[i].email
          ? sendExpirationAlertEmail({
              user: {
                name: customerPhonesServices[i].name,
                email: customerPhonesServices[i].email as string,
              },
              serviceName: customerPhonesServices[i].serviceName,
            })
          : Promise.resolve(),
      ]);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: "Asia/Dhaka" })
  async sendExpirationReminder() {
    // Find the orders that will expire 2 days later
    const orders = await this.prisma.order.findMany({
      where: {
        endDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0) + 2 * 24 * 60 * 60 * 1000), // Start of the day after tomorrow
          lt: new Date(new Date().setHours(0, 0, 0, 0) + 3 * 24 * 60 * 60 * 1000), // Start of three days later
        },
      },
      select: {
        accountType: true,
        endDate: true,
        service: true,
        serviceAccount: true,
        customer: { select: { id: true, name: true, personalEmail: true, phone: true } },
      },
    });

    for (let i = 0; i < orders.length; i++) {
      if (orders[i].customer.personalEmail) {
        sendExpirationReminderEmail({
          user: {
            name: orders[i].customer.name,
            email: orders[i].customer.personalEmail as string,
          },
          serviceName: orders[i].service.name,
          expirationDate: new Date(orders[i].endDate).toLocaleDateString(),
        });
      }
    }
  }
}
