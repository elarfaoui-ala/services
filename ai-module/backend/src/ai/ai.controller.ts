import {
  Controller, Post, Body, Res, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AiService } from './ai.service';
import { ChatRequestDto, SummarizeRequestDto, CompleteRequestDto } from './ai.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat/stream')
  @ApiOperation({ summary: 'Stream chat with Claude (SSE)' })
  @ApiResponse({ status: 200, description: 'SSE stream of chat response chunks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async chatStream(
    @Body() req: ChatRequestDto,
    @Res() res: Response,
  ) {
    await this.ai.streamChat(req, res);
  }

  @Post('summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Summarize a document' })
  @ApiResponse({ status: 200, description: 'Summary with word count and token usage' })
  @ApiResponse({ status: 400, description: 'Text too long or missing' })
  summarize(@Body() req: SummarizeRequestDto) {
    return this.ai.summarize(req);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'One-shot completion (no streaming)' })
  @ApiResponse({ status: 200, description: 'Completion text' })
  complete(@Body() body: CompleteRequestDto) {
    return this.ai.complete(body.prompt, body.system);
  }
}
