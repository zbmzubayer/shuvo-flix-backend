import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/modules/prisma/prisma.service";

import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  create(createCustomerDto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: createCustomerDto });
  }

  findAll() {
    return this.prisma.customer.findMany({
      include: { orders: { include: { serviceAccount: true }, orderBy: { createdAt: "desc" } } },
    });
  }

  findOne(id: number) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({ where: { id }, data: updateCustomerDto });
  }

  remove(id: number) {
    return this.prisma.customer.delete({ where: { id } });
  }
}
