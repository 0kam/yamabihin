import { rest, RestRequest } from 'msw'
import { BihinType, Organization } from '../../types'
import { FIXED_PASSWORD } from '../../config'
import { PathParams } from 'msw'

interface LoginBody {
  username: string
  password: string
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

const mockBihins = [
  {
    id: 1,
    type: 'トラップカメラ' as BihinType,
    vendor: 'キヤノン',
    model_name: 'テストモデル1',
    who_bought: '筑波大学' as Organization,
    when_bought: '2025-01',
    why_bought: 'テスト用途',
    bought_memo: 'テストメモ1',
    who_wrote_this: 'testuser',
    when_wrote_this: '2025-03-22T00:00:00Z'
  },
  {
    id: 2,
    type: 'レンズ' as BihinType,
    vendor: 'ニコン',
    model_name: 'テストモデル2',
    who_bought: '北海道大学' as Organization,
    when_bought: '2025-02',
    why_bought: 'テスト用途2',
    bought_memo: 'テストメモ2',
    who_wrote_this: 'testuser',
    when_wrote_this: '2025-03-22T00:00:00Z'
  }
]

const mockMovements = [
  {
    id: 1,
    bihin_id: 1,
    when_moved: '2025-03-22',
    who_moved: 'testuser',
    why_moved: 'テスト移動',
    where_moved: 'テスト研究室',
    status_after_moved: '設置済み',
    moved_memo: 'テスト移動メモ',
    who_wrote_this: 'testuser',
    when_wrote_this: '2025-03-22T00:00:00Z'
  },
  {
    id: 2,
    bihin_id: 2,
    when_moved: '2025-03-23',
    who_moved: 'testuser',
    why_moved: 'テスト移動2',
    where_moved: 'テスト研究室2',
    status_after_moved: '設置済み',
    moved_memo: 'テスト移動メモ2',
    who_wrote_this: 'testuser',
    when_wrote_this: '2025-03-23T00:00:00Z'
  }
]

export const handlers = [
  // Auth関連ハンドラー
  rest.get(`${API_BASE_URL}/auth/session`, (req, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (username) {
      return res(ctx.status(200), ctx.json({ username }))
    }
    return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }))
  }),

  rest.post<LoginBody>(`${API_BASE_URL}/auth/login`, async (req, res, ctx) => {
    const { username, password } = req.body
    if (password === FIXED_PASSWORD) {
      localStorage.setItem('yamabihin_username', username)
      return res(ctx.status(200), ctx.json({ username }))
    }
    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }))
  }),

  // 備品関連ハンドラー
  rest.get(`${API_BASE_URL}/bihins`, (req, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const searchQuery = req.url.searchParams.get('q') || ''
    const filteredBihins = mockBihins.filter(bihin => 
      bihin.model_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bihin.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bihin.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return res(ctx.status(200), ctx.json(filteredBihins))
  }),

  rest.post(`${API_BASE_URL}/bihins`, async (req: any, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const data = req.body
    const newBihin = {
      id: mockBihins.length + 1,
      ...data,
      who_wrote_this: username,
      when_wrote_this: new Date().toISOString()
    }
    mockBihins.push(newBihin)
    return res(ctx.status(201), ctx.json({ data: newBihin }))
  }),

  rest.get(`${API_BASE_URL}/bihins/:id`, (req, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const { id } = req.params
    const bihin = mockBihins.find(b => b.id === parseInt(id as string))
    if (bihin) {
      return res(ctx.status(200), ctx.json(bihin))
    }
    return res(ctx.status(404))
  }),

  rest.put(`${API_BASE_URL}/bihins/:id`, async (req: any, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const { id } = req.params
    const data = req.body
    const index = mockBihins.findIndex(b => b.id === parseInt(id as string))
    
    if (index === -1) return res(ctx.status(404))

    mockBihins[index] = {
      ...mockBihins[index],
      ...data,
      who_wrote_this: username,
      when_wrote_this: new Date().toISOString()
    }
    
    return res(ctx.status(200), ctx.json({ data: mockBihins[index] }))
  }),

  rest.delete(`${API_BASE_URL}/bihins/:id`, (req, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const { id } = req.params
    const index = mockBihins.findIndex(b => b.id === parseInt(id as string))
    
    if (index === -1) return res(ctx.status(404))

    mockBihins.splice(index, 1)
    return res(ctx.status(200), ctx.json({ message: '備品を削除しました' }))
  }),

  // 移動履歴関連ハンドラー
  rest.get(`${API_BASE_URL}/bihins/:bihinId/movements`, (req, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const { bihinId } = req.params
    const movements = mockMovements.filter(m => m.bihin_id === parseInt(bihinId as string))
    return res(ctx.status(200), ctx.json(movements))
  }),

  rest.post(`${API_BASE_URL}/bihins/:bihinId/movements`, async (req: any, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const { bihinId } = req.params
    const data = req.body
    const newMovement = {
      id: mockMovements.length + 1,
      bihin_id: parseInt(bihinId as string),
      ...data,
      who_wrote_this: username,
      when_wrote_this: new Date().toISOString()
    }
    mockMovements.push(newMovement)
    return res(ctx.status(201), ctx.json({ data: newMovement }))
  }),

  rest.put(`${API_BASE_URL}/bihins/:bihinId/movements/:movementId`, async (req: any, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const { bihinId, movementId } = req.params
    const data = req.body
    const index = mockMovements.findIndex(
      m => m.id === parseInt(movementId as string) && m.bihin_id === parseInt(bihinId as string)
    )
    
    if (index === -1) return res(ctx.status(404))

    mockMovements[index] = {
      ...mockMovements[index],
      ...data,
      who_wrote_this: username,
      when_wrote_this: new Date().toISOString()
    }
    
    return res(ctx.status(200), ctx.json({ data: mockMovements[index] }))
  }),

  rest.delete(`${API_BASE_URL}/bihins/:bihinId/movements/:movementId`, (req, res, ctx) => {
    const username = localStorage.getItem('yamabihin_username')
    if (!username) return res(ctx.status(401))

    const { bihinId, movementId } = req.params
    const index = mockMovements.findIndex(
      m => m.id === parseInt(movementId as string) && m.bihin_id === parseInt(bihinId as string)
    )
    
    if (index === -1) return res(ctx.status(404))

    mockMovements.splice(index, 1)
    return res(ctx.status(200), ctx.json({ message: '移動履歴を削除しました' }))
  })
]