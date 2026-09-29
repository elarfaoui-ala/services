import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';

describe('AiController', () => {
  let controller: AiController;

  const mockAiService = {
    summarize: jest.fn().mockResolvedValue({
      summary: 'Test summary',
      wordCount: 10,
      readTime: 1,
      tokens: 50,
    }),
    complete: jest.fn().mockResolvedValue('Test completion'),
    streamChat: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        { provide: AiService, useValue: mockAiService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();
    controller = module.get<AiController>(AiController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('summarize', () => {
    it('should call aiService.summarize', async () => {
      const result = await controller.summarize({
        text: 'Hello world',
      });
      expect(mockAiService.summarize).toHaveBeenCalledWith({ text: 'Hello world' });
      expect(result.summary).toBe('Test summary');
    });
  });

  describe('complete', () => {
    it('should call aiService.complete with prompt', async () => {
      const result = await controller.complete({
        prompt: 'Say hello',
      });
      expect(mockAiService.complete).toHaveBeenCalledWith('Say hello', undefined);
      expect(result).toBe('Test completion');
    });

    it('should pass optional system prompt', async () => {
      await controller.complete({
        prompt: 'Say hello',
        system: 'You are a pirate',
      });
      expect(mockAiService.complete).toHaveBeenCalledWith('Say hello', 'You are a pirate');
    });
  });
});
