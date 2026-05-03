<template>
  <v-btn
    class="countdown-ready-button mt-1"
    :class="{ 'is-counting-down': isCountingDown }"
    :aria-disabled="isCountingDown"
    color="primary"
    prepend-icon="mdi-play"
    size="large"
    @click="startCountdown"
  >
    <v-fade-transition leave-absolute>
      <span :key="isCountingDown" class="button-content">
        {{ isCountingDown ? "Starting..." : "Ready" }}
      </span>
    </v-fade-transition>
    <span
      v-if="isCountingDown"
      class="countdown-overlay"
      :style="{ animationDuration: `${durationMs}ms` }"
    />
  </v-btn>
</template>

<script setup lang="ts">
const props = defineProps({
  durationMs: {
    type: Number,
    default: 3000,
  },
});

const emit = defineEmits(["complete"]);

const isCountingDown = ref(false);
let countdownTimer: ReturnType<typeof setTimeout> | null = null;

onBeforeUnmount(() => {
  clearCountdown();
});

function startCountdown() {
  if (isCountingDown.value) {
    return;
  }

  isCountingDown.value = true;
  countdownTimer = setTimeout(() => {
    isCountingDown.value = false;
    countdownTimer = null;
    emit("complete");
  }, props.durationMs);
}

function clearCountdown() {
  if (countdownTimer) {
    clearTimeout(countdownTimer);
    countdownTimer = null;
  }
}
</script>

<style scoped>
.countdown-ready-button {
  overflow: hidden;
  position: relative;
}

.countdown-ready-button.is-counting-down {
  cursor: default;
}

.button-content {
  position: relative;
  z-index: 2;
}

.countdown-ready-button :deep(.v-btn__prepend) {
  position: relative;
  z-index: 2;
}

.countdown-overlay {
  animation-name: fillCountdown;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  background: rgba(var(--v-theme-on-primary), 0.24);
  bottom: 0;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 0%;
  z-index: 1;
}

@keyframes fillCountdown {
  from {
    width: 0%;
  }

  to {
    width: 100%;
  }
}
</style>
