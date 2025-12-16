#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sistema de Sincronização de Navegadores - VERSÃO MELHORADA (ANTI-DETECÇÃO)
"""

import os
import sys
import time
import threading
import tempfile
import shutil
from queue import Queue
import random # NOVO: Importa o módulo random
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
START_URL = "https://open.spotify.com/intl-pt/album/6n8qNc6gVcj3jEJAIME00Q"
PAGE_LOAD_TIMEOUT = 60
# NOVO: Intervalo de tempo aleatório entre 15 e 30 segundos
AD_SKIP_INTERVAL_RANGE = (15, 30) 
ACTIVITY_INTERVAL = 30 

# USER AGENTS
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
]

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

    def start(self):
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
                chrome_options.add_argument(f"--proxy-server=http://{self.proxy['ip']}:{self.proxy['port']}")
                print(f"🌐 Janela {self.instance_id}: Proxy {self.proxy['ip']}:{self.proxy['port']}")
            else:
                print(f"⚠️ Janela {self.instance_id}: Sem proxy")

            # Iniciar driver
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
            self.driver.get(START_URL)

            self.is_running = True
            self.start_automation_thread()

            print(f"✓ Janela {self.instance_id} iniciada")
            return True

        except Exception as e:
            print(f"✗ Erro na janela {self.instance_id}: {e}")
            self.cleanup()
            return False

    def start_automation_thread(self):
        def automation_loop():
            while not self.stop_automation and self.is_running:
                try:
                    scripts = PlatformScripts.get_scripts_for_url(self.current_url)
                    for code in scripts.values():
                        self.execute_script(code)
                    
                    # ⚠️ NOVO: Tempo de espera aleatório para quebrar a sincronização
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
    def __init__(self, num_instances, use_proxies=True):
        self.num_instances = num_instances
        self.use_proxies = use_proxies
        self.instances = []
        self.proxies = []

    def fetch_proxies(self):
        if not self.use_proxies:
            print("⚠️ Modo sem proxies")
            return

        manager = ProxyManager(self.num_instances)
        self.proxies = manager.run()

        if not self.proxies:
            print("⚠️ Nenhum proxy encontrado. Continuando sem proxies.")
            self.use_proxies = False

    def start_all_instances(self):
        if self.use_proxies:
            self.fetch_proxies()

        print(f"🚀 Iniciando {self.num_instances} janelas...")

        for i in range(1, self.num_instances + 1):
            proxy = self.proxies[i - 1] if self.proxies and i <= len(self.proxies) else None
            user_agent = USER_AGENTS[(i - 1) % len(USER_AGENTS)]
            inst = BrowserInstance(i, user_agent, proxy)
            self.instances.append(inst)

            t = threading.Thread(target=inst.start)
            t.start()

        time.sleep(3)

    def navigate_all(self, url):
        print(f"📍 Navegando todas as janelas: {url}")
        for inst in self.instances:
            inst.navigate(url)

    def close_all(self):
        print("🔴 Fechando janelas...")
        for inst in self.instances:
            inst.cleanup()


def main():
    sync = BrowserSync(NUM_INSTANCES)
    sync.start_all_instances()

    print("Escreva 'sair' para fechar.")
    while True:
        cmd = input(">>> ").strip().lower()
        if cmd == "sair":
            break
        elif cmd.startswith("http"):
            sync.navigate_all(cmd)

    sync.close_all()


if __name__ == "__main__":
    main()