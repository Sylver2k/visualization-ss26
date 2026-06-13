<template>
  <v-sheet
    class="dataset-picker pa-6 rounded-lg"
    :class="{ 'border-success': selectedFile }"
    border
  >
    <v-row align="center">
      <v-col cols="auto">
        <v-icon
          :color="selectedFile ? 'success' : 'primary'"
          :icon="
            selectedFile ? 'mdi-file-check-outline' : 'mdi-cloud-upload-outline'
          "
          size="42"
        />
      </v-col>

      <v-col cols="12" sm>
        <div class="text-subtitle-1 font-weight-bold">
          {{ selectedFile ? "Dataset selected" : "Upload a dataset" }}
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1 text-break">
          {{
            selectedFile
              ? selectedFile.name
              : "Choose or drop a tab-separated values file here."
          }}
        </div>
      </v-col>

      <v-col cols="12" md="5">
        <v-file-input
          v-model="selectedFile"
          accept=".tsv"
          clearable
          density="comfortable"
          hide-details="auto"
          label="Select Dataset"
          prepend-icon=""
          prepend-inner-icon="mdi-table"
          show-size
          variant="outlined"
          :error-messages="errorMessage"
          @update:model-value="validateFile"
        />
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script setup lang="ts">
const selectedFile = defineModel<File | null>({ default: null });
const errorMessage = ref("");

function validateFile(file: File | File[] | null) {
  const nextFile = Array.isArray(file) ? (file[0] ?? null) : file;

  if (nextFile && !nextFile.name.toLowerCase().endsWith(".tsv")) {
    errorMessage.value = "Please select a .tsv file.";
    selectedFile.value = null;
    return;
  }

  errorMessage.value = "";
  selectedFile.value = nextFile;
}

async function readText() {
  if (!selectedFile.value) {
    throw new Error("No TSV dataset has been selected.");
  }

  return selectedFile.value.text();
}
</script>

<style scoped>
.dataset-picker {
  border-style: dashed !important;
  border-width: 2px !important;
}
</style>
