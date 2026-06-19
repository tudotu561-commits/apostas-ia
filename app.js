const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO = "llama-3.3-70b-versatile";

// ===== UTILITÁRIOS =====
function toggleApiKey() {
  const input = document.getElementById("api-key");
  input.type = input.type === "password" ? "text" : "password";
}

function mostrarErro(mensagem) {
  document.getElementById("resultados").innerHTML = `
    <div class="erro-card">
      <div class="erro-icon">⚠️</div>
      <div><strong>Erro</strong><br/>${mensagem}</div>
    </div>`;
}

function toggleRapidKey() {}

function salvarConfig() {
  try {
    localStorage.setItem("groq_api_key", document.getElementById("api-key").value.trim());
    localStorage.setItem("odd_minima",   document.getElementById("odd-minima").value);
  } catch(e) {}
}

function carregarConfig() {
  try {
    const k = localStorage.getItem("groq_api_key");
    const o = localStorage.getItem("odd_minima");
    if (k) document.getElementById("api-key").value    = k;
    if (o) document.getElementById("odd-minima").value = o;
  } catch(e) {}
}

function pararAutoUpdate() {}



// ===== PROMPT PROFISSIONAL COMPLETO =====
function montarPrompt(jogos, oddMinima) {
  return `⚽ PROFESSIONAL FOOTBALL MATCH ANALYST (PRE-MATCH & LIVE)

You are an elite football analyst and betting specialist with 20+ years of experience.
Your mission: perform the most comprehensive, data-driven analysis possible.
Always use the most recent available data. Explain every conclusion. Be objective and evidence-based.
Do NOT assume facts — if information cannot be confirmed, clearly state it is unconfirmed.

════════════════════════════════════
MATCHES TO ANALYZE TODAY:
════════════════════════════════════
${jogos}

════════════════════════════════════
BETTING CONFIGURATION:
════════════════════════════════════
- MINIMUM ODD (MANDATORY): ${oddMinima} — NEVER suggest below this value
- Always generate: 1 BEST BET (pre-match) + 1 SECONDARY BET (pre-match) + LIVE IN-PLAY TRIGGERS for each match

════════════════════════════════════
PRE-MATCH ANALYSIS — Analyze in detail for EVERY match:
════════════════════════════════════
📊 Team form over the last 5, 10, and 15 matches
🏠 Home and away performance records
⚽ Goals scored and conceded averages
🎯 Expected Goals (xG) and Expected Goals Against (xGA)
📈 Shot creation and defensive statistics
🚑 Injuries, suspensions, and unavailable players
⭐ Expected starting lineups
✅ Confirmed lineups when available
🔥 Players currently in top form
📋 Squad depth and bench quality
🤝 Head-to-head history (last 10 meetings)
🏆 Competition importance and what is at stake
📅 Fixture congestion and player fatigue
✈️ Travel distance and recovery time
🌦️ Weather forecast and possible impact
🏟️ Stadium, pitch conditions, and crowd environment
📰 Latest team news and press conferences
💰 Market expectations and public sentiment
🎯 Tactical matchups and coaching strategies
📉 Weaknesses and vulnerabilities of each team
📈 Strengths and advantages of each team

════════════════════════════════════
LIVE MATCH ANALYSIS — Generate specific in-play triggers:
════════════════════════════════════
Monitor and create triggers based on:
📍 Possession percentage shifts
📍 Shots and shots on target accumulation
📍 Expected Goals (xG) live progression
📍 Dangerous attacks and pressure zones
📍 Corner kick patterns
📍 Fouls, cards, and referee behavior
📍 Substitutions and tactical adjustments
📍 Injuries during match
📍 Momentum swings and psychological factors
📍 Match tempo and rhythm changes
📍 Team pressing intensity
📍 Individual player performances
📍 Potential turning points (red card, goal, VAR)

════════════════════════════════════
RESEARCH REQUIREMENTS:
════════════════════════════════════
Gather information from multiple reliable sources:
✅ Official club and league websites
✅ Verified lineup sources (e.g. Sofascore, WhoScored)
✅ Reputable football statistics providers (Opta, StatsBomb)
✅ Sports news outlets
✅ Weather services
✅ Injury reports and press conferences
Cross-check all information. State clearly when unconfirmed.

════════════════════════════════════
AVAILABLE BETTING MARKETS:
════════════════════════════════════
Result (1X2), Both Teams to Score, Over/Under Goals (1.5/2.5/3.5),
Asian Handicap, Double Chance, Draw No Bet, First Half Result,
Corners Over/Under, Cards Over/Under, Clean Sheet, Anytime Goalscorer,
Half Time/Full Time, Next Goal, Correct Score

════════════════════════════════════
OUTPUT — Return ONLY this exact JSON (no markdown, no text before or after):
════════════════════════════════════

{
  "resumo_executivo": "2-3 sentence executive summary of today's matches and overall outlook in Portuguese",
  "analise_geral": "Brief overall context in Portuguese",
  "melhor_aposta": {
    "jogo": "Team A x Team B",
    "competicao": "Copa do Mundo 2026",
    "tipo": "pre-jogo",
    "mercado": "Market name",
    "aposta": "Clear bet description",
    "odd_estimada": "2.05",
    "confianca": "Alta",
    "nivel_risco": "Baixo",
    "analise_completa": {
      "resumo": "Why this is THE BEST bet of the day with detailed reasoning",
      "forma_mandante": "Last 5/10/15 results, home record, goals, trends",
      "forma_visitante": "Last 5/10/15 results, away record, goals, trends",
      "h2h": "Last 10 head-to-head meetings with patterns and insights",
      "xg_stats": "xG, xGA, shots on target, conversion rate, defensive solidity",
      "lesoes_suspensoes": "All confirmed and suspected injuries/suspensions both teams",
      "analise_tatica": "Formation, pressing style, key battles, coaching tendencies",
      "fatores_externos": "Weather, travel fatigue, crowd influence, fixture congestion",
      "cenarios_provaveis": "3 most likely match scenarios with probabilities",
      "pontos_atencao": "Risks, uncertainties, and what could invalidate this bet"
    },
    "stats": [
      {"icone": "📊", "label": "Forma (5 jogos)", "valor": "4V 1E 0D"},
      {"icone": "⚽", "label": "Média gols/jogo", "valor": "2.4"},
      {"icone": "🎯", "label": "xG médio", "valor": "1.8"},
      {"icone": "🤝", "label": "H2H (5 jogos)", "valor": "3V 1E 1D"},
      {"icone": "🛡️", "label": "Gols sofridos/jogo", "valor": "0.6"},
      {"icone": "📈", "label": "Aproveitamento", "valor": "82%"}
    ],
    "escalacao_esperada": {
      "mandante": "Formation e.g. 4-3-3: GK; RB, CB, CB, LB; CM, CM, CAM; RW, ST, LW",
      "visitante": "Formation e.g. 4-2-3-1: GK; ..."
    }
  },
  "aposta_secundaria": {
    "jogo": "Team C x Team D",
    "competicao": "Copa do Mundo 2026",
    "tipo": "pre-jogo",
    "mercado": "Market name",
    "aposta": "Clear bet description",
    "odd_estimada": "1.85",
    "confianca": "Alta",
    "nivel_risco": "Baixo",
    "analise_completa": {
      "resumo": "Why this is a strong secondary bet",
      "forma_mandante": "Form analysis with last 5/10/15 matches",
      "forma_visitante": "Form analysis with last 5/10/15 matches",
      "h2h": "H2H history and patterns",
      "xg_stats": "xG, xGA and key stats",
      "lesoes_suspensoes": "Confirmed injuries and suspensions",
      "analise_tatica": "Tactical breakdown and key matchups",
      "fatores_externos": "External factors affecting the match",
      "cenarios_provaveis": "Most likely scenarios",
      "pontos_atencao": "Risks and warnings"
    },
    "stats": [
      {"icone": "📊", "label": "Forma (5 jogos)", "valor": "3V 1E 1D"},
      {"icone": "⚽", "label": "Média gols/jogo", "valor": "1.9"},
      {"icone": "🎯", "label": "xG médio", "valor": "1.5"},
      {"icone": "🤝", "label": "H2H (5 jogos)", "valor": "2V 2E 1D"}
    ],
    "escalacao_esperada": {
      "mandante": "Formation and key players",
      "visitante": "Formation and key players"
    }
  },
  "analise_ao_vivo": [
    {
      "jogo": "Team A x Team B",
      "descricao_cenario": "What to monitor in this match and why it has live value",
      "oportunidades": [
        {
          "titulo": "Short descriptive title",
          "gatilho": "SPECIFIC: IF [exact situation e.g. score 0-0 at 60min AND home team 8+ shots] THEN enter bet",
          "aposta": "Exact bet to place",
          "mercado": "Market name",
          "odd_alvo": "2.10",
          "janela_tempo": "e.g. Minutes 55-75 / After first goal / Half-time",
          "logica": "Why this situation statistically creates value — data, patterns, tactical reasons",
          "alertas": "Specific situations that would cancel this opportunity"
        },
        {
          "titulo": "Second live trigger title",
          "gatilho": "SPECIFIC trigger condition",
          "aposta": "Exact bet",
          "mercado": "Market",
          "odd_alvo": "1.90",
          "janela_tempo": "Time window",
          "logica": "Statistical and tactical reasoning",
          "alertas": "Warning conditions"
        },
        {
          "titulo": "Third live trigger title",
          "gatilho": "SPECIFIC trigger condition",
          "aposta": "Exact bet",
          "mercado": "Market",
          "odd_alvo": "2.30",
          "janela_tempo": "Time window",
          "logica": "Statistical and tactical reasoning",
          "alertas": "Warning conditions"
        }
      ]
    },
    {
      "jogo": "Team C x Team D",
      "descricao_cenario": "What to monitor live",
      "oportunidades": [
        {
          "titulo": "Live trigger title",
          "gatilho": "Specific trigger",
          "aposta": "Exact bet",
          "mercado": "Market",
          "odd_alvo": "1.95",
          "janela_tempo": "Time window",
          "logica": "Reasoning",
          "alertas": "Warnings"
        },
        {
          "titulo": "Second live trigger",
          "gatilho": "Specific trigger",
          "aposta": "Exact bet",
          "mercado": "Market",
          "odd_alvo": "2.20",
          "janela_tempo": "Time window",
          "logica": "Reasoning",
          "alertas": "Warnings"
        }
      ]
    }
  ]
}

CRITICAL RULES:
- ALL odds MUST be >= ${oddMinima}
- "tipo" = exactly "pre-jogo" or "ao-vivo"
- "confianca" = exactly "Alta", "Media" or "Baixa"
- "nivel_risco" = exactly "Baixo", "Médio" or "Alto"
- ALL text fields in Brazilian Portuguese
- analise_completa fields must contain REAL, DETAILED content — never placeholder text
- ao_vivo gatilhos must be SPECIFIC and actionable with exact conditions
- Return ONLY valid JSON — no markdown, no code blocks, no text before or after`;
}


