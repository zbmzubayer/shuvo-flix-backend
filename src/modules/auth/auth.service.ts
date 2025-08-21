import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

import { PrismaService } from "@/modules/prisma/prisma.service";

import { LoginDto } from "./dto/login.dto";
import { hash } from "./hash";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const admin = await this.prisma.admin.findUnique({
      where: { username },
      select: { id: true, username: true, password: true, role: true },
    });
    if (!admin) {
      throw new NotFoundException("Admin not found");
    }

    const isPasswordMatch = await hash.verify(password, admin.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException("Invalid password");
    }

    const adapterUser = { id: admin.id, username: admin.username, role: admin.role };
    return adapterUser;
  }
}
