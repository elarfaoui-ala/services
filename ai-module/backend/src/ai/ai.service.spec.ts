import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  const mockConfig = {
    get: jest.fn((key: string, defaultVal?: any) => {
      const config: Record<string, string> = {
        ANTHROPIC_API_KEY: 'test-key',
        AI_MODEL: 'claude-sonnet-4-6',
        FRONTEND_URL: '*',
      };
      return config[key] ?? defaultVal;
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService, { provide: ConfigService, useValue: mockConfig }],
    }).compile();
    service = module.get<AiService>(AiService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('summarize', () => {
    it('should summarize text successfully', async () => {
      const result = await service.summarize({
        text: 'This is a test document with enough words to summarize properly.',
      });
      expect(result.summary).toBe('Test response');
      expect(result.wordCount).toBe(11);
      expect(result.readTime).toBe(1);
      expect(result.tokens).toBe(50);
    });

    it('should throw BadRequestException for empty text', async () => {
      await expect(service.summarize({ text: '' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for whitespace-only text', async () => {
      await expect(service.summarize({ text: '   ' })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for text exceeding 50,000 chars', async () => {
      await expect(service.summarize({ text: 'a'.repeat(50_001) })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('complete', () => {
    it('should return completion text', async () => {
      const result = await service.complete('What is 2+2?');
      expect(result).toBe('Test response');
    });

    it('should accept optional system prompt', async () => {
      const result = await service.complete('Say hello', 'You are a pirate');
      expect(result).toBe('Test response');
    });
  });
});
