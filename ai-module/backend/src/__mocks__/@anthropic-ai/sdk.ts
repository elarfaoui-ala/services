const mockCreate = jest.fn().mockResolvedValue({
  content: [{ type: 'text', text: 'Test response' }],
  usage: { output_tokens: 50 },
});

const mockStream = jest.fn().mockReturnValue({
  [Symbol.asyncIterator]: async function* () {
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } };
  },
  finalMessage: jest.fn().mockResolvedValue({
    usage: { input_tokens: 10, output_tokens: 20 },
  }),
});

const Anthropic = jest.fn().mockImplementation(() => ({
  messages: {
    create: mockCreate,
    stream: mockStream,
  },
}));

export default Anthropic;
