#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerenciador de Proxies Gratuitos
Busca e valida proxies gratuitos automaticamente
"""

import requests
import time
import threading
from typing import List, Dict, Optional
from queue import Queue
import random


class ProxyManager:
    """Gerencia a busca e validação de proxies gratuitos"""
    
    def __init__(self, num_proxies_needed: int = 20):
        self.num_proxies_needed = num_proxies_needed
        self.proxies: List[Dict] = []
        self.validated_proxies: List[Dict] = []
        self.proxy_sources = [
            'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
            'https://www.proxy-list.download/api/v1/get?type=http',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
            'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
        ]
        
    def fetch_proxies_from_source(self, source_url: str) -> List[str]:
        """Busca proxies de uma fonte específica"""
        try:
            response = requests.get(source_url, timeout=10)
            if response.status_code == 200:
                proxies = response.text.strip().split('\n')
                return [p.strip() for p in proxies if p.strip() and ':' in p]
        except Exception as e:
            print(f"⚠️  Erro ao buscar de {source_url[:50]}: {str(e)}")
        return []
    
    def fetch_all_proxies(self):
        """Busca proxies de todas as fontes"""
        print("\n🔍 Buscando proxies gratuitos...")
        all_proxies = []
        
        for source in self.proxy_sources:
            proxies = self.fetch_proxies_from_source(source)
            all_proxies.extend(proxies)
            print(f"  ✓ Encontrados {len(proxies)} proxies")
        
        # Remover duplicatas
        all_proxies = list(set(all_proxies))
        print(f"\n📊 Total de proxies únicos: {len(all_proxies)}")
        
        # Converter para formato de dicionário
        for proxy_str in all_proxies:
            if ':' in proxy_str:
                parts = proxy_str.split(':')
                if len(parts) == 2:
                    self.proxies.append({
                        'ip': parts[0],
                        'port': parts[1],
                        'full': f"{parts[0]}:{parts[1]}"
                    })
    
    def validate_proxy(self, proxy: Dict, test_url: str = 'http://httpbin.org/ip', timeout: int = 15) -> bool: # TIMEOUT AUMENTADO para 15
        """Valida se um proxy funciona"""
        try:
            proxy_dict = {
                'http': f"http://{proxy['full']}",
                'https': f"http://{proxy['full']}"
            }
            response = requests.get(test_url, proxies=proxy_dict, timeout=timeout)
            return response.status_code == 200
        except:
            return False
    
    def validate_proxies_threaded(self, max_workers: int = 50):
        """Valida proxies usando threads para acelerar o processo"""
        print(f"\n🧪 Validando proxies (isto pode levar alguns minutos)...")
        print(f"   Testando até {max_workers} proxies simultaneamente...\n")
        
        validated_count = 0
        tested_count = 0
        lock = threading.Lock()
        
        def validate_worker(proxy):
            nonlocal validated_count, tested_count
            
            # Use o timeout de 15 segundos aqui
            if self.validate_proxy(proxy, timeout=15):
                with lock:
                    self.validated_proxies.append(proxy)
                    validated_count += 1
                    print(f"  ✅ Proxy válido #{validated_count}: {proxy['full']}")
                    
                    # Parar quando atingir o número necessário
                    if validated_count >= self.num_proxies_needed:
                        return True
            
            with lock:
                tested_count += 1
                if tested_count % 10 == 0:
                    print(f"  📊 Progresso: {tested_count} testados, {validated_count} válidos")
            
            return False
        
        # Embaralhar proxies para testar aleatoriamente
        random.shuffle(self.proxies)
        
        # Criar threads
        threads = []
        for i, proxy in enumerate(self.proxies):
            if validated_count >= self.num_proxies_needed:
                break
            
            thread = threading.Thread(target=validate_worker, args=(proxy,))
            thread.start()
            threads.append(thread)
            
            # Limitar número de threads simultâneas
            if len(threads) >= max_workers:
                threads[0].join()
                threads.pop(0)
        
        # Aguardar todas as threads finalizarem
        for thread in threads:
            thread.join()
        
        print(f"\n✅ Validação concluída: {validated_count} proxies válidos de {tested_count} testados\n")
    
    def get_proxies(self, num_proxies: int = None) -> List[Dict]:
        """Retorna lista de proxies validados"""
        if num_proxies:
            return self.validated_proxies[:num_proxies]
        return self.validated_proxies
    
    def get_proxy_for_selenium(self, proxy: Dict) -> str:
        """Retorna proxy no formato adequado para Selenium"""
        return proxy['full']
    
    def run(self) -> List[Dict]:
        """Executa o processo completo de busca e validação"""
        print("\n" + "="*60)
        print("🌐 GERENCIADOR DE PROXIES GRATUITOS")
        print("="*60)
        
        # Buscar proxies
        self.fetch_all_proxies()
        
        if not self.proxies:
            print("\n❌ Nenhum proxy encontrado. Verifique sua conexão.")
            return []
        
        # Validar proxies
        self.validate_proxies_threaded(max_workers=50)
        
        if len(self.validated_proxies) < self.num_proxies_needed:
            print(f"\n⚠️  Atenção: Apenas {len(self.validated_proxies)} proxies válidos encontrados.")
            print(f"   Necessário: {self.num_proxies_needed}")
            print(f"   Algumas janelas usarão o mesmo proxy ou sem proxy.\n")
        
        return self.validated_proxies


if __name__ == "__main__":
    # Teste standalone
    manager = ProxyManager(num_proxies_needed=20)
    proxies = manager.run()
    
    print("\n" + "="*60)
    print(f"📋 PROXIES VALIDADOS: {len(proxies)}")
    print("="*60)
    
    for i, proxy in enumerate(proxies, 1):
        print(f"{i}. {proxy['full']}")