import {
  getAllRegistries,
  getRegistryIcon,
  getRegistryProviderColor,
  getRegistryProviderIcon,
} from '@/services/registry';

// Mock fetch globally
global.fetch = vi.fn();

describe('Registry Service', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear();
  });

  describe('getRegistryIcon', () => {
    it('returns the registry icon', () => {
      expect(getRegistryIcon()).toBe('fas fa-database');
    });
  });

  describe('getRegistryProviderIcon', () => {
    it('returns correct icons for different providers', () => {
      expect(getRegistryProviderIcon('acr.example.com')).toBe('fab fa-microsoft');
      expect(getRegistryProviderIcon('custom.registry.com')).toBe('fas fa-cubes');
      expect(getRegistryProviderIcon('ecr.amazonaws.com')).toBe('fab fa-aws');
      expect(getRegistryProviderIcon('forgejo.example.com')).toBe('fas fa-code-branch');
      expect(getRegistryProviderIcon('gcr.io')).toBe('fab fa-google');
      expect(getRegistryProviderIcon('ghcr.io')).toBe('fab fa-github');
      expect(getRegistryProviderIcon('gitea.example.com')).toBe('fas fa-code-branch');
      expect(getRegistryProviderIcon('gitlab.com')).toBe('fab fa-gitlab');
      expect(getRegistryProviderIcon('hub.docker.com')).toBe('fab fa-docker');
      expect(getRegistryProviderIcon('quay.io')).toBe('fab fa-redhat');
      expect(getRegistryProviderIcon('lscr.io')).toBe('fab fa-linux');
      expect(getRegistryProviderIcon('codeberg.org')).toBe('fas fa-mountain');
      expect(getRegistryProviderIcon('dhi.example.com')).toBe('fab fa-docker');
      expect(getRegistryProviderIcon('docr.digitalocean.com')).toBe('fab fa-digital-ocean');
      expect(getRegistryProviderIcon('alicr.aliyuncs.com')).toBe('fas fa-cloud');
      expect(getRegistryProviderIcon('artifactory.acme.com')).toBe('fas fa-frog');
      expect(getRegistryProviderIcon('gar.pkg.dev')).toBe('fab fa-google');
      expect(getRegistryProviderIcon('harbor.acme.com')).toBe('fas fa-anchor');
      expect(getRegistryProviderIcon('ibmcr.icr.io')).toBe('fas fa-cloud');
      expect(getRegistryProviderIcon('nexus.acme.com')).toBe('fas fa-box');
      expect(getRegistryProviderIcon('ocir.io')).toBe('fas fa-cloud');
      expect(getRegistryProviderIcon('trueforge.example')).toBe('fas fa-cube');
    });

    it('returns default icon for unknown providers', () => {
      expect(getRegistryProviderIcon('unknown.registry')).toBe('fas fa-cube');
    });

    it('returns default icon when provider is missing', () => {
      expect(getRegistryProviderIcon(undefined)).toBe('fas fa-cube');
    });

    it('handles provider names with dots correctly', () => {
      expect(getRegistryProviderIcon('hub.docker.com')).toBe('fab fa-docker');
      expect(getRegistryProviderIcon('gcr.io')).toBe('fab fa-google');
    });
  });

  describe('getRegistryProviderColor', () => {
    it.each([
      ['acr.example.com', '#0078D4'],
      ['ecr.amazonaws.com', '#FF9900'],
      ['forgejo.example.com', '#FB923C'],
      ['gcr.io', '#4285F4'],
      ['ghcr.io', '#8B5CF6'],
      ['gitea.example.com', '#609926'],
      ['gitlab.com', '#FC6D26'],
      ['hub.docker.com', '#2496ED'],
      ['quay.io', '#EE0000'],
      ['lscr.io', '#DA3B8A'],
      ['codeberg.org', '#2185D0'],
      ['dhi.example.com', '#2496ED'],
      ['docr.digitalocean.com', '#0080FF'],
      ['alicr.aliyuncs.com', '#FF6A00'],
      ['artifactory.acme.com', '#41BF47'],
      ['gar.pkg.dev', '#4285F4'],
      ['harbor.acme.com', '#60B932'],
      ['ibmcr.icr.io', '#0F62FE'],
      ['nexus.acme.com', '#1B1C30'],
      ['ocir.io', '#F80000'],
      ['custom.registry.com', '#6B7280'],
      ['trueforge.example', '#6B7280'],
      ['unknown.registry', '#6B7280'],
    ])('returns %s color', (provider, color) => {
      expect(getRegistryProviderColor(provider)).toBe(color);
    });
  });

  describe('getAllRegistries', () => {
    it('fetches all registries successfully', async () => {
      const mockRegistries = [
        { name: 'hub', type: 'docker' },
        { name: 'ghcr', type: 'github' },
      ];
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegistries,
      } as any);

      const registries = await getAllRegistries();

      expect(fetch).toHaveBeenCalledWith('/api/registries', {
        credentials: 'include',
      });
      expect(registries).toEqual(mockRegistries);
    });
  });
});
