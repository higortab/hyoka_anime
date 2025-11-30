<script setup>
/* -------------------------------------------
   IMPORTS
------------------------------------------- */
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

/* -------------------------------------------
   ROUTER
------------------------------------------- */
const router = useRouter();

/* -------------------------------------------
   SLIDER PRINCIPAL (FULLSCREEN)
------------------------------------------- */
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

/* -------------------------------------------
   LANÇAMENTOS – CARROSSEL HORIZONTAL
------------------------------------------- */
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





/* -------------------------------------------
   LIFECYCLE
------------------------------------------- */
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

      <p class="overview"> {{ movies[currentIndex].overview || "Sem descrição disponível." }} </p>

      <p class="rating">⭐ {{ movies[currentIndex].vote_average.toFixed(1) }}</p>


      <button class="info-btn-main" @click="openMovie(movies[currentIndex].id)">
        Veja informações sobre o filme
      </button>
    </div>


    <button class="nav-btn left" @click="previousMovie">‹</button>
    <button class="nav-btn right" @click="nextMovie">›</button>
  </div>

  <!-- ===================== LANÇAMENTOS ===================== -->
 <div class="releases-section">

      <h2 class="section-title" style="font-family: 'Michroma';">Lançamentos</h2>

    <div class="release-list">

      <div v-for="movie in releases" :key="movie.id" class="movie-card">

        <img
          class="movie-poster"
          :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`"
          :alt="movie.title"
          @click="openMovie(movie.id)"

        />

        <div class="release-footer">
          <h3 class="movie-title">{{ movie.title }}</h3>

          <p class="movie-rating">⭐ {{ movie.vote_average.toFixed(1) }}</p>

          <p class="movie-genres">
            {{ movie.genre_names?.join(', ') }}
          </p>
        </div>

      </div>
    </div>
  </div>

</template>



<style>

.slider-container {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 900px;
  overflow: hidden;
  color: var(--white);
  font-family: "Inter", Arial, sans-serif;
}


/* tela inteira com imagem */
.fullscreen-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center top;
  filter: brightness(0.55) saturate(1.25);
  z-index: 1;
}

/* gradiente estilo Crunchyroll */
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

/* painel com textos */
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

/* botão principal */
.info-btn-main {
  background-color: #EE4646;
  border: none;
  padding: 14px 18px;
  font-size: 1rem;
  font-family: "Michroma";
  width: 60%;
  margin-top: 2%;
}

.info-btn-main:hover {
  background-color: white;
}


/* ============================================================
   ◀ ▶ NAVEGAÇÃO DO SLIDE
   ============================================================ */
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
  color: transparent; /* invisível até hover */
}

.slider-container:hover .nav-btn {
  color: rgba(255, 80, 80, 0.6);
}

.nav-btn:hover {
  color: var(--white) !important;
}

.left { left: 0; }
.right { right: 0; }


/* ============================================================
   🟧 ANIMAÇÕES
   ============================================================ */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.6s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}


/* --- SECTION --- */
.releases-section {
  padding: 0 20px;
  background-color: black;
  margin-bottom: 5%;
}

.section-title {
  color: #EE4646;
  font-size:210%;
  font-weight: bold;
  margin-top: 5%;
  margin-bottom: 15px;
}

/* --- LISTA --- */
.release-list {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-behavior: smooth;
}

.release-list::-webkit-scrollbar {
  height: 10px;

}

.release-list::-webkit-scrollbar-thumb {
  border-radius: 12px;
  background: #EE4646;

}

/* --- MOVIE CARD --- */
.movie-card {
  position: relative;
  min-width: 220px;
  width: 180px;
  overflow: hidden;
  background: #EE4646;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* IMAGEM */
.movie-poster {
  width: 100%;
  height: 260px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* FOOTER */
.release-footer {
  background: #EE4646;
  padding: 10px;
  min-height: 100px;
  color: #fff;
  font-family: "Michroma", sans-serif;
  transition: background 0.3s ease, transform 0.3s ease;
}

.movie-title {
  font-size: 15px;
  margin-bottom: 6px;
  line-height: 1.2;
}

.movie-rating {
  font-size: 14px;
  margin-bottom: 4px;
}

.movie-genres {
  font-size: 12px;
  opacity: 0.85;
}

/* --- HOVER UNIVERSAL (Crunchyroll Style) --- */
.movie-card:hover {
  transform: scale(1.07);
  box-shadow: 0 10px 25px rgba(255, 90, 40, 0.35);
}

.movie-card:hover .movie-poster {
  transform: scale(1.15);
}

.movie-card:hover .release-footer {
  transform: translateY(-4px);
}


</style>
