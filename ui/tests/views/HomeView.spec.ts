import { mount } from '@vue/test-utils';
import HomeView from '@/views/HomeView';

// Mock services
vi.mock('@/services/container', () => ({
  getContainerIcon: vi.fn(() => 'fab fa-docker'),
  getAllContainers: vi.fn(() =>
    Promise.resolve([
      { id: 1, updateAvailable: true },
      { id: 2, updateAvailable: false },
    ]),
  ),
}));
vi.mock('@/services/registry', () => ({
  getRegistryIcon: vi.fn(() => 'fas fa-database'),
  getAllRegistries: vi.fn(() => Promise.resolve([{}, {}, {}])),
}));
vi.mock('@/services/trigger', () => ({
  getTriggerIcon: vi.fn(() => 'fas fa-bell'),
  getAllTriggers: vi.fn(() => Promise.resolve([{}])),
}));
vi.mock('@/services/watcher', () => ({
  getWatcherIcon: vi.fn(() => 'fas fa-arrows-rotate'),
  getAllWatchers: vi.fn(() => Promise.resolve([{}, {}])),
}));
vi.mock('@/services/audit', () => ({
  getAuditLog: vi.fn(() =>
    Promise.resolve({
      entries: [
        {
          id: '1',
          timestamp: '2025-01-15T10:30:00Z',
          action: 'update-applied',
          containerName: 'nginx',
          status: 'success',
        },
      ],
      total: 1,
    }),
  ),
}));
vi.mock('@/services/image-icon', () => ({
  getEffectiveDisplayIcon: vi.fn((icon) => icon || 'fab fa-docker'),
}));

describe('HomeView', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(HomeView);

    // Simulate data loaded from beforeRouteEnter
    await wrapper.setData({
      containers: [
        {
          id: 1,
          updateAvailable: true,
          displayName: 'nginx',
          displayIcon: 'fab fa-docker',
          image: { name: 'nginx', tag: { value: '1.24' } },
          updateKind: { kind: 'tag', semverDiff: 'minor', remoteValue: '1.25' },
        },
        {
          id: 2,
          updateAvailable: false,
          displayName: 'redis',
          displayIcon: 'fab fa-docker',
          image: { name: 'redis', tag: { value: '7.0' } },
        },
      ],
      containersCount: 2,
      triggersCount: 1,
      watchersCount: 2,
      registriesCount: 3,
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('renders all status cards', () => {
    const cards = wrapper.findAll('.stat-card');
    expect(cards).toHaveLength(4);
  });

  it('displays correct counts', () => {
    const text = wrapper.text();
    expect(text).toContain('2');
    expect(text).toContain('Containers');
    expect(text).toContain('1');
    expect(text).toContain('Triggers');
    expect(text).toContain('Watchers');
    expect(text).toContain('3');
    expect(text).toContain('Registries');
  });

  it('displays update warning when updates are available', () => {
    expect(wrapper.text()).toContain('1 update');
    expect(wrapper.vm.containersWithUpdates).toHaveLength(1);
  });

  it('displays success message when no updates are available', async () => {
    await wrapper.setData({
      containers: [
        {
          id: 1,
          updateAvailable: false,
          displayName: 'nginx',
          displayIcon: 'fab fa-docker',
          image: { name: 'nginx', tag: { value: '1.24' } },
        },
        {
          id: 2,
          updateAvailable: false,
          displayName: 'redis',
          displayIcon: 'fab fa-docker',
          image: { name: 'redis', tag: { value: '7.0' } },
        },
      ],
    });
    expect(wrapper.text()).toContain('up to date');
  });

  it('shows recent activity when entries exist', async () => {
    await wrapper.setData({
      recentActivity: [
        {
          id: '1',
          timestamp: '2025-01-15T10:30:00Z',
          action: 'update-applied',
          containerName: 'nginx',
          status: 'success',
        },
      ],
    });
    expect(wrapper.text()).toContain('nginx');
    expect(wrapper.text()).toContain('update-applied');
  });

  it('shows empty state when no recent activity', async () => {
    await wrapper.setData({ recentActivity: [] });
    expect(wrapper.text()).toContain('No activity recorded yet');
  });

  it('returns correct action icons', () => {
    expect(wrapper.vm.actionIcon('update-applied')).toBe('fas fa-circle-check');
    expect(wrapper.vm.actionIcon('update-failed')).toBe('fas fa-circle-xmark');
    expect(wrapper.vm.actionIcon('unknown')).toBe('fas fa-circle-question');
  });

  it('returns correct action colors', () => {
    expect(wrapper.vm.actionColor('update-applied')).toBe('success');
    expect(wrapper.vm.actionColor('update-failed')).toBe('error');
    expect(wrapper.vm.actionColor('unknown')).toBe('default');
  });

  it('formats time correctly', () => {
    expect(wrapper.vm.formatTime('2025-01-15T10:30:00Z')).toBeTruthy();
    expect(wrapper.vm.formatTime('')).toBe('');
  });

  it('navigates to correct routes', () => {
    const cards = wrapper.findAll('.stat-card');
    const paths = cards.map((w) => w.attributes('to') || w.props('to')).filter(Boolean);

    expect(paths).toContain('/containers');
    expect(paths).toContain('/configuration/triggers');
    expect(paths).toContain('/configuration/watchers');
    expect(paths).toContain('/configuration/registries');
  });
});

// Separate test block for the route hook logic if needed
describe('HomeView Route Hook', () => {
  it('fetches data on beforeRouteEnter', async () => {
    const next = vi.fn();
    const from = {};
    const to = {};

    await HomeView.beforeRouteEnter.call(HomeView, to, from, next);

    // Check if next was called with a callback
    expect(next).toHaveBeenCalledWith(expect.any(Function));

    // Simulate the callback execution
    const vm = {
      containers: [],
      containersCount: 0,
      triggersCount: 0,
      watchersCount: 0,
      registriesCount: 0,
      recentActivity: [],
    };
    const callback = next.mock.calls[0][0];
    callback(vm);

    expect(vm.containersCount).toBe(2);
    expect(vm.registriesCount).toBe(3);
    expect(vm.recentActivity).toHaveLength(1);
  });
});
