<script setup>
import {  onMounted, computed, ref, watch } from 'vue';
import { useTvStore } from '@/stores/tv';
import { useRoute } from 'vue-router';

const route = useRoute();
const tvStore = useTvStore();

console.log('Route params:', route.params);
console.log('Prop ID:', route.params.id);

// carrosel
const currentImageIndex = ref(0);
const isModalOpen = ref(false);
const selectedImagePath = ref('');


const loadTvData = async () => {
  const tvId = route.params.id;
  console.log('Carregando dados para série ID:', tvId);

  if (!tvId) {
    console.error('ID da série não fornecido');
    return;
  }

  await tvStore.fetchAllTvData(tvId);


  console.log('Store state após carregamento:', {
    currentTv: tvStore.currentTv,
    hasImages: !!tvStore.tvImages?.backdrops?.length,
    isLoading: tvStore.isLoading,
    error: tvStore.error
  });
};

onMounted(async () => {
  console.log('Componente montado');
  await loadTvData();
});


watch(() => route.params.id, (newId) => {
  console.log('ID mudou para:', newId);
  if (newId) {
    loadTvData();
  }
});


const certification = computed(() => {
  console.log('Calculando certificação...', tvStore.currentTv.content_ratings);

  if (!tvStore.currentTv.content_ratings?.results) {
    console.log('Sem resultados de content_ratings');
    return null;
  }


  const brRating = tvStore.currentTv.content_ratings.results.find(
    r => r.iso_3166_1 === 'BR'
  );

  if (brRating?.rating) {
    console.log('Certificação BR encontrada:', brRating.rating);
    return brRating.rating;
  }


  const usRating = tvStore.currentTv.content_ratings.results.find(
    r => r.iso_3166_1 === 'US'
  );

  if (usRating?.rating) {
    console.log('Certificação US encontrada:', usRating.rating);
    return usRating.rating;
  }


  for (const country of tvStore.currentTv.content_ratings.results) {
    if (country?.rating) {
      console.log('Certificação encontrada de', country.iso_3166_1, ':', country.rating);
      return country.rating;
    }
  }

  console.log('Nenhuma certificação encontrada');
  return null;
});


const genres = computed(() => {
  console.log('Gêneros:', tvStore.currentTv.genres);
  return tvStore.currentTv.genres || [];
});


const carouselImages = computed(() => {
  const images = tvStore.tvImages?.backdrops?.slice(0, 10) || [];
  console.log('Imagens do carrossel:', images.length);
  return images;
});


const nextImage = () => {
  if (carouselImages.value.length === 0) return;
  currentImageIndex.value = (currentImageIndex.value + 1) % carouselImages.value.length;
};

const prevImage = () => {
  if (carouselImages.value.length === 0) return;
  currentImageIndex.value = (currentImageIndex.value - 1 + carouselImages.value.length) % carouselImages.value.length;
};

const goToImage = (index) => {
  currentImageIndex.value = index;
};

// Funções do modal
const showImageModal = (imagePath) => {
  selectedImagePath.value = imagePath;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};


let carouselInterval;

const startAutoCarousel = () => {
  if (carouselImages.value.length > 1) {
    carouselInterval = setInterval(() => {
      nextImage();
    }, 5000);
  }
};

const stopAutoCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval);
  }
};

onMounted(() => {
  startAutoCarousel();
});
</script>