// ===== API GROQ =====
async function chamarGroq(apiKey, prompt) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODELO,
      messages: [
        {
          role: "system",
          content: "You are an elite professional football analyst and betting specialist. Always respond in Brazilian Portuguese. Return ONLY valid JSON when requested — no markdown, no code blocks, no extra text whatsoever."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 8000
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("Chave de API inválida. Verifique em <a href='https://console.groq.com' target='_blank'>console.groq.com</a>");
    if (res.status === 429) throw new Error("Limite de requisições atingido. Aguarde alguns segundos e tente novamente.");
    throw new Error(`Erro na API Groq (${res.status}): ${err.error?.message || res.statusText}`);
  }

  return (await res.json()).choices[0].message.content;
}

// ===== PARSE JSON =====
function parseResposta(texto) {
  let limpo = texto.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
  try {
    return JSON.parse(limpo);
  } catch(e) {
    const m = limpo.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch(e2) {} }
    throw new Error("Não foi possível interpretar a resposta da IA. Tente novamente.");
  }
}


// ===== RENDERIZA CARD DE APOSTA =====
function renderizarCardAposta(op, tipo) {
  if (!op) return "";
  const ac = op.analise_completa || {};
  const isLive = op.tipo === "ao-vivo";
  const isMelhor = tipo === "melhor";
  const acId = "acc-" + tipo;

  const confClass = { Alta: "confianca-alta", Media: "confianca-media", Baixa: "confianca-baixa" }[op.confianca] || "confianca-media";
  const confIcon  = { Alta: "✅", Media: "⚡", Baixa: "⚠️" }[op.confianca] || "⚡";
  const riskClass = { "Baixo": "risco-baixo", "Médio": "risco-medio", "Alto": "risco-alto" }[op.nivel_risco] || "risco-medio";
  const riskIcon  = { "Baixo": "🟢", "Médio": "🟡", "Alto": "🔴" }[op.nivel_risco] || "🟡";

  const statsHtml = (op.stats || []).map(s =>
    `<div class="stat-pill"><span>${s.icone}</span><span>${s.label}:</span><strong>${s.valor}</strong></div>`
  ).join("");

  const secoes = [
    { icone: "💡", titulo: "Por que esta aposta?", conteudo: ac.resumo },
    { icone: "📊", titulo: "Forma Recente",
      conteudo: ac.forma_mandante && ac.forma_visitante
        ? `<strong>🏠 Mandante:</strong> ${ac.forma_mandante}<br/><br/><strong>✈️ Visitante:</strong> ${ac.forma_visitante}`
        : null },
    { icone: "🤝", titulo: "Histórico H2H",       conteudo: ac.h2h },
    { icone: "🎯", titulo: "xG & Estatísticas",   conteudo: ac.xg_stats },
    { icone: "🚑", titulo: "Lesões & Suspensões", conteudo: ac.lesoes_suspensoes },
    { icone: "♟️", titulo: "Análise Tática",      conteudo: ac.analise_tatica },
    { icone: "🌦️", titulo: "Fatores Externos",    conteudo: ac.fatores_externos },
    { icone: "📈", titulo: "Cenários Prováveis",  conteudo: ac.cenarios_provaveis },
    { icone: "⚠️", titulo: "Pontos de Atenção",   conteudo: ac.pontos_atencao },
  ].filter(s => s.conteudo);

  let escalacaoHtml = "";
  if (op.escalacao_esperada?.mandante || op.escalacao_esperada?.visitante) {
    escalacaoHtml = `
      <div class="escalacao-box">
        <div class="escalacao-titulo">⭐ Escalações Esperadas</div>
        <div class="escalacao-grid">
          <div class="escalacao-time">
            <span class="escalacao-label">🏠 Mandante</span>
            <span>${op.escalacao_esperada.mandante || "—"}</span>
          </div>
          <div class="escalacao-time">
            <span class="escalacao-label">✈️ Visitante</span>
            <span>${op.escalacao_esperada.visitante || "—"}</span>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="oportunidade-card ${isMelhor ? "card-melhor-aposta" : "card-aposta-secundaria"}">
      <div class="aposta-label-destaque ${isMelhor ? "label-melhor" : "label-secundaria"}">
        ${isMelhor ? "🥇 MELHOR APOSTA DO DIA" : "🥈 APOSTA SECUNDÁRIA"}
      </div>

      <div class="op-header">
        <div class="op-rank">${isMelhor ? "🥇" : "🥈"}</div>
        <div class="op-jogo">
          <strong>${op.jogo}</strong>
          <span>${op.competicao || "Copa do Mundo 2026"}</span>
        </div>
        <div class="op-badges">
          ${isLive ? `<span class="badge badge-live">🔴 Ao Vivo</span>` : `<span class="badge badge-pre">📋 Pré-Jogo</span>`}
          <span class="badge badge-confianca ${confClass}">${confIcon} ${op.confianca} Confiança</span>
          <span class="badge badge-risco ${riskClass}">${riskIcon} Risco ${op.nivel_risco || "—"}</span>
        </div>
      </div>

      <div class="op-aposta-destaque">
        <div class="op-aposta-info">
          <span class="op-aposta-tipo">${op.mercado}</span>
          <span class="op-aposta-nome">${op.aposta}</span>
        </div>
        <div class="op-odd-box">
          <span class="op-odd-label">Odd Estimada</span>
          <span class="op-odd-valor">${op.odd_estimada}</span>
        </div>
      </div>

      ${statsHtml ? `<div class="op-stats">${statsHtml}</div>` : ""}
      ${escalacaoHtml}

      <div class="analise-accordion">
        <button class="accordion-toggle" onclick="toggleAccordion('${acId}', this)">
          🔬 Ver Análise Completa <span class="accordion-arrow">▼</span>
        </button>
        <div class="accordion-body" id="${acId}" style="display:none;">
          ${secoes.map(s => `
            <div class="analise-secao">
              <div class="analise-secao-titulo">${s.icone} ${s.titulo}</div>
              <div class="analise-secao-corpo">${s.conteudo}</div>
            </div>`).join("")}
        </div>
      </div>
    </div>`;
}


// ===== RENDERIZA SEÇÃO AO VIVO =====
function renderizarAoVivo(lista) {
  if (!lista || lista.length === 0) return "";

  let html = `
    <div class="ao-vivo-section" id="ao-vivo-section">
      <div class="ao-vivo-header">
        <div class="ao-vivo-dot-wrap"><span class="ao-vivo-dot"></span></div>
        <div>
          <div class="ao-vivo-title">🔴 ANÁLISE AO VIVO — Gatilhos In-Play</div>
          <div class="ao-vivo-subtitle">Monitore estas situações durante os jogos. Quando o gatilho ocorrer, entre na aposta.</div>
        </div>
      </div>`;

  lista.forEach((jogo) => {
    html += `
      <div class="av-jogo-bloco">
        <div class="av-jogo-titulo">⚽ ${jogo.jogo}</div>
        ${jogo.descricao_cenario ? `<div class="av-jogo-desc">${jogo.descricao_cenario}</div>` : ""}
        <div class="av-oportunidades">
          ${(jogo.oportunidades || []).map((op, oi) => `
            <div class="av-card">
              <div class="av-card-header">
                <div class="av-num">${oi + 1}</div>
                <div class="av-info">
                  <strong>${op.titulo || op.aposta}</strong>
                  <div class="av-meta">
                    <span class="av-badge av-badge-mercado">${op.mercado}</span>
                    <span class="av-badge av-badge-tempo">⏱️ ${op.janela_tempo}</span>
                    <span class="av-badge av-badge-odd">Odd alvo: <strong>${op.odd_alvo}</strong></span>
                  </div>
                </div>
              </div>
              <div class="av-gatilho">
                <div class="av-gatilho-label">🎯 GATILHO — Quando entrar:</div>
                <div class="av-gatilho-texto">${op.gatilho}</div>
              </div>
              <div class="av-aposta-destaque">
                <span class="av-aposta-label">📌 Aposta:</span>
                <span class="av-aposta-valor">${op.aposta}</span>
              </div>
              <div class="av-secoes">
                <div class="av-secao">
                  <div class="av-secao-titulo">🧠 Lógica</div>
                  <div class="av-secao-corpo">${op.logica}</div>
                </div>
                ${op.alertas ? `
                <div class="av-secao av-secao-alerta">
                  <div class="av-secao-titulo">🚨 Alertas — Quando NÃO entrar</div>
                  <div class="av-secao-corpo">${op.alertas}</div>
                </div>` : ""}
              </div>
            </div>`).join("")}
        </div>
      </div>`;
  });

  html += `</div>`;
  return html;
}


// ===== BARRA DE EXPORTAR =====
function renderizarExportar() {
  return `
    <div class="export-bar" id="export-bar">
      <div class="export-info">
        <span class="export-icon">📸</span>
        <div>
          <strong>Baixar Análise como Imagem</strong>
          <span>Salve ou compartilhe sua análise completa</span>
        </div>
      </div>
      <div class="export-btns">
        <button class="btn-export" onclick="exportarImagem('resultados-inner', 'analise-completa')">
          ⬇️ Apostas (Pré-Jogo)
        </button>
        <button class="btn-export btn-export-vivo" onclick="exportarImagem('ao-vivo-section', 'ao-vivo')">
          🔴 Gatilhos Ao Vivo
        </button>
      </div>
    </div>`;
}

// ===== EXPORTAR IMAGEM =====
async function exportarImagem(elementId, nomeArquivo) {
  const el = document.getElementById(elementId);
  if (!el) { alert("Seção não encontrada para exportar."); return; }

  const btn = event.currentTarget;
  const original = btn.innerHTML;
  btn.innerHTML = "⏳ Gerando...";
  btn.disabled = true;

  // Abre todos os accordions temporariamente
  const accordions = el.querySelectorAll(".accordion-body");
  const estados = [];
  accordions.forEach(a => { estados.push(a.style.display); a.style.display = "block"; });

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: "#0b0d12",
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: -window.scrollY,
    });

    const hoje = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const link = document.createElement("a");
    link.download = `betanalytics-${nomeArquivo}-${hoje}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch(e) {
    alert("Erro ao gerar imagem: " + e.message);
  } finally {
    accordions.forEach((a, i) => { a.style.display = estados[i]; });
    btn.innerHTML = original;
    btn.disabled = false;
  }
}

// ===== ACCORDION =====
function toggleAccordion(id, btn) {
  const body = document.getElementById(id);
  const isOpen = body.style.display !== "none";
  body.style.display = isOpen ? "none" : "block";
  if (btn) {
    const arrow = isOpen ? "▼" : "▲";
    const label = isOpen ? "Ver" : "Ocultar";
    const icon  = isOpen ? "🔬" : "🔼";
    btn.innerHTML = `${icon} ${label} Análise Completa <span class="accordion-arrow">${arrow}</span>`;
  }
}


// ===== RENDERIZA TUDO =====
function renderizarResultados(dados) {
  let inner = "";

  // Resumo executivo
  if (dados.resumo_executivo) {
    inner += `
      <div class="exec-summary">
        <div class="exec-icon">📋</div>
        <div>
          <div class="exec-title">Resumo Executivo</div>
          <p>${dados.resumo_executivo}</p>
        </div>
      </div>`;
  }

  // Header
  inner += `
    <div class="resultado-header">
      <div class="icon">🎯</div>
      <div>
        <h2>Análise Profissional Concluída</h2>
        <p>${dados.analise_geral || "Análise baseada em dados históricos, xG, táticas e fatores externos."}</p>
      </div>
    </div>`;

  // Melhor aposta + secundária
  inner += renderizarCardAposta(dados.melhor_aposta, "melhor");
  inner += renderizarCardAposta(dados.aposta_secundaria, "secundaria");

  // Monta HTML final
  let html = `<div id="resultados-inner">${inner}</div>`;

  // Ao vivo separado (fora do resultados-inner para exportar separado)
  if (dados.analise_ao_vivo?.length) {
    html += `<div class="divisor-section"><span>🔴 GATILHOS IN-PLAY — AO VIVO</span></div>`;
    html += renderizarAoVivo(dados.analise_ao_vivo);
  }

  // Barra de exportar sempre no final
  html += renderizarExportar();

  document.getElementById("resultados").innerHTML = html;
}

// ===== FUNÇÃO PRINCIPAL =====
async function analisarJogos() {
  const apiKey    = document.getElementById("api-key").value.trim();
  const jogos     = document.getElementById("jogos-input").value.trim();
  const oddMinima = document.getElementById("odd-minima").value || "1.70";

  if (!apiKey) { mostrarErro("Insira sua chave da API Groq."); return; }
  if (!apiKey.startsWith("gsk_")) {
    mostrarErro("Chave inválida. A chave Groq começa com <strong>gsk_</strong>. Acesse <a href='https://console.groq.com' target='_blank'>console.groq.com</a>");
    return;
  }
  if (!jogos) { mostrarErro("Informe ao menos um jogo para analisar."); return; }

  salvarConfig();

  const btn     = document.getElementById("btn-analisar");
  const loading = document.getElementById("loading");

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Analisando com IA...`;
  loading.style.display = "flex";
  document.getElementById("resultados").innerHTML = "";

  try {
    const prompt   = montarPrompt(jogos, oddMinima);
    const resposta = await chamarGroq(apiKey, prompt);
    const dados    = parseResposta(resposta);

    if (!dados.melhor_aposta) {
      mostrarErro("A IA não retornou análise. Tente novamente.");
      return;
    }

    renderizarResultados(dados);
    mostrarPainelAoVivo(jogos);

  } catch(e) {
    mostrarErro(e.message || "Erro inesperado. Tente novamente.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `🔍 Analisar com IA Profissional`;
    loading.style.display = "none";
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  carregarConfig();
  document.getElementById("jogos-input").addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "Enter") analisarJogos();
  });
  // Para o auto-update se o usuário fechar/recarregar a página
  window.addEventListener("beforeunload", pararAutoUpdate);
});

