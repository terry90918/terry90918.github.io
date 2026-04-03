import { useSyncExternalStore } from 'react'

/**
 * 使用 useSyncExternalStore 安全地檢測是否在客戶端
 * 這是 React 官方推薦的方式，避免 hydration mismatch
 * 且不會觸發 react-hooks/set-state-in-effect 警告
 */
function subscribe() {
  // 不需要訂閱任何東西，因為 mounted 狀態不會改變
  return () => {}
}

function getSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

export function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
