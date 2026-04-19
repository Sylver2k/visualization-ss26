<template>
  <div class="d-flex flex-column ga-6">
    <v-slide-y-transition appear>
      <v-card class="glass-card overflow-hidden" rounded="xlarge">
        <v-card-text class="pa-6 pa-md-8">
          <v-row align="center" class="ga-0" justify="space-between">
            <v-col cols="12" md="8">
              <div class="section-kicker mb-3">Visualization SS26</div>
              <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">
                Perceived Area Experiment
              </h1>
              <p class="text-body-1 text-medium-emphasis mb-6 hero-copy">
                Experiment application for studying how people perceive relative
                size in circles and squares by matching target ratios through
                direct manipulation.
              </p>

              <div class="d-flex flex-wrap ga-3">
                <v-chip
                  color="primary"
                  prepend-icon="mdi-chart-bubble"
                  variant="tonal"
                >
                  Ratio-matching study
                </v-chip>
                <v-chip
                  color="secondary"
                  prepend-icon="mdi-motion-play"
                  variant="tonal"
                >
                  Interactive resizing
                </v-chip>
                <v-chip
                  prepend-icon="mdi-sigma"
                  color="grey-lighten-2"
                  variant="outlined"
                >
                  Computes exponent x
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <v-sheet class="metric-card pa-5" rounded="xl">
                <div class="section-kicker mb-3">Session Flow</div>
                <div class="d-flex flex-column ga-4">
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Active stage
                    </div>
                    <div class="text-h5 font-weight-bold">
                      {{ activeStageLabel }}
                    </div>
                  </div>

                  <v-divider />

                  <div class="d-flex flex-wrap ga-3">
                    <v-chip color="primary" variant="flat">
                      4 guided stages
                    </v-chip>
                    <v-chip color="success" variant="tonal">
                      JSON export/import
                    </v-chip>
                  </div>
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-slide-y-transition>

    <v-fade-transition appear>
      <v-card class="glass-card" rounded="xlarge">
        <v-card-text class="pa-5 pa-md-6">
          <stage-indicator v-model="stage" />
        </v-card-text>
      </v-card>
    </v-fade-transition>

    <v-fade-transition>
      <v-sheet class="canvas-shell pa-3 pa-md-4" rounded="xlarge">
        <stages-container v-model="stage" />
      </v-sheet>
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">
const stage = ref("INTRO");
const { STAGES } = useDefaults();

const activeStageLabel = computed(
  () => STAGES.find((entry) => entry.id === stage.value)?.label ?? stage.value,
);
</script>

<style scoped>
.hero-copy {
  max-width: 50rem;
}
</style>
