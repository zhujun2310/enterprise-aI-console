import 'uno.css';
import '@unocss/reset/tailwind.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { permissionDirective } from './directives/permission';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.directive('permission', permissionDirective);
app.use(router);
app.mount('#app');
