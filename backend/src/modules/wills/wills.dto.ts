import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWillDto {
  @ApiProperty({ example: 'estate-uuid-here' })
  @IsString()
  @IsNotEmpty()
  estateId!: string;

  @ApiProperty({ example: 'Last Will and Testament of John Doe' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'TESTATOR_LED', enum: ['TESTATOR_LED', 'ADVOCATE_LED', 'COLLABORATIVE'], required: false })
  @IsOptional()
  @IsString()
  mode?: string;
}

export class CreateClauseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  clauseNo!: number;

  @ApiProperty({ example: 'Appointment of Executor' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'I appoint Jane Doe as the primary executor of this estate.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: any;
}

export class CreateWillVersionDto {
  @ApiProperty({ type: [CreateClauseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateClauseDto)
  clauses?: CreateClauseDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentId?: string;
}

export class FinalizeVersionDto {
  @ApiProperty({ example: 'I confirm and finalize this will under oath and policy guidelines.' })
  @IsString()
  @IsNotEmpty()
  confirmationStatement!: string;
}
