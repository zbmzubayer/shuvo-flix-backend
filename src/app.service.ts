import { PrismaService } from "@/modules/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return "Hello World!";
  }

  async getDashboard() {
    const [customers, orders] = await Promise.all([
      this.prisma.customer.findMany({ select: { _count: { select: { orders: true } } } }),
      this.prisma.order.findMany({ select: { endDate: true } }),
    ]);
    const totalCustomer = customers.length;
    let newCustomer = 0;
    for (let i = 0; i < totalCustomer; i++) {
      if (customers[i]._count.orders <= 1) {
        newCustomer++;
      }
    }

    const totalOrder = orders.length;
    let activeOrder = 0;
    let upcomingExpiredOrder = 0;
    for (let i = 0; i < totalOrder; i++) {
      if (orders[i].endDate > new Date()) {
        activeOrder++;
        const diffInDays =
          (new Date(orders[i].endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        if (diffInDays <= 2 && diffInDays > 0) {
          upcomingExpiredOrder++;
        }
      }
    }

    return {
      totalCustomer,
      newCustomer,
      totalOrder,
      activeOrder,
      expiredOrder: totalOrder - activeOrder,
      upcomingExpiredOrder,
    };
  }
}
