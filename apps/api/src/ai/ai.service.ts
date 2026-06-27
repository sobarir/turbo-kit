import { Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import type { Env } from 'src/config/env.validation';
import { ChatMessageDto } from './dto/chat.dto';

// Provider-agnostic AI client. Talks to any OpenAI-compatible gateway
// (OpenRouter by default). Swap models by changing AI_MODEL in env —
// no code change. To swap providers, change AI_BASE_URL.
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  
  // Pattern for services that log: inject PinoLogger with the class context.
  constructor(
    private readonly config: ConfigService<Env, true>,
  ) {}

  async chat(messages: ChatMessageDto[]): Promise<string> {
    const apiKey = this.config.get('AI_API_KEY', { infer: true });
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI is not configured. Set AI_API_KEY.',
      );
    }

    const baseUrl = this.config.get('AI_BASE_URL', { infer: true });
    const model = this.config.get('AI_MODEL', { infer: true });

    try {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages }),
      });

      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`AI gateway error ${res.status}: ${text}`);
        throw new ServiceUnavailableException('AI request failed');
      }

      const data = (await res.json()) as {
        choices: { message: { content: string } }[];
      };
      return data.choices[0]?.message?.content ?? '';
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      // Log the full error (Pino serializes the stack); client gets a safe 503.
      this.logger.error({ err }, 'AI request failed');
      throw new ServiceUnavailableException('AI request failed');
    }
  }
}
