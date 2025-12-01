<script setup>
import { useRoute } from 'vue-router';
import { useTvStore } from '@/stores/tv';
import { onMounted, ref } from 'vue';

const route = useRoute();
const tvStore = useTvStore();
const isLoading = ref(false);

onMounted(async () => {
  const tvId = route.params.id;
  isLoading.value = true;
  await tvStore.getTvDetail(tvId);
  isLoading.value = false;
});
</script>

<template>
  <div class="main">
    <div class="content">
      <img
        :src="`https://image.tmdb.org/t/p/w185${tvStore.currentTv.poster_path}`"
        :alt="tvStore.currentTv.name"
      />

      <div class="details">
        <h1>Série: {{ tvStore.currentTv.name }}</h1> <!-- Alterado para name -->
        <p>{{ tvStore.currentTv.tagline }}</p>
        <p>{{ tvStore.currentTv.overview }}</p>
        <!-- Séries não têm orçamento, então adicionei informações relevantes -->
        <p v-if="tvStore.currentTv.number_of_seasons">
          Temporadas: {{ tvStore.currentTv.number_of_seasons }}
        </p>
        <p v-if="tvStore.currentTv.number_of_episodes">
          Episódios: {{ tvStore.currentTv.number_of_episodes }}
        </p>
        <p v-if="tvStore.currentTv.first_air_date">
          Estreia: {{ tvStore.currentTv.first_air_date }}
        </p>
        <p v-if="tvStore.currentTv.last_air_date">
          Último episódio: {{ tvStore.currentTv.last_air_date }}
        </p>
        <p v-if="tvStore.currentTv.status">
          Status: {{ tvStore.currentTv.status }}
        </p>
        <p>Avaliação: {{ tvStore.currentTv.vote_average }}</p>
      </div>
    </div>
  </div>
</template>
