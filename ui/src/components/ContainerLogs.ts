import {
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  type PropType,
  ref,
  watch,
} from 'vue';
import { getContainerLogs } from '../services/container';

type ContainerLogTarget = {
  id: string;
};

type ContainerLogsResponse = {
  logs?: unknown;
};

const AUTO_FETCH_INTERVALS = [
  { title: 'Off', value: 0 },
  { title: '2s', value: 2 },
  { title: '5s', value: 5 },
  { title: '10s', value: 10 },
  { title: '30s', value: 30 },
];

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function isNearBottom(element: HTMLElement): boolean {
  const thresholdPx = 16;
  return element.scrollHeight - element.scrollTop - element.clientHeight <= thresholdPx;
}

export default defineComponent({
  props: {
    container: {
      type: Object as PropType<ContainerLogTarget>,
      required: true,
    },
  },
  setup: function setup(props) {
    const logs = ref('');
    const loading = ref(false);
    const error = ref('');
    const tail = ref(100);
    const autoFetchSeconds = ref(5);
    const scrollBlocked = ref(false);
    const logPre = ref<HTMLElement | null>(null);
    let autoFetchTimer: ReturnType<typeof setInterval> | undefined;

    const scrollToBottom = function scrollToBottom(): void {
      const element = logPre.value;
      if (!element) {
        return;
      }
      element.scrollTop = element.scrollHeight;
      scrollBlocked.value = false;
    };

    const handleLogScroll = function handleLogScroll(): void {
      const element = logPre.value;
      if (!element) {
        return;
      }
      scrollBlocked.value = !isNearBottom(element);
    };

    const resumeAutoScroll = function resumeAutoScroll(): void {
      scrollBlocked.value = false;
      scrollToBottom();
    };

    const fetchLogs = async function fetchLogs(): Promise<void> {
      loading.value = true;
      error.value = '';
      try {
        const result = (await getContainerLogs(
          props.container.id,
          tail.value,
        )) as ContainerLogsResponse;
        logs.value = typeof result.logs === 'string' ? result.logs : '';
        await nextTick();
        if (!scrollBlocked.value) {
          scrollToBottom();
        }
      } catch (e: unknown) {
        error.value = toErrorMessage(e);
      } finally {
        loading.value = false;
      }
    };

    const stopAutoFetch = function stopAutoFetch(): void {
      if (autoFetchTimer) {
        clearInterval(autoFetchTimer);
        autoFetchTimer = undefined;
      }
    };

    const startAutoFetch = function startAutoFetch(): void {
      stopAutoFetch();
      if (autoFetchSeconds.value <= 0) {
        return;
      }
      autoFetchTimer = globalThis.setInterval(() => {
        if (!loading.value) {
          void fetchLogs();
        }
      }, autoFetchSeconds.value * 1000);
    };

    onMounted(function loadLogsOnMount() {
      void fetchLogs();
      startAutoFetch();
    });

    onBeforeUnmount(function stopLogsAutoFetchOnUnmount() {
      stopAutoFetch();
    });

    watch(tail, function reloadLogsOnTailChange() {
      void fetchLogs();
    });

    watch(autoFetchSeconds, function restartAutoFetchOnIntervalChange() {
      startAutoFetch();
    });

    watch(
      () => props.container.id,
      function reloadLogsOnContainerChange() {
        scrollBlocked.value = false;
        void fetchLogs();
      },
    );

    return {
      logs,
      loading,
      error,
      tail,
      autoFetchSeconds,
      autoFetchItems: AUTO_FETCH_INTERVALS,
      scrollBlocked,
      logPre,
      fetchLogs,
      handleLogScroll,
      resumeAutoScroll,
    };
  },
});
