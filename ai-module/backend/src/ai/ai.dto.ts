import { IsString, IsOptional, IsArray, IsNumber, Min, Max, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsString()
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export class ChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(128000)
  maxTokens?: number;

  @IsOptional()
  @IsString()
  model?: string;
}

export class SummarizeRequestDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsIn(['brief', 'detailed', 'bullets', 'eli5'])
  mode?: 'brief' | 'detailed' | 'bullets' | 'eli5';

  @IsOptional()
  @IsString()
  language?: string;
}

export class CompleteRequestDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  system?: string;
}
