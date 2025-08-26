import { ServiceAccountModule } from "@/modules/service-account/service-account.module";
import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";

@Module({
  imports: [ServiceAccountModule],
  providers: [TaskService],
})
export class TaskModule {}
