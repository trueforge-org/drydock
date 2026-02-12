import { defineComponent } from 'vue';
import { getBackups, rollback } from '@/services/backup';

interface BackupSummary {
  id: string;
  imageTag: string;
  timestamp: string;
  triggerName: string;
}

interface RollbackData {
  loading: boolean;
  rolling: boolean;
  error: string;
  backups: BackupSummary[];
  selectedBackupId: string;
}

type RollbackEmit = {
  (event: 'update:modelValue', value: boolean): void;
  (event: 'rollback-success'): void;
  (event: 'rollback-error', message: string): void;
};

type RollbackComponentThis = RollbackData & {
  containerId: string;
  modelValue: boolean;
  isOpen: boolean;
  $emit: RollbackEmit;
  $filters: {
    dateTime: (dateStr: string) => string;
  };
  handleDialogOpened: () => void;
  handleDialogClosed: () => void;
  fetchBackups: () => Promise<void>;
  close: () => void;
};

export default defineComponent({
  props: {
    containerId: {
      type: String,
      required: true,
    },
    containerName: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:modelValue', 'rollback-success', 'rollback-error'],
  data(): RollbackData {
    return {
      loading: false,
      rolling: false,
      error: '',
      backups: [],
      selectedBackupId: '',
    };
  },
  computed: {
    isOpen: {
      get(this: RollbackComponentThis): boolean {
        return this.modelValue;
      },
      set(this: RollbackComponentThis, value: boolean): void {
        this.$emit('update:modelValue', value);
        return;
      },
    },
  },
  watch: {
    modelValue(this: RollbackComponentThis): void {
      if (this.modelValue) {
        this.handleDialogOpened();
        return;
      }
      this.handleDialogClosed();
      return;
    },
  },
  methods: {
    handleDialogOpened(this: RollbackComponentThis): void {
      void this.fetchBackups();
      return;
    },
    handleDialogClosed(this: RollbackComponentThis): void {
      this.backups = [];
      this.error = '';
      this.selectedBackupId = '';
      return;
    },
    async fetchBackups(this: RollbackComponentThis): Promise<void> {
      this.loading = true;
      this.error = '';
      this.backups = [];
      this.selectedBackupId = '';
      try {
        const backups = await getBackups(this.containerId);
        this.backups = backups as BackupSummary[];
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Failed to load backups';
      } finally {
        this.loading = false;
      }
      return;
    },
    selectBackup(this: RollbackComponentThis, id: string): void {
      this.selectedBackupId = id;
      return;
    },
    async confirmRollback(this: RollbackComponentThis): Promise<void> {
      if (this.selectedBackupId === '') {
        return;
      }
      this.rolling = true;
      try {
        await rollback(this.containerId, this.selectedBackupId);
        this.$emit('rollback-success');
        this.close();
      } catch (e: unknown) {
        this.error = e instanceof Error ? e.message : 'Rollback failed';
        this.$emit('rollback-error', this.error);
      } finally {
        this.rolling = false;
      }
      return;
    },
    close(this: RollbackComponentThis): void {
      this.isOpen = false;
      return;
    },
    formatDate(this: RollbackComponentThis, dateStr: string): string {
      return this.$filters.dateTime(dateStr);
    },
  },
});
