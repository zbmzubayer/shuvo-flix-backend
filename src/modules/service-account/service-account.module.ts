import { Module } from "@nestjs/common";
import { ServiceAccountController } from "./service-account.controller";
import { ServiceAccountService } from "./service-account.service";

@Module({
  controllers: [ServiceAccountController],
  providers: [ServiceAccountService],
})
export class ServiceAccountModule {}
