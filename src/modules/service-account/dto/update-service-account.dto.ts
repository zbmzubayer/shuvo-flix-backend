import { PartialType } from "@nestjs/swagger";
import { CreateServiceAccountDto } from "./create-service-account.dto";

export class UpdateServiceAccountDto extends PartialType(CreateServiceAccountDto) {}
