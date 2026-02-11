<template>
  <v-container>
    <v-row>
      <v-col>
        <h2 class="text-h5 mb-4">Update History</h2>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-row class="mb-2">
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="filterAction"
          :items="actionOptions"
          label="Filter by action"
          clearable
          density="compact"
          variant="outlined"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          v-model="filterContainer"
          label="Filter by container"
          clearable
          density="compact"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <div class="mt-4 text-medium-emphasis">Loading history...</div>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="error">
      <v-col class="text-center py-8">
        <v-icon size="48" color="error">fas fa-triangle-exclamation</v-icon>
        <div class="mt-4 text-error">{{ error }}</div>
        <v-btn variant="outlined" class="mt-4" @click="fetchEntries">Retry</v-btn>
      </v-col>
    </v-row>

    <!-- Empty state -->
    <v-row v-else-if="entries.length === 0">
      <v-col>
        <v-card variant="outlined">
          <v-card-text class="text-center text-medium-emphasis pa-8">
            <v-icon size="48" color="grey">fas fa-clock-rotate-left</v-icon>
            <div class="mt-4">No update history yet</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table -->
    <v-row v-else>
      <v-col>
        <v-card variant="outlined">
          <div style="overflow-x: auto">
            <table class="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Container</th>
                  <th v-if="mdAndUp">From</th>
                  <th v-if="mdAndUp">To</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in entries" :key="entry.id">
                  <td class="text-no-wrap">{{ formatTimestamp(entry.timestamp) }}</td>
                  <td>
                    <v-chip :color="actionColor(entry.action)" size="small" label>
                      {{ entry.action }}
                    </v-chip>
                  </td>
                  <td>{{ entry.containerName }}</td>
                  <td v-if="mdAndUp">{{ entry.fromVersion || '-' }}</td>
                  <td v-if="mdAndUp">{{ entry.toVersion || '-' }}</td>
                  <td>
                    <v-chip :color="statusColor(entry.status)" size="small" label>
                      {{ entry.status }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="5"
          />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" src="./MonitoringHistoryView.ts"></script>

<style scoped>
.audit-table {
  width: 100%;
  border-collapse: collapse;
}

.audit-table th,
.audit-table td {
  padding: 10px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.audit-table th {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.audit-table tbody tr:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
</style>
