import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@/modules/prisma/prisma.service";

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
    await Promise.all([
      updateServiceAccountDto.serviceId
        ? this.prisma.service.findUniqueOrThrow({
            where: { id: updateServiceAccountDto.serviceId },
          })
        : Promise.resolve(),
      updateServiceAccountDto.dealerId
        ? this.prisma.dealer.findUniqueOrThrow({ where: { id: updateServiceAccountDto.dealerId } })
        : Promise.resolve(),
    ]);

    return this.prisma.serviceAccount.update({
      where: { id },
      data: updateServiceAccountDto,
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
