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

    if (
      serviceAccount.personalSlots <= serviceAccount.soldPersonalSlots &&
      orderDto.accountType === "Personal"
    ) {
      throw new BadRequestException("No personal slots available");
    } else if (
      serviceAccount.sharedSlots <= serviceAccount.soldSharedSlots &&
      orderDto.accountType === "Shared"
    ) {
      throw new BadRequestException("No shared slots available");
    }

    let customerId = isCustomerExists?.id ?? 0;

    const serviceAccountUpdateData: Prisma.ServiceAccountUncheckedUpdateInput =
      orderDto.accountType === "Personal"
        ? { soldPersonalSlots: { increment: 1 } }
        : { soldSharedSlots: { increment: 1 } };
    if (!isCustomerExists) {
      const newCustomer = await this.prisma.customer.create({ data: customer });
      customerId = newCustomer.id;
    }

    serviceAccountUpdateData.status = this.serviceAccountService.calculateStatus(serviceAccount);

    const [order] = await Promise.all([
      this.prisma.order.create({ data: { ...orderDto, customerId } }),
      isCustomerExists
        ? this.prisma.customer.update({
            where: { id: isCustomerExists.id },
            data: { lastPurchase: new Date() },
          })
        : Promise.resolve(),
      this.prisma.serviceAccount.update({
        where: { id: orderDto.serviceAccountId },
        data: serviceAccountUpdateData,
      }),
    ]);

    return order;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: { customer: true, service: true, serviceAccount: true, provider: true },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { customer: true, service: true, serviceAccount: true, provider: true },
    });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