// ===== PROMPT AO VIVO =====
function montarPromptAoVivo(dadosLive, oddMinima, contextoOriginal) {
  const {
    jogo, minuto,
    golsCasa, golsFora,
    posseCasa, posseFora,
    chutesCasa, chutesFora,
    escanteiosCasa, escanteiosFora,
    amarelosCasa, amarelosFora,
    eventos
  } = dadosLive;

  const placar = `${golsCasa} x ${golsFora}`;
  const agora = new Date();
  const horario = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const data    = agora.toLocaleDateString("pt-BR");

  return `⚽ LIVE MATCH ANALYST — REAL-TIME IN-PLAY ANALYSIS

You are an elite football betting analyst. A match is currently IN PROGRESS.
Analyze the current match state and identify the BEST betting opportunities RIGHT NOW.

════════════════════════════════════
CURRENT MATCH STATUS (as of ${horario} on ${data})
════════════════════════════════════
Match:   ${jogo}
Minute:  ${minuto}'
Score:   ${placar}

════════════════════════════════════
LIVE STATISTICS (current moment)
════════════════════════════════════
Possession:      ${posseCasa ? posseCasa + "% (home)" : "N/A"} vs ${posseFora ? posseFora + "% (away)" : "N/A"}
Shots:           ${chutesCasa ? chutesCasa + " (home)" : "N/A"} vs ${chutesFora ? chutesFora + " (away)" : "N/A"}
Corners:         ${escanteiosCasa ? escanteiosCasa + " (home)" : "N/A"} vs ${escanteiosFora ? escanteiosFora + " (away)" : "N/A"}
Yellow Cards:    ${amarelosCasa ? amarelosCasa + " (home)" : "N/A"} vs ${amarelosFora ? amarelosFora + " (away)" : "N/A"}

════════════════════════════════════
MATCH EVENTS & CONTEXT
════════════════════════════════════
${eventos || "No additional events reported."}

════════════════════════════════════
PRE-MATCH CONTEXT
════════════════════════════════════
${contextoOriginal || "Standard pre-match analysis applies."}

════════════════════════════════════
BETTING CONFIGURATION
════════════════════════════════════
Minimum odd: ${oddMinima}
Current time: ${horario}

════════════════════════════════════
YOUR TASK
════════════════════════════════════
Based on the CURRENT match state at minute ${minuto} with score ${placar}:

1. Assess the match momentum and dynamics RIGHT NOW
2. Identify which team is dominating and why
3. Find the BEST live betting opportunity considering:
   - Current score and how each team will react
   - Remaining time (${minuto} minutes played, ~${90 - parseInt(minuto) || "?"} remaining)
   - Live statistics showing dominance patterns
   - Psychological pressure on each team
   - Likely tactical adjustments ahead
   - Available markets: Next Goal, Over/Under remaining goals, Asian Handicap live,
     Both Teams to Score, Correct Score, Double Chance, Corners remaining, Cards

4. Give a CLEAR recommendation for what to bet RIGHT NOW

Return ONLY this exact JSON (no markdown, no text before or after):

{
  "horario_analise": "${horario}",
  "jogo": "${jogo}",
  "minuto": "${minuto}",
  "placar_atual": "${placar}",
  "resumo_momento": "2-3 sentences describing the current match state and momentum in Portuguese",
  "time_dominante": "home or away or equal",
  "momentum": "Description of which team is in control and why, based on stats and events",
  "melhor_aposta_live": {
    "aposta": "Exact bet to place RIGHT NOW",
    "mercado": "Market name",
    "odd_estimada": "1.95",
    "confianca": "Alta",
    "nivel_risco": "Baixo",
    "justificativa": "Why this is the best bet at this exact moment — reference the current score, stats, minute, and dynamics",
    "janela_ideal": "How long this opportunity is valid e.g. Next 10-15 minutes / Before 80th minute",
    "alertas": "What would invalidate this bet — specific events to watch for"
  },
  "aposta_alternativa": {
    "aposta": "Alternative bet if the main bet odds change",
    "mercado": "Market name",
    "odd_estimada": "2.10",
    "justificativa": "Why this is a solid alternative right now"
  },
  "analise_estatisticas": "Deep analysis of what the current stats reveal about the match trajectory",
  "proximo_evento_esperado": "What is most likely to happen next based on the current dynamics",
  "riscos_agora": "Current risks and what to watch out for in the next few minutes",
  "stats_live": [
    {"icone": "⏱️", "label": "Minuto", "valor": "${minuto}'"},
    {"icone": "🏆", "label": "Placar", "valor": "${placar}"},
    {"icone": "📊", "label": "Posse", "valor": "${posseCasa || "?"}% x ${posseFora || "?"}%"},
    {"icone": "🎯", "label": "Chutes", "valor": "${chutesCasa || "?"} x ${chutesFora || "?"}"},
    {"icone": "🟩", "label": "Escanteios", "valor": "${escanteiosCasa || "?"} x ${escanteiosFora || "?"}"},
    {"icone": "🟨", "label": "Amarelos", "valor": "${amarelosCasa || "?"} x ${amarelosFora || "?"}"}
  ]
}

RULES:
- odd_estimada MUST be >= ${oddMinima}
- "confianca" = "Alta", "Media" or "Baixa"
- "nivel_risco" = "Baixo", "Médio" or "Alto"
- ALL text in Brazilian Portuguese
- Base every recommendation on the ACTUAL current match data provided
- Return ONLY valid JSON`;
}

