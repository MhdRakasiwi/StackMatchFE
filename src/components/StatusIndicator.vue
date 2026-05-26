<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  apiAlive: boolean | null
  checkHealth: () => Promise<boolean>
}>()

let pollInterval: any = null

onMounted(async () => {
  // Initial check
  await props.checkHealth()
  // Setup interval to poll health every 30 seconds
  pollInterval = setInterval(async () => {
    await props.checkHealth()
  }, 30000)
})

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>

<template>
  <div 
    class="status-indicator" 
    role="status" 
    aria-live="polite"
    aria-label="API status indicator"
  >
    <span class="status-label">API Status:</span>
    <span 
      v-if="props.apiAlive === null" 
      class="status-badge status-checking"
    >
      <span class="dot pulse-checking"></span>
      CHECKING
    </span>
    <span 
      v-else-if="props.apiAlive === true" 
      class="status-badge status-online"
    >
      <span class="dot pulse-online"></span>
      ONLINE
    </span>
    <span 
      v-else 
      class="status-badge status-offline"
    >
      <span class="dot pulse-offline"></span>
      OFFLINE
    </span>
  </div>
</template>

<style scoped>
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  user-select: none;
}

.status-label {
  color: var(--text-secondary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
}

.status-checking {
  color: var(--text-secondary);
}

.status-online {
  color: var(--score-high);
}

.status-offline {
  color: var(--score-low);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.pulse-checking {
  background-color: var(--text-secondary);
  animation: dotPulse 1.5s infinite ease-in-out;
}

.pulse-online {
  background-color: var(--score-high);
  animation: dotPulseOnline 2s infinite ease-in-out;
}

.pulse-offline {
  background-color: var(--score-low);
  animation: dotPulseOffline 1.5s infinite ease-in-out;
}

@keyframes dotPulse {
  0%, 100% {
    transform: scale(0.85);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes dotPulseOnline {
  0% {
    box-shadow: 0 0 0 0 rgba(63, 185, 80, 0.7);
    transform: scale(0.9);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(63, 185, 80, 0);
    transform: scale(1.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(63, 185, 80, 0);
    transform: scale(0.9);
  }
}

@keyframes dotPulseOffline {
  0% {
    box-shadow: 0 0 0 0 rgba(248, 81, 73, 0.7);
    transform: scale(0.9);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(248, 81, 73, 0);
    transform: scale(1.1);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(248, 81, 73, 0);
    transform: scale(0.9);
  }
}
</style>
