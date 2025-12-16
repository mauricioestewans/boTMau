# 🚀 Browser Sync v2.0 - Sistema de Sincronização de Navegadores MELHORADO

## 🌟 O QUE É?

Sistema que abre 20 janelas Chrome simultâneas e sincroniza a navegação entre elas.

## ✨ NOVIDADES DA VERSÃO 2.0

### 🎯 Principais Melhorias:

1. **🌐 IPs DIFERENTES** (PRIORIDADE MÁXIMA - IMPLEMENTADO!)
   - ✅ Cada janela usa um proxy diferente
   - ✅ Sistema busca proxies gratuitos automaticamente
   - ✅ Rotação automática de IPs

2. **🎬 AUTO-SKIP DE ANÚNCIOS**
   - ✅ Pula anúncios do YouTube automaticamente
   - ✅ Fecha popups irritantes
   - ✅ Intervalo configurável (padrão: 5 segundos)

3. **⏸️ PREVENÇÃO AUTOMÁTICA DE PAUSAS**
   - ✅ Detecta e retoma reprodução automaticamente
   - ✅ Funciona em YouTube, Spotify, Deezer e TikTok
   - ✅ Simula atividade do usuário

4. **🎯 MELHORIAS ESPECÍFICAS POR PLATAFORMA**
   - ✅ **YouTube:** Skip ads, anti-pause, auto-unmute
   - ✅ **Spotify:** Anti-pause, auto-cookies, play contínuo
   - ✅ **Deezer:** Anti-pause, auto-play
   - ✅ **TikTok:** Auto-scroll, anti-pause

---

## 📦 INSTALAÇÃO RÁPIDA

### Requisitos:
- Python 3.8+
- Google Chrome
- Conexão com internet

### Instalar:
```bash
pip install -r requirements_browser.txt
```

---

## 🎮 COMO USAR

### Opção 1: Windows (Mais Fácil)
```bash
executar_melhorado.bat
```

### Opção 2: Linha de Comando
```bash
python browser_sync_improved.py
```

### O que vai acontecer:

1. **Busca de Proxies** (1-3 minutos)
   - Sistema busca proxies gratuitos online
   - Valida cada proxy
   - Pode encontrar 10-30 proxies válidos

2. **Abertura das Janelas**
   - 20 janelas Chrome abrem simultaneamente
   - Cada uma com um proxy/IP diferente
   - Posicionadas em cascata

3. **Controle Interativo**
   - Digite URLs para navegar
   - Use atalhos: `youtube`, `spotify`, `deezer`, `tiktok`
   - Sistema auto-skip de anúncios roda em background

---

## 🎯 EXEMPLOS RÁPIDOS

### Exemplo 1: YouTube
```bash
🎮 Digite um comando: youtube
# Todas as janelas abrem YouTube
# Anúncios são pulados automaticamente!
```

### Exemplo 2: Spotify
```bash
🎮 Digite um comando: spotify
# Todas as janelas abrem Spotify
# Não pausa por inatividade!
```

### Exemplo 3: URL Customizada
```bash
🎮 Digite um comando: youtube.com/watch?v=SEU_VIDEO_ID
# Todas as janelas abrem o vídeo específico
```

### Exemplo 4: Ver Status
```bash
🎮 Digite um comando: status

📊 Status: 20/20 janelas ativas
🌐 Proxies: 18 janelas com IP diferente
✨ Auto-skip: ATIVO (intervalo: 5s)
```

---

## 📋 COMANDOS DISPONÍVEIS

| Comando | Descrição |
|---------|----------|
| `youtube` | Atalho para YouTube |
| `spotify` | Atalho para Spotify |
| `deezer` | Atalho para Deezer |
| `tiktok` | Atalho para TikTok |
| `[URL]` | Navegar para qualquer URL |
| `status` | Ver status das janelas |
| `scroll` | Rolar página para baixo |
| `refresh` | Atualizar todas as páginas |
| `menu` | Mostrar menu novamente |
| `sair` | Fechar tudo e sair |

---

## 🏗️ ARQUITETURA DO SISTEMA

### Módulos:

1. **browser_sync_improved.py** - Programa principal
   - Gerencia instâncias de navegadores
   - Controle interativo
   - Coordena automações

2. **proxy_manager.py** - Gerenciador de proxies
   - Busca proxies gratuitos de múltiplas fontes
   - Valida proxies (teste de conectividade)
   - Retorna lista de proxies funcionais

3. **platform_scripts.py** - Scripts por plataforma
   - JavaScript para auto-skip de anúncios
   - Scripts de prevenção de pausas
   - Específico para cada plataforma

### Fluxo de Execução:

```
┌─────────────────────────────────────┐
│  1. Iniciar Programa                │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  2. Buscar Proxies Gratuitos        │
│     • Múltiplas fontes              │
│     • Validação paralela            │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  3. Abrir 20 Janelas Chrome         │
│     • Cada uma com proxy único      │
│     • User-agent diferente          │
│     • Perfil temporário             │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  4. Iniciar Thread de Automação     │
│     • Auto-skip de anúncios (5s)    │
│     • Prevenção de pausas           │
│     • Simular atividade             │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  5. Loop de Controle Interativo     │
│     • Aguardar comandos do usuário  │
│     • Executar navegação            │
│     • Manter automações ativas      │
└─────────────────────────────────────┘
```

---

## ⚙️ CONFIGURAÇÕES

### Arquivo: `browser_sync_improved.py`

