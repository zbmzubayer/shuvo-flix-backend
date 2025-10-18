import { ORDER_ACCOUNT_TYPE, OrderAccountType } from "@/enums/order.enum";
import { SERVICE_ACCOUNT_STATUS } from "@/enums/service-account.enum";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ServiceAccountService } from "@/modules/service-account/service-account.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "generated/prisma";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly serviceAccountService: ServiceAccountService
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { customer, ...orderDto } = createOrderDto;

    const [isCustomerExists, serviceAccount] = await Promise.all([
      this.prisma.customer.findUnique({ where: { phone: customer.phone } }),
      this.prisma.serviceAccount.findUniqueOrThrow({ where: { id: orderDto.serviceAccountId } }),
    ]);

    if (serviceAccount.status === SERVICE_ACCOUNT_STATUS.disabled) {
      throw new BadRequestException("Account is disabled! Activate it before creating orders.");
    }

    this.serviceAccountService.checkSlotAvailability(serviceAccount, orderDto.accountType);

    let customerId = isCustomerExists?.id ?? 0;

    const serviceAccountUpdateData: Prisma.ServiceAccountUncheckedUpdateInput =
      orderDto.accountType === ORDER_ACCOUNT_TYPE.personal
        ? { soldPersonalSlots: { increment: 1 } }
        : { soldSharedSlots: { increment: 1 } };
    if (!isCustomerExists) {
      const newCustomer = await this.prisma.customer.create({ data: customer });
      customerId = newCustomer.id;
    }

    serviceAccountUpdateData.status = this.serviceAccountService.calculateStatus(serviceAccount);

    return await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({ data: { ...orderDto, customerId } });
      if (isCustomerExists) {
        await tx.customer.update({
          where: { id: isCustomerExists.id },
          data: { lastPurchase: new Date() },
        });
      }

      await tx.serviceAccount.update({
        where: { id: orderDto.serviceAccountId },
        data: serviceAccountUpdateData,
      });

      return order;
    });
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { customer: true, service: true, serviceAccount: true, provider: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { customer: true, service: true, serviceAccount: true, provider: true },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id },
      include: { serviceAccount: true },
    });

    // Check is service account is same or different
    if (
      updateOrderDto.serviceAccountId &&
      order.serviceAccountId !== updateOrderDto.serviceAccountId
    ) {
      const serviceAccount = await this.prisma.serviceAccount.findUniqueOrThrow({
        where: { id: updateOrderDto.serviceAccountId },
      });
      if (serviceAccount.status === SERVICE_ACCOUNT_STATUS.disabled) {
        throw new BadRequestException("Account is disabled! Activate it before use.");
      }
      this.serviceAccountService.checkSlotAvailability(
        serviceAccount,
        (updateOrderDto.accountType ?? order.accountType) as OrderAccountType
      );
      // Update service account - slot and status
      const serviceAccountUpdateData: Prisma.ServiceAccountUncheckedUpdateInput =
        (updateOrderDto.accountType ?? order.accountType) === ORDER_ACCOUNT_TYPE.personal
          ? { soldPersonalSlots: { increment: 1 } }
          : { soldSharedSlots: { increment: 1 } };
      serviceAccountUpdateData.status = this.serviceAccountService.calculateStatus(serviceAccount);
      // Update existing service account - slot and status
      const existingServiceAccountUpdateData: Prisma.ServiceAccountUncheckedUpdateInput =
        (updateOrderDto.accountType ?? order.accountType) === ORDER_ACCOUNT_TYPE.personal
          ? { soldPersonalSlots: { decrement: 1 } }
          : { soldSharedSlots: { decrement: 1 } };
      existingServiceAccountUpdateData.status = this.serviceAccountService.calculateStatus(
        order.serviceAccount
      );

      return await this.prisma.$transaction(async (tx) => {
        const [updatedOrder] = await Promise.all([
          tx.order.update({ where: { id }, data: updateOrderDto }),
          tx.serviceAccount.update({
            where: { id: updateOrderDto.serviceAccountId },
            data: serviceAccountUpdateData,
          }),
          tx.serviceAccount.update({
            where: { id: order.serviceAccountId },
            data: existingServiceAccountUpdateData,
          }),
        ]);
        return updatedOrder;
      });
    }
    // Check if account type is changing
    else if (updateOrderDto.accountType && order.accountType !== updateOrderDto.accountType) {
      this.serviceAccountService.checkSlotAvailability(
        order.serviceAccount,
        updateOrderDto.accountType
      );
      const serviceAccountUpdateData: Prisma.ServiceAccountUncheckedUpdateInput =
        updateOrderDto.accountType === ORDER_ACCOUNT_TYPE.personal
          ? {
              soldPersonalSlots: { increment: 1 },
              soldSharedSlots: { decrement: 1 },
            }
          : {
              soldSharedSlots: { increment: 1 },
              soldPersonalSlots: { decrement: 1 },
            };
      return await this.prisma.$transaction(async (tx) => {
        const [updatedOrder] = await Promise.all([
          tx.order.update({ where: { id }, data: updateOrderDto }),
          tx.serviceAccount.update({
            where: { id: order.serviceAccountId },
            data: serviceAccountUpdateData,
          }),
        ]);
        return updatedOrder;
      });
    }
    return this.prisma.order.update({ where: { id }, data: updateOrderDto });
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
