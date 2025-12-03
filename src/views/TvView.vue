<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'
import Loading from 'vue-loading-overlay'

const router = useRouter()
const isLoading = ref(false)
const series = ref([])
const searchQuery = ref("")
const currentGenre = ref(null)

const subGenres = [
  { id: 16, name: "Animação" },
  { id: 10759, name: "Ação & Aventura" },
  { id: 35, name: "Comédia" },
  { id: 18, name: "Drama" },
  { id: 10765, name: "Ficção Científica & Fantasia" },
  { id: 9648, name: "Mistério" },
  { id: 10762, name: "Infantil" },
  { id: 10763, name: "Notícias" },
  { id: 10764, name: "Reality Show" },
  { id: 10767, name: "Talk Show" },
  { id: 10768, name: "Guerra & Política" },
]

async function listAnimeSeries(extraGenreId = null) {
  isLoading.value = true

  try {
    const response = await api.get("discover/tv", {
      params: {
        with_genres: extraGenreId ? `16,${extraGenreId}` : 16,
        with_origin_country: "JP",
        with_original_language: "ja",
        language: "pt-BR",
        sort_by: "popularity.desc"
      }
    })

    series.value = response.data.results
    currentGenre.value = extraGenreId
  } catch (error) {
    console.error('Erro ao buscar séries:', error)
    series.value = []
  } finally {
    isLoading.value = false
  }
}

function openSerie(serieId) {
  router.push({ name: 'TvDetail', params: { id: serieId } })
}

async function searchAnime() {
  if (!searchQuery.value.trim()) {
    listAnimeSeries(currentGenre.value)
    return
  }

  isLoading.value = true

  try {
    const response = await api.get("search/tv", {
      params: {
        query: searchQuery.value,
        language: "pt-BR",
        sort_by: "popularity.desc"
      }
    })

    series.value = response.data.results.filter(serie =>
      serie.genre_ids?.includes(16) &&
      serie.original_language === "ja"
    )
  } catch (error) {
    console.error('Erro na busca:', error)
    series.value = []
  } finally {
    isLoading.value = false
  }
}

function getImageUrl(posterPath) {
  return posterPath
    ? `https://image.tmdb.org/t/p/w300${posterPath}` // w300 para melhor qualidade
    : '/placeholder-poster.jpg'
}

function formatRating(voteAverage) {
  return voteAverage ? voteAverage.toFixed(1) : 'N/A'
}

function formatYear(firstAirDate) {
  return firstAirDate
    ? new Date(firstAirDate).getFullYear()
    : 'N/A'
}

function getRatingColor(voteAverage) {
  if (voteAverage >= 8) return '#21d07a'
  if (voteAverage >= 7) return '#d2d531'
  if (voteAverage >= 6) return '#f9c22e'
  return '#e44d4d'
}

onMounted(() => {
  listAnimeSeries()
})
</script>

<template>
  <loading v-model:active="isLoading" is-full-page />

  <div class="series">
    <!-- Sidebar de gêneros -->
    <div class="genre-list">
      <input
        v-model="searchQuery"
        @input="searchAnime"
        placeholder="Buscar série de anime"
        class="search-input"
      />
      <span
        v-for="genre in subGenres"
        :key="genre.id"
        @click="listAnimeSeries(genre.id)"
        :class="{ active: genre.id === currentGenre }"
        class="genre-item"
      >
        {{ genre.name }}
      </span>
    </div>

    <!-- Lista de séries -->
    <div class="serie-list">
      <div v-for="serie in series" :key="serie.id" class="serie-card" @click="openSerie(serie.id)">
        <div class="poster-container">
          <img
            :src="getImageUrl(serie.poster_path)"
            :alt="serie.name"
            class="poster-image"
          />
          <div class="rating-circle" :style="{ backgroundColor: getRatingColor(serie.vote_average) }">
            {{ formatRating(serie.vote_average) }}
          </div>
        </div>

        <div class="serie-info">
          <h3 class="serie-title">{{ serie.name }}</h3>
          <p class="serie-date">{{ formatYear(serie.first_air_date) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.series {
  display: flex;
  gap: 2rem;
  padding: 0 3%;
  background-color: black;
  min-height: 100vh;
}

.genre-list {
  height: fit-content;
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: start;
  background-color: #EE4646;
  padding: 1.5rem 1rem;
  border-radius: 8px;
  font-family: 'Michroma';
  margin-top: 3%;
  margin-bottom: 3%;
}

.genre-item {
  padding: 2% 3%;
  color: white;
  font-size: 100%;
  transition: all 0.2s ease;
  margin-bottom: 2%;
  cursor: pointer;
  border-radius: 4px;
  width: 100%;
}

.genre-item:hover,
.genre-item.active {
  background-color: #c71a1a;
  color: white;
  font-weight: 600;
}

input {
  background-color: #EE4646;
  border: 2px solid black;
  border-radius: 20px;
  height: 50px;
  width: 100%;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
  color: white;
  font-family: 'Michroma';
  font-size: 0.9rem;
}

input::placeholder {
  color: rgb(209, 207, 207);
}

input:focus {
  outline: none;
  border-color: black;
}

.serie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
  width: 100%;
}

/* Card */
.serie-card {
  background: transparent;
  border-radius: 8px;
  overflow: visible;
  transition: all 0.3s ease;
  cursor: pointer;
}

.serie-card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0.5rem #EE4646;
}

.poster-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px #EE4646(0, 0, 0, 0.3);
  margin-bottom: 0.8rem;
}

.poster-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.serie-card:hover .poster-image {
  transform: scale(1.1);

}

.rating-circle {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #EE4646;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  border: 2px solid #0d253f;
  box-shadow: 0 2px 4px #EE4646(0, 0, 0, 0.3);
}

.serie-info {
  padding: 0 0.2rem;
}

.serie-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.3rem 0;
  line-height: 1.3;
  display: -webkit-box;
  overflow: hidden;
  font-family: 'Source Sans Pro', Arial, sans-serif;
}

.serie-date {
  font-size: 0.9rem;
  color: #EE4646;
  margin: 0;
  font-family: 'Source Sans Pro', Arial, sans-serif;
  font-weight: 400;
}

</style>
