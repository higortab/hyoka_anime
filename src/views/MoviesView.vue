<script setup>
import { ref } from 'vue'
import api from '@/plugins/axios'
import Loading from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const movies = ref([])

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

const currentGenre = ref(null)

async function listAnimeMovies(extraGenreId = null) {
  isLoading.value = true

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
  isLoading.value = false
}


function openMovie(movieId) {
  router.push({ name: 'MovieDetails', params: { movieId } }); }
</script>

<template>
  <h1>Filmes</h1>

  <loading v-model:active="isLoading" is-full-page />

  <div class="genre-list">
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

  <div class="movie-list">
    <div v-for="movie in movies" :key="movie.id" class="movie-card">
      <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
      @click="openMovie(movie.id)"
      />
      <p class="movie-title">{{ movie.title }}</p>
    </div>
  </div>
</template>

<style scoped>
/* ---------- TÍTULO ---------- */

h1 {
  text-align: center;
  font-size: 2rem;
  margin-top: 1rem;
  color: #2c2c2c;
  font-weight: bold;
}



/* ---------- LISTA DE GÊNEROS ---------- */

.genre-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 1.5rem 0;
}

.genre-item {
  background-color: #748708;
  border-radius: 0.5rem;
  padding: 0.3rem 0.7rem;
  color: #fff;
  font-size: 0.85rem;
  font-weight: bold;
  transition: 0.2s ease;
}

.genre-item:hover {
  cursor: pointer;
  background-color: #455a08;
  box-shadow: 0 0 0.5rem #748708;
}

.genre-item.active {
  background-color: #67b086;
  color: #000;
  font-weight: bolder;
  border: 1px solid #abc322;
}



/* ---------- LISTA DE FILMES ---------- */

.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  justify-content: center;
  padding-bottom: 2rem;
}

/* Cartão */
.movie-card {
  width: 15rem;
  height: 29rem;
  background-color: #fff;
  border-radius: 0.6rem;
  overflow: hidden;
  box-shadow: 0 0 0.5rem #000;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.movie-card:hover {
  transform: scale(1.03);
  box-shadow: 0 0 0.8rem #455a08;
}

/* Poster */
.movie-card img {
  width: 100%;
  height: 20rem;
  object-fit: cover;
  border-bottom: 2px solid #e1e1e1;
}

/* Detalhes */
.movie-title {
  padding: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #2c2c2c;
  text-align: center;
  height: 3rem;
}

/* Ajuste para caso o título seja longo */
.movie-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}



/* ---------- RESPONSIVIDADE ---------- */

@media (max-width: 768px) {
  .movie-card {
    width: 11rem;
    height: 23rem;
  }

  .movie-card img {
    height: 15rem;
  }

  .movie-title {
    font-size: 0.9rem;
  }

  .genre-item {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}
</style>
