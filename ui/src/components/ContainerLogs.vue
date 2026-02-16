<template>
  <div>
    <div class="d-flex align-center pa-2" style="gap: 8px">
      <v-select
        v-model="tail"
        :items="[50, 100, 500]"
        label="Lines"
        density="compact"
        hide-details
        style="max-width: 120px"
      />
      <v-select
        v-model="autoFetchSeconds"
        :items="autoFetchItems"
        item-title="title"
        item-value="value"
        label="Auto fetch"
        density="compact"
        hide-details
        style="max-width: 140px"
      />
      <v-btn
        icon
        size="small"
        variant="text"
        :loading="loading"
        @click="fetchLogs"
      >
        <v-icon>fas fa-arrows-rotate</v-icon>
      </v-btn>
      <v-chip
        v-if="scrollBlocked"
        size="small"
        color="warning"
        variant="tonal"
      >
        Scroll locked
      </v-chip>
      <v-btn
        v-if="scrollBlocked"
        size="small"
        variant="text"
        @click="resumeAutoScroll"
      >
        Resume
      </v-btn>
    </div>

    <div v-if="loading && !logs" class="d-flex justify-center pa-4">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="error" type="error" class="ma-2">
      {{ error }}
    </v-alert>

    <pre
      v-else-if="logs"
      ref="logPre"
      class="pa-3 ma-2"
      @scroll="handleLogScroll"
      style="
        background-color: #1e1e1e;
        color: #d4d4d4;
        max-height: 400px;
        overflow-y: auto;
        font-size: 0.85rem;
        border-radius: 4px;
      "
    >{{ logs }}</pre>

    <div v-else class="text-center pa-4 text-medium-emphasis">
      No logs available
    </div>
  </div>
</template>

<script lang="ts" src="./ContainerLogs.ts"></script>
