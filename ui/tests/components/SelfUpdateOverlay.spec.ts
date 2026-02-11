import { mount } from '@vue/test-utils';
import SelfUpdateOverlay from '@/components/SelfUpdateOverlay';

// Mock window.location.reload
const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
  writable: true,
});

describe('SelfUpdateOverlay', () => {
  let wrapper: any;
  let mockEventBus: any;
  let eventHandlers: Record<string, Function>;
  let rafMock: ReturnType<typeof vi.fn>;
  let cafMock: ReturnType<typeof vi.fn>;
  let rafId: number;

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
    reloadMock.mockClear();
    rafId = 0;
    rafMock = vi.fn((_cb: FrameRequestCallback) => ++rafId);
    cafMock = vi.fn();
    window.requestAnimationFrame = rafMock as any;
    window.cancelAnimationFrame = cafMock as any;

    eventHandlers = {};
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler;
      }),
      off: vi.fn(),
    };

    wrapper = mount(SelfUpdateOverlay, {
      global: {
        provide: {
          eventBus: mockEventBus,
        },
        stubs: {
          'v-overlay': {
            template:
              '<div class="v-overlay" :class="{ active: modelValue }"><slot v-if="modelValue" /></div>',
            props: ['modelValue', 'persistent', 'scrim', 'opacity', 'zIndex'],
          },
          'v-progress-linear': {
            template: '<div class="v-progress-linear" />',
            props: ['indeterminate', 'color'],
          },
          'v-icon': {
            template: '<i class="v-icon"><slot /></i>',
            props: ['color', 'size'],
          },
        },
      },
    });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
    vi.useRealTimers();
  });

  it('is not visible by default', () => {
    expect(wrapper.vm.active).toBe(false);
    expect(wrapper.find('.v-overlay').classes()).not.toContain('active');
  });

  it('registers self-update and connection-lost listeners on mount', () => {
    expect(mockEventBus.on).toHaveBeenCalledWith('self-update', expect.any(Function));
    expect(mockEventBus.on).toHaveBeenCalledWith('connection-lost', expect.any(Function));
  });

  it('becomes visible when self-update event fires', async () => {
    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.active).toBe(true);
    expect(wrapper.find('.v-overlay').classes()).toContain('active');
  });

  it('shows "Updating drydock..." text initially', async () => {
    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.statusText).toBe('Updating drydock...');
    expect(wrapper.text()).toContain('Updating drydock...');
  });

  it('shows "Restarting..." text after connection-lost', async () => {
    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();
    eventHandlers['connection-lost']();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.statusText).toBe("Restarting... we'll be right back");
    expect(wrapper.vm.phase).toBe('disconnected');
  });

  it('does not react to connection-lost when not active', async () => {
    eventHandlers['connection-lost']();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.active).toBe(false);
    expect(wrapper.vm.phase).toBe('updating');
  });

  it('shows progress bar during updating phase', async () => {
    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.v-progress-linear').exists()).toBe(true);
  });

  it('shows progress bar during disconnected phase', async () => {
    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();
    eventHandlers['connection-lost']();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.v-progress-linear').exists()).toBe(true);
  });

  it('transitions to ready phase when health check succeeds', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true } as Response);

    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();
    eventHandlers['connection-lost']();
    await wrapper.vm.$nextTick();

    await vi.advanceTimersByTimeAsync(3000);

    expect(wrapper.vm.phase).toBe('ready');
    expect(wrapper.vm.statusText).toBe('Ready!');
  });

  it('hides progress bar and shows check icon when ready', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true } as Response);

    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();
    eventHandlers['connection-lost']();
    await wrapper.vm.$nextTick();

    await vi.advanceTimersByTimeAsync(3000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.v-progress-linear').exists()).toBe(false);
    expect(wrapper.find('.v-icon').exists()).toBe(true);
  });

  it('reloads page after ready phase', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true } as Response);

    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();
    eventHandlers['connection-lost']();
    await wrapper.vm.$nextTick();

    await vi.advanceTimersByTimeAsync(3000);
    await vi.advanceTimersByTimeAsync(1500);

    expect(reloadMock).toHaveBeenCalled();
  });

  it('keeps polling when health check fails', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();
    eventHandlers['connection-lost']();
    await wrapper.vm.$nextTick();

    await vi.advanceTimersByTimeAsync(3000);
    expect(wrapper.vm.phase).toBe('disconnected');

    (global.fetch as any).mockResolvedValue({ ok: true } as Response);
    await vi.advanceTimersByTimeAsync(3000);
    expect(wrapper.vm.phase).toBe('ready');
  });

  it('starts bounce animation on self-update', async () => {
    eventHandlers['self-update']();
    await wrapper.vm.$nextTick();

    expect(rafMock).toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    eventHandlers['self-update']();
    wrapper.unmount();

    expect(cafMock).toHaveBeenCalled();
    expect(mockEventBus.off).toHaveBeenCalledWith('self-update', expect.any(Function));
    expect(mockEventBus.off).toHaveBeenCalledWith('connection-lost', expect.any(Function));
  });
});
