import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 배포할 때마다 새 빌드 파일명이 생기는데, 그 사이에 이 탭이 예전 index.html을 그대로
// 들고 있으면 페이지 이동 시 "이제 없는 파일"을 불러오려다 실패합니다(Member/News 등
// 자주 재배포한 페이지에서 간헐적으로 겪는 그 증상). Vite가 이런 경우 쏘는
// vite:preloadError를 잡아서, 한 번만 강제로 새로고침해 최신 파일을 받아오게 합니다.
window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem('reloaded-after-chunk-error')) return
  sessionStorage.setItem('reloaded-after-chunk-error', '1')
  window.location.reload()
})

createApp(App).use(router).mount('#app')
