<template>
  <form class="filter-panel" aria-label="Фильтры рецептов" @submit.prevent>
    <div class="row g-3">
      <div class="col-md-4">
        <label for="filter-search">Поиск</label>
        <div class="input-with-icon">
          <Icon name="search" class-name="input-icon" />
          <input
            id="filter-search"
            v-model="local.search"
            type="search"
            class="form-control"
            placeholder="манго, тако, лайм…"
          >
        </div>
      </div>
      <div class="col-md-3">
        <label for="filter-type">Тип блюда</label>
        <select id="filter-type" v-model="local.type" class="form-select">
          <option value="">Все типы</option>
          <option value="закуска">Закуска</option>
          <option value="основное">Основное</option>
          <option value="гарнир">Гарнир</option>
          <option value="десерт">Десерт</option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="filter-difficulty">Сложность</label>
        <select id="filter-difficulty" v-model="local.difficulty" class="form-select">
          <option value="">Любая</option>
          <option value="лёгкая">Лёгкая</option>
          <option value="средняя">Средняя</option>
          <option value="сложная">Сложная</option>
        </select>
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button type="button" class="btn btn-vice btn-vice-ghost w-100" @click="onReset">
          <Icon name="reset" class-name="icon--sm" />
          Сброс
        </button>
      </div>
      <div class="col-12">
        <label id="ingredients-label">Ингредиенты</label>
        <div
          class="chip-group"
          role="group"
          aria-labelledby="ingredients-label"
        >
          <button
            v-for="ing in ingredients"
            :key="ing"
            type="button"
            class="chip"
            :class="{ 'is-active': local.ingredients.includes(ing) }"
            :aria-pressed="local.ingredients.includes(ing)"
            @click="toggle(ing)"
          >
            {{ ing }}
          </button>
        </div>
      </div>
    </div>
    <p class="mb-0 mt-3 small" aria-live="polite" role="status">
      Найдено: {{ count }}
    </p>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import Icon from '@/components/Icon.vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  ingredients: { type: Array, default: () => [] },
  count: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue', 'reset'])

const local = reactive({
  search: props.modelValue.search || '',
  type: props.modelValue.type || '',
  difficulty: props.modelValue.difficulty || '',
  ingredients: [...(props.modelValue.ingredients || [])],
})

watch(
  local,
  () => {
    emit('update:modelValue', {
      search: local.search,
      type: local.type,
      difficulty: local.difficulty,
      ingredients: [...local.ingredients],
    })
  },
  { deep: true }
)

watch(
  () => props.modelValue,
  (v) => {
    local.search = v.search || ''
    local.type = v.type || ''
    local.difficulty = v.difficulty || ''
    local.ingredients = [...(v.ingredients || [])]
  },
  { deep: true }
)

function toggle(ing) {
  if (local.ingredients.includes(ing)) {
    local.ingredients = local.ingredients.filter((i) => i !== ing)
  } else {
    local.ingredients.push(ing)
  }
}

function onReset() {
  local.search = ''
  local.type = ''
  local.difficulty = ''
  local.ingredients = []
  emit('reset')
}
</script>
