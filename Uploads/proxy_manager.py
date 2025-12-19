#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerenciador de Proxies (Privados e Gratuitos)
Suporta proxies privados com autenticação e proxies gratuitos
"""

import requests
import time
import threading
from typing import List, Dict, Optional
from queue import Queue
import random


class ProxyManager:
    """Gerencia proxies privados e gratuitos"""
    
    def __init__(self, num_proxies_needed: int = 20, use_private_proxies: bool = True, use_free_proxies: bool = False):
        self.num_proxies_needed = num_proxies_needed
        self.use_private_proxies = use_private_proxies
        self.use_free_proxies = use_free_proxies
        self.proxies: List[Dict] = []
        self.validated_proxies: List[Dict] = []
        
        # Lista de proxies privados (formato: ip:porta:usuario:senha)
        self.private_proxies_raw = [
            "9.142.47.176:6345:uoycexqe:mphbbv5emc22",
            "9.142.41.221:6391:uoycexqe:mphbbv5emc22",
            "82.21.11.244:6504:uoycexqe:mphbbv5emc22",
            "9.142.194.64:6732:uoycexqe:mphbbv5emc22",
            "195.40.133.201:6421:uoycexqe:mphbbv5emc22",
            "82.29.47.48:7772:uoycexqe:mphbbv5emc22",
            "46.203.184.189:7456:uoycexqe:mphbbv5emc22",
            "82.29.143.110:7824:uoycexqe:mphbbv5emc22",
            "104.253.199.102:5381:uoycexqe:mphbbv5emc22",
            "45.58.229.181:5353:uoycexqe:mphbbv5emc22",
            "46.203.43.94:6081:uoycexqe:mphbbv5emc22",
            "104.252.59.155:7627:uoycexqe:mphbbv5emc22",
            "195.40.138.88:5808:uoycexqe:mphbbv5emc22",
            "82.29.143.22:7736:uoycexqe:mphbbv5emc22",
            "140.233.168.87:7802:uoycexqe:mphbbv5emc22",
            "103.130.178.197:5861:uoycexqe:mphbbv5emc22",
            "46.203.184.36:7303:uoycexqe:mphbbv5emc22",
            "46.203.137.49:6046:uoycexqe:mphbbv5emc22",
            "150.241.248.179:7396:uoycexqe:mphbbv5emc22",
            "72.1.153.43:5435:uoycexqe:mphbbv5emc22",
        ]
        
        # Fontes de proxies gratuitos
        self.proxy_sources = [
            'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
            'https://www.proxy-list.download/api/v1/get?type=http',
            'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
            'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
            'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
        ]
    
    def load_private_proxies(self):
        """Carrega e formata proxies privados"""
        print("\n🔐 Carregando proxies privados...")
        
        for proxy_str in self.private_proxies_raw:
            parts = proxy_str.split(':')
            if len(parts) == 4:
                ip, port, username, password = parts
                self.proxies.append({
                    'ip': ip,
                    'port': port,
                    'username': username,
                    'password': password,
                    'full': f"{ip}:{port}",
                    'auth': f"{username}:{password}@{ip}:{port}",
                    'type': 'private'
                })
        
        print(f"✅ {len(self.proxies)} proxies privados carregados!")
        self.validated_proxies = self.proxies.copy()
        
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
    
    def fetch_all_free_proxies(self):
        """Busca proxies gratuitos de todas as fontes"""
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
                        'full': f"{parts[0]}:{parts[1]}",
                        'type': 'free'
                    })
    
    def validate_proxy(self, proxy: Dict, test_url: str = 'http://httpbin.org/ip', timeout: int = 15) -> bool:
        """Valida se um proxy funciona"""
        try:
            if proxy.get('type') == 'private':
                # Proxy com autenticação
                proxy_dict = {
                    'http': f"http://{proxy['username']}:{proxy['password']}@{proxy['ip']}:{proxy['port']}",
                    'https': f"http://{proxy['username']}:{proxy['password']}@{proxy['ip']}:{proxy['port']}"
                }
            else:
                # Proxy sem autenticação
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
            
            if self.validate_proxy(proxy, timeout=15):
                with lock:
                    self.validated_proxies.append(proxy)
                    validated_count += 1
                    proxy_type = "🔐 Privado" if proxy.get('type') == 'private' else "🆓 Gratuito"
                    print(f"  ✅ Proxy válido #{validated_count} ({proxy_type}): {proxy['full']}")
                    
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
        if proxy.get('type') == 'private':
            return proxy['auth']
        return proxy['full']
    
    def run(self) -> List[Dict]:
        """Executa o processo completo de busca e validação"""
        print("\n" + "="*60)
        print("🌐 GERENCIADOR DE PROXIES")
        print("="*60)
        
        # Carregar proxies privados se habilitado
        if self.use_private_proxies:
            self.load_private_proxies()
            
            # Se já temos proxies privados suficientes, não precisa buscar gratuitos
            if len(self.validated_proxies) >= self.num_proxies_needed:
                print(f"\n✅ {len(self.validated_proxies)} proxies privados prontos para uso!")
                return self.validated_proxies
        
        # Buscar proxies gratuitos se habilitado
        if self.use_free_proxies:
            self.fetch_all_free_proxies()
            
            if not self.proxies:
                print("\n❌ Nenhum proxy encontrado. Verifique sua conexão.")
                return []
            
            # Validar proxies gratuitos
            self.validate_proxies_threaded(max_workers=50)
        
        if len(self.validated_proxies) < self.num_proxies_needed:
            print(f"\n⚠️  Atenção: Apenas {len(self.validated_proxies)} proxies válidos encontrados.")
            print(f"   Necessário: {self.num_proxies_needed}")
            print(f"   Algumas janelas usarão o mesmo proxy ou sem proxy.\n")
        
        return self.validated_proxies


if __name__ == "__main__":
    # Teste standalone
    print("\n🔧 MODO DE TESTE - PROXY MANAGER")
    print("="*60)
    print("1. Apenas proxies privados")
    print("2. Apenas proxies gratuitos")
    print("3. Ambos (privados + gratuitos)")
    choice = input("\nEscolha uma opção (1-3): ").strip()
    
    use_private = choice in ['1', '3']
    use_free = choice in ['2', '3']
    
    manager = ProxyManager(num_proxies_needed=20, use_private_proxies=use_private, use_free_proxies=use_free)
    proxies = manager.run()
    
    print("\n" + "="*60)
    print(f"📋 PROXIES VALIDADOS: {len(proxies)}")
    print("="*60)
    
    for i, proxy in enumerate(proxies, 1):
        proxy_type = "🔐 Privado" if proxy.get('type') == 'private' else "🆓 Gratuito"
        print(f"{i}. {proxy_type} - {proxy['full']}")