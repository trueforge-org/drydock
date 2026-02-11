import sseService from '@/services/sse';

describe('SseService', () => {
  let mockEventSource: any;
  let eventListeners: Record<string, Function>;
  let mockEventBus: any;
  let MockEventSourceCtor: any;

  beforeEach(() => {
    vi.useFakeTimers();
    eventListeners = {};
    mockEventSource = {
      addEventListener: vi.fn((event: string, handler: Function) => {
        eventListeners[event] = handler;
      }),
      close: vi.fn(),
      onerror: null as Function | null,
    };
    MockEventSourceCtor = vi.fn(function () {
      return mockEventSource;
    });
    vi.stubGlobal('EventSource', MockEventSourceCtor);
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    };
  });

  afterEach(() => {
    sseService.disconnect();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('creates EventSource on connect', () => {
    sseService.connect(mockEventBus);
    expect(MockEventSourceCtor).toHaveBeenCalledWith('/api/events/ui');
  });

  it('registers event listeners for dd:connected, dd:self-update, and dd:heartbeat', () => {
    sseService.connect(mockEventBus);
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
      'dd:connected',
      expect.any(Function),
    );
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
      'dd:self-update',
      expect.any(Function),
    );
    expect(mockEventSource.addEventListener).toHaveBeenCalledWith(
      'dd:heartbeat',
      expect.any(Function),
    );
  });

  it('emits sse:connected on dd:connected event', () => {
    sseService.connect(mockEventBus);
    eventListeners['dd:connected']();
    expect(mockEventBus.emit).toHaveBeenCalledWith('sse:connected');
  });

  it('emits self-update on dd:self-update event', () => {
    sseService.connect(mockEventBus);
    eventListeners['dd:self-update']();
    expect(mockEventBus.emit).toHaveBeenCalledWith('self-update');
  });

  it('emits connection-lost on error when in self-update mode', () => {
    sseService.connect(mockEventBus);
    eventListeners['dd:self-update']();
    mockEventBus.emit.mockClear();

    mockEventSource.onerror();
    expect(mockEventBus.emit).toHaveBeenCalledWith('connection-lost');
  });

  it('auto-reconnects on error in normal mode', () => {
    sseService.connect(mockEventBus);
    MockEventSourceCtor.mockClear();

    mockEventSource.onerror();
    expect(mockEventBus.emit).not.toHaveBeenCalledWith('connection-lost');

    vi.advanceTimersByTime(5000);
    expect(MockEventSourceCtor).toHaveBeenCalledWith('/api/events/ui');
  });

  it('closes EventSource on disconnect', () => {
    sseService.connect(mockEventBus);
    sseService.disconnect();
    expect(mockEventSource.close).toHaveBeenCalled();
  });

  it('does not reconnect after disconnect', () => {
    sseService.connect(mockEventBus);
    mockEventSource.onerror();
    sseService.disconnect();
    MockEventSourceCtor.mockClear();

    vi.advanceTimersByTime(10000);
    expect(MockEventSourceCtor).not.toHaveBeenCalled();
  });

  it('closes previous EventSource on multiple connect calls', () => {
    sseService.connect(mockEventBus);
    const firstSource = mockEventSource;

    const secondSource = {
      addEventListener: vi.fn(),
      close: vi.fn(),
      onerror: null as Function | null,
    };
    MockEventSourceCtor.mockImplementation(function () {
      return secondSource;
    });

    sseService.connect(mockEventBus);
    expect(firstSource.close).toHaveBeenCalled();
  });

  it('resets self-update mode on disconnect', () => {
    sseService.connect(mockEventBus);
    eventListeners['dd:self-update']();
    sseService.disconnect();

    sseService.connect(mockEventBus);
    mockEventBus.emit.mockClear();
    MockEventSourceCtor.mockClear();

    mockEventSource.onerror();
    expect(mockEventBus.emit).not.toHaveBeenCalledWith('connection-lost');
    vi.advanceTimersByTime(5000);
    expect(MockEventSourceCtor).toHaveBeenCalled();
  });
});
