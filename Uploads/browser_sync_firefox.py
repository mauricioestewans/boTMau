#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de Sincronização de Navegadores - VERSÃO FIREFOX
Com suporte para múltiplas plataformas e proxies privados
"""

import os
import sys
import time
import threading
import tempfile
import shutil
import random
from typing import List, Optional, Dict

from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.common.exceptions import WebDriverException

from proxy_manager import ProxyManager
from platform_script import PlatformScripts

# CONFIGURAÇÕES
NUM_INSTANCES = 20
PAGE_LOAD_TIMEOUT = 60
AD_SKIP_INTERVAL_RANGE = (15, 30)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0",
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
]

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
    """Representa uma instância individual do navegador (Firefox)"""

    def __init__(self, instance_id: int, user_agent: str, proxy: Optional[Dict] = None):
        self.instance_id = instance_id
        self.user_agent = user_agent
        self.proxy = proxy
        self.driver: Optional[webdriver.Firefox] = None
        self.temp_dir: Optional[str] = None
        self.is_running = False
        self.current_url = ""
        self.automation_thread: Optional[threading.Thread] = None
        self.stop_automation = False

    def start(self, start_url: str) -> bool:
        try:
            self.temp_dir = tempfile.mkdtemp(prefix=f"ff_{self.instance_id}_")

            options = FirefoxOptions()
            options.set_preference("general.useragent.override", self.user_agent)

            # Reduzir detecção de Selenium
            options.set_preference("dom.webdriver.enabled", False)
            options.set_preference("useautomationextension", False)

            # Mutar áudio
            options.set_preference("media.volume_scale", "0.0")

            # Perfil temporário
            options.set_preference("browser.cache.disk.enable", False)
            options.set_preference("browser.cache.memory.enable", True)
            options.set_preference("browser.privatebrowsing.autostart", True)

            # Proxy
            if self.proxy:
                ip = self.proxy["ip"]
                port = int(self.proxy["port"])
                print(f"[DEBUG] Firefox Janela {self.instance_id} usando proxy {ip}:{port}")

                options.set_preference("network.proxy.type", 1)  # manual
                # HTTP
                options.set_preference("network.proxy.http", ip)
                options.set_preference("network.proxy.http_port", port)
                # HTTPS
                options.set_preference("network.proxy.ssl", ip)
                options.set_preference("network.proxy.ssl_port", port)
                
                # Se tiver username/password, tentar SOCKS5 com autenticação
                if self.proxy.get("username") and self.proxy.get("password"):
                    print(f"[DEBUG] Tentando SOCKS5 com autenticação para janela {self.instance_id}")
                    options.set_preference("network.proxy.socks", ip)
                    options.set_preference("network.proxy.socks_port", port)
                    options.set_preference("network.proxy.socks_username", self.proxy["username"])
                    options.set_preference("network.proxy.socks_password", self.proxy["password"])
                    options.set_preference("network.proxy.socks_version", 5)
            else:
                options.set_preference("network.proxy.type", 0)  # sem proxy

            service = FirefoxService()
            self.driver = webdriver.Firefox(service=service, options=options)
            self.driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)

            self.driver.get(start_url)
            self.current_url = start_url

            self.is_running = True
            self.start_automation_thread()

            print(f"✓ Janela {self.instance_id} iniciada (Firefox)")
            return True

        except Exception as e:
            print(f"✗ Erro na janela {self.instance_id} (Firefox): {e}")
            self.cleanup()
            return False

    def start_automation_thread(self):
        def automation_loop():
            while not self.stop_automation and self.is_running:
                try:
                    scripts = PlatformScripts.get_scripts_for_url(self.current_url)
                    for code in scripts.values():
                        self.execute_script(code)

                    sleep_time = random.uniform(*AD_SKIP_INTERVAL_RANGE)
                    time.sleep(sleep_time)
                except Exception:
                    pass

        self.automation_thread = threading.Thread(target=automation_loop, daemon=True)
        self.automation_thread.start()

    def navigate(self, url: str) -> bool:
        if self.driver and self.is_running:
            try:
                self.driver.get(url)
                self.current_url = url
                return True
            except Exception:
                return False
        return False

    def execute_script(self, script: str):
        try:
            if self.driver and self.is_running:
                return self.driver.execute_script(script)
        except Exception:
            return False

    def cleanup(self):
        self.stop_automation = True
        try:
            if self.driver:
                self.driver.quit()
        except Exception:
            pass

        if self.temp_dir:
            shutil.rmtree(self.temp_dir, ignore_errors=True)

        self.is_running = False


class BrowserSync:
    def __init__(self, num_instances: int, use_proxies=True, use_private_proxies=True, use_free_proxies=False):
        self.num_instances = num_instances
        self.use_proxies = use_proxies
        self.use_private_proxies = use_private_proxies
        self.use_free_proxies = use_free_proxies
        self.instances: List[BrowserInstance] = []
        self.proxies: List[Dict] = []

    def fetch_proxies(self):
        if not self.use_proxies:
            print("⚠️  Modo sem proxies")
            return

        manager = ProxyManager(
            self.num_instances,
            use_private_proxies=self.use_private_proxies,
            use_free_proxies=self.use_free_proxies,
        )
        self.proxies = manager.run()

        if not self.proxies:
            print("⚠️  Nenhum proxy encontrado. Continuando sem proxies.")
            self.use_proxies = False

    def start_all_instances(self, start_url: str):
        if self.use_proxies:
            self.fetch_proxies()

        print(f"\n🚀 Iniciando {self.num_instances} janelas (Firefox)...")

        for i in range(1, self.num_instances + 1):
            proxy = self.proxies[i - 1] if self.proxies and i <= len(self.proxies) else None
            user_agent = USER_AGENTS[(i - 1) % len(USER_AGENTS)]
            inst = BrowserInstance(i, user_agent, proxy)
            self.instances.append(inst)

            t = threading.Thread(target=inst.start, args=(start_url,))
            t.start()
            time.sleep(0.5)

        time.sleep(3)
        print(f"\n✅ {len(self.instances)} janelas iniciadas com sucesso! (Firefox)\n")

    def navigate_all(self, url: str):
        print(f"\n📍 Navegando todas as janelas para: {url}")
        for inst in self.instances:
            inst.navigate(url)
        print("✅ Navegação concluída!\n")

    def close_all(self):
        print("\n🔴 Fechando todas as janelas (Firefox)...")
        for inst in self.instances:
            inst.cleanup()
        print("✅ Todas as janelas fechadas!\n")


def show_menu():
    print("\n" + "=" * 70)
    print("🎵 SISTEMA DE AUTOMAÇÃO DE STREAMING - MULTI-PLATAFORMA (FIREFOX)")
    print("=" * 70)
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
    print("=" * 70)


def get_platform_choice() -> str:
    while True:
        try:
            choice = input("\n👉 Escolha uma plataforma (1-9): ").strip()
            if choice in [str(i) for i in range(1, 10)]:
                return choice
            else:
                print("❌ Opção inválida! Escolha um número entre 1 e 9.")
        except KeyboardInterrupt:
            print("\n\n👋 Programa interrompido pelo usuário.")
            sys.exit(0)


def get_start_url(choice: str) -> str:
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
    print("\n" + "=" * 70)
    print("🌐 CONFIGURAÇÃO DE PROXIES (FIREFOX)")
    print("=" * 70)
    print("  1. 🔐 Usar apenas proxies privados (Recomendado)")
    print("  2. 🆓 Usar apenas proxies gratuitos")
    print("  3. 🔄 Usar ambos (privados + gratuitos)")
    print("  4. ❌ Não usar proxies")
    print("=" * 70)

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
    print("\n" + "=" * 70)
    print("🚀 BEM-VINDO AO SISTEMA DE AUTOMAÇÃO DE STREAMING (FIREFOX)")
    print("=" * 70)

    use_proxies, use_private, use_free = configure_proxies()

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

    show_menu()
    choice = get_platform_choice()

    if choice == '9':
        print("\n👋 Até logo!")
        return

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

    sync = BrowserSync(
        num_instances,
        use_proxies=use_proxies,
        use_private_proxies=use_private,
        use_free_proxies=use_free
    )
    sync.start_all_instances(start_url)

    print("\n" + "=" * 70)
    print("💡 COMANDOS DISPONÍVEIS:")
    print("  - Digite uma URL para navegar todas as janelas")
    print("  - Digite 'menu' para ver as plataformas novamente")
    print("  - Digite 'sair' para fechar o programa")
    print("=" * 70)

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