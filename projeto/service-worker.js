const CACHE_NAME = 'plantapp-cache-v2'; // Versão do cache
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/images/background-pattern.png', // Adicione o seu padrão de fundo
    '/images/icon-192.png',
    '/images/icon-512.png',
    // '/images/flower-icon.png' // Se você for usar este ícone, adicione aqui
];

// Evento de instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto, adicionando URLs...');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Falha ao adicionar URLs ao cache durante a instalação:', error);
            })
    );
});

// Evento de 'fetch' para servir arquivos do cache ou da rede
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se o recurso está no cache, retorna-o
                if (response) {
                    return response;
                }
                // Se não está no cache, faz a requisição normal à rede
                return fetch(event.request).catch(() => {
                    // Opcional: retornar uma página offline para navegações que não estão em cache
                    // return caches.match('/offline.html');
                });
            })
    );
});

// Evento de ativação para limpar caches antigos
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName); // Deleta caches antigos
                    }
                })
            );
        })
    );
});