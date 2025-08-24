import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendExpirationReminder() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.logger.debug("Called every 5 seconds1: " + new Date().toISOString());
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async releaseSlotAndNotify() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.logger.debug("Called every 5 seconds2: " + new Date().toISOString());
  }
}
