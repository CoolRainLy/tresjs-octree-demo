import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import {setupStore} from "@/stores";

const app = createApp(App)

setupStore(app)

app.mount('#app')
