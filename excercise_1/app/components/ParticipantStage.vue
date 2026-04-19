<template>
  <div class="d-flex align-center ga-4">
    <v-card>
      <v-card-text>
        <div>Participant Setup</div>

        <div>Enter your first name or username:</div>

        <v-text-field
          v-model="participant.id"
          label="Participant ID or name"
          variant="outlined"
          placeholder="e.g. p01"
        />

        <v-textarea
          v-model="participant.notes"
          label="Optional notes"
          variant="outlined"
          rows="3"
          auto-grow
          placeholder="Optional context for this session"
        />

        <v-btn
          size="large"
          :disabled="!participant.id"
          @click="emit('beginn-session')"
        >
          <v-icon start>mdi-content-save</v-icon>

          Beginn Session
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-text>
        <p>Instructions</p>
        <ol class="plain-list plain-list--ordered">
          <li>Read the target ratio shown above the shapes.</li>
          <li>Drag the handle on the adjustable shape until it feels right.</li>
          <li>Confirm the trial to record the result and advance.</li>
        </ol>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "beginn-session"]);

const participant = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:modelValue", newValue);
  },
});
</script>

<style scoped></style>
