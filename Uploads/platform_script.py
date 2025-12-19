#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scripts Específicos para cada Plataforma
Contém JavaScript para auto-skip de anúncios e prevenção de pausas
"""


class PlatformScripts:
    """Scripts JavaScript para automação em diferentes plataformas"""
    
    @staticmethod
    def get_youtube_scripts():
        """Scripts para YouTube"""
        return {
            'skip_ad': """
                // Skip de anúncios do YouTube
                (function() {
                    // Tentar clicar no botão de skip
                    var skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');
                    if (skipButton) {
                        skipButton.click();
                        console.log('✅ Anúncio pulado!');
                        return true;
                    }
                    
                    // Verificar se é anúncio não pulável
                    var adText = document.querySelector('.ytp-ad-text');
                    if (adText) {
                        console.log('⏳ Aguardando anúncio não pulável...');
                    }
                    
                    return false;
                })();
            """,
            
            'prevent_pause': """
                // Prevenir pausas por inatividade
                (function() {
                    var video = document.querySelector('video');
                    if (video && video.paused) {
                        video.play();
                        console.log('▶️  Vídeo retomado!');
                    }
                    
                    // Remover overlay de pausa
                    var pauseOverlay = document.querySelector('.ytp-pause-overlay');
                    if (pauseOverlay) {
                        pauseOverlay.style.display = 'none';
                    }
                })();
            """,
            
            'auto_unmute': """
                // Auto-unmute se necessário
                (function() {
                    var video = document.querySelector('video');
                    if (video && video.muted) {
                        video.muted = false;
                        video.volume = 0.3; // Volume baixo
                        console.log('🔊 Som ativado!');
                    }
                })();
            """,
            
            'simulate_activity': """
                // Simular atividade do usuário com RANDOMICIDADE (Anti-Detecção)
                (function() {
                    var x = Math.floor(Math.random() * window.innerWidth);
                    var y = Math.floor(Math.random() * window.innerHeight);

                    // Disparar movimento de mouse em posição aleatória
                    document.dispatchEvent(new MouseEvent('mousemove', {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y
                    }));

                    // Scroll aleatório (pequeno)
                    var scrollAmount = Math.random() < 0.5 ? 50 : -50;
                    window.scrollBy(0, scrollAmount);

                    console.log('✨ Atividade simulada: mouse e scroll aleatório.');
                })();
            """
        }
    
    @staticmethod
    def get_spotify_scripts():
        """Scripts para Spotify"""
        return {
            'prevent_pause': """
                // Prevenir pausas no Spotify
                (function() {
                    // Clicar em play se pausado
                    var playButton = document.querySelector('[data-testid="control-button-play"]');
                    if (playButton) {
                        playButton.click();
                        console.log('▶️  Spotify retomado!');
                    }
                    
                    // Verificar se há modal de inatividade
                    var modal = document.querySelector('[role="dialog"]');
                    if (modal) {
                        // Tentar encontrar botão de continuar
                        var continueBtn = modal.querySelector('button');
                        if (continueBtn && continueBtn.textContent.includes('Continuar')) {
                            continueBtn.click();
                            console.log('✅ Modal de inatividade fechado!');
                        }
                    }
                })();
            """,
            
            'accept_cookies': """
                // Aceitar cookies automaticamente
                (function() {
                    var acceptButton = document.querySelector('[id="onetrust-accept-btn-handler"]');
                    if (acceptButton) {
                        acceptButton.click();
                        console.log('🍪 Cookies aceitos!');
                    }
                })();
            """,
            
            'simulate_activity': """
                // Simular atividade com RANDOMICIDADE
                (function() {
                    var x = Math.floor(Math.random() * window.innerWidth);
                    var y = Math.floor(Math.random() * window.innerHeight);
                    
                    // Disparar movimento de mouse em posição aleatória
                    document.dispatchEvent(new MouseEvent('mousemove', {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y
                    }));
                    
                    console.log('✨ Atividade simulada: mouse aleatório.');
                })();
            """
        }
    
    @staticmethod
    def get_deezer_scripts():
        """Scripts para Deezer"""
        return {
            'prevent_pause': """
                // Prevenir pausas no Deezer
                (function() {
                    var playButton = document.querySelector('[aria-label="Play"], .svg-icon-play');
                    if (playButton) {
                        playButton.click();
                        console.log('▶️  Deezer retomado!');
                    }
                    
                    // Fechar modais
                    var closeButtons = document.querySelectorAll('[aria-label="Close"], .modal-close');
                    closeButtons.forEach(btn => btn.click());
                })();
            """,
            
            'accept_cookies': """
                // Aceitar cookies
                (function() {
                    var acceptButton = document.querySelector('[class*="accept"], [class*="agree"]');
                    if (acceptButton && acceptButton.textContent.includes('Accept')) {
                        acceptButton.click();
                        console.log('🍪 Cookies aceitos!');
                    }
                })();
            """,
            
            'simulate_activity': """
                // Simular atividade
                (function() {
                    document.dispatchEvent(new MouseEvent('click', {bubbles: true}));
                })();
            """
        }
    
    @staticmethod
    def get_tiktok_scripts():
        """Scripts para TikTok"""
        return {
            'prevent_pause': """
                // Prevenir pausas no TikTok
                (function() {
                    var videos = document.querySelectorAll('video');
                    videos.forEach(video => {
                        if (video.paused) {
                            video.play();
                            console.log('▶️  TikTok vídeo retomado!');
                        }
                    });
                })();
            """,
            
            'auto_scroll': """
                // Scroll automático para próximo vídeo
                (function() {
                    window.scrollBy(0, window.innerHeight);
                    console.log('📜 Scroll para próximo vídeo!');
                })();
            """,
            
            'simulate_activity': """
                // Simular atividade no TikTok
                (function() {
                    var video = document.querySelector('video');
                    if (video) {
                        video.dispatchEvent(new Event('playing'));
                    }
                })();
            """
        }
    
    @staticmethod
    def get_tidal_scripts():
        """Scripts para Tidal - NOVO"""
        return {
            'prevent_pause': """
                // Prevenir pausas no Tidal
                (function() {
                    // Clicar em play se pausado
                    var playButton = document.querySelector('[data-test="play-controls"], [data-type="button-play"], button[aria-label*="Play" i]');
                    if (playButton && playButton.getAttribute('aria-label')?.includes('Play')) {
                        playButton.click();
                        console.log('▶️  Tidal retomado!');
                    }
                    
                    // Verificar player de áudio
                    var audio = document.querySelector('audio');
                    if (audio && audio.paused) {
                        audio.play();
                        console.log('▶️  Tidal áudio retomado!');
                    }
                    
                    // Fechar modais de inatividade
                    var modal = document.querySelector('[role="dialog"], .modal');
                    if (modal) {
                        var continueBtn = modal.querySelector('button');
                        if (continueBtn) {
                            continueBtn.click();
                            console.log('✅ Modal fechado!');
                        }
                    }
                })();
            """,
            
            'accept_cookies': """
                // Aceitar cookies no Tidal
                (function() {
                    var acceptButton = document.querySelector('[id*="accept"], [class*="accept"], button[class*="cookie"]');
                    if (acceptButton) {
                        acceptButton.click();
                        console.log('🍪 Cookies aceitos!');
                    }
                })();
            """,
            
            'simulate_activity': """
                // Simular atividade no Tidal com RANDOMICIDADE
                (function() {
                    var x = Math.floor(Math.random() * window.innerWidth);
                    var y = Math.floor(Math.random() * window.innerHeight);
                    
                    document.dispatchEvent(new MouseEvent('mousemove', {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y
                    }));
                    
                    console.log('✨ Atividade simulada: mouse aleatório.');
                })();
            """
        }
    
    @staticmethod
    def get_apple_music_scripts():
        """Scripts para Apple Music / iTunes - NOVO"""
        return {
            'prevent_pause': """
                // Prevenir pausas no Apple Music
                (function() {
                    // Clicar em play se pausado
                    var playButton = document.querySelector('[data-testid="play-button"], button[aria-label*="Play" i], .playback-play');
                    if (playButton) {
                        playButton.click();
                        console.log('▶️  Apple Music retomado!');
                    }
                    
                    // Verificar player de áudio
                    var audio = document.querySelector('audio');
                    if (audio && audio.paused) {
                        audio.play();
                        console.log('▶️  Apple Music áudio retomado!');
                    }
                    
                    // Fechar alertas e modais
                    var closeButtons = document.querySelectorAll('[aria-label*="Close" i], .modal-close, .dialog-close');
                    closeButtons.forEach(btn => {
                        if (btn.offsetParent !== null) {
                            btn.click();
                        }
                    });
                })();
            """,
            
            'accept_cookies': """
                // Aceitar cookies no Apple Music
                (function() {
                    var acceptButton = document.querySelector('button[class*="accept"], button[class*="agree"]');
                    if (acceptButton) {
                        acceptButton.click();
                        console.log('🍪 Cookies aceitos!');
                    }
                })();
            """,
            
            'simulate_activity': """
                // Simular atividade no Apple Music com RANDOMICIDADE
                (function() {
                    var x = Math.floor(Math.random() * window.innerWidth);
                    var y = Math.floor(Math.random() * window.innerHeight);
                    
                    document.dispatchEvent(new MouseEvent('mousemove', {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y
                    }));
                    
                    // Scroll aleatório pequeno
                    var scrollAmount = Math.random() < 0.5 ? 30 : -30;
                    window.scrollBy(0, scrollAmount);
                    
                    console.log('✨ Atividade simulada: mouse e scroll aleatório.');
                })();
            """
        }
    
    @staticmethod
    def get_amazon_music_scripts():
        """Scripts para Amazon Music - NOVO"""
        return {
            'prevent_pause': """
                // Prevenir pausas no Amazon Music
                (function() {
                    // Clicar em play se pausado
                    var playButton = document.querySelector('[data-testid="play-button"], button[aria-label*="Play" i], .playbackControls__play');
                    if (playButton) {
                        playButton.click();
                        console.log('▶️  Amazon Music retomado!');
                    }
                    
                    // Verificar player de áudio
                    var audio = document.querySelector('audio');
                    if (audio && audio.paused) {
                        audio.play();
                        console.log('▶️  Amazon Music áudio retomado!');
                    }
                    
                    // Fechar modais e overlays
                    var closeButtons = document.querySelectorAll('[aria-label*="Close" i], .modal-close, button[class*="close"]');
                    closeButtons.forEach(btn => {
                        if (btn.offsetParent !== null) {
                            btn.click();
                        }
                    });
                })();
            """,
            
            'accept_cookies': """
                // Aceitar cookies no Amazon Music
                (function() {
                    var acceptButton = document.querySelector('[id*="accept"], button[name*="accept"], input[id*="accept-cookies"]');
                    if (acceptButton) {
                        acceptButton.click();
                        console.log('🍪 Cookies aceitos!');
                    }
                })();
            """,
            
            'simulate_activity': """
                // Simular atividade no Amazon Music com RANDOMICIDADE
                (function() {
                    var x = Math.floor(Math.random() * window.innerWidth);
                    var y = Math.floor(Math.random() * window.innerHeight);
                    
                    document.dispatchEvent(new MouseEvent('mousemove', {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y
                    }));
                    
                    console.log('✨ Atividade simulada: mouse aleatório.');
                })();
            """
        }
    
    @staticmethod
    def get_universal_scripts():
        """Scripts universais para qualquer site"""
        return {
            'close_popups': """
                // Fechar popups genéricos
                (function() {
                    var closeButtons = document.querySelectorAll('[class*="close"], [class*="dismiss"], [aria-label*="close" i]');
                    closeButtons.forEach(btn => {
                        if (btn.offsetParent !== null) { // Visível
                            btn.click();
                        }
                    });
                })();
            """,
            
            'remove_overlays': """
                // Remover overlays que bloqueiam interação
                (function() {
                    var overlays = document.querySelectorAll('[class*="overlay"], [class*="modal-backdrop"]');
                    overlays.forEach(overlay => overlay.remove());
                })();
            """
        }
    
    @staticmethod
    def get_scripts_for_url(url: str):
        """Retorna os scripts apropriados baseado na URL"""
        url_lower = url.lower()
        
        if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
            return PlatformScripts.get_youtube_scripts()
        elif 'spotify.com' in url_lower:
            return PlatformScripts.get_spotify_scripts()
        elif 'deezer.com' in url_lower:
            return PlatformScripts.get_deezer_scripts()
        elif 'tiktok.com' in url_lower:
            return PlatformScripts.get_tiktok_scripts()
        elif 'tidal.com' in url_lower:
            return PlatformScripts.get_tidal_scripts()
        elif 'music.apple.com' in url_lower or 'itunes.apple.com' in url_lower:
            return PlatformScripts.get_apple_music_scripts()
        elif 'music.amazon.com' in url_lower or 'amazon.com/music' in url_lower:
            return PlatformScripts.get_amazon_music_scripts()
        else:
            return PlatformScripts.get_universal_scripts()