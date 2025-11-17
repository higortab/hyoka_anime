<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import api from '@/plugins/axios'
import Loading from 'vue-loading-overlay'

// estado
const isLoading = ref(false)
const series = ref([])
const totalPages = ref(1)
const page = ref(1)

const currentGenre = ref(null)
const searchQuery = ref("")
const observerTarget = ref(null)

let observer = null
let isFetchingMore = false
let searchDebounceTimer = null

// Mapeamento de gêneros da UI -> array de IDs TMDb (cobre 28 vs 10759 etc)
const subGenres = [
  { id: 'action', name: "Ação & Aventura", tmdbIds: [10759, 28] },
  { id: 'scifi', name: "Sci-Fi & Fantasia", tmdbIds: [10765, 878] },
  { id: 'comedy', name: "Comédia", tmdbIds: [35] },
  { id: 'drama', name: "Drama", tmdbIds: [18] },
  { id: 'romance', name: "Romance", tmdbIds: [10749] },
  { id: 'horror', name: "Terror", tmdbIds: [27] },
  { id: 'adventure', name: "Aventura", tmdbIds: [12] },
  { id: 'fantasy', name: "Fantasia", tmdbIds: [14] },
]

// Helper: monta string para with_genres (usa OR entre ids)
function buildWithGenresParam() {
  if (!currentGenre.value) return 16 // só Animation
  const item = subGenres.find(g => g.id === currentGenre.value)
  if (!item) return 16
  // garante que 16 (Animation) esteja incluído junto com os tmdbIds (uso OR)
  const allIds = Array.from(new Set([16, ...item.tmdbIds]))
  // OR é representado por '|' no discover endpoint
  return allIds.join('|')
}

// Função principal: busca via discover (padrão) ou search (quando houver query)
async function fetchFromApi(isLoadMore = false) {
  if (isFetchingMore) return
  isFetchingMore = true
  isLoading.value = !isLoadMore

  try {
    let response

    // Se houver query de busca, usar search/tv (pesquisa global)
    if (searchQuery.value && searchQuery.value.trim().length > 0) {
      response = await api.get("search/tv", {
        params: {
          query: searchQuery.value.trim(),
          language: "pt-BR",
          page: page.value,
          include_adult: false,
        }
      })
    } else {
      // discover com with_genres montado (inclui 16 e IDs mapeados)
      response = await api.get("discover/tv", {
        params: {
          with_genres: buildWithGenresParam(),
          with_origin_country: "JP",
          with_original_language: "ja",
          language: "pt-BR",
          sort_by: "popularity.desc",
          page: page.value
        }
      })
    }

    let results = response.data.results || []

    // OBS: alguns títulos podem não ter poster_path ou nome no campo `name` (usar fallback)
    results = results.map(r => ({
      id: r.id,
      name: r.name ?? r.original_name ?? r.title ?? "—",
      poster_path: r.poster_path,
      genre_ids: r.genre_ids || [],
      overview: r.overview || "",
      original_name: r.original_name || ""
    }))

    if (isLoadMore) {
      // evita duplicatas por id
      const existingIds = new Set(series.value.map(s => s.id))
      const newItems = results.filter(r => !existingIds.has(r.id))
      series.value = [...series.value, ...newItems]
    } else {
      series.value = results
    }

    totalPages.value = response.data.total_pages || 1
  } catch (err) {
    console.error("Erro ao buscar séries:", err)
  } finally {
    isLoading.value = false
    isFetchingMore = false
  }
}

// wrapper que decide se é load more
function listAnimeSeries(isLoadMore = false) {
  fetchFromApi(isLoadMore)
}

// watch: ao mudar gênero -> reset página e lista e buscar
watch(currentGenre, () => {
  page.value = 1
  series.value = []
  listAnimeSeries(false)
})

// watch: busca com debounce, reset pagina/lista
watch(searchQuery, () => {
  // debounce simples: 500ms
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    page.value = 1
    series.value = []
    listAnimeSeries(false)
  }, 500)
})

// Observer para infinite scroll
function initObserver() {
  observer = new IntersectionObserver(entries => {
    const entry = entries[0]
    if (entry && entry.isIntersecting && page.value < totalPages.value && !isFetchingMore) {
      page.value++
      listAnimeSeries(true)
    }
  }, {
    root: null,
    rootMargin: '200px', // carrega antes de chegar no fim
    threshold: 0.1
  })

  if (observerTarget.value) observer.observe(observerTarget.value)
}

onMounted(() => {
  listAnimeSeries(false)
  initObserver()
})

onBeforeUnmount(() => {
  if (observer && observerTarget.value) observer.unobserve(observerTarget.value)
})
</script>

<template>
  <h1>Séries de Anime</h1>

  <loading v-model:active="isLoading" is-full-page />

  <input
    v-model="searchQuery"
    placeholder="Buscar anime (use 3+ caracteres para melhores resultados)..."
    class="search-input"
  />

  <div class="genre-list">
    <span
      v-for="genre in subGenres"
      :key="genre.id"
      @click="() => { page = 1; currentGenre = genre.id }"
      :class="{ active: genre.id === currentGenre }"
      class="genre-item"
    >
      {{ genre.name }}
    </span>

    <span @click="() => { page = 1; currentGenre = null }" :class="{ active: currentGenre === null }" class="genre-item">
      Todos
    </span>
  </div>

  <div class="movie-list">
    <div v-for="s in series" :key="s.id" class="movie-card">
      <img :src=" s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : 'https://via.placeholder.com/150x225?text=Sem+Imagem' " />
      <p class="movie-title">{{ s.name }}</p>
      <!-- mostra gêneros como IDs (pode trocar para nomes se quiser buscar /genre/tv/list) -->
      <small v-if="s.genre_ids && s.genre_ids.length">Genres: {{ s.genre_ids.join(', ') }}</small>
    </div>
  </div>

  <!-- elemento invisível para infinite scroll -->
  <div ref="observerTarget" class="scroll-trigger"></div>
</template>

<style scoped>
.genre-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 20px 0;
}
.genre-item {
  padding: 6px 10px;
  border-radius: 6px;
  background: #eee;
  cursor: pointer;
}
.genre-item.active {
  background: #008cff;
  color: white;
}
.search-input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
}
.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, 150px);
  gap: 20px;
}
.movie-card img {
  width: 150px;
  height: 225px;
  object-fit: cover;
  border-radius: 8px;
}
.movie-title {
  text-align: center;
  margin-top: 8px;
}
.scroll-trigger {
  width: 100%;
  height: 1px;
}
</style>
