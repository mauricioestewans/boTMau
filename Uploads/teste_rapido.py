#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teste Rápido - Verifica se os módulos estão funcionando
"""

import sys

def test_imports():
    """Testa se todas as dependências estão instaladas"""
    print("\n" + "="*60)
    print("🧪 TESTE RÁPIDO - Browser Sync v2.0")
    print("="*60 + "\n")
    
    print("📦 Verificando dependências...\n")
    
    # Testar imports
    tests = [
        ('selenium', 'Selenium WebDriver'),
        ('requests', 'Requests HTTP'),
    ]
    
    all_ok = True
    
    for module, name in tests:
        try:
            __import__(module)
            print(f"  ✅ {name}: OK")
        except ImportError:
            print(f"  ❌ {name}: NÃO ENCONTRADO")
            all_ok = False
    
    print()
    
    # Testar módulos customizados
    print("🔧 Verificando módulos customizados...\n")
    
    try:
        from proxy_manager import ProxyManager
        print("  ✅ ProxyManager: OK")
    except Exception as e:
        print(f"  ❌ ProxyManager: ERRO - {str(e)}")
        all_ok = False
    
    try:
        from platform_scripts import PlatformScripts
        print("  ✅ PlatformScripts: OK")
    except Exception as e:
        print(f"  ❌ PlatformScripts: ERRO - {str(e)}")
        all_ok = False
    
    print()
    
    # Resultado final
    print("="*60)
    if all_ok:
        print("✅ TODOS OS TESTES PASSARAM!")
        print("\n🚀 Você pode executar: python browser_sync_improved.py")
    else:
        print("❌ ALGUNS TESTES FALHARAM")
        print("\n📝 Execute: pip install -r requirements_browser.txt")
    print("="*60 + "\n")
    
    return all_ok

def test_proxy_fetch():
    """Teste rápido de busca de proxies (opcional)"""
    print("\n" + "="*60)
    print("🌐 TESTE DE PROXIES (Opcional - pode levar 1-2 min)")
    print("="*60 + "\n")
    
    response = input("Deseja testar busca de proxies? (s/n): ").lower()
    
    if response == 's':
        try:
            from proxy_manager import ProxyManager
            print("\n🔍 Buscando proxies (aguarde...)\n")
            
            manager = ProxyManager(num_proxies_needed=5)
            proxies = manager.run()
            
            print("\n" + "="*60)
            print(f"✅ Teste concluído: {len(proxies)} proxies encontrados")
            print("="*60 + "\n")
            
            if proxies:
                print("Exemplos:")
                for i, proxy in enumerate(proxies[:3], 1):
                    print(f"  {i}. {proxy['full']}")
        except Exception as e:
            print(f"\n❌ Erro no teste de proxies: {str(e)}\n")
    else:
        print("\n⏭️  Teste de proxies ignorado.\n")

if __name__ == "__main__":
    # Teste de imports
    if test_imports():
        # Teste de proxies (opcional)
        test_proxy_fetch()
    
    print("\n👋 Teste finalizado!\n")
