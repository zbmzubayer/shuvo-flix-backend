import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";

import { AuthGuard } from "@/modules/auth/auth.guard";
import { CreateProviderDto } from "./dto/create-provider.dto";
import { UpdateProviderDto } from "./dto/update-provider.dto";
import { ProviderService } from "./provider.service";

@Controller("provider")
@UseGuards(AuthGuard)
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  create(@Body() createProviderDto: CreateProviderDto) {
    return this.providerService.create(createProviderDto);
  }

  @Get()
  findAll() {
    return this.providerService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.providerService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateProviderDto: UpdateProviderDto) {
    return this.providerService.update(+id, updateProviderDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.providerService.remove(+id);
  }
}
