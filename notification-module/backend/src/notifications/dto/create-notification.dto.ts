import { IsIn, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateNotificationDto {
  @IsIn(['success', 'error', 'warning', 'info'])
  type!: 'success' | 'error' | 'warning' | 'info';

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  roomId?: string;
}
