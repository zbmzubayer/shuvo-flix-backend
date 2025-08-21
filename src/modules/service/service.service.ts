import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/modules/prisma/prisma.service";

import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({ data: createServiceDto });
  }

  findAll() {
    return this.prisma.service.findMany({ include: { serviceAccounts: true } });
  }

  findOne(id: number) {
    return this.prisma.service.findUnique({
      where: { id },
      include: { serviceAccounts: { orderBy: { createdAt: "asc" } } },
    });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data: updateServiceDto });
  }

  async remove(id: number) {
    await this.prisma.service.delete({ where: { id } });
    return true;
  }
}
