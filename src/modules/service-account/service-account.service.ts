import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/modules/prisma/prisma.service";

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
    return this.prisma.serviceAccount.findUnique({ where: { id } });
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
}
