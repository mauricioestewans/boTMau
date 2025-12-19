#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de Sincronização de Navegadores - VERSÃO MELHORADA (ANTI-DETECÇÃO)
Com suporte para múltiplas plataformas e proxies privados
"""

import os
import sys
import time
import threading
import tempfile
import shutil
from queue import Queue
import random
from typing import List, Optional, Dict
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import WebDriverException

# Importar módulos auxiliares
from proxy_manager import ProxyManager
from platform_script import PlatformScripts

# CONFIGURAÇÕES
NUM_INSTANCES = 20
PAGE_LOAD_TIMEOUT = 60
# Intervalo de tempo aleatório entre 15 e 30 segundos
AD_SKIP_INTERVAL_RANGE = (15, 30) 
ACTIVITY_INTERVAL = 30 

# USER AGENTS
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

# URLs DE EXEMPLO PARA CADA PLATAFORMA
PLATFORM_URLS = {
    'spotify': 'https://open.spotify.com/intl-pt/album/6n8qNc6gVcj3jEJAIME00Q',
    'youtube': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'deezer': 'https://www.deezer.com/br/album/302127',
    'tiktok': 'https://www.tiktok.com/@spotify',
    'tidal': 'https://listen.tidal.com/album/251380836',
    'apple_music': 'https://music.apple.com/us/album/1440933267',
    'amazon_music': 'https://music.amazon.com/albums/B0CXQY3X3X',
}


class BrowserInstance:
    """Representa uma instância individual do navegador"""

    def __init__(self, instance_id, user_agent, proxy=None):
        self.instance_id = instance_id
        self.user_agent = user_agent
        self.proxy = proxy
        self.driver = None
        self.temp_dir = None
        self.is_running = False
        self.current_url = ""
        self.automation_thread = None
        self.stop_automation = False

    def start(self, start_url):
        try:
            self.temp_dir = tempfile.mkdtemp(prefix=f"browser_{self.instance_id}_")

            chrome_options = Options()
            chrome_options.add_argument(f"--user-agent={self.user_agent}")
            chrome_options.add_argument(f"--user-data-dir={self.temp_dir}")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_argument("--mute-audio")

            # OPÇÕES ANTI-DETECÇÃO
            chrome_options.add_argument("window-size=1280,720")
            chrome_options.add_argument("--disable-infobars")
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            # FIM DAS OPÇÕES ANTI-DETECÇÃO
            
            # Proxy
            if self.proxy:
                if self.proxy.get('type') == 'private':
                    # Proxy com autenticação
                    proxy_url = f"http://{self.proxy['username']}:{self.proxy['password']}@{self.proxy['ip']}:{self.proxy['port']}"
                    chrome_options.add_argument(f"--proxy-server={proxy_url}")
                    print(f"🔐 Janela {self.instance_id}: Proxy Privado {self.proxy['ip']}:{self.proxy['port']}")
                else:
                    # Proxy sem autenticação
                    chrome_options.add_argument(f"--proxy-server=http://{self.proxy['ip']}:{self.proxy['port']}")
                    print(f"🌐 Janela {self.instance_id}: Proxy {self.proxy['ip']}:{self.proxy['port']}")
            else:
                print(f"⚠️ Janela {self.instance_id}: Sem proxy")

            # Iniciar driver
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
            
            # Injetar script anti-detecção
            self.inject_stealth_script()
            
            self.driver.get(start_url)
            self.current_url = start_url

            self.is_running = True
            self.start_automation_thread()

            print(f"✓ Janela {self.instance_id} iniciada")
            return True

        except Exception as e:
            print(f"✗ Erro na janela {self.instance_id}: {e}")
            self.cleanup()
            return False

    def inject_stealth_script(self):
        """Injeta script para evitar detecção de automação"""
        stealth_script = """
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
        
        window.navigator.chrome = {
            runtime: {}
        };
        
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5]
        });
        
        Object.defineProperty(navigator, 'languages', {
            get: () => ['pt-BR', 'pt', 'en-US', 'en']
        });
        """
        try:
            self.driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
                'source': stealth_script
            })
        except:
            pass

    def start_automation_thread(self):
        def automation_loop():
            while not self.stop_automation and self.is_running:
                try:
                    scripts = PlatformScripts.get_scripts_for_url(self.current_url)
                    for code in scripts.values():
                        self.execute_script(code)
                    
                    # Tempo de espera aleatório para quebrar a sincronização
                    sleep_time = random.uniform(AD_SKIP_INTERVAL_RANGE[0], AD_SKIP_INTERVAL_RANGE[1])
                    time.sleep(sleep_time)
                except:
                    pass

        self.automation_thread = threading.Thread(target=automation_loop, daemon=True)
        self.automation_thread.start()

    def navigate(self, url):
        if self.driver and self.is_running:
            try:
                self.driver.get(url)
                self.current_url = url
                return True
            except:
                return False
        return False

    def execute_script(self, script):
        try:
            if self.driver and self.is_running:
                return self.driver.execute_script(script)
        except:
            return False

    def cleanup(self):
        self.stop_automation = True
        try:
            if self.driver:
                self.driver.quit()
        except:
            pass

        if self.temp_dir:
            shutil.rmtree(self.temp_dir, ignore_errors=True)

        self.is_running = False


class BrowserSync:
    def __init__(self, num_instances, use_proxies=True, use_private_proxies=True, use_free_proxies=False):
        self.num_instances = num_instances
        self.use_proxies = use_proxies
        self.use_private_proxies = use_private_proxies
        self.use_free_proxies = use_free_proxies
        self.instances = []
        self.proxies = []

    def fetch_proxies(self):
        if not self.use_proxies:
            print("⚠️ Modo sem proxies")
            return

        manager = ProxyManager(
            self.num_instances, 
            use_private_proxies=self.use_private_proxies,
            use_free_proxies=self.use_free_proxies
        )
        self.proxies = manager.run()

        if not self.proxies:
            print("⚠️ Nenhum proxy encontrado. Continuando sem proxies.")
            self.use_proxies = False

    def start_all_instances(self, start_url):
        if self.use_proxies:
            self.fetch_proxies()

        print(f"\n🚀 Iniciando {self.num_instances} janelas...")

        for i in range(1, self.num_instances + 1):
            proxy = self.proxies[i - 1] if self.proxies and i <= len(self.proxies) else None
            user_agent = USER_AGENTS[(i - 1) % len(USER_AGENTS)]
            inst = BrowserInstance(i, user_agent, proxy)
            self.instances.append(inst)

            t = threading.Thread(target=inst.start, args=(start_url,))
            t.start()

        time.sleep(3)
        print(f"\n✅ {len(self.instances)} janelas iniciadas com sucesso!\n")

    def navigate_all(self, url):
        print(f"\n📍 Navegando todas as janelas para: {url}")
        for inst in self.instances:
            inst.navigate(url)
        print("✅ Navegação concluída!\n")

    def close_all(self):
        print("\n🔴 Fechando todas as janelas...")
        for inst in self.instances:
            inst.cleanup()
        print("✅ Todas as janelas fechadas!\n")


def show_menu():
    """Exibe o menu principal"""
    print("\n" + "="*70)
    print("🎵 SISTEMA DE AUTOMAÇÃO DE STREAMING - MULTI-PLATAFORMA")
    print("="*70)
    print("\n📋 PLATAFORMAS DISPONÍVEIS:")
    print("  1. 🎵 Spotify")
    print("  2. 🎥 YouTube")
    print("  3. 🎶 Deezer")
    print("  4. 📱 TikTok")
    print("  5. 🌊 Tidal")
    print("  6. 🍎 Apple Music / iTunes")
    print("  7. 📦 Amazon Music")
    print("  8. 🔗 URL Personalizada")
    print("  9. ❌ Sair")
    print("="*70)


def get_platform_choice():
    """Obtém a escolha da plataforma do usuário"""
    while True:
        try:
            choice = input("\n👉 Escolha uma plataforma (1-9): ").strip()
            if choice in ['1', '2', '3', '4', '5', '6', '7', '8', '9']:
                return choice
            else:
                print("❌ Opção inválida! Escolha um número entre 1 e 9.")
        except KeyboardInterrupt:
            print("\n\n👋 Programa interrompido pelo usuário.")
            sys.exit(0)


def get_start_url(choice):
    """Retorna a URL inicial baseada na escolha"""
    url_map = {
        '1': PLATFORM_URLS['spotify'],
        '2': PLATFORM_URLS['youtube'],
        '3': PLATFORM_URLS['deezer'],
        '4': PLATFORM_URLS['tiktok'],
        '5': PLATFORM_URLS['tidal'],
        '6': PLATFORM_URLS['apple_music'],
        '7': PLATFORM_URLS['amazon_music'],
    }
    
    if choice == '8':
        url = input("\n🔗 Digite a URL personalizada: ").strip()
        return url if url.startswith('http') else f"https://{url}"
    
    return url_map.get(choice, PLATFORM_URLS['spotify'])


def configure_proxies():
    """Configura o uso de proxies"""
    print("\n" + "="*70)
    print("🌐 CONFIGURAÇÃO DE PROXIES")
    print("="*70)
    print("  1. 🔐 Usar apenas proxies privados (Recomendado)")
    print("  2. 🆓 Usar apenas proxies gratuitos")
    print("  3. 🔄 Usar ambos (privados + gratuitos)")
    print("  4. ❌ Não usar proxies")
    print("="*70)
    
    while True:
        choice = input("\n👉 Escolha uma opção (1-4): ").strip()
        if choice == '1':
            return True, True, False
        elif choice == '2':
            return True, False, True
        elif choice == '3':
            return True, True, True
        elif choice == '4':
            return False, False, False
        else:
            print("❌ Opção inválida! Escolha um número entre 1 e 4.")


def main():
    """Função principal"""
    print("\n" + "="*70)
    print("🚀 BEM-VINDO AO SISTEMA DE AUTOMAÇÃO DE STREAMING")
    print("="*70)
    
    # Configurar proxies
    use_proxies, use_private, use_free = configure_proxies()
    
    # Configurar número de instâncias
    while True:
        try:
            num_inst = input(f"\n📊 Quantas janelas deseja abrir? (padrão: {NUM_INSTANCES}): ").strip()
            num_instances = int(num_inst) if num_inst else NUM_INSTANCES
            if num_instances > 0:
                break
            else:
                print("❌ O número deve ser maior que 0!")
        except ValueError:
            print("❌ Digite um número válido!")
    
    # Mostrar menu e obter escolha
    show_menu()
    choice = get_platform_choice()
    
    if choice == '9':
        print("\n👋 Até logo!")
        return
    
    # Obter URL inicial
    start_url = get_start_url(choice)
    
    platform_names = {
        '1': 'Spotify',
        '2': 'YouTube',
        '3': 'Deezer',
        '4': 'TikTok',
        '5': 'Tidal',
        '6': 'Apple Music',
        '7': 'Amazon Music',
        '8': 'URL Personalizada'
    }
    
    print(f"\n✅ Plataforma selecionada: {platform_names.get(choice, 'Desconhecida')}")
    print(f"🔗 URL: {start_url}")
    
    # Iniciar sistema
    sync = BrowserSync(
        num_instances, 
        use_proxies=use_proxies,
        use_private_proxies=use_private,
        use_free_proxies=use_free
    )
    sync.start_all_instances(start_url)
    
    # Loop de comandos
    print("\n" + "="*70)
    print("💡 COMANDOS DISPONÍVEIS:")
    print("  - Digite uma URL para navegar todas as janelas")
    print("  - Digite 'menu' para ver as plataformas novamente")
    print("  - Digite 'sair' para fechar o programa")
    print("="*70)
    
    while True:
        try:
            cmd = input("\n>>> ").strip().lower()
            
            if cmd == "sair":
                break
            elif cmd == "menu":
                show_menu()
                choice = get_platform_choice()
                if choice == '9':
                    break
                url = get_start_url(choice)
                sync.navigate_all(url)
            elif cmd.startswith("http"):
                sync.navigate_all(cmd)
            elif cmd:
                print("❌ Comando não reconhecido. Digite uma URL, 'menu' ou 'sair'.")
        except KeyboardInterrupt:
            print("\n")
            break
    
    sync.close_all()
    print("\n👋 Programa encerrado com sucesso!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Programa interrompido pelo usuário.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        sys.exit(1)