<template>
  <div class="tv-page">

    <div v-if="tvStore.isLoading" class="loading">
      <p>Carregando série...</p>
    </div>

    <div v-else-if="tvStore.error" class="error">
      <p>Erro ao carregar série: {{ tvStore.error }}</p>
    </div>


    <div v-else>

      <div v-if="tvStore.currentTv" style="display: none;">
        <p>Dados carregados: {{ Object.keys(tvStore.currentTv).length > 0 ? 'Sim' : 'Não' }}</p>
        <p>Título: {{ tvStore.currentTv.name }}</p>
        <p>ID: {{ tvStore.currentTv.id }}</p>
      </div>


      <div class="backdrop" :style="{
        backgroundImage: tvStore.currentTv.backdrop_path
          ? `url(https://image.tmdb.org/t/p/original${tvStore.currentTv.backdrop_path})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }">
        <div class="overlay"></div>

        <div class="header-content">
          <div class="poster-container">
            <img class="poster" :src="tvStore.currentTv.poster_path
              ? `https://image.tmdb.org/t/p/w500${tvStore.currentTv.poster_path}`
              : '/placeholder-tv.jpg'" :alt="tvStore.currentTv.name" />
          </div>

          <div class="text-info">
            <div class="title-section">
              <h1>{{ tvStore.currentTv.name || 'Carregando...' }}</h1>
              <div class="metadata">
                <span v-if="certification" class="certification">
                  {{ certification }}
                </span>

                <span v-if="tvStore.currentTv.episode_run_time?.length" class="runtime">
                  {{ tvStore.currentTv.episode_run_time[0] }}min
                </span>

                <span v-if="tvStore.currentTv.first_air_date" class="release-year">
                  {{ new Date(tvStore.currentTv.first_air_date).getFullYear() }}
                </span>
              </div>
            </div>

            <p v-if="tvStore.currentTv.tagline" class="tagline">
              "{{ tvStore.currentTv.tagline }}"
            </p>

            <div v-if="genres.length" class="genres">
              <span v-for="genre in genres" :key="genre.id" class="genre-tag">
                {{ genre.name }}
              </span>
            </div>

            <div class="stats">
              <span class="rating">
                <img src="/HEADER/star.png" alt="Avaliação">
                {{ tvStore.currentTv.vote_average?.toFixed(1) || 'N/A' }}
              </span>
              <span v-if="tvStore.currentTv.number_of_seasons" class="seasons">

                {{ tvStore.currentTv.number_of_seasons }} temporada{{ tvStore.currentTv.number_of_seasons > 1 ? 's' : '' }}
              </span>
            </div>

            <p v-if="tvStore.currentTv.overview" class="overview">
              {{ tvStore.currentTv.overview }}
            </p>
          </div>
        </div>
      </div>


      <section v-if="tvStore.currentTv.production_companies?.length" class="companies-section">
        <h2>Produtoras</h2>
        <div class="companies">
          <div v-for="company in tvStore.currentTv.production_companies" :key="company.id" class="company-card">
            <img v-if="company.logo_path" :src="`https://image.tmdb.org/t/p/w200${company.logo_path}`"
              :alt="company.name" class="company-logo" />
            <p v-else class="company-name">{{ company.name }}</p>
          </div>
        </div>
      </section>

      <!-- CARROSSEL DE IMAGENS -->
      <section v-if="carouselImages.length > 0" class="carousel-section">
        <div class="carousel-header">
          <h2>Imagens</h2>
          <div class="carousel-indicator">
            {{ currentImageIndex + 1 }} / {{ carouselImages.length }}
          </div>
        </div>

        <div class="carousel-container" @mouseenter="stopAutoCarousel" @mouseleave="startAutoCarousel">
          <button class="carousel-btn prev-btn" @click="prevImage" :disabled="carouselImages.length <= 1">
            &#10094;
          </button>


          <div class="carousel-slide" @click="showImageModal(carouselImages[currentImageIndex].file_path)">
            <img :src="`https://image.tmdb.org/t/p/w1280${carouselImages[currentImageIndex].file_path}`"
              :alt="`Imagem ${currentImageIndex + 1} de ${tvStore.currentTv.name}`" class="carousel-image"
              loading="lazy" />
          </div>

          <button class="carousel-btn next-btn" @click="nextImage" :disabled="carouselImages.length <= 1">
            &#10095;
          </button>

          <div class="carousel-dots">
            <button v-for="(_, index) in carouselImages" :key="index" class="dot"
              :class="{ active: index === currentImageIndex }" @click="goToImage(index)"
              :aria-label="`Ir para imagem ${index + 1}`">
            </button>
          </div>
        </div>

        <div class="thumbnails-container">
          <div v-for="(image, index) in carouselImages" :key="index" class="thumbnail-wrapper"
            :class="{ active: index === currentImageIndex }" @click="goToImage(index)">
            <img :src="`https://image.tmdb.org/t/p/w300${image.file_path}`"
              :alt="`Miniatura ${index + 1}`" class="thumbnail" loading="lazy" />
          </div>
        </div>
      </section>

      <div v-if="isModalOpen" class="image-modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="close-modal" @click="closeModal">&times;</button>
          <img :src="`https://image.tmdb.org/t/p/original${selectedImagePath}`" alt="Imagem em tela cheia"
            class="modal-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tv-page {
  width: 100%;
  color: white;
  font-family: Arial, sans-serif;
}

