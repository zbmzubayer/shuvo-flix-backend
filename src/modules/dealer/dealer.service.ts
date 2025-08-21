import { Injectable } from "@nestjs/common";

import { PrismaService } from "@/modules/prisma/prisma.service";

import { CreateDealerDto } from "./dto/create-dealer.dto";
import { UpdateDealerDto } from "./dto/update-dealer.dto";

@Injectable()
export class DealerService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDealerDto: CreateDealerDto) {
    return this.prisma.dealer.create({ data: createDealerDto });
  }

  findAll() {
    return this.prisma.dealer.findMany();
  }

  findOne(id: number) {
    return this.prisma.dealer.findUnique({ where: { id } });
  }

  update(id: number, updateDealerDto: UpdateDealerDto) {
    console.log(`Updating dealer with ID: ${id}`, updateDealerDto);
    return this.prisma.dealer.update({ where: { id }, data: updateDealerDto });
  }

  remove(id: number) {
    return this.prisma.dealer.delete({ where: { id } });
  }
}
