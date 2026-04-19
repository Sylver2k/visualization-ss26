<template>
  <v-row class="ga-0" density="comfortable">
    <v-col cols="12" md="7">
      <v-slide-y-transition appear>
        <v-card class="glass-card h-100" rounded="xlarge">
          <v-card-text class="pa-6 pa-md-7 d-flex flex-column ga-5">
            <div>
              <div class="section-kicker mb-3">Participant Setup</div>
              <h2 class="text-h4 font-weight-bold mb-3">
                Prepare the next experiment session
              </h2>
              <p class="text-body-1 text-medium-emphasis">
                Enter a participant identifier and any optional context before
                starting the randomized trial sequence.
              </p>
            </div>

            <v-text-field
              v-model="participantId"
              color="primary"
              density="comfortable"
              label="Participant ID or name"
              placeholder="e.g. p01"
              prepend-inner-icon="mdi-account-circle-outline"
              rounded="xl"
              variant="outlined"
            />

            <v-textarea
              v-model="participantNotes"
              auto-grow
              color="primary"
              label="Optional notes"
              placeholder="Optional context for this session"
              rows="3"
              rounded="xl"
              variant="outlined"
            />

            <div
              class="d-flex flex-wrap align-center justify-space-between ga-4"
            >
              <div class="text-body-2 text-medium-emphasis">
                A participant id is required before the experiment can begin.
              </div>

              <v-btn
                color="primary"
                prepend-icon="mdi-arrow-right"
                rounded="pill"
                size="x-large"
                :disabled="!canBeginSession"
                @click="beginSession"
              >
                Begin Session
              </v-btn>
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
              <div class="section-kicker mb-3">Instructions</div>
              <h3 class="text-h5 font-weight-bold">
                How to run a clean session
              </h3>
            </div>

            <div class="d-flex flex-column ga-3">
              <v-sheet
                v-for="(step, index) in steps"
                :key="step"
                class="metric-card pa-4"
                rounded="xl"
              >
                <div class="d-flex align-start ga-3">
                  <v-avatar color="primary" size="30" variant="tonal">
                    {{ index + 1 }}
                  </v-avatar>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ step }}
                  </div>
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
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "beginn-session"]);

const participantId = ref(props.modelValue.id ?? "");
const participantNotes = ref(props.modelValue.notes ?? "");

const canBeginSession = computed(() => participantId.value.trim().length > 0);

watch(
  () => props.modelValue,
  (newValue) => {
    participantId.value = newValue.id ?? "";
    participantNotes.value = newValue.notes ?? "";
  },
  { deep: true },
);

watch([participantId, participantNotes], emitParticipantUpdate, {
  immediate: true,
});

function emitParticipantUpdate() {
  emit("update:modelValue", {
    ...props.modelValue,
    id: participantId.value,
    notes: participantNotes.value,
  });
}

function beginSession() {
  emit("update:modelValue", {
    ...props.modelValue,
    id: participantId.value.trim(),
    notes: participantNotes.value.trim(),
  });
  emit("beginn-session");
}

const steps = [
  "Read the target ratio shown above the shapes before adjusting anything.",
  "Drag the handle on the adjustable shape until the perceived size feels right.",
  "Confirm each trial to record the result and advance through the randomized sequence.",
];
</script>

<style scoped></style>
