import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    const reply = await this.ai.chat(dto.messages);
    return { reply };
  }
}
