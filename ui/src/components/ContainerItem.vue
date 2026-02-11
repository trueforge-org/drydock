<template>
  <div>
    <div
      v-if="
        this.groupingLabel &&
        this.previousContainer?.labels?.[this.groupingLabel] !==
          this.container.labels?.[this.groupingLabel]
      "
    >
      <div class="text-h6">
        {{ this.groupingLabel }} =
        {{ this.container.labels?.[this.groupingLabel] ?? "(empty)" }}
      </div>
      <v-divider class="pb-3"></v-divider>
    </div>
    <v-card>
      <v-card-title
        @click="collapseDetail()"
        style="cursor: pointer"
        class="pa-3 d-flex align-center bg-surface"
      >
        <div
          class="text-body-3 d-flex align-center"
          style="gap: 5px"
        >
          <span v-if="smAndUp && container.agent">
            <v-chip label :color="agentStatusColor" variant="outlined" disabled>
              <v-icon left>fas fa-network-wired</v-icon>
              {{ container.agent }}
            </v-chip>
            /
          </span>
          <span v-if="smAndUp">
            <v-chip label color="info" variant="outlined" disabled>
              <v-icon left>fas fa-arrows-rotate</v-icon>
              {{ container.watcher }}
            </v-chip>
            /
          </span>
          <span v-if="mdAndUp">
            <v-chip label color="info" variant="outlined" disabled>
              <IconRenderer 
                v-if="smAndUp" 
                :icon="registryIcon"
                :size="24"
                :margin-right="8"
              />
              {{ container.image.registry.name }}
            </v-chip>
            /
          </span>
          <v-chip label color="info" variant="outlined" disabled>
            <IconRenderer 
              v-if="smAndUp" 
              :icon="container.displayIcon"
              :size="24"
              :margin-right="8"
            />
            <span style="overflow: hidden; text-overflow: ellipsis">
              {{ container.displayName }}
            </span>
          </v-chip>
          <span>
            :
            <v-chip label variant="outlined" color="info" disabled>
              {{ container.image.tag.value }}
            </v-chip>
          </span>
        </div>
        
        <v-spacer />
        
        <div class="d-flex align-center" style="gap: 8px">
          <span v-if="smAndUp && container.updateAvailable" class="d-flex align-center" style="gap: 4px">
            <v-icon>fas fa-arrow-right</v-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-chip
                  label
                  variant="outlined"
                  :color="newVersionClass"
                  v-bind="props"
                  @click="
                    copyToClipboard('container new version', newVersion);
                    $event.stopImmediatePropagation();
                  "
                >
                  {{ newVersion }}
                  <v-icon end size="small">far fa-clipboard</v-icon>
                </v-chip>
              </template>
              <span class="text-caption">Copy to clipboard</span>
            </v-tooltip>
          </span>
          <span v-if="smAndUp && updatePolicyChipLabel" class="d-flex align-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-chip
                  label
                  variant="outlined"
                  color="warning"
                  v-bind="props"
                >
                  <v-icon start size="small">fas fa-bell-slash</v-icon>
                  {{ updatePolicyChipLabel }}
                </v-chip>
              </template>
              <span class="text-caption">{{ updatePolicyDescription }}</span>
            </v-tooltip>
          </span>

          <span
            v-if="smAndUp && oldestFirst"
            class="text-caption"
          >
            {{ this.$filters.date(container.image.created) }}
          </span>

          <v-icon>{{
            showDetail ? "fas fa-chevron-up" : "fas fa-chevron-down"
          }}</v-icon>
        </div>
      </v-card-title>
      <transition name="expand-transition">
        <div v-show="showDetail">
          <v-tabs
            :stacked="smAndUp"
            fixed-tabs
            v-model="tab"
            ref="tabs"
          >
            <v-tab v-if="container.result">
              <span v-if="smAndUp">Update</span>
              <v-icon>fas fa-box-archive</v-icon>
            </v-tab>
            <v-tab>
              <span v-if="smAndUp">Triggers</span>
              <v-icon>fas fa-bell</v-icon>
            </v-tab>
            <v-tab>
              <span v-if="smAndUp">Image</span>
              <v-icon>fas fa-cube</v-icon>
            </v-tab>
            <v-tab>
              <span v-if="smAndUp">Container</span>
              <IconRenderer
                :icon="container.displayIcon"
                :size="24"
                :margin-right="8"
              />
            </v-tab>
            <v-tab>
              <span v-if="smAndUp">Logs</span>
              <v-icon>fas fa-file-lines</v-icon>
            </v-tab>
            <v-tab v-if="container.error">
              <span v-if="smAndUp">Error</span>
              <v-icon>fas fa-triangle-exclamation</v-icon>
            </v-tab>
          </v-tabs>

          <v-window v-model="tab">
            <v-window-item v-if="container.result">
              <container-update
                :result="container.result"
                :semver="container.image.tag.semver"
                :update-kind="container.updateKind"
                :update-available="container.updateAvailable"
              />
            </v-window-item>
            <v-window-item>
              <container-triggers :container="container" />
            </v-window-item>
            <v-window-item>
              <container-image :image="container.image" />
            </v-window-item>
            <v-window-item>
              <container-detail :container="container" />
            </v-window-item>
            <v-window-item>
              <container-logs :container="container" />
            </v-window-item>
            <v-window-item v-if="container.error">
              <container-error :error="container.error" />
            </v-window-item>
          </v-window>

          <v-card-actions>
            <!-- Desktop: icon-button toolbar -->
            <div v-if="smAndUp" class="d-flex justify-center align-center w-100" style="gap: 4px;">
              <!-- Preview -->
              <v-tooltip text="Preview update" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    v-bind="props"
                    :disabled="!container.updateAvailable"
                    @click="showPreview = true"
                  >
                    <v-icon>fas fa-eye</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <!-- Update now -->
              <v-tooltip text="Update now" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    color="secondary"
                    v-bind="props"
                    :loading="isUpdatingContainer"
                    :disabled="!container.updateAvailable"
                    @click="updateContainerNow"
                  >
                    <v-icon>fas fa-rocket</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <!-- Rollback (disabled placeholder) -->
              <v-tooltip text="Rollback" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn icon variant="text" size="small" v-bind="props" disabled>
                    <v-icon>fas fa-rotate-left</v-icon>
                  </v-btn>
                </template>
              </v-tooltip>

              <!-- Policy menu -->
              <v-menu location="top">
                <template v-slot:activator="{ props: menuProps }">
                  <v-tooltip text="Update policy" location="top">
                    <template v-slot:activator="{ props: tooltipProps }">
                      <v-btn icon variant="text" size="small" color="info" v-bind="{ ...menuProps, ...tooltipProps }">
                        <v-icon>fas fa-sliders</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </template>
                <v-list density="compact">
                  <v-list-item
                    :disabled="!container.updateKind || container.updateKind.kind === 'unknown'"
                    @click="skipCurrentUpdate"
                  >
                    <v-list-item-title>Skip current update</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="snoozeUpdates(1)">
                    <v-list-item-title>Snooze 1 day</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="snoozeUpdates(7)">
                    <v-list-item-title>Snooze 7 days</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="snoozeUpdates(30)">
                    <v-list-item-title>Snooze 30 days</v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item
                    :disabled="!container.updatePolicy || !container.updatePolicy.snoozeUntil"
                    @click="clearSnooze"
                  >
                    <v-list-item-title>Clear snooze</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="!hasAnyUpdatePolicy"
                    @click="clearUpdatePolicy"
                  >
                    <v-list-item-title>Clear all policy</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <!-- Delete -->
              <v-dialog
                v-model="dialogDelete"
                width="500"
                v-if="deleteEnabled"
              >
                <template v-slot:activator="{ props: dialogProps }">
                  <v-tooltip text="Delete" location="top">
                    <template v-slot:activator="{ props: tooltipProps }">
                      <v-btn icon variant="text" size="small" color="error" v-bind="{ ...dialogProps, ...tooltipProps }">
                        <v-icon>fas fa-trash</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </template>

                <v-card class="text-center">
                  <v-app-bar color="error" dark flat dense>
                    <v-toolbar-title class="text-body-1">
                      Delete the container?
                    </v-toolbar-title>
                  </v-app-bar>
                  <v-card-subtitle class="text-body-2">
                    <v-row class="mt-2" no-gutters>
                      <v-col>
                        Delete
                        <span class="font-weight-bold error--text">{{
                          container.name
                        }}</span>
                        from the list?
                        <br />
                        <span class="font-italic"
                          >(The real container won't be deleted)</span
                        >
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="text-center">
                        <v-btn variant="outlined" @click="dialogDelete = false" small>
                          Cancel
                        </v-btn>
                        &nbsp;
                        <v-btn
                          color="error"
                          small
                          @click="
                            dialogDelete = false;
                            deleteContainer();
                          "
                        >
                          Delete
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-subtitle>
                </v-card>
              </v-dialog>
            </div>

            <!-- Mobile: overflow menu -->
            <div v-else class="d-flex justify-center w-100">
              <v-menu location="top">
                <template v-slot:activator="{ props }">
                  <v-btn icon variant="text" v-bind="props">
                    <v-icon>fas fa-ellipsis-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    :disabled="!container.updateAvailable"
                    @click="showPreview = true"
                  >
                    <template v-slot:prepend><v-icon>fas fa-eye</v-icon></template>
                    <v-list-item-title>Preview</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="!container.updateAvailable"
                    :loading="isUpdatingContainer"
                    @click="updateContainerNow"
                  >
                    <template v-slot:prepend><v-icon>fas fa-rocket</v-icon></template>
                    <v-list-item-title>Update now</v-list-item-title>
                  </v-list-item>
                  <v-list-item disabled>
                    <template v-slot:prepend><v-icon>fas fa-rotate-left</v-icon></template>
                    <v-list-item-title>Rollback</v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item
                    :disabled="!container.updateKind || container.updateKind.kind === 'unknown'"
                    @click="skipCurrentUpdate"
                  >
                    <template v-slot:prepend><v-icon>fas fa-sliders</v-icon></template>
                    <v-list-item-title>Skip current update</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="snoozeUpdates(1)">
                    <template v-slot:prepend><v-icon>fas fa-clock</v-icon></template>
                    <v-list-item-title>Snooze 1 day</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="snoozeUpdates(7)">
                    <template v-slot:prepend><v-icon>fas fa-clock</v-icon></template>
                    <v-list-item-title>Snooze 7 days</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="snoozeUpdates(30)">
                    <template v-slot:prepend><v-icon>fas fa-clock</v-icon></template>
                    <v-list-item-title>Snooze 30 days</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="!container.updatePolicy || !container.updatePolicy.snoozeUntil"
                    @click="clearSnooze"
                  >
                    <template v-slot:prepend><v-icon>fas fa-bell</v-icon></template>
                    <v-list-item-title>Clear snooze</v-list-item-title>
                  </v-list-item>
                  <v-list-item
                    :disabled="!hasAnyUpdatePolicy"
                    @click="clearUpdatePolicy"
                  >
                    <template v-slot:prepend><v-icon>fas fa-eraser</v-icon></template>
                    <v-list-item-title>Clear all policy</v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item
                    v-if="deleteEnabled"
                    class="text-error"
                    @click="dialogDelete = true"
                  >
                    <template v-slot:prepend><v-icon color="error">fas fa-trash</v-icon></template>
                    <v-list-item-title>Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>

              <!-- Delete dialog for mobile (triggered by list item) -->
              <v-dialog
                v-model="dialogDelete"
                width="500"
                v-if="deleteEnabled"
              >
                <v-card class="text-center">
                  <v-app-bar color="error" dark flat dense>
                    <v-toolbar-title class="text-body-1">
                      Delete the container?
                    </v-toolbar-title>
                  </v-app-bar>
                  <v-card-subtitle class="text-body-2">
                    <v-row class="mt-2" no-gutters>
                      <v-col>
                        Delete
                        <span class="font-weight-bold error--text">{{
                          container.name
                        }}</span>
                        from the list?
                        <br />
                        <span class="font-italic"
                          >(The real container won't be deleted)</span
                        >
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="text-center">
                        <v-btn variant="outlined" @click="dialogDelete = false" small>
                          Cancel
                        </v-btn>
                        &nbsp;
                        <v-btn
                          color="error"
                          small
                          @click="
                            dialogDelete = false;
                            deleteContainer();
                          "
                        >
                          Delete
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-subtitle>
                </v-card>
              </v-dialog>
            </div>
          </v-card-actions>
        </div>
      </transition>
      <container-preview
        v-model="showPreview"
        :container-id="container.id"
        @update-confirmed="updateContainerNow"
      />
    </v-card>
  </div>
</template>

<script lang="ts" src="./ContainerItem.ts"></script>

<style scoped>
.v-chip--disabled {
  opacity: 1;
  pointer-events: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
