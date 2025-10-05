import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@/modules/prisma/prisma.service";

import { ORDER_ACCOUNT_TYPE, OrderAccountType } from "@/enums/order.enum";
import { SERVICE_ACCOUNT_STATUS, ServiceAccountStatus } from "@/enums/service-account.enum";
import { ServiceAccount } from "generated/prisma";
import { CreateServiceAccountDto } from "./dto/create-service-account.dto";
import { UpdateServiceAccountDto } from "./dto/update-service-account.dto";

@Injectable()
export class ServiceAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceAccountDto: CreateServiceAccountDto) {
    // Check if the service and dealer exist before creating the service account
    await Promise.all([
      this.prisma.service.findUniqueOrThrow({ where: { id: createServiceAccountDto.serviceId } }),
      this.prisma.dealer.findUniqueOrThrow({ where: { id: createServiceAccountDto.dealerId } }),
    ]);

    return this.prisma.serviceAccount.create({ data: createServiceAccountDto });
  }

  findAll() {
    return this.prisma.serviceAccount.findMany();
  }

  findOne(id: number) {
    return this.prisma.serviceAccount.findUnique({
      where: { id },
      select: {
        orders: {
          where: { endDate: { gte: new Date() } },
          include: { customer: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async update(id: number, updateServiceAccountDto: UpdateServiceAccountDto) {
    const serviceAccount = await this.prisma.serviceAccount.findUniqueOrThrow({ where: { id } });
    if (
      updateServiceAccountDto.personalSlots &&
      updateServiceAccountDto.personalSlots < serviceAccount.soldPersonalSlots
    ) {
      throw new BadRequestException("Cannot reduce personal slots below sold amount");
    }
    if (
      updateServiceAccountDto.sharedSlots &&
      updateServiceAccountDto.sharedSlots < serviceAccount.soldSharedSlots
    ) {
      throw new BadRequestException("Cannot reduce shared slots below sold amount");
    }
    if (serviceAccount.status === SERVICE_ACCOUNT_STATUS.disabled) {
      return this.prisma.serviceAccount.update({
        where: { id },
        data: updateServiceAccountDto,
      });
    }
    serviceAccount.personalSlots =
      updateServiceAccountDto.personalSlots ?? serviceAccount.personalSlots;
    serviceAccount.sharedSlots = updateServiceAccountDto.sharedSlots ?? serviceAccount.sharedSlots;
    const newStatus = this.calculateStatus(serviceAccount);

    return this.prisma.serviceAccount.update({
      where: { id },
      data: { ...updateServiceAccountDto, status: newStatus },
    });
  }

  async remove(id: number) {
    await this.prisma.serviceAccount.delete({ where: { id } });
    return true;
  }

  async toggleStatus(id: number) {
    const serviceAccount = await this.prisma.serviceAccount.findUniqueOrThrow({ where: { id } });

    if (
      serviceAccount.status !== SERVICE_ACCOUNT_STATUS.disabled &&
      serviceAccount.soldPersonalSlots + serviceAccount.soldSharedSlots > 0
    ) {
      throw new BadRequestException("Release all slots before disabling");
    }

    const newStatus =
      serviceAccount.status === SERVICE_ACCOUNT_STATUS.disabled
        ? this.calculateStatus(serviceAccount)
        : SERVICE_ACCOUNT_STATUS.disabled;

    await this.prisma.serviceAccount.update({
      where: { id },
      data: { status: newStatus },
    });

    return true;
  }

  checkSlotAvailability(serviceAccount: ServiceAccount, accountType: OrderAccountType) {
    if (
      accountType === ORDER_ACCOUNT_TYPE.shared &&
      serviceAccount.sharedSlots <= serviceAccount.soldSharedSlots
    ) {
      throw new BadRequestException("No shared slots available");
    } else if (
      accountType === ORDER_ACCOUNT_TYPE.personal &&
      serviceAccount.personalSlots <= serviceAccount.soldPersonalSlots
    ) {
      throw new BadRequestException("No personal slots available");
    }
  }

  calculateStatus(serviceAccount: ServiceAccount): ServiceAccountStatus {
    const totalSlots = serviceAccount.personalSlots + serviceAccount.sharedSlots;
    const totalSoldSlots = serviceAccount.soldPersonalSlots + serviceAccount.soldSharedSlots;
    if (totalSoldSlots > 0 && totalSoldSlots < totalSlots) {
      return SERVICE_ACCOUNT_STATUS.partial;
    } else if (totalSoldSlots === totalSlots) {
      return SERVICE_ACCOUNT_STATUS.full;
    } else {
      return SERVICE_ACCOUNT_STATUS.new;
    }
  }
}
