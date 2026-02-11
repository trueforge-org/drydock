import { mount } from '@vue/test-utils';
import HomeView from '@/views/HomeView';

// Mock services
vi.mock('@/services/container', () => ({
  getContainerIcon: vi.fn(() => 'fab fa-docker'),
  getAllContainers: vi.fn(() => Promise.resolve([
    { id: 1, updateAvailable: true },
    { id: 2, updateAvailable: false }
  ]))
}));
vi.mock('@/services/registry', () => ({
  getRegistryIcon: vi.fn(() => 'fas fa-database'),
  getAllRegistries: vi.fn(() => Promise.resolve([{}, {}, {}]))
}));
vi.mock('@/services/trigger', () => ({
  getTriggerIcon: vi.fn(() => 'fas fa-bell'),
  getAllTriggers: vi.fn(() => Promise.resolve([{}]))
}));
vi.mock('@/services/watcher', () => ({
  getWatcherIcon: vi.fn(() => 'fas fa-arrows-rotate'),
  getAllWatchers: vi.fn(() => Promise.resolve([{}, {}]))
}));
vi.mock('@/services/audit', () => ({
  getAuditLog: vi.fn(() => Promise.resolve({
    entries: [
      { id: '1', timestamp: '2025-01-15T10:30:00Z', action: 'update-applied', containerName: 'nginx', status: 'success' },
    ],
    total: 1,
  })),
}));

describe('HomeView', () => {
  let wrapper;

  beforeEach(async () => {
    wrapper = mount(HomeView, {
      global: {
        stubs: {
          'v-btn': {
            template: '<button class="v-btn-stub" :data-to="to"><slot /></button>',
            props: ['to']
          },
          'v-chip': {
            template: '<span class="v-chip-stub" :data-to="to"><slot /></span>',
            props: ['to', 'color', 'size', 'variant']
          }
        }
      }
    });
    
    // Simulate data loaded from beforeRouteEnter
    await wrapper.setData({
      containersCount: 2,
      containersToUpdateCount: 1,
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
    const cards = wrapper.findAll('.home-card');
    expect(cards).toHaveLength(4);
  });

  it('displays correct counts', () => {
    expect(wrapper.text()).toContain('2 containers');
    expect(wrapper.text()).toContain('1 triggers');
    expect(wrapper.text()).toContain('2 watchers');
    expect(wrapper.text()).toContain('3 registries');
  });

  it('displays update warning when updates are available', () => {
    expect(wrapper.text()).toContain('1 update');
  });

  it('displays success message when no updates are available', async () => {
    await wrapper.setData({
      containersToUpdateCount: 0
    });
    expect(wrapper.text()).toContain('up to date');
  });
  
  it('shows recent activity when entries exist', async () => {
    await wrapper.setData({
      recentActivity: [
        { id: '1', timestamp: '2025-01-15T10:30:00Z', action: 'update-applied', containerName: 'nginx', status: 'success' },
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
      const links = wrapper.findAll('.v-btn-stub, .v-chip-stub');

      const paths = links.map(w => w.attributes('data-to')).filter(Boolean);
      
      expect(paths).toContain('/containers');
      expect(paths).toContain('/containers?update-available=true');
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
            containersCount: 0,
            triggersCount: 0,
            watchersCount: 0,
            registriesCount: 0,
            containersToUpdateCount: 0,
            recentActivity: []
        };
        const callback = next.mock.calls[0][0];
        callback(vm);

        expect(vm.containersCount).toBe(2);
        expect(vm.registriesCount).toBe(3);
        expect(vm.recentActivity).toHaveLength(1);
    });
});