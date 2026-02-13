import { defineComponent, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';

var UINT32_MAX_PLUS_ONE = 2 ** 32;

function getSecureRandomFloat(): number {
  if (!globalThis.crypto?.getRandomValues) {
    return 0.5;
  }

  var values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0] / UINT32_MAX_PLUS_ONE;
}

export default defineComponent({
  name: 'SelfUpdateOverlay',
  setup() {
    var eventBus = inject('eventBus') as any;
    var { smAndDown } = useDisplay();
    var active = ref(false);
    var phase = ref<'updating' | 'disconnected' | 'ready'>('updating');
    var statusText = ref('Updating drydock...');

    // DVD bounce state
    var x = ref(100);
    var y = ref(100);
    var dx = ref(2);
    var dy = ref(1.5);
    var hue = ref(0);
    var logoSize = 120;
    var animationFrame = 0;
    var healthPollTimer: ReturnType<typeof setInterval> | null = null;
    var hueTimer: ReturnType<typeof setInterval> | null = null;

    function animate() {
      if (!active.value) return;

      var maxX = globalThis.innerWidth - logoSize;
      var maxY = globalThis.innerHeight - logoSize;

      x.value += dx.value;
      y.value += dy.value;

      if (x.value <= 0 || x.value >= maxX) {
        dx.value = -dx.value;
        hue.value = (hue.value + 47) % 360;
        x.value = Math.max(0, Math.min(x.value, maxX));
      }
      if (y.value <= 0 || y.value >= maxY) {
        dy.value = -dy.value;
        hue.value = (hue.value + 47) % 360;
        y.value = Math.max(0, Math.min(y.value, maxY));
      }

      animationFrame = requestAnimationFrame(animate);
    }

    function startBounce() {
      x.value = getSecureRandomFloat() * (globalThis.innerWidth - logoSize);
      y.value = getSecureRandomFloat() * (globalThis.innerHeight - logoSize);
      var speed = 1.5 + getSecureRandomFloat();
      var angle = getSecureRandomFloat() * Math.PI * 2;
      dx.value = Math.cos(angle) * speed;
      dy.value = Math.sin(angle) * speed;
      hue.value = Math.floor(getSecureRandomFloat() * 360);
      animationFrame = requestAnimationFrame(animate);
    }

    function stopBounce() {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }

    function startMobileHue() {
      hueTimer = setInterval(() => {
        hue.value = (hue.value + 5) % 360;
      }, 200);
    }

    function stopMobileHue() {
      if (hueTimer) {
        clearInterval(hueTimer);
        hueTimer = null;
      }
    }

    function startHealthPolling() {
      if (healthPollTimer) return;
      healthPollTimer = setInterval(async () => {
        try {
          const res = await fetch('/api/app/health', { cache: 'no-store' });
          if (res.ok) {
            phase.value = 'ready';
            statusText.value = 'Ready!';
            if (healthPollTimer) {
              clearInterval(healthPollTimer);
              healthPollTimer = null;
            }
            setTimeout(() => globalThis.location.reload(), 1500);
          }
        } catch {
          // Still down, keep polling
        }
      }, 3000);
    }

    function onSelfUpdate() {
      active.value = true;
      phase.value = 'updating';
      statusText.value = 'Updating drydock...';
      if (smAndDown.value) {
        startMobileHue();
      } else {
        startBounce();
      }
    }

    function onConnectionLost() {
      if (!active.value) return;
      phase.value = 'disconnected';
      statusText.value = "Restarting... we'll be right back";
      startHealthPolling();
    }

    onMounted(() => {
      eventBus?.on('self-update', onSelfUpdate);
      eventBus?.on('connection-lost', onConnectionLost);
    });

    onUnmounted(() => {
      stopBounce();
      stopMobileHue();
      if (healthPollTimer) {
        clearInterval(healthPollTimer);
        healthPollTimer = null;
      }
      eventBus?.off('self-update', onSelfUpdate);
      eventBus?.off('connection-lost', onConnectionLost);
    });

    watch(active, (val) => {
      if (!val) {
        stopBounce();
        stopMobileHue();
      }
    });

    return { active, phase, statusText, x, y, hue, logoSize, smAndDown };
  },
});
