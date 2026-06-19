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

function salvarConfig() {
  try {
    localStorage.setItem("groq_api_key", document.getElementById("api-key").value.trim());
    localStorage.setItem("odd_minima", document.getElementById("odd-minima").value);
  } catch(e) {}
}

function carregarConfig() {
  try {
    const k = localStorage.getItem("groq_api_key");
    const o = localStorage.getItem("odd_minima");
    if (k) document.getElementById("api-key").value = k;
    if (o) document.getElementById("odd-minima").value = o;
  } catch(e) {}
}

// ===== PROMPT PROFISSIONAL =====
function montarPrompt(jogos, contextoExtra, oddMinima, modoAoVivo, modoPreJogo) {
  const tipos = [];
  if (modoPreJogo) tipos.push("pré-jogo");
  if (modoAoVivo) tipos.push("ao vivo (in-play)");

  return `⚽ PROFESSIONAL FOOTBALL MATCH ANALYST (PRE-MATCH & LIVE)

You are an elite football analyst with 20+ years of experience. Your mission is to perform the most comprehensive and data-driven analysis possible.

Always use the most recent available data. Explain the reasoning behind every conclusion. Remain objective and evidence-based.

========================
MATCHES TO ANALYZE TODAY:
========================
${jogos}

${contextoExtra ? `ADDITIONAL CONTEXT PROVIDED:\n${contextoExtra}\n` : ""}

========================
BETTING CONFIGURATION:
========================
- MINIMUM ODD (MANDATORY): ${oddMinima} — NEVER suggest below this value
- Market types accepted: ${tipos.join(" and ")}
- Primary competition: Copa do Mundo 2026

========================
ANALYSIS REQUIREMENTS:
========================

For each match, analyze in depth:

PRE-MATCH:
- Team form over last 5, 10, and 15 matches
- Home and away performance records
- Goals scored and conceded averages
- Expected Goals (xG) and xGA when available
- Shot creation and defensive statistics
- Injuries, suspensions, and unavailable players
- Expected starting lineups
- Players currently in top form
- Squad depth and bench quality
- Head-to-head history (last 10 meetings)
- Competition importance and what's at stake
- Fixture congestion and player fatigue
- Travel distance and recovery time
- Weather conditions and possible impact
- Stadium, pitch conditions, crowd influence
- Latest team news and press conferences
- Tactical matchups and coaching strategies
- Weaknesses and vulnerabilities of each team
- Strengths and advantages of each team

LIVE (if applicable):
- Current possession, shots, xG
- Dangerous attacks and corners
- Fouls, cards, substitutions
- Tactical adjustments and momentum swings
- Pressing intensity and individual performances

AVAILABLE MARKETS TO CONSIDER:
Result (1X2), Both Teams to Score, Over/Under Goals (1.5/2.5/3.5), Asian Handicap,
Double Chance, Draw No Bet, First Half Result, Corners Over/Under, Cards Over/Under,
Clean Sheet, Half Time/Full Time, Anytime Goalscorer

========================
OUTPUT FORMAT (RETURN ONLY VALID JSON — NO TEXT BEFORE OR AFTER):
========================

{
  "resumo_executivo": "2-3 sentence executive summary of today's matches and overall outlook",
  "analise_geral": "Brief overall context of the matches",
  "oportunidades": [
    {
      "rank": 1,
      "jogo": "Team A x Team B",
      "competicao": "Copa do Mundo 2026",
      "tipo": "pre-jogo",
      "mercado": "Market name",
      "aposta": "Clear bet description",
      "odd_estimada": "1.95",
      "confianca": "Alta",
      "nivel_risco": "Baixo",
      "analise_completa": {
        "resumo": "Why this is the best bet in 2-3 sentences",
        "forma_mandante": "Last 5-10 results and form analysis for home team",
        "forma_visitante": "Last 5-10 results and form analysis for away team",
        "h2h": "Last 5-10 head-to-head meetings analysis",
        "xg_stats": "xG, xGA, shots statistics if available",
        "lesoes_suspensoes": "Key injuries and suspensions for both teams",
        "analise_tatica": "Tactical matchup, coaching strategies, key battles",
        "fatores_externos": "Weather, travel, fatigue, crowd, pressure",
        "cenarios_provaveis": "2-3 most likely match scenarios",
        "pontos_atencao": "Risks and uncertainties for this bet"
      },
      "stats": [
        {"icone": "📊", "label": "Forma (últimos 5)", "valor": "4V 1E 0D"},
        {"icone": "⚽", "label": "Média gols/jogo", "valor": "2.4"},
        {"icone": "🎯", "label": "xG médio", "valor": "1.8"},
        {"icone": "🤝", "label": "H2H (últimos 5)", "valor": "3V 1E 1D"},
        {"icone": "🛡️", "label": "Gols sofridos/jogo", "valor": "0.6"},
        {"icone": "📈", "label": "Aproveitamento", "valor": "82%"}
      ],
      "escalacao_esperada": {
        "mandante": "Expected lineup or formation if known",
        "visitante": "Expected lineup or formation if known"
      }
    },
    {
      "rank": 2,
      "jogo": "Team C x Team D",
      "competicao": "Copa do Mundo 2026",
      "tipo": "pre-jogo",
      "mercado": "Market name",
      "aposta": "Clear bet description",
      "odd_estimada": "2.10",
      "confianca": "Alta",
      "nivel_risco": "Médio",
      "analise_completa": {
        "resumo": "Why this is a strong bet",
        "forma_mandante": "Form analysis",
        "forma_visitante": "Form analysis",
        "h2h": "H2H analysis",
        "xg_stats": "Statistics",
        "lesoes_suspensoes": "Injury report",
        "analise_tatica": "Tactical analysis",
        "fatores_externos": "External factors",
        "cenarios_provaveis": "Likely scenarios",
        "pontos_atencao": "Risks"
      },
      "stats": [
        {"icone": "📊", "label": "Forma (últimos 5)", "valor": "3V 1E 1D"},
        {"icone": "⚽", "label": "Média gols/jogo", "valor": "1.9"}
      ],
      "escalacao_esperada": {
        "mandante": "Formation/lineup",
        "visitante": "Formation/lineup"
      }
    },
    {
      "rank": 3,
      "jogo": "Team E x Team F",
      "competicao": "Copa do Mundo 2026",
      "tipo": "pre-jogo",
      "mercado": "Market name",
      "aposta": "Clear bet description",
      "odd_estimada": "1.75",
      "confianca": "Media",
      "nivel_risco": "Baixo",
      "analise_completa": {
        "resumo": "Why this bet makes sense",
        "forma_mandante": "Form analysis",
        "forma_visitante": "Form analysis",
        "h2h": "H2H analysis",
        "xg_stats": "Statistics",
        "lesoes_suspensoes": "Injury report",
        "analise_tatica": "Tactical analysis",
        "fatores_externos": "External factors",
        "cenarios_provaveis": "Likely scenarios",
        "pontos_atencao": "Risks"
      },
      "stats": [
        {"icone": "📊", "label": "Forma (últimos 5)", "valor": "2V 2E 1D"},
        {"icone": "⚽", "label": "Média gols/jogo", "valor": "1.6"}
      ],
      "escalacao_esperada": {
        "mandante": "Formation/lineup",
        "visitante": "Formation/lineup"
      }
    }
  ]
}

MANDATORY RULES:
- ALL odds MUST be >= ${oddMinima}
- "tipo" must be exactly "pre-jogo" or "ao-vivo"
- "confianca" must be exactly "Alta", "Media" or "Baixa"
- "nivel_risco" must be exactly "Baixo", "Médio" or "Alto"
- Respond in PORTUGUESE BRAZILIAN
- All analise_completa fields must be filled with real, detailed content — not placeholder text
- Return ONLY valid JSON. No markdown. No text before or after.`;
}

