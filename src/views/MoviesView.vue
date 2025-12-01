<script setup>
import { ref } from 'vue'
import api from '@/plugins/axios'
import Loading from 'vue-loading-overlay'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const movies = ref([])
const searchQuery = ref("")

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


async function searchAnime() {
  if (!searchQuery.value.trim()) {
    listAnimeMovies(currentGenre.value)
    return
  }

  isLoading.value = true

  const response = await api.get("search/movie", {
    params: {
      query: searchQuery.value,
      language: "pt-BR",
      sort_by: "popularity.desc"
    }
  })

  // 🔥 FILTRA SÓ ANIMES JAPONESES
  movies.value = response.data.results.filter(movie =>
    movie.genre_ids?.includes(16) && // animação
    movie.original_language === "ja" // japonês
  )

  isLoading.value = false
}


</script>

<template>

  <loading v-model:active="isLoading" is-full-page />
<div class="filmes">
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

  <div class="movie-list">
    <div v-for="movie in movies" :key="movie.id" class="movie-card">
      <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
      @click="openMovie(movie.id)"
      />
      <h3 class="movie-title">{{ movie.title }}</h3>

          <p class="movie-rating">⭐ {{ movie.vote_average.toFixed(1) }}</p>

          <p class="movie-genres">{{ movie.genre_names?.join(', ') }}</p>
    </div>
  </div>
</div>
</template>

<style scoped>

.filmes {
  display: flex;
  margin-block-start: 5%;
}




.genre-list {
  height: 2%;
  width: 30%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: start;
  margin-left: 3%;
  background-color: #EE4646;
  padding: 4% 5% 10% 1%;
  margin-bottom: 5%;
  font-family: 'Michroma';
  font-size: 120%;
}

.genre-item {
  padding: 0.3rem 0.7rem;
  color: white;
  font-size: 0.85rem;
  transition: 0.2s ease;
  margin-bottom: 2%;
}

input {
  background-color: #EE4646;
  border: 2px solid black;
  border-radius: 10px;
  height: 30px;
  width: 80%;
  padding: 2%;
  margin-bottom: 4%;
}


.movie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  padding-bottom: 2rem;
  justify-content: center;
  width: 70%;
}

/* Cartão */
.movie-card {
  width: 25%;
  height: auto;
  background-color: #EE4646;
  overflow: hidden;
  box-shadow: 0 0 0.5rem #EE4646;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.movie-card:hover {
  transform: scale(1.03);
  box-shadow: 0 0 8rem #EE4646;
}


.movie-card img {
  width: 100%;
  height: 20rem;
  object-fit: cover;

}


.movie-title {
  padding: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #2c2c2c;
  text-align: center;
  height: 3rem;
}


.movie-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;

}




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
