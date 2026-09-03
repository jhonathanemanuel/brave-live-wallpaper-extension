document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.querySelector('.search-wrapper input');
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings');
    const settingsPanel = document.getElementById('settings-panel');
    const saveBtn = document.getElementById('save-settings');
    const wallpaperInput = document.getElementById('wallpaper-file');
    const toggleClock = document.getElementById('toggle-clock');
    const clockElement = document.getElementById('clock');
    const clockTime = document.getElementById('clock-time');
    const clockSeconds = document.getElementById('clock-seconds');
    const video = document.getElementById('bg-video');

    if (searchInput) searchInput.focus();

    // Abrir/Fechar Painel
    settingsBtn.addEventListener('click', () => settingsPanel.classList.remove('hidden'));
    closeSettingsBtn.addEventListener('click', () => settingsPanel.classList.add('hidden'));

    // Relógio
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        if (clockTime) clockTime.textContent = `${hours}:${minutes}`;
        if (clockSeconds) clockSeconds.textContent = `:${seconds}`;
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- GERENCIADOR DE ARQUIVOS (OPFS - LEITURA/ESCRITA INSTANTÂNEA) ---
    async function saveVideoFile(file) {
        const root = await navigator.storage.getDirectory();
        const fileHandle = await root.getFileHandle('custom_wallpaper.mp4', { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
    }

    async function loadVideoFile() {
        try {
            const root = await navigator.storage.getDirectory();
            const fileHandle = await root.getFileHandle('custom_wallpaper.mp4');
            const file = await fileHandle.getFile();
            return URL.createObjectURL(file);
        } catch (e) {
            return null; // Nenhum vídeo salvo ainda
        }
    }

    // 1. CARREGAR CONFIGURAÇÕES RAPIDAMENTE
    // Carrega o relógio em milissegundos do storage leve
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['showClock'], (result) => {
            if (result.showClock) {
                toggleClock.checked = true;
                clockElement.classList.remove('hidden-clock');
            } else {
                toggleClock.checked = false;
                clockElement.classList.add('hidden-clock');
            }
        });
    }

    // Carrega o vídeo direto do sistema de arquivos sem travar a interface
    const videoUrl = await loadVideoFile();
    if (videoUrl) {
        video.src = videoUrl;
        video.play().catch(e => console.log('Autoplay:', e));
    }

    // 2. SALVAR CONFIGURAÇÕES
    saveBtn.addEventListener('click', async () => {
        const file = wallpaperInput.files[0];
        const isClockVisible = toggleClock.checked;
        const originalText = saveBtn.textContent;

        saveBtn.disabled = true;
        saveBtn.textContent = 'Salvando...';

        // Atualização instantânea na tela
        if (isClockVisible) {
            clockElement.classList.remove('hidden-clock');
        } else {
            clockElement.classList.add('hidden-clock');
        }

        try {
            // Salva apenas a flag do relógio no storage leve
            await new Promise(resolve => chrome.storage.local.set({ showClock: isClockVisible }, resolve));

            // Se selecionou um novo arquivo, grava direto no disco local
            if (file) {
                await saveVideoFile(file);
                const newUrl = URL.createObjectURL(file);
                video.src = newUrl;
                video.play().catch(err => console.log(err));
                wallpaperInput.value = '';
            }

            saveBtn.textContent = 'Salvo! ✓';
            setTimeout(() => {
                settingsPanel.classList.add('hidden');
                resetBotao();
            }, 600);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            saveBtn.textContent = 'Erro!';
            resetBotao();
        }

        function resetBotao() {
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.textContent = originalText;
            }, 1000);
        }
    });
});