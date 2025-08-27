import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { AuthGuard } from "@/modules/auth/auth.guard";
import { CreateServiceAccountDto } from "./dto/create-service-account.dto";
import { UpdateServiceAccountDto } from "./dto/update-service-account.dto";
import { ServiceAccountService } from "./service-account.service";

@Controller("service-account")
@UseGuards(AuthGuard)
export class ServiceAccountController {
  constructor(private readonly serviceAccountService: ServiceAccountService) {}

  @Post()
  create(@Body() createServiceAccountDto: CreateServiceAccountDto) {
    return this.serviceAccountService.create(createServiceAccountDto);
  }

  @Get()
  findAll() {
    return this.serviceAccountService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.serviceAccountService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateServiceAccountDto: UpdateServiceAccountDto) {
    return this.serviceAccountService.update(+id, updateServiceAccountDto);
  }

  @Patch("/toggle-status/:id")
  toggleStatus(@Param("id") id: string) {
    return this.serviceAccountService.toggleStatus(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.serviceAccountService.remove(+id);
  }
}
