<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'
import Loading from 'vue-loading-overlay'

const router = useRouter()
const isLoading = ref(false)
const movies = ref([])
const searchQuery = ref("")
const currentGenre = ref(null)

const subGenres = [
  { id: 28, name: "Ação" },
  { id: 12, name: "Aventura" },
  { id: 35, name: "Comédia" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasia" },
  { id: 878, name: "Ficção Científica" },
  { id: 10749, name: "Romance" },
  { id: 27, name: "Terror" },
]

async function listAnimeMovies(extraGenreId = null) {
  isLoading.value = true

  try {
    const response = await api.get("discover/movie", {
      params: {
        with_genres: extraGenreId ? `16,${extraGenreId}` : 16,
        with_origin_country: "JP",
        with_original_language: "ja",
        language: "pt-BR",
        sort_by: "popularity.desc"
      }
    })

    movies.value = response.data.results
    currentGenre.value = extraGenreId
  } catch (error) {
    console.error('Erro ao buscar filmes:', error)
    movies.value = []
  } finally {
    isLoading.value = false
  }
}

function openMovie(movieId) {
  router.push({ name: 'MovieDetails', params: { movieId } })
}

async function searchAnime() {
  if (!searchQuery.value.trim()) {
    listAnimeMovies(currentGenre.value)
    return
  }

  isLoading.value = true

  try {
    const response = await api.get("search/movie", {
      params: {
        query: searchQuery.value,
        language: "pt-BR",
        sort_by: "popularity.desc"
      }
    })

    movies.value = response.data.results.filter(movie =>
      movie.genre_ids?.includes(16) &&
      movie.original_language === "ja"
    )
  } catch (error) {
    console.error('Erro na busca:', error)
    movies.value = []
  } finally {
    isLoading.value = false
  }
}

function getImageUrl(posterPath) {
  return posterPath
    ? `https://image.tmdb.org/t/p/w300${posterPath}`
    : '/placeholder-poster.jpg'
}

function formatRating(voteAverage) {
  return voteAverage ? voteAverage.toFixed(1) : 'N/A'
}

function formatYear(releaseDate) {
  return releaseDate
    ? new Date(releaseDate).getFullYear()
    : 'N/A'
}

function getRatingColor(voteAverage) {
  if (voteAverage >= 8) return '#21d07a'
  if (voteAverage >= 7) return '#d2d531'
  if (voteAverage >= 6) return '#f9c22e'
  return '#e44d4d'
}

onMounted(() => {
  listAnimeMovies()
})
</script>

<template>
  <loading v-model:active="isLoading" is-full-page />

  <div class="filmes">
    <!-- Sidebar de gêneros -->
    <div class="genre-list">
      <input
        v-model="searchQuery"
        @input="searchAnime"
        placeholder="Buscar anime"
        class="search-input"
      />
      <span
        v-for="genre in subGenres"
        :key="genre.id"
        @click="listAnimeMovies(genre.id)"
        :class="{ active: genre.id === currentGenre }"
        class="genre-item"
      >
        {{ genre.name }}
      </span>
    </div>

    <!-- Lista de filmes -->
    <div class="movie-list">
      <div v-for="movie in movies" :key="movie.id" class="movie-card" @click="openMovie(movie.id)">
        <div class="poster-container">
          <img
            :src="getImageUrl(movie.poster_path)"
            :alt="movie.title"
            class="poster-image"
          />
          <div class="rating-circle" :style="{ backgroundColor: getRatingColor(movie.vote_average) }">
            {{ formatRating(movie.vote_average) }}
          </div>
        </div>

        <div class="movie-info">
          <h3 class="movie-title">{{ movie.title }}</h3>
          <p class="movie-date">{{ formatYear(movie.release_date) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.filmes {
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

.movie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  padding: 2rem 0;
  width: 100%;
}

/* Card */
.movie-card {
  background: transparent;
  border-radius: 8px;
  overflow: visible;
  transition: all 0.3s ease;
  cursor: pointer;
}

.movie-card:hover {
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
  height: 300px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.movie-card:hover .poster-image {
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

.movie-info {
  padding: 0 0.2rem;
}

.movie-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.3rem 0;
  line-height: 1.3;
  display: -webkit-box;
  overflow: hidden;
  font-family: 'Source Sans Pro', Arial, sans-serif;
}

.movie-date {
  font-size: 0.9rem;
  color: #EE4646;
  margin: 0;
  font-family: 'Source Sans Pro', Arial, sans-serif;
  font-weight: 400;
}


</style>
