import { defineComponent } from 'vue';

const COMPOSE_PROJECT_CONFIG_FILES_LABEL = 'com.docker.compose.project.config_files';
const COMPOSE_PROJECT_WORKING_DIR_LABEL = 'com.docker.compose.project.working_dir';
const DD_COMPOSE_FILE_LABEL = 'dd.compose.file';
const WUD_COMPOSE_FILE_LABEL = 'wud.compose.file';

function isAbsolutePath(path: string) {
  return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path);
}

function getPathSeparator(workingDir: string) {
  // Prefer Windows-style separator for obvious Windows paths (drive letter or UNC),
  // or when only backslashes are present. Fall back to POSIX-style otherwise.
  if (/^[A-Za-z]:[\\/]/.test(workingDir) || workingDir.startsWith('\\\\')) {
    return '\\';
  }
  const hasBackslash = workingDir.includes('\\');
  const hasSlash = workingDir.includes('/');
  if (hasBackslash && !hasSlash) {
    return '\\';
  }
  return '/';
}

function joinComposePath(workingDir: string, configFile: string) {
  const hasTrailingSeparator = /[\\/]\s*$/.test(workingDir);
  if (hasTrailingSeparator) {
    return `${workingDir}${configFile}`;
  }

  const separator = getPathSeparator(workingDir);
  return `${workingDir}${separator}${configFile}`;
}

function getComposeNativeFilePathFromLabels(labels: Record<string, string> = {}) {
  const composeConfigFiles = labels[COMPOSE_PROJECT_CONFIG_FILES_LABEL];
  if (!composeConfigFiles || composeConfigFiles.trim() === '') {
    return null;
  }

  const composeProjectWorkingDir = labels[COMPOSE_PROJECT_WORKING_DIR_LABEL];
  const configFiles = composeConfigFiles
    .split(',')
    .map((configFile) => configFile.trim())
    .filter((configFile) => configFile !== '');

  const configFile = configFiles[0];
  if (!configFile) {
    return null;
  }

  if (isAbsolutePath(configFile)) {
    return configFile;
  }

  const trimmedWorkingDir = composeProjectWorkingDir?.trim();
  if (trimmedWorkingDir) {
    return joinComposePath(trimmedWorkingDir, configFile);
  }

  return configFile;
}

function getComposeFilePathFromLabels(labels: Record<string, string> = {}) {
  const overridePath = labels[DD_COMPOSE_FILE_LABEL] ?? labels[WUD_COMPOSE_FILE_LABEL];
  if (overridePath) {
    return overridePath;
  }

  return getComposeNativeFilePathFromLabels(labels);
}

export default defineComponent({
  props: {
    container: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },

  computed: {
    hookPre(): string | null {
      return (
        this.container.labels?.['dd.hook.pre'] ?? this.container.labels?.['wud.hook.pre'] ?? null
      );
    },
    hookPost(): string | null {
      return (
        this.container.labels?.['dd.hook.post'] ?? this.container.labels?.['wud.hook.post'] ?? null
      );
    },
    hookPreAbort(): boolean {
      return (
        (this.container.labels?.['dd.hook.pre.abort'] ??
          this.container.labels?.['wud.hook.pre.abort'] ??
          'true') === 'true'
      );
    },
    hookTimeout(): number {
      return Number.parseInt(
        this.container.labels?.['dd.hook.timeout'] ??
          this.container.labels?.['wud.hook.timeout'] ??
          '60000',
        10,
      );
    },
    hasHooks(): boolean {
      return Boolean(this.hookPre || this.hookPost);
    },
    autoRollback(): boolean {
      return (
        (this.container.labels?.['dd.rollback.auto'] ??
          this.container.labels?.['wud.rollback.auto'] ??
          'false') === 'true'
      );
    },
    rollbackWindow(): number {
      return Number.parseInt(
        this.container.labels?.['dd.rollback.window'] ??
          this.container.labels?.['wud.rollback.window'] ??
          '300000',
        10,
      );
    },
    rollbackInterval(): number {
      return Number.parseInt(
        this.container.labels?.['dd.rollback.interval'] ??
          this.container.labels?.['wud.rollback.interval'] ??
          '10000',
        10,
      );
    },
    composeFilePath(): string | null {
      return getComposeFilePathFromLabels(this.container.labels || {});
    },
  },

  methods: {
    copyToClipboard(kind: string, value: string) {
      navigator.clipboard.writeText(value);
      this.$eventBus.emit('notify', `${kind} copied to clipboard`);
    },
  },
});
