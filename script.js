document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-wrapper input');
    
    // Foco automático na barra de busca
    searchInput.focus();

    // ... (mantenha o restante do código de configurações e vídeo que já fizemos)
});

const video = document.getElementById('bg-video');

// Tentar dar play manualmente caso o navegador bloqueie
document.addEventListener('mouseover', () => {
    video.play();
}, { once: true }); // Dá play na primeira vez que você mexer o mouse

// Verificar se o vídeo deu erro
video.onerror = function() {
    console.error("Erro ao carregar o vídeo:", video.error);
    alert("O vídeo não pôde ser carregado. Verifique o console (F12).");
};