.loading, .error {
  padding: 3rem;
  text-align: center;
  font-size: 1.5rem;
}

.error {
  color: #e50914;
}



.backdrop {
  width: 100%;
  min-height: 70vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: end;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
}

.header-content {
  position: relative;
  display: flex;
  gap: 2rem;
  padding: 3rem;
  align-items: flex-start;
}

.poster-container {
  width: 300px;
  flex-shrink: 0;
}

.poster {
  width: 100%;
  height: 450px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.6);
}

.text-info {
  max-width: 55%;
  flex: 1;
}

.title-section {
  margin-bottom: 10px;
}

h1 {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.metadata {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.certification {
  background: black;
  border: 2px solid white;
  border-radius: 4px;
  padding: 2px 8px;
  font-weight: bold;
  font-size: 0.9rem;
}

.runtime,
.release-year {
  opacity: 0.9;
  font-size: 0.95rem;
}

.tagline {
  font-style: italic;
  opacity: 0.8;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.genre-tag {
  background: rgba(255, 255, 255, 0.15);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
}

.stats {
  display: flex;
  gap: 1.5rem;
  font-size: 1.1rem;
  margin-bottom: 20px;
  align-items: center;
}

.stats img {
  width: 20px;
  height: 20px;
  margin-right: 5px;
  vertical-align: middle;
}

.overview {
  line-height: 1.5;
  font-size: 1.05rem;
  margin-bottom: 25px;
  max-width: 800px;
}

/* PRODUTORAS */
.companies-section {
  padding: 3rem;
  color: #e50914;
  background: black;
}

.companies-section h2 {
  margin-bottom: 1.3rem;
  font-size: 1.8rem;
  font-family: 'Michroma';
}

.companies {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: start;
}

.company-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  width: 150px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.company-card:hover {
  transform: translateY(-5px);
}

.company-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.company-name {
  text-align: center;
  font-size: 0.9rem;
  color: #666;
}

/* CARROSSEL DE IMAGENS */
.carousel-section {
  padding: 3rem;
  background: black;
  color: #e50914;
  font-family: 'Michroma';
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.carousel-header h2 {
  font-size: 1.8rem;
  margin: 0;
}

.carousel-indicator {
  background: rgba(229, 9, 20, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.carousel-container {
  position: relative;
  max-width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 1rem;
  background: #111;
}

.carousel-slide {
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.carousel-slide:hover {
  transform: scale(1.01);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 10;
}

.carousel-btn:hover:not(:disabled) {
  background: rgba(229, 9, 20, 0.9);
  transform: translateY(-50%) scale(1.1);
}

.carousel-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 10px;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.dot.active {
  background: #e50914;
  border-color: #e50914;
  transform: scale(1.2);
}

.dot:hover:not(.active) {
  background: rgba(255, 255, 255, 0.5);
}

.thumbnails-container {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
  scrollbar-width: thin;
  scrollbar-color: #e50914 #222;
}

.thumbnails-container::-webkit-scrollbar {
  height: 8px;
}

.thumbnails-container::-webkit-scrollbar-track {
  background: #222;
  border-radius: 4px;
}

.thumbnails-container::-webkit-scrollbar-thumb {
  background: #e50914;
  border-radius: 4px;
}

.thumbnail-wrapper {
  flex: 0 0 auto;
  width: 120px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s;
  opacity: 0.7;
}

.thumbnail-wrapper.active {
  border-color: #e50914;
  opacity: 1;
  transform: scale(1.05);
}

.thumbnail-wrapper:hover:not(.active) {
  opacity: 1;
  border-color: rgba(229, 9, 20, 0.5);
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* MODAL */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
  }

  to {
    transform: scale(1);
  }
}

.close-modal {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.close-modal:hover {
  transform: scale(1.2);
}

.modal-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
}
</style>
