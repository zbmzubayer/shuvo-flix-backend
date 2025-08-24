import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

import {
  ORDER_ACCOUNT_TYPE,
  ORDER_STATUS,
  type OrderAccountType,
  type OrderStatus,
} from "@/enums/order.enum";
import { CreateCustomerDto } from "@/modules/customer/dto/create-customer.dto";

export class CreateOrderDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsEnum(ORDER_ACCOUNT_TYPE)
  @ApiProperty()
  accountType: OrderAccountType;

  @IsNotEmpty()
  @IsEnum(ORDER_STATUS)
  @ApiProperty()
  status: OrderStatus;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  endDate: Date;

  @IsOptional()
  @IsString()
  @ApiProperty()
  note?: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  serviceId: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  serviceAccountId: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty()
  providerId: number;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerDto)
  customer: CreateCustomerDto;
}
