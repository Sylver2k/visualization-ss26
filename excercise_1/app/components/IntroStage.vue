<template>
  <v-row class="ga-0" density="comfortable">
    <v-col cols="12" md="7">
      <v-slide-y-transition appear>
        <v-card class="glass-card h-100" rounded="xlarge">
          <v-card-text class="pa-6 pa-md-7 d-flex flex-column ga-6">
            <div>
              <div class="section-kicker mb-3">Methodology</div>
              <h2 class="text-h4 font-weight-bold mb-4">
                How the experiment measures perceived size
              </h2>
              <p class="text-body-1 text-medium-emphasis mb-4">
                Each trial asks the participant to resize an adjustable shape
                until it appears to match a target ratio relative to a fixed
                reference shape.
              </p>
              <p class="text-body-1 text-medium-emphasis">
                The session then compares the requested perceived ratio with the
                actual geometric area ratio and derives the perception exponent
                <strong>x</strong>.
              </p>
            </div>

            <v-sheet class="metric-card pa-5" rounded="xl">
              <div class="text-subtitle-1 font-weight-bold mb-2">
                Interpretation
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">
                <code>x = log(perceived ratio) / log(actual area ratio)</code>.
                <br />
                <br />
                Values below <code>1</code> indicate that perceived size grows
                more slowly than actual area.
              </p>
            </v-sheet>

            <div class="d-flex flex-wrap align-center ga-3">
              <v-btn
                color="primary"
                prepend-icon="mdi-play"
                rounded="pill"
                size="x-large"
                @click="emit('start-experiment')"
              >
                Start Experiment
              </v-btn>

              <v-chip
                prepend-icon="mdi-timer-sand"
                color="grey-lighten-2"
                variant="outlined"
              >
                Single randomized session
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-slide-y-transition>
    </v-col>

    <v-col cols="12" md="5">
      <v-slide-y-transition appear>
        <v-card class="glass-card h-100" rounded="xlarge">
          <v-card-text class="pa-6 pa-md-7 d-flex flex-column ga-5">
            <div>
              <div class="section-kicker mb-3">Study Design</div>
              <h3 class="text-h5 font-weight-bold">
                What this session includes
              </h3>
            </div>

            <div class="d-flex flex-wrap ga-3">
              <v-chip
                v-for="ratio in TARGET_RATIOS"
                :key="ratio"
                color="primary"
                variant="tonal"
              >
                Ratio {{ ratio }}
              </v-chip>
            </div>

            <div class="d-flex flex-column ga-3">
              <v-sheet
                v-for="item in studyItems"
                :key="item.title"
                class="metric-card pa-4"
                rounded="xl"
              >
                <div class="text-subtitle-2 font-weight-bold mb-1">
                  {{ item.title }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ item.copy }}
                </div>
              </v-sheet>
            </div>
          </v-card-text>
        </v-card>
      </v-slide-y-transition>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
const { TARGET_RATIOS } = useDefaults();

const emit = defineEmits(["start-experiment"]);
const studyItems = [
  {
    title: "Documented participant information",
    copy: "Each session records a participant id and optional notes for later analysis.",
  },
  {
    title: "Direct manipulation trials",
    copy: "The adjustable shape uses a drag handle so matching remains visual and continuous.",
  },
  {
    title: "Per-trial averaging",
    copy: "Recorded trials are aggregated to estimate circle, square, and overall mean x values.",
  },
];
</script>

<style scoped></style>