```python
# Número de janelas
NUM_INSTANCES = 20  # Altere para 10, 30, 50...

# URL inicial
START_URL = "https://open.spotify.com/..."

# Intervalo de auto-skip
AD_SKIP_INTERVAL = 5  # segundos

# Timeout de carregamento
PAGE_LOAD_TIMEOUT = 30  # segundos
```

---

## 📊 COMO FUNCIONA O SISTEMA DE PROXIES

### Fontes de Proxies:

1. ProxyScrape API
2. Proxy-List Download
3. GitHub: TheSpeedX/PROXY-List
4. GitHub: ShiftyTR/Proxy-List
5. GitHub: monosans/proxy-list

### Processo:

```
1. Buscar de todas as fontes (10-1000 proxies)
   ↓
2. Remover duplicatas (100-500 únicos)
   ↓
3. Validar em paralelo (50 threads)
   ↓
4. Retornar válidos (10-30 funcionais)
   ↓
5. Atribuir 1 proxy por janela
```

### Validação:

- Testa conexão HTTP
- Timeout de 5-8 segundos
- Verifica resposta 200 OK
- Parallel testing (50 simultâneos)

---

## 🎬 SCRIPTS DE AUTOMAÇÃO

### YouTube:

```javascript
// Skip de anúncios
- Procura botão "Skip Ad"
- Clica automaticamente
- Verifica anúncios não-puláveis

// Prevenção de pausas
- Detecta vídeo pausado
- Chama video.play()
- Remove overlay de pausa

// Auto-unmute
- Detecta se está mudo
- Ativa som (volume baixo)
```

### Spotify:

```javascript
// Anti-pause
- Procura botão play
- Clica se pausado
- Fecha modais de inatividade

// Auto-cookies
- Aceita cookies automaticamente

// Simular atividade
- Dispara eventos de mouse
```

### Deezer:

```javascript
// Similar ao Spotify
- Anti-pause
- Auto-cookies
- Fechar modais
```

### TikTok:

```javascript
// Auto-scroll
- Scroll para próximo vídeo

// Anti-pause
- Mantém vídeos tocando

// Simular interação
- Eventos de playing
```

---

## 🐛 TROUBLESHOOTING

### ❓ Poucos proxies encontrados

```
⚠️ Apenas 5 proxies válidos encontrados
```

**Normal!** Proxies gratuitos são instáveis.

**Soluções:**
- Execute novamente (busca novos proxies)
- Use sem proxies temporariamente
- Considere proxies pagos para melhor resultado

---

### ❓ Janelas não abrem

```
✗ Erro ao iniciar janela: 'chromedriver'...
```

**Solução:**
```bash
pip install --upgrade selenium webdriver-manager
```

---

### ❓ Anúncios não pulam

**Possíveis causas:**
- Aguarde 5 segundos (intervalo padrão)
- Alguns anúncios não são puláveis
- YouTube mudou seletores HTML

**Solução:**
- Sistema tenta continuamente
- Aguarde o anúncio terminar naturalmente

---

### ❓ Alto uso de RAM

**Normal:** 20 janelas Chrome consomem 4-8 GB RAM

**Solução:**
```python
NUM_INSTANCES = 10  # Reduzir para 10 janelas
```

---

## 📈 COMPARAÇÃO DE VERSÕES

| Funcionalidade | v1.0 | v2.0 ✨ |
|----------------|------|----------|
| IPs Diferentes | ❌ | ✅ Sim |
| Auto-skip Ads | ❌ | ✅ Sim |
| Anti-pause | ❌ | ✅ Sim |
| Proxies | ❌ | ✅ Automático |
| YouTube | 🟡 | ✅ Otimizado |
| Spotify | 🟡 | ✅ Otimizado |
| Deezer | 🟡 | ✅ Otimizado |
| TikTok | 🟡 | ✅ Otimizado |
| Atalhos | ❌ | ✅ Sim |

---

## 💡 DICAS DE USO

### Para Melhor Performance:

1. **Primeira execução:** Aguarde 2-3 min (busca proxies)
2. **PC fraco:** Use 10 janelas ao invés de 20
3. **Feche outros apps:** Libera RAM
4. **Internet lenta:** Aumente PAGE_LOAD_TIMEOUT

### Para Melhores Resultados:

1. **Deixe rodar:** Sistema funciona melhor após 1-2 min
2. **Aguarde entre comandos:** 3-5 segundos
3. **Use atalhos:** `youtube`, `spotify` mais rápido que URLs
4. **Verifique status:** Use comando `status` regularmente

---

## ⚠️ AVISOS LEGAIS

- ✅ Use apenas para testes legítimos
- ✅ Respeite termos de serviço das plataformas
- ✅ Não use para manipular métricas
- ✅ Considere impacto de acessos múltiplos
- ✅ Proxies gratuitos têm limitações

---

## 📞 SUPORTE

### Documentação Completa:

- **MANUAL_DE_USO.md** - Manual detalhado
- **README_BROWSER_SYNC.md** - Este arquivo

### Problemas Comuns:

1. Poucos proxies → Execute novamente
2. Janela não abre → Atualize dependências
3. Erro conexão → Verifique internet
4. Chrome não encontrado → Instale Chrome

---

## 🎉 APROVEITE!

**Browser Sync v2.0** implementa TODAS as melhorias solicitadas:

- ✅ IPs diferentes (proxies automáticos)
- ✅ Auto-skip de anúncios
- ✅ Prevenção de pausas
- ✅ Otimizado para YouTube, Spotify, Deezer, TikTok

**Teste agora e veja a diferença!** 🚀

---

**Desenvolvido com ❤️ para automatizar navegação em massa**

**Versão:** 2.0  
**Ano:** 2025  
**Status:** ✅ Todas as melhorias implementadas  
