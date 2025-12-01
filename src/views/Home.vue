<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const movies = ref([]);
const currentIndex = ref(0);
let autoplayInterval = null;

async function showMovieData() {
  const apiKey = "09a966dc92563a26c9fe76e249b32585";

  try {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&with_keywords=210024&language=pt-BR`
    );
    movies.value = data.results;
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
  }
}

function nextMovie() {
  currentIndex.value = (currentIndex.value + 1) % movies.value.length;
}

function previousMovie() {
  currentIndex.value =
    (currentIndex.value - 1 + movies.value.length) % movies.value.length;
}

function openMovie(movieId) {
  router.push({ name: "MovieDetails", params: { movieId } });
}

/* AUTO-PLAY */
function startAutoplay() {
  autoplayInterval = setInterval(() => nextMovie(), 5000);
}

function stopAutoplay() {
  clearInterval(autoplayInterval);
}

const releases = ref([]);

async function getAnimeReleases() {
  const apiKey = "09a966dc92563a26c9fe76e249b32585";

  try {
    const { data } = await axios.get(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_keywords=210024&sort_by=release_date.desc&language=pt-BR&primary_release_year=2025`
    );
    releases.value = data.results;
  } catch (err) {
    console.error("Erro ao buscar lançamentos:", err);
  }
}

function getImageUrl(posterPath) {
  return posterPath
    ? `https://image.tmdb.org/t/p/w300${posterPath}`
    : '/placeholder-poster.jpg';
}

function formatRating(voteAverage) {
  return voteAverage ? voteAverage.toFixed(1) : 'N/A';
}

function formatYear(releaseDate) {
  return releaseDate
    ? new Date(releaseDate).getFullYear()
    : 'N/A';
}

function getRatingColor(voteAverage) {
  if (voteAverage >= 8) return '#21d07a';
  if (voteAverage >= 7) return '#d2d531';
  if (voteAverage >= 6) return '#f9c22e';
  return '#e44d4d';
}

onMounted(() => {
  showMovieData();
  startAutoplay();
  getAnimeReleases();
});

onBeforeUnmount(() => stopAutoplay());
</script>

<template>
  <div class="slider-container" v-if="movies.length">
    <transition name="slide-fade" mode="out-in">
      <div
        :key="movies[currentIndex].id"
        class="fullscreen-slide"
        :style="`background-image: url(https://image.tmdb.org/t/p/original/${movies[currentIndex].backdrop_path})`"
      ></div>
    </transition>

    <div class="info-panel">
      <h1>{{ movies[currentIndex].title }}</h1>
      <p class="overview">{{ movies[currentIndex].overview || "Sem descrição disponível." }}</p>
      <p class="rating">⭐ {{ movies[currentIndex].vote_average.toFixed(1) }}</p>
      <button class="info-btn-main" @click="openMovie(movies[currentIndex].id)">
        Veja informações sobre o filme
      </button>
    </div>

    <button class="nav-btn left" @click="previousMovie">‹</button>
    <button class="nav-btn right" @click="nextMovie">›</button>
  </div>

  <div class="releases-section">
    <h2 class="section-title">Lançamentos</h2>
    <div class="release-list">
      <div
        v-for="movie in releases"
        :key="movie.id"
        class="movie-card"
        @click="openMovie(movie.id)"
      >
        <div class="poster-container">
          <img
            class="movie-poster"
            :src="getImageUrl(movie.poster_path)"
            :alt="movie.title"
          />
          <div
            class="rating-circle"
            :style="{ backgroundColor: getRatingColor(movie.vote_average) }"
          >
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

<style scoped>
.slider-container {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 900px;
  overflow: hidden;
  color: white;
  font-family: "Inter", Arial, sans-serif;
}


.fullscreen-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center top;
  filter: brightness(0.55) saturate(1.25);
  z-index: 1;
}

.fullscreen-slide::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.25) 45%,
    rgba(0, 0, 0, 0) 70%
  );
  z-index: 2;
}


.info-panel {
  position: absolute;
  top: 20%;
  left: 6%;
  max-width: 580px;
  max-height: 60vh;
  overflow: hidden;
  z-index: 3;
  pointer-events: none;
  color: white;
}

.info-panel * {
  pointer-events: auto;
}

.info-panel h1 {
  font-size: 3rem;
  line-height: 1.1;
  margin-bottom: 15px;
}

.overview {
  font-size: 1.1rem;
  line-height: 1.4;
  max-height: 140px;
  overflow: hidden;
  margin: 12px 0 20px 0;
  text-overflow: ellipsis;
}

.rating {
  font-size: 1.6rem;
}


.info-btn-main {
  background-color: #EE4646;
  border: none;
  padding: 14px 18px;
  font-size: 1rem;
  font-family: "Michroma";
  width: 60%;
  margin-top: 2%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.info-btn-main:hover {
  background-color: white;
}


.nav-btn {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 85px;
  font-size: 4rem;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 4;
  transition: var(--transition-fast);
  color: transparent;
}

.slider-container:hover .nav-btn {
  color: rgba(255, 80, 80, 0.6);
}

.nav-btn:hover {
  color: var(--white) !important;
}

.left { left: 0; }
.right { right: 0; }


.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.6s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

/* LANÇAMENTOS */
.releases-section {
  padding: 40px 20px;
  margin-bottom: 5%;
}

.section-title {
  color: #EE4646;
  font-size: 2rem;
  font-weight: normal;
  margin-bottom: 25px;
  font-family: 'Michroma';
  padding-left: 10px;
}


.release-list {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0 20px 10px;
  scroll-behavior: smooth;
}

.release-list::-webkit-scrollbar {
  height: 8px;
}

.release-list::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: #EE4646;
}

.release-list::-webkit-scrollbar-track {
  background: rgba(224, 21, 21, 0.1);
  border-radius: 4px;
}


.movie-card {
  background: transparent;
  border-radius: 8px;
  overflow: visible;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  width: 200px;
}

.movie-card:hover {
  transform: scale(1.05);
}

.poster-container {
  width: 100%;
  height: 300px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.movie-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster {
  transform: scale(1.08);
}

.rating-circle {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  border: 2px solid #0d253f;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.movie-info {
  padding: 0 5px;
  min-height: 60px;
}

.movie-title {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.3rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-family: 'Source Sans Pro', Arial, sans-serif;
}

.movie-date {
  font-size: 0.85rem;
  color: #EE4646;
  margin: 0;
  font-family: 'Michroma';
  font-weight: 400;
}

/* Responsividade para telas menores */
@media (max-width: 768px) {
  .movie-card {
    width: 160px; /* Cards menores em mobile */
  }

  .poster-container {
    height: 240px;
  }
}

@media (max-width: 480px) {
  .movie-card {
    width: 140px; /* Cards ainda menores em telas muito pequenas */
  }

  .poster-container {
    height: 210px;
  }
}
</style>
