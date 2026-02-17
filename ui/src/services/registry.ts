/**
 * Get registry component icon.
 * @returns {string}
 */
function getRegistryIcon() {
  return 'fas fa-database';
}

/**
 * Get registry provider icon (acr, ecr...).
 * @param provider
 * @returns {string}
 */
const REGISTRY_PROVIDER_ICONS = {
  acr: 'fab fa-microsoft',
  alicr: 'fas fa-cloud',
  artifactory: 'fas fa-frog',
  custom: 'fas fa-cubes',
  ecr: 'fab fa-aws',
  forgejo: 'fas fa-code-branch',
  gar: 'fab fa-google',
  gcr: 'fab fa-google',
  ghcr: 'fab fa-github',
  gitea: 'fas fa-code-branch',
  gitlab: 'fab fa-gitlab',
  harbor: 'fas fa-anchor',
  hub: 'fab fa-docker',
  ibmcr: 'fas fa-cloud',
  nexus: 'fas fa-box',
  ocir: 'fas fa-cloud',
  quay: 'fab fa-redhat',
  lscr: 'fab fa-linux',
  codeberg: 'fas fa-mountain',
  dhi: 'fab fa-docker',
  docr: 'fab fa-digital-ocean',
};

function getRegistryProviderIcon(provider) {
  const providerName = `${provider || ''}`.split('.')[0];
  return REGISTRY_PROVIDER_ICONS[providerName] || 'fas fa-cube';
}

/**
 * Get registry provider brand color.
 * @param provider
 * @returns {string}
 */
const REGISTRY_PROVIDER_COLORS = {
  acr: '#0078D4',
  alicr: '#FF6A00',
  artifactory: '#41BF47',
  ecr: '#FF9900',
  forgejo: '#FB923C',
  gar: '#4285F4',
  gcr: '#4285F4',
  ghcr: '#8B5CF6',
  gitea: '#609926',
  gitlab: '#FC6D26',
  harbor: '#60B932',
  hub: '#2496ED',
  ibmcr: '#0F62FE',
  nexus: '#1B1C30',
  ocir: '#F80000',
  quay: '#EE0000',
  lscr: '#DA3B8A',
  codeberg: '#2185D0',
  dhi: '#2496ED',
  docr: '#0080FF',
  custom: '#6B7280',
  trueforge: '#6B7280',
};

function getRegistryProviderColor(provider) {
  return REGISTRY_PROVIDER_COLORS[provider.split('.')[0]] || '#6B7280';
}

/**
 * get all registries.
 * @returns {Promise<any>}
 */
async function getAllRegistries() {
  const response = await fetch('/api/registries', { credentials: 'include' });
  return response.json();
}

export { getRegistryIcon, getRegistryProviderIcon, getRegistryProviderColor, getAllRegistries };