// ===== RENDERIZA PAINEL AO VIVO APÓS ANÁLISE =====
function mostrarPainelAoVivo(jogos) {
  const painel = document.getElementById("painel-ao-vivo");
  painel.style.display = "block";
  // Pré-preenche o primeiro jogo se houver só um
  const linhas = jogos.split("\n").map(l => l.trim()).filter(Boolean);
  if (linhas.length === 1) {
    const jogo = linhas[0].split(" - ")[0].trim();
    document.getElementById("live-jogo").value = jogo;
  }
  painel.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== RENDERIZA RESULTADO AO VIVO =====
function renderizarResultadoAoVivo(dados) {
  const ml = dados.melhor_aposta_live || {};
  const alt = dados.aposta_alternativa || {};

  const confClass = { Alta: "confianca-alta", Media: "confianca-media", Baixa: "confianca-baixa" }[ml.confianca] || "confianca-media";
  const confIcon  = { Alta: "✅", Media: "⚡", Baixa: "⚠️" }[ml.confianca] || "⚡";
  const riskClass = { "Baixo": "risco-baixo", "Médio": "risco-medio", "Alto": "risco-alto" }[ml.nivel_risco] || "risco-medio";
  const riskIcon  = { "Baixo": "🟢", "Médio": "🟡", "Alto": "🔴" }[ml.nivel_risco] || "🟡";

  const statsHtml = (dados.stats_live || []).map(s =>
    `<div class="stat-pill stat-pill-live"><span>${s.icone}</span><span>${s.label}:</span><strong>${s.valor}</strong></div>`
  ).join("");

  const html = `
    <div class="live-resultado-wrap">

      <!-- CABEÇALHO DO RESULTADO -->
      <div class="live-resultado-header">
        <div class="live-resultado-placar">
          <div class="live-resultado-jogo">${dados.jogo || ""}</div>
          <div class="live-resultado-score">${dados.placar_atual || ""}</div>
          <div class="live-resultado-min">⏱️ ${dados.minuto || "?"}' — Análise às ${dados.horario_analise || ""}</div>
        </div>
        <div class="live-momentum-badge live-momentum-${dados.time_dominante || "equal"}">
          ${dados.time_dominante === "home" ? "🏠 Mandante Dominando" :
            dados.time_dominante === "away" ? "✈️ Visitante Dominando" : "⚖️ Equilíbrio"}
        </div>
      </div>

      <!-- STATS AO VIVO -->
      ${statsHtml ? `<div class="op-stats live-stats-row">${statsHtml}</div>` : ""}

      <!-- RESUMO DO MOMENTO -->
      <div class="live-momento">
        <div class="live-momento-titulo">🧠 Leitura do Momento</div>
        <div class="live-momento-texto">${dados.resumo_momento || ""}</div>
      </div>
      ${dados.momentum ? `
      <div class="live-momento live-momento-momentum">
        <div class="live-momento-titulo">📈 Momentum</div>
        <div class="live-momento-texto">${dados.momentum}</div>
      </div>` : ""}

      <!-- MELHOR APOSTA AGORA -->
      <div class="live-aposta-agora">
        <div class="live-aposta-agora-label">🔴 APOSTAR AGORA</div>
        <div class="live-aposta-agora-body">
          <div class="live-aposta-info">
            <div class="live-aposta-mercado">${ml.mercado || ""}</div>
            <div class="live-aposta-nome">${ml.aposta || ""}</div>
            <div class="live-aposta-janela">⏳ ${ml.janela_ideal || ""}</div>
          </div>
          <div class="live-aposta-odd-wrap">
            <div class="op-odd-label">Odd Est.</div>
            <div class="op-odd-valor live-odd">${ml.odd_estimada || ""}</div>
            <span class="badge badge-confianca ${confClass}">${confIcon} ${ml.confianca || ""}</span>
            <span class="badge badge-risco ${riskClass}">${riskIcon} ${ml.nivel_risco || ""}</span>
          </div>
        </div>

        ${ml.justificativa ? `
        <div class="live-justificativa">
          <div class="live-justificativa-titulo">💡 Por que apostar agora</div>
          <div class="live-justificativa-corpo">${ml.justificativa}</div>
        </div>` : ""}

        ${ml.alertas ? `
        <div class="live-justificativa live-alerta">
          <div class="live-justificativa-titulo">🚨 Fique atento</div>
          <div class="live-justificativa-corpo">${ml.alertas}</div>
        </div>` : ""}
      </div>

      <!-- APOSTA ALTERNATIVA -->
      ${alt.aposta ? `
      <div class="live-alternativa">
        <div class="live-alt-label">🔁 Alternativa</div>
        <div class="live-alt-body">
          <div>
            <div class="live-aposta-mercado">${alt.mercado || ""}</div>
            <div class="live-aposta-nome">${alt.aposta || ""}</div>
            ${alt.justificativa ? `<div class="live-alt-just">${alt.justificativa}</div>` : ""}
          </div>
          <div class="op-odd-valor live-odd-alt">${alt.odd_estimada || ""}</div>
        </div>
      </div>` : ""}

      <!-- ANÁLISE + PRÓXIMO EVENTO + RISCOS -->
      ${dados.analise_estatisticas ? `
      <div class="live-secao-detalhe">
        <div class="live-secao-titulo">📊 Análise das Estatísticas</div>
        <div class="live-secao-corpo">${dados.analise_estatisticas}</div>
      </div>` : ""}

      ${dados.proximo_evento_esperado ? `
      <div class="live-secao-detalhe">
        <div class="live-secao-titulo">🔮 Próximo Evento Esperado</div>
        <div class="live-secao-corpo">${dados.proximo_evento_esperado}</div>
      </div>` : ""}

      ${dados.riscos_agora ? `
      <div class="live-secao-detalhe live-secao-risco">
        <div class="live-secao-titulo">⚠️ Riscos Agora</div>
        <div class="live-secao-corpo">${dados.riscos_agora}</div>
      </div>` : ""}

      <!-- BOTÃO EXPORTAR AO VIVO -->
      <div class="live-export-bar">
        <button class="btn-export btn-export-vivo" onclick="exportarImagem('live-resultado-wrap-outer', 'ao-vivo')">
          📸 Baixar Esta Análise Ao Vivo
        </button>
        <button class="btn-export" style="background:var(--bg4);color:var(--text2);border:1px solid var(--border);" onclick="analisarAoVivo()">
          🔄 Atualizar Análise
        </button>
      </div>
    </div>`;

  const wrapper = document.createElement("div");
  wrapper.id = "live-resultado-wrap-outer";
  wrapper.innerHTML = html;

  const container = document.getElementById("resultado-ao-vivo");
  container.innerHTML = "";
  container.appendChild(wrapper);
  wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== ANALISAR AO VIVO =====
async function analisarAoVivo() {
  const apiKey = document.getElementById("api-key").value.trim();
  const jogo   = document.getElementById("live-jogo").value.trim();
  const minuto = document.getElementById("live-minuto").value.trim();
  const golsCasa = document.getElementById("live-gols-casa").value || "0";
  const golsFora = document.getElementById("live-gols-fora").value || "0";
  const oddMinima = document.getElementById("odd-minima").value || "1.70";

  if (!apiKey) { alert("Insira sua chave Groq na sidebar."); return; }
  if (!jogo)   { alert("Informe o nome do jogo."); return; }
  if (!minuto) { alert("Informe o minuto atual do jogo."); return; }

  const dadosLive = {
    jogo, minuto, golsCasa, golsFora,
    posseCasa:       document.getElementById("live-posse-casa").value,
    posseFora:       document.getElementById("live-posse-fora").value,
    chutesCasa:      document.getElementById("live-chutes-casa").value,
    chutesFora:      document.getElementById("live-chutes-fora").value,
    escanteiosCasa:  document.getElementById("live-escanteios-casa").value,
    escanteiosFora:  document.getElementById("live-escanteios-fora").value,
    amarelosCasa:    document.getElementById("live-amarelos-casa").value,
    amarelosFora:    document.getElementById("live-amarelos-fora").value,
    eventos:         document.getElementById("live-eventos").value,
  };

  const contextoOriginal = document.getElementById("jogos-input").value;

  const btn = document.getElementById("btn-live");
  const container = document.getElementById("resultado-ao-vivo");

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Analisando momento atual...`;
  container.innerHTML = `
    <div class="loading-card" style="margin-top:12px;">
      <div class="loading-inner">
        <div class="loading-spinner"></div>
        <div class="loading-text">
          <strong>Analisando ${jogo} ao vivo...</strong>
          <span>Minuto ${minuto}' · Placar ${golsCasa} x ${golsFora} · Processando dados em tempo real</span>
        </div>
      </div>
    </div>`;

  try {
    const prompt   = montarPromptAoVivo(dadosLive, oddMinima, contextoOriginal);
    const resposta = await chamarGroq(apiKey, prompt);
    const dados    = parseResposta(resposta);
    renderizarResultadoAoVivo(dados);
  } catch(e) {
    container.innerHTML = `
      <div class="erro-card" style="margin-top:12px;">
        <div class="erro-icon">⚠️</div>
        <div><strong>Erro na análise ao vivo</strong><br/>${e.message}</div>
      </div>`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `🔴 Analisar Momento Atual com IA`;
  }
}
