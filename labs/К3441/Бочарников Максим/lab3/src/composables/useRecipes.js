import { computed, ref } from 'vue'
import { recipesApi, authorsApi, likesApi, apiURL } from '@/api'
import { useAuthStore } from '@/stores/auth'

export function useRecipes() {
  const recipes = ref([])
  const authors = ref([])
  const likedIds = ref(new Set())
  const loading = ref(false)
  const error = ref('')
  const apiDown = ref(false)

  const filters = ref({
    search: '',
    type: '',
    difficulty: '',
    ingredients: [],
  })

  const authorMap = computed(() => {
    const map = new Map()
    authors.value.forEach((a) => map.set(Number(a.id), a))
    return map
  })

  const allIngredients = computed(() =>
    Array.from(new Set(recipes.value.flatMap((r) => r.ingredients || []))).sort(
      (a, b) => a.localeCompare(b, 'ru')
    )
  )

  const filteredRecipes = computed(() => {
    const { search, type, difficulty, ingredients } = filters.value
    const q = search.trim().toLowerCase()

    return recipes.value.filter((recipe) => {
      if (type && recipe.type !== type) return false
      if (difficulty && recipe.difficulty !== difficulty) return false
      if (q) {
        const hay = [
          recipe.title,
          recipe.description,
          recipe.type,
          ...(recipe.ingredients || []),
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (ingredients.length) {
        for (const ing of ingredients) {
          if (!(recipe.ingredients || []).includes(ing)) return false
        }
      }
      return true
    })
  })

  async function checkApi() {
    try {
      await fetch(`${apiURL}/recipes`)
      apiDown.value = false
      return true
    } catch {
      apiDown.value = true
      return false
    }
  }

  async function loadCatalog() {
    loading.value = true
    error.value = ''
    const ok = await checkApi()
    if (!ok) {
      loading.value = false
      return
    }

    try {
      const auth = useAuthStore()
      const [r, a] = await Promise.all([
        recipesApi.getAll(),
        authorsApi.getAll(),
      ])
      recipes.value = r
      authors.value = a

      if (auth.isLoggedIn) {
        try {
          const likes = await likesApi.get({ userId: auth.user.id })
          likedIds.value = new Set(likes.map((l) => Number(l.recipeId)))
        } catch {
          likedIds.value = new Set()
        }
      } else {
        likedIds.value = new Set()
      }
    } catch (e) {
      error.value = e.message || 'Не удалось загрузить каталог'
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.value = {
      search: '',
      type: '',
      difficulty: '',
      ingredients: [],
    }
  }

  function toggleIngredient(ing) {
    const list = filters.value.ingredients
    if (list.includes(ing)) {
      filters.value.ingredients = list.filter((i) => i !== ing)
    } else {
      filters.value.ingredients = [...list, ing]
    }
  }

  function getAuthor(id) {
    return authorMap.value.get(Number(id)) || { name: 'Автор', avatar: '' }
  }

  function setLiked(recipeId, liked) {
    const next = new Set(likedIds.value)
    if (liked) next.add(Number(recipeId))
    else next.delete(Number(recipeId))
    likedIds.value = next
  }

  function updateRecipeLikes(recipeId, likes) {
    const idx = recipes.value.findIndex((r) => Number(r.id) === Number(recipeId))
    if (idx >= 0) {
      recipes.value[idx] = { ...recipes.value[idx], likes }
    }
  }

  return {
    recipes,
    authors,
    likedIds,
    loading,
    error,
    apiDown,
    filters,
    filteredRecipes,
    allIngredients,
    loadCatalog,
    resetFilters,
    toggleIngredient,
    getAuthor,
    setLiked,
    updateRecipeLikes,
  }
}
