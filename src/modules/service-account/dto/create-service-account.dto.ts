import { SERVICE_ACCOUNT_PAYMENT, ServiceAccountPayment } from "@/enums/service-account.enum";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateServiceAccountDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  note: string;

  @IsNotEmpty()
  @IsEnum(SERVICE_ACCOUNT_PAYMENT)
  @ApiProperty()
  payment: ServiceAccountPayment;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  personalSlots: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  sharedSlots: number;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  joinDate: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  expiryDate: Date;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  dealerId: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  serviceId: number;
}
