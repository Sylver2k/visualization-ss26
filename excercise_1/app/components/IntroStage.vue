<template>
  <div class="d-flex align-center ga-4">
    <v-card>
      <v-card-text>
        <div>Methodology</div>

        <div>How the experiment measures perception</div>

        <div class="text-body-2">
          Every trial asks the participant to make the adjustable shape look a
          specific ratio larger or smaller than the reference shape. The
          experiment compares the requested perceived ratio with the actual area
          ratio produced by the participant.
        </div>

        <div class="text-body-2">
          For each valid trial, the app computes
          <code>x = log(perceived ratio) / log(actual area ratio)</code>. Values
          below <code>1</code> indicate that perceived size grows more slowly
          than actual area.
        </div>

        <div>
          <v-btn size="large" @click="emit('start-experiment')">
            <v-icon start>mdi-play</v-icon>

            Start Experiment
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-text>
        <p>Study Design</p>
        <ul class="plain-list">
          <li>Target ratios: {{ TARGET_RATIOS.join(", ") }}</li>
          <li>Documented participant information</li>
          <li>Drag-handle interaction</li>
          <li>Per-trial averaging for the final participant estimate</li>
        </ul>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const { TARGET_RATIOS } = useDefaults();

const emit = defineEmits(["start-experiment"]);
</script>

<style scoped></style>
