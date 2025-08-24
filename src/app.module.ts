import { Module } from "@nestjs/common";

import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { DealerModule } from "./modules/dealer/dealer.module";
import { FileModule } from "./modules/file/file.module";
import { OrderModule } from "./modules/order/order.module";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { ProviderModule } from "./modules/provider/provider.module";
import { ServiceAccountModule } from "./modules/service-account/service-account.module";
import { ServiceModule } from "./modules/service/service.module";
import { TaskModule } from "./modules/task/task.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AdminModule,
    ServiceModule,
    ProviderModule,
    FileModule,
    CustomerModule,
    ServiceAccountModule,
    OrderModule,
    DealerModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
