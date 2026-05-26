import { watchEffect, isRef } from 'vue'

export function usePageTitle(title) {
  watchEffect(() => {
    const titleVal = isRef(title) ? title.value : title
    if (titleVal) {
      document.title = `StackMatch — ${titleVal}`
    } else {
      document.title = 'StackMatch'
    }
  })
}

export default usePageTitle
