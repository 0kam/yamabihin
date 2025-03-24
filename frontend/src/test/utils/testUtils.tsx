import { act } from '@testing-library/react'

export const waitForChanges = async () => {
  // すべての非同期更新が完了するまで待機
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
  })
}

// ユーザーイベント後の状態更新を待機
export const waitForStateUpdate = async (callback: () => Promise<void>) => {
  await act(async () => {
    await callback()
    // 状態更新が完了するまで待機
    await new Promise(resolve => setTimeout(resolve, 0))
  })
}