// ===== CHAMADA API GROQ =====
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
          content: "You are an elite professional football analyst and betting specialist. Always respond in Brazilian Portuguese. When asked to return JSON, return ONLY valid JSON with no additional text, no markdown formatting, no code blocks."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.65,
      max_tokens: 6000
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
    if (m) {
      try { return JSON.parse(m[0]); } catch(e2) {}
    }
    throw new Error("Não foi possível interpretar a resposta da IA. Tente novamente.");
  }
}

// ===== RENDERIZA RESULTADOS =====
function renderizarResultados(dados) {
  const ranks = ["🥇", "🥈", "🥉"];
  const rankClass = ["rank-1", "rank-2", "rank-3"];

  let html = "";

  // Resumo executivo
  if (dados.resumo_executivo) {
    html += `
      <div class="exec-summary">
        <div class="exec-icon">📋</div>
        <div>
          <div class="exec-title">Resumo Executivo</div>
          <p>${dados.resumo_executivo}</p>
        </div>
      </div>`;
  }

  // Header de resultados
  html += `
    <div class="resultado-header">
      <div class="icon">🎯</div>
      <div>
        <h2>${dados.oportunidades.length} Melhores Oportunidades Identificadas</h2>
        <p>${dados.analise_geral || "Análise profissional baseada em dados históricos e estatísticas avançadas."}</p>
      </div>
    </div>`;

  // Cards de oportunidade
  dados.oportunidades.forEach((op, i) => {
    const isLive = op.tipo === "ao-vivo";
    const ac = op.analise_completa || {};

    const badgeTipo = isLive
      ? `<span class="badge badge-live">🔴 Ao Vivo</span>`
      : `<span class="badge badge-pre">📋 Pré-Jogo</span>`;

    const confMap = { Alta: "confianca-alta", Media: "confianca-media", Baixa: "confianca-baixa" };
    const confIcon = { Alta: "✅", Media: "⚡", Baixa: "⚠️" };
    const riskMap = { "Baixo": "risco-baixo", "Médio": "risco-medio", "Alto": "risco-alto" };
    const riskIcon = { "Baixo": "🟢", "Médio": "🟡", "Alto": "🔴" };

    const cClass = confMap[op.confianca] || "confianca-media";
    const cIcone = confIcon[op.confianca] || "⚡";
    const rClass = riskMap[op.nivel_risco] || "risco-medio";
    const rIcone = riskIcon[op.nivel_risco] || "🟡";

    const statsHtml = (op.stats || []).map(s =>
      `<div class="stat-pill"><span>${s.icone}</span><span>${s.label}:</span><strong>${s.valor}</strong></div>`
    ).join("");

    // Seções de análise profunda
    const secoes = [
      { id: `resumo-${i}`, icone: "💡", titulo: "Por que esta aposta?", conteudo: ac.resumo },
      { id: `forma-${i}`, icone: "📊", titulo: "Forma Recente", conteudo: ac.forma_mandante && ac.forma_visitante ? `<strong>Mandante:</strong> ${ac.forma_mandante}<br/><br/><strong>Visitante:</strong> ${ac.forma_visitante}` : null },
      { id: `h2h-${i}`, icone: "🤝", titulo: "Histórico H2H", conteudo: ac.h2h },
      { id: `xg-${i}`, icone: "🎯", titulo: "xG & Estatísticas", conteudo: ac.xg_stats },
      { id: `lesoes-${i}`, icone: "🚑", titulo: "Lesões & Suspensões", conteudo: ac.lesoes_suspensoes },
      { id: `tatica-${i}`, icone: "♟️", titulo: "Análise Tática", conteudo: ac.analise_tatica },
      { id: `fatores-${i}`, icone: "🌦️", titulo: "Fatores Externos", conteudo: ac.fatores_externos },
      { id: `cenarios-${i}`, icone: "📈", titulo: "Cenários Prováveis", conteudo: ac.cenarios_provaveis },
      { id: `riscos-${i}`, icone: "⚠️", titulo: "Pontos de Atenção", conteudo: ac.pontos_atencao },
    ].filter(s => s.conteudo);

    const secoesHtml = secoes.map(s => `
      <div class="analise-secao">
        <div class="analise-secao-titulo">${s.icone} ${s.titulo}</div>
        <div class="analise-secao-corpo">${s.conteudo}</div>
      </div>`).join("");

    // Escalação
    let escalacaoHtml = "";
    if (op.escalacao_esperada && (op.escalacao_esperada.mandante || op.escalacao_esperada.visitante)) {
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

    html += `
      <div class="oportunidade-card ${rankClass[i] || ""}">

        <!-- CABEÇALHO -->
        <div class="op-header">
          <div class="op-rank">${ranks[i] || "🎯"}</div>
          <div class="op-jogo">
            <strong>${op.jogo}</strong>
            <span>${op.competicao || "Copa do Mundo 2026"}</span>
          </div>
          <div class="op-badges">
            ${badgeTipo}
            <span class="badge badge-confianca ${cClass}">${cIcone} ${op.confianca} Confiança</span>
            <span class="badge badge-risco ${rClass}">${rIcone} Risco ${op.nivel_risco || "—"}</span>
          </div>
        </div>

        <!-- APOSTA DESTAQUE -->
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

        <!-- STATS PILLS -->
        ${statsHtml ? `<div class="op-stats">${statsHtml}</div>` : ""}

        <!-- ESCALAÇÕES -->
        ${escalacaoHtml}

        <!-- ANÁLISE PROFUNDA (ACCORDION) -->
        <div class="analise-accordion">
          <button class="accordion-toggle" onclick="toggleAccordion('acc-${i}')">
            🔬 Ver Análise Completa
            <span class="accordion-arrow" id="arrow-acc-${i}">▼</span>
          </button>
          <div class="accordion-body" id="acc-${i}" style="display:none;">
            ${secoesHtml || "<p style='color:var(--text2);padding:12px;'>Análise detalhada não disponível.</p>"}
          </div>
        </div>

      </div>`;
  });

  document.getElementById("resultados").innerHTML = html;
}

// ===== ACCORDION =====
function toggleAccordion(id) {
  const body = document.getElementById(id);
  const arrow = document.getElementById("arrow-" + id);
  const isOpen = body.style.display !== "none";
  body.style.display = isOpen ? "none" : "block";
  if (arrow) arrow.textContent = isOpen ? "▼" : "▲";
  // Atualiza texto do botão
  const btn = body.previousElementSibling;
  if (btn) btn.innerHTML = `${isOpen ? "🔬" : "🔼"} ${isOpen ? "Ver" : "Ocultar"} Análise Completa <span class="accordion-arrow" id="arrow-${id}">${isOpen ? "▼" : "▲"}</span>`;
}

// ===== FUNÇÃO PRINCIPAL =====
async function analisarJogos() {
  const apiKey = document.getElementById("api-key").value.trim();
  const jogos = document.getElementById("jogos-input").value.trim();
  const contexto = document.getElementById("contexto-extra").value.trim();
  const oddMinima = document.getElementById("odd-minima").value || "1.70";
  const aoVivo = document.getElementById("ao-vivo").checked;
  const preJogo = document.getElementById("pre-jogo").checked;

  if (!apiKey) { mostrarErro("Insira sua chave da API Groq."); return; }
  if (!apiKey.startsWith("gsk_")) {
    mostrarErro("Chave inválida. A chave Groq começa com <strong>gsk_</strong>. Acesse <a href='https://console.groq.com' target='_blank'>console.groq.com</a>");
    return;
  }
  if (!jogos) { mostrarErro("Informe ao menos um jogo para analisar."); return; }
  if (!aoVivo && !preJogo) { mostrarErro("Selecione ao menos um tipo: pré-jogo ou ao vivo."); return; }

  salvarConfig();

  const btn = document.getElementById("btn-analisar");
  const loading = document.getElementById("loading");

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Analisando...`;
  loading.style.display = "flex";
  document.getElementById("resultados").innerHTML = "";

  try {
    const prompt = montarPrompt(jogos, contexto, oddMinima, aoVivo, preJogo);
    const resposta = await chamarGroq(apiKey, prompt);
    const dados = parseResposta(resposta);

    if (!dados.oportunidades?.length) {
      mostrarErro("A IA não encontrou oportunidades. Tente adicionar mais jogos ou contexto.");
      return;
    }

    renderizarResultados(dados);

  } catch(e) {
    mostrarErro(e.message || "Erro inesperado. Tente novamente.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `🔍 Analisar com IA`;
    loading.style.display = "none";
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  carregarConfig();
  document.getElementById("jogos-input").addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "Enter") analisarJogos();
  });
});
