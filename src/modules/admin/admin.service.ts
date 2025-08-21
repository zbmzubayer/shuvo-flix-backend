import { ConflictException, Injectable } from "@nestjs/common";

import { hash } from "@/modules/auth/hash";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateAdminDto } from "./dto/create-admin.dto";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const { username } = createAdminDto;
    const existingAdmin = await this.prisma.admin.findUnique({ where: { username } });

    if (existingAdmin) {
      throw new ConflictException("Admin with this username already exists");
    }

    createAdminDto.password = await hash.create(createAdminDto.password);

    return this.prisma.admin.create({ data: createAdminDto });
  }
}
