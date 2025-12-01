import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useTvStore = defineStore('tv', {
  state: () => ({
    currentTv: {},
    tvImages: {},
    isLoading: false,
    error: null
  }),

  actions: {
    async fetchAllTvData(tvId) {
      this.isLoading = true
      this.error = null

      try {
        // Busca dados da série
        const tvResponse = await api.get(`tv/${tvId}`, {
          params: {
            language: 'pt-BR'
          }
        })
        this.currentTv = tvResponse.data

        // Busca content ratings separadamente
        const ratingsResponse = await api.get(`tv/${tvId}/content_ratings`)
        this.currentTv.content_ratings = ratingsResponse.data

        // Busca imagens
        await this.fetchTvImages(tvId)

        console.log('Dados carregados:', this.currentTv)

      } catch (error) {
        console.error('Erro ao buscar dados da série:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async fetchTvImages(tvId) {
      try {
        const response = await api.get(`tv/${tvId}/images`)
        this.tvImages = response.data
      } catch (error) {
        console.error('Erro ao buscar imagens:', error)
        this.tvImages = {}
      }
    },

    clearCurrentTv() {
      this.currentTv = {}
      this.tvImages = {}
      this.isLoading = false
      this.error = null
    }
  },

  getters: {
    // Getters opcionais para facilitar acesso
    getGenres: (state) => state.currentTv.genres || [],
    getBackdropUrl: (state) => state.currentTv.backdrop_path
      ? `https://image.tmdb.org/t/p/original${state.currentTv.backdrop_path}`
      : null,
    getPosterUrl: (state) => state.currentTv.poster_path
      ? `https://image.tmdb.org/t/p/w500${state.currentTv.poster_path}`
      : null
  }
})
