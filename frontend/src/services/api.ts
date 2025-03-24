import axios from 'axios'
import { Bihin, Movement } from '../types'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
})

// セッションの取得
export const checkSession = async () => {
  const response = await axiosInstance.get('/auth/session')
  return response.data
}

// ログイン
export const login = async (username: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', {
    username,
    password,
  })
  return response.data
}

// 備品関連のAPI
export const bihinApi = {
  async getAll() {
    const response = await axiosInstance.get<Bihin[]>('/bihins')
    return response.data
  },

  async create(data: Partial<Bihin>) {
    const response = await axiosInstance.post<{ data: Bihin }>('/bihins', data)
    return response.data
  },

  async getById(id: number) {
    const response = await axiosInstance.get<Bihin>(`/bihins/${id}`)
    return response.data
  },

  async update(id: number, data: Partial<Bihin>) {
    const response = await axiosInstance.put<{ data: Bihin }>(`/bihins/${id}`, data)
    return response.data
  },

  async delete(id: number) {
    const response = await axiosInstance.delete(`/bihins/${id}`)
    return response.data
  }
}

// 移動履歴関連のAPI
export const movementApi = {
  async getByBihinId(bihinId: number) {
    const response = await axiosInstance.get<Movement[]>(`/bihins/${bihinId}/movements`)
    return response.data
  },

  async create(bihinId: number, data: Partial<Movement>) {
    const response = await axiosInstance.post<{ data: Movement }>(
      `/bihins/${bihinId}/movements`,
      data
    )
    return response.data
  },

  async update(bihinId: number, movementId: number, data: Partial<Movement>) {
    const response = await axiosInstance.put<{ data: Movement }>(
      `/bihins/${bihinId}/movements/${movementId}`,
      data
    )
    return response.data
  },

  async delete(bihinId: number, movementId: number) {
    const response = await axiosInstance.delete(
      `/bihins/${bihinId}/movements/${movementId}`
    )
    return response.data
  }
}

// エクスポート用のエイリアス
export const {
  create: createBihin,
  update: updateBihin,
  delete: deleteBihin,
  getById: fetchBihin
} = bihinApi

export const {
  create: createMovement,
  update: updateMovement,
  delete: deleteMovement
} = movementApi