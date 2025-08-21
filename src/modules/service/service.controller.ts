import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";

import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { ServiceService } from "./service.service";

// @UseGuards(AuthGuard)
@Controller("service")
export class ServiceController {
  private count: number = 0;
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.serviceService.create(createServiceDto);
  }

  @Get()
  findAll() {
    this.count++;
    console.log(this.count);
    return this.serviceService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.serviceService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.serviceService.update(+id, updateServiceDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.serviceService.remove(+id);
  }
}
