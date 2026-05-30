<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    transition="slide-y-transition"
    location="bottom end"
  >
    <template #activator="{ props: activatorProps }">
      <v-text-field
        v-bind="activatorProps"
        :append-inner-icon="menuOpen ? 'mdi-menu-up' : 'mdi-menu-down'"
        class="manufacturer-filter-activator"
        density="comfortable"
        hide-details
        model-value="Manufacturer"
        readonly
        variant="outlined"
      />
    </template>

    <v-card class="manufacturer-filter-menu" elevation="8">
      <div class="d-flex align-center justify-space-between pa-4">
        <span class="text-subtitle-1 font-weight-bold">Manufacturer</span>
        <span class="text-caption text-medium-emphasis">
          {{ modelValue.length }}/{{ options.length }}
        </span>
      </div>

      <v-divider />

      <v-card-actions>
        <v-btn size="small" variant="text" @click="selectAll">
          Select all
        </v-btn>
        <v-btn size="small" variant="text" @click="clearSelection">
          Clear
        </v-btn>
      </v-card-actions>

      <v-divider />

      <v-list class="manufacturer-filter-list" density="compact">
        <v-list-item
          v-for="manufacturer in options"
          :key="manufacturer"
          :title="manufacturer"
          @click="toggleManufacturer(manufacturer)"
        >
          <template #prepend>
            <v-checkbox-btn
              :model-value="modelValue.includes(manufacturer)"
              @click.stop="toggleManufacturer(manufacturer)"
            />
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[];
  options: string[];
}>();

const emit = defineEmits(["update:modelValue"]);

const menuOpen = ref(false);
const initialized = ref(false);

watch(
  () => props.options,
  (options) => {
    if (!initialized.value && options.length > 0) {
      emit("update:modelValue", [...options]);
      initialized.value = true;
    }
  },
  { immediate: true },
);

function toggleManufacturer(manufacturer: string) {
  const selected = new Set(props.modelValue);

  if (selected.has(manufacturer)) {
    selected.delete(manufacturer);
  } else {
    selected.add(manufacturer);
  }

  emit(
    "update:modelValue",
    props.options.filter((option) => selected.has(option)),
  );
}

function selectAll() {
  emit("update:modelValue", [...props.options]);
}

function clearSelection() {
  emit("update:modelValue", []);
}
</script>

<style scoped>
.manufacturer-filter-menu {
  border: 1px solid #dce3ed;
  border-radius: 8px;
  width: 280px;
}

.manufacturer-filter-activator {
  min-width: 180px;
}

.manufacturer-filter-list {
  max-height: 360px;
  overflow-y: auto;
}
</style>
