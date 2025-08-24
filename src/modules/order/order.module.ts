import { ServiceAccountModule } from "@/modules/service-account/service-account.module";
import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";

@Module({
  imports: [ServiceAccountModule],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
