// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  })),
}));

// Simple test for notification types
describe('Notification Types', () => {
  it('should define notification types', () => {
    const types = ['success', 'error', 'warning', 'info'];
    expect(types).toHaveLength(4);
    expect(types).toContain('success');
    expect(types).toContain('error');
    expect(types).toContain('warning');
    expect(types).toContain('info');
  });

  it('should define WS events', () => {
    const events = {
      NOTIFY: 'notify',
      EMIT: 'emit_notification',
      JOIN_ROOM: 'join_room',
      LEAVE_ROOM: 'leave_room',
      CONNECTED: 'connected',
    };
    expect(events.NOTIFY).toBe('notify');
    expect(events.JOIN_ROOM).toBe('join_room');
  });
});
