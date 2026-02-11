import { getContainerIcon, getAllContainers } from "@/services/container";
import { getRegistryIcon, getAllRegistries } from "@/services/registry";
import { getTriggerIcon, getAllTriggers } from "@/services/trigger";
import { getWatcherIcon, getAllWatchers } from "@/services/watcher";
import { getAuditLog } from "@/services/audit";
import { defineComponent } from "vue";

export default defineComponent({
  data() {
    return {
      containersCount: 0,
      containersToUpdateCount: 0,
      triggersCount: 0,
      watchersCount: 0,
      registriesCount: 0,
      containerIcon: getContainerIcon(),
      registryIcon: getRegistryIcon(),
      triggerIcon: getTriggerIcon(),
      watcherIcon: getWatcherIcon(),
      recentActivity: [] as any[],
      activityLoading: false,
    };
  },

  computed: {
    containerUpdateMessage() {
      if (this.containersToUpdateCount > 0) {
        return `${this.containersToUpdateCount} update${this.containersToUpdateCount === 1 ? '' : 's'}`;
      }
      return "up to date";
    },
  },

  methods: {
    actionIcon(action: string): string {
      const map: Record<string, string> = {
        'update-available': 'fas fa-circle-info',
        'update-applied': 'fas fa-circle-check',
        'update-failed': 'fas fa-circle-xmark',
        'container-added': 'fas fa-circle-plus',
        'container-removed': 'fas fa-circle-minus',
        'rollback': 'fas fa-rotate-left',
        'preview': 'fas fa-eye',
      };
      return map[action] || 'fas fa-circle-question';
    },
    actionColor(action: string): string {
      const map: Record<string, string> = {
        'update-available': 'info',
        'update-applied': 'success',
        'update-failed': 'error',
        'container-added': 'primary',
        'container-removed': 'warning',
        'rollback': 'warning',
        'preview': 'secondary',
      };
      return map[action] || 'default';
    },
    formatTime(ts: string): string {
      if (!ts) return '';
      return new Date(ts).toLocaleString();
    },
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const containers = await getAllContainers();
      const watchers = await getAllWatchers();
      const registries = await getAllRegistries();
      const triggers = await getAllTriggers();

      let recentActivity: any[] = [];
      try {
        const auditResult = await getAuditLog({ limit: 5 });
        recentActivity = auditResult.entries || [];
      } catch {
        // Audit log may not be available yet
      }

      next((vm: any) => {
        vm.containersCount = containers.length;
        vm.triggersCount = triggers.length;
        vm.watchersCount = watchers.length;
        vm.registriesCount = registries.length;
        vm.containersToUpdateCount = containers.filter(
          (container: any) => container.updateAvailable,
        ).length;
        vm.recentActivity = recentActivity;
      });
    } catch (e) {
      next(() => {
        console.log(e);
      });
    }
  },
});
