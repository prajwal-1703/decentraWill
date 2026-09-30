import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VoteChoice } from '@prisma/client';

export class CreateProposalDto {
  @ApiProperty({ example: 'Approval for Estate Activation and Resource Release' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Official vote to approve activation after medical certification review' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  quorum?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsInt()
  threshold?: number;

  @ApiProperty({ example: 7, description: 'Voting window in days', required: false })
  @IsOptional()
  @IsInt()
  votingDays?: number;
}

export class CastVoteDto {
  @ApiProperty({ enum: VoteChoice, example: VoteChoice.FOR })
  @IsEnum(VoteChoice)
  choice!: VoteChoice;
}
