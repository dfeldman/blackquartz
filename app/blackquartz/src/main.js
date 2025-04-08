import { createApp } from 'vue'
import App from './App.vue'
import './assets/css/styles.css'


let app = createApp(App)

app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err);
    console.error('Component:', vm);
    console.error('Info:', info);
  }

app.mount('#app')

