import { CUSTOMER_SOCIAL } from "@/enums/customer.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty()
  personalEmail: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phone: string;

  @IsOptional()
  @IsEnum(CUSTOMER_SOCIAL)
  @ApiProperty({ required: false })
  social: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  socialLink: string;
}
