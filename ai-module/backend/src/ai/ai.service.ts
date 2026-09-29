import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService }                   from '@nestjs/config';
import Anthropic                            from '@anthropic-ai/sdk';
import { Response }                         from 'express';
import {
  ChatRequest, SummarizeRequest,
  SummarizeResponse, StreamChunk, SummarizeMode, AIUsage,
} from './ai.types';
import { ChatRequestDto, SummarizeRequestDto } from './ai.dto';

const DEFAULT_MAX_TOKENS = 1024;

const SUMMARIZE_PROMPTS: Record<SummarizeMode, string> = {
  brief:    'Summarize the following text in 2-3 sentences. Be concise and capture the key point.',
  detailed: 'Provide a comprehensive summary of the following text. Cover all main points and key details.',
  bullets:  'Summarize the following text as a bullet-point list. Each bullet should be one clear insight.',
  eli5:     'Explain the following text as if explaining to a 10-year-old. Use simple language and analogies.',
};

function getTextContent(content: Anthropic.Messages.ContentBlock[]): string {
  const block = content.find((b): b is { type: 'text'; text: string } => b.type === 'text');
  return block?.text ?? '';
}

@Injectable()
export class AiService {
  private client: Anthropic;
  private model: string;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY', ''),
    });
    this.model = this.config.get<string>('AI_MODEL', 'claude-sonnet-4-6');
  }

  // ── Streaming Chat ────────────────────────────────────────────────────────

  async streamChat(req: ChatRequestDto, res: Response): Promise<void> {
    if (!req.messages?.length) {
      throw new BadRequestException('Messages array is required');
    }

    res.setHeader('Content-Type',                'text/event-stream');
    res.setHeader('Cache-Control',               'no-cache');
    res.setHeader('Connection',                  'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', this.config.get('FRONTEND_URL', 'http://localhost:3000'));
    res.flushHeaders();

    const sendChunk = (chunk: StreamChunk) => {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    };

    const abortController = new AbortController();

    res.on('close', () => {
      abortController.abort();
    });

    try {
      const stream = this.client.messages.stream({
        model:      req.model      ?? this.model,
        max_tokens: req.maxTokens  ?? DEFAULT_MAX_TOKENS,
        system:     req.systemPrompt ?? 'You are a helpful, concise assistant.',
        messages:   req.messages,
        signal:     abortController.signal,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          sendChunk({ type: 'delta', content: event.delta.text });
        }
      }

      const finalMessage = await stream.finalMessage();
      const usage: AIUsage = {
        inputTokens:  finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
        totalTokens:  finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
      };

      sendChunk({
        type:   'done',
        tokens: usage.outputTokens,
        usage,
      });

    } catch (err: any) {
      if (abortController.signal.aborted) return;
      sendChunk({ type: 'error', error: err.message ?? 'AI request failed' });
    } finally {
      res.end();
    }
  }

  // ── Summarize (non-streaming) ─────────────────────────────────────────────

  async summarize(req: SummarizeRequestDto): Promise<SummarizeResponse> {
    if (!req.text?.trim()) {
      throw new BadRequestException('Text is required');
    }
    if (req.text.length > 50_000) {
      throw new BadRequestException('Text too long — max 50,000 characters');
    }

    const mode   = req.mode ?? 'brief';
    const prompt = SUMMARIZE_PROMPTS[mode];

    const response = await this.client.messages.create({
      model:      this.model,
      max_tokens: mode === 'detailed' ? 800 : 400,
      messages: [{
        role:    'user',
        content: `${prompt}\n\n---\n\n${req.text}`,
      }],
    });

    const summary   = getTextContent(response.content);
    const wordCount = req.text.trim().split(/\s+/).length;
    const readTime  = Math.max(1, Math.round(wordCount / 200));

    return {
      summary,
      wordCount,
      readTime,
      tokens: response.usage.output_tokens,
    };
  }

  // ── Quick one-shot (no streaming, useful for short tasks) ─────────────────

  async complete(prompt: string, system?: string): Promise<string> {
    const response = await this.client.messages.create({
      model:      this.model,
      max_tokens: DEFAULT_MAX_TOKENS,
      system:     system ?? 'You are a helpful assistant.',
      messages:   [{ role: 'user', content: prompt }],
    });
    return getTextContent(response.content);
  }
}
