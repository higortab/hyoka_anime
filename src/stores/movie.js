// src/stores/movie.js
import { reactive, computed } from 'vue';
import { defineStore } from 'pinia';
import api from '@/plugins/axios';

export const useMovieStore = defineStore('movie', () => {
  const state = reactive({
    currentMovie: {},
    currentMovieVideos: [],
    movieRecommendations: [],
    movieImages: {}, // Adicionado para armazenar imagens
  });

  // Getters
  const currentMovie = computed(() => state.currentMovie);
  const currentMovieVideos = computed(() => state.currentMovieVideos);
  const movieRecommendations = computed(() => state.movieRecommendations);
  const movieImages = computed(() => state.movieImages);

  // Actions
  const getMovieDetail = async (movieId) => {
    try {
      const response = await api.get(`movie/${movieId}`, {
        params: {
          append_to_response: 'release_dates' // Para obter a certificação (idade indicativa)
        }
      });
      state.currentMovie = response.data;
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      throw error;
    }
  };

  const getMovieVideos = async (movieId) => {
    try {
      const response = await api.get(`movie/${movieId}/videos`, {
        params: {
          language: 'pt-BR'
        }
      });
      state.currentMovieVideos = response.data.results;
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      // Não lançamos o erro para não quebrar a página se os vídeos falharem
    }
  };

  const getMovieRecommendations = async (movieId) => {
    try {
      const response = await api.get(`movie/${movieId}/recommendations`, {
        params: {
          language: 'pt-BR',
          page: 1
        }
      });
      state.movieRecommendations = response.data.results;
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
      // Não lançamos o erro para não quebrar a página se as recomendações falharem
    }
  };

  // NOVA FUNÇÃO: Buscar imagens do filme
  const getMovieImages = async (movieId) => {
    try {
      const response = await api.get(`movie/${movieId}/images`);
      state.movieImages = response.data;
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      // Se der erro, inicializa com estrutura vazia
      state.movieImages = { backdrops: [], posters: [], logos: [] };
    }
  };

  // Função para buscar todos os dados de uma vez
  const fetchAllMovieData = async (movieId) => {
    try {
      // Executa todas as requisições em paralelo para melhor performance
      await Promise.all([
        getMovieDetail(movieId),
        getMovieVideos(movieId),
        getMovieRecommendations(movieId),
        getMovieImages(movieId) // Adicionado para buscar imagens
      ]);
    } catch (error) {
      console.error('Erro ao buscar todos os dados do filme:', error);
      throw error;
    }
  };

  // Função para limpar o estado
  const clearCurrentMovie = () => {
    state.currentMovie = {};
    state.currentMovieVideos = [];
    state.movieRecommendations = [];
    state.movieImages = {};
  };

  return {
    // State (via getters)
    currentMovie,
    currentMovieVideos,
    movieRecommendations,
    movieImages,

    // Actions
    getMovieDetail,
    getMovieVideos,
    getMovieRecommendations,
    getMovieImages,
    fetchAllMovieData,
    clearCurrentMovie,
  };
});
