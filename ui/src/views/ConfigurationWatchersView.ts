import { defineComponent } from 'vue';
import ConfigurationItem from '@/components/ConfigurationItem.vue';
import { getAllWatchers } from '@/services/watcher';

export default defineComponent({
  data() {
    return {
      watchers: [] as any[],
    };
  },
  components: {
    ConfigurationItem,
  },
  async beforeRouteEnter(to, from, next) {
    try {
      const watchers = await getAllWatchers();
      next((vm: any) => {
        vm.watchers = watchers;
      });
    } catch (e: any) {
      next((vm: any) => {
        vm.$eventBus.emit(
          'notify',
          `Error when trying to load the watchers (${e.message})`,
          'error',
        );
      });
    }
  },
});
