import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ChatMessageDto {
  @IsIn(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  @MinLength(1)
  content!: string;
}

export class ChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages!: ChatMessageDto[];
}
