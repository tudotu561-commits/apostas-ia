const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO_WEB   = "compound-beta";              // busca na web automaticamente
const MODELO_JSON  = "llama-3.3-70b-versatile";    // gera JSON limpo

// ===== UTILITÁRIOS =====
function toggleApiKey() {
  const input = document.getElementById("api-key");
  input.type = input.type === "password" ? "text" : "password";
}

function mostrarErro(msg) {
  document.getElementById("resultados").innerHTML = `
    <div class="erro-card">
      <div class="erro-icon">⚠️</div>
      <div><strong>Erro</strong><br/>${msg}</div>
    </div>`;
}

function mostrarErroLive(msg) {
  document.getElementById("resultado-ao-vivo").innerHTML = `
    <div class="erro-card" style="margin-top:12px">
      <div class="erro-icon">⚠️</div>
      <div><strong>Erro</strong><br/>${msg}</div>
    </div>`;
}

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


// ===== CHAMADA GROQ COM BUSCA WEB (compound-beta) =====
async function chamarGroqWeb(apiKey, mensagem) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODELO_WEB,
      messages: [
        {
          role: "system",
          content: `Você é um analista profissional de futebol e apostas esportivas de elite.
Sempre pesquise na internet antes de responder.
Use obrigatoriamente os seguintes sites para buscar dados:
- https://www.flashscore.com/
- https://fbref.com/en/
- https://www.academiadasapostasbrasil.com/
- https://www.sofascore.com/
- https://www.whoscored.com/
Busque: placar ao vivo, estatísticas, escalações, lesões, forma recente, H2H.
Responda sempre em português brasileiro.`
        },
        { role: "user", content: mensagem }
      ],
      temperature: 0.4,
      max_tokens: 6000
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("Chave de API inválida. Verifique em <a href='https://console.groq.com' target='_blank'>console.groq.com</a>");
    if (res.status === 429) throw new Error("Limite de requisições atingido. Aguarde alguns segundos e tente novamente.");
    throw new Error(`Erro na API Groq (${res.status}): ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ===== CHAMADA GROQ PARA GERAR JSON LIMPO =====
async function chamarGroqJson(apiKey, dadosColetados, promptJson) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODELO_JSON,
      messages: [
        {
          role: "system",
          content: "Você é um especialista em apostas esportivas. Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois."
        },
        {
          role: "user",
          content: `Com base nos dados abaixo, gere o JSON solicitado:\n\n${dadosColetados}\n\n${promptJson}`
        }
      ],
      temperature: 0.3,
      max_tokens: 6000
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Erro ao gerar análise: ${err.error?.message || res.statusText}`);
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


// ===== PROMPT DE COLETA WEB (pré-jogo) =====
function promptColetaPreJogo(jogos) {
  return `Pesquise agora na internet informações ATUALIZADAS sobre os seguintes jogos de futebol:

${jogos}

Busque nos sites: flashscore.com, fbref.com, academiadasapostasbrasil.com, sofascore.com, whoscored.com

Para CADA jogo, colete e retorne em texto detalhado:
1. Forma recente dos times (últimos 5, 10 e 15 jogos)
2. Desempenho em casa e fora
3. Média de gols marcados e sofridos
4. xG (Expected Goals) se disponível
5. Lesões e suspensões confirmadas
6. Escalações esperadas ou confirmadas
7. Histórico H2H (últimos 10 confrontos)
8. Notícias recentes, coletivas de imprensa
9. Clima e condições do estádio
10. Importância da partida e contexto da competição

Seja completo e específico. Inclua números e dados reais encontrados.`;
}

// ===== PROMPT JSON PRÉ-JOGO =====
function promptJsonPreJogo(oddMinima) {
  return `Agora com os dados acima, gere EXATAMENTE este JSON (sem markdown, sem texto extra):

{
  "resumo_executivo": "Resumo executivo dos jogos em 2-3 frases em português",
  "analise_geral": "Contexto geral dos jogos",
  "melhor_aposta": {
    "jogo": "Time A x Time B",
    "competicao": "Nome da competição",
    "tipo": "pre-jogo",
    "mercado": "Nome do mercado",
    "aposta": "Descrição clara da aposta",
    "odd_estimada": "2.05",
    "confianca": "Alta",
    "nivel_risco": "Baixo",
    "analise_completa": {
      "resumo": "Por que esta é a MELHOR aposta do dia — raciocínio detalhado com dados reais",
      "forma_mandante": "Forma recente com resultados reais encontrados",
      "forma_visitante": "Forma recente com resultados reais encontrados",
      "h2h": "Histórico H2H com dados reais encontrados",
      "xg_stats": "xG, xGA, chutes, estatísticas encontradas",
      "lesoes_suspensoes": "Lesões e suspensões confirmadas encontradas",
      "analise_tatica": "Análise tática baseada nos dados coletados",
      "fatores_externos": "Clima, fadiga, viagem, torcida — dados encontrados",
      "cenarios_provaveis": "3 cenários mais prováveis com probabilidades",
      "pontos_atencao": "Riscos e incertezas desta aposta"
    },
    "stats": [
      {"icone": "📊", "label": "Forma (5 jogos)", "valor": "baseado em dados reais"},
      {"icone": "⚽", "label": "Média gols/jogo", "valor": "baseado em dados reais"},
      {"icone": "🎯", "label": "xG médio", "valor": "baseado em dados reais"},
      {"icone": "🤝", "label": "H2H (5 jogos)", "valor": "baseado em dados reais"},
      {"icone": "🛡️", "label": "Gols sofridos/jogo", "valor": "baseado em dados reais"},
      {"icone": "📈", "label": "Aproveitamento", "valor": "baseado em dados reais"}
    ],
    "escalacao_esperada": {
      "mandante": "Escalação encontrada ou provável",
      "visitante": "Escalação encontrada ou provável"
    }
  },
  "aposta_secundaria": {
    "jogo": "Time C x Time D",
    "competicao": "Nome da competição",
    "tipo": "pre-jogo",
    "mercado": "Nome do mercado",
    "aposta": "Descrição clara da aposta",
    "odd_estimada": "1.85",
    "confianca": "Alta",
    "nivel_risco": "Baixo",
    "analise_completa": {
      "resumo": "Por que esta é uma aposta secundária forte",
      "forma_mandante": "Forma recente real",
      "forma_visitante": "Forma recente real",
      "h2h": "H2H real",
      "xg_stats": "Estatísticas reais",
      "lesoes_suspensoes": "Lesões reais",
      "analise_tatica": "Análise tática",
      "fatores_externos": "Fatores externos",
      "cenarios_provaveis": "Cenários prováveis",
      "pontos_atencao": "Riscos"
    },
    "stats": [
      {"icone": "📊", "label": "Forma (5 jogos)", "valor": "real"},
      {"icone": "⚽", "label": "Média gols/jogo", "valor": "real"},
      {"icone": "🎯", "label": "xG médio", "valor": "real"},
      {"icone": "🤝", "label": "H2H (5 jogos)", "valor": "real"}
    ],
    "escalacao_esperada": {
      "mandante": "Escalação provável",
      "visitante": "Escalação provável"
    }
  },
  "analise_ao_vivo": [
    {
      "jogo": "Time A x Time B",
      "descricao_cenario": "O que monitorar neste jogo ao vivo e por quê tem valor",
      "oportunidades": [
        {
          "titulo": "Título curto do gatilho",
          "gatilho": "SE [situação exata: placar X a Y no minuto Z com time A tendo N chutes] ENTÃO entrar",
          "aposta": "Aposta exata a fazer",
          "mercado": "Mercado",
          "odd_alvo": "2.10",
          "janela_tempo": "Minutos 55-75 / Após primeiro gol / Intervalo",
          "logica": "Por que esta situação cria valor estatisticamente",
          "alertas": "O que cancelaria esta oportunidade"
        },
        {
          "titulo": "Segundo gatilho",
          "gatilho": "Situação específica",
          "aposta": "Aposta exata",
          "mercado": "Mercado",
          "odd_alvo": "1.90",
          "janela_tempo": "Janela de tempo",
          "logica": "Raciocínio estatístico",
          "alertas": "Alertas"
        },
        {
          "titulo": "Terceiro gatilho",
          "gatilho": "Situação específica",
          "aposta": "Aposta exata",
          "mercado": "Mercado",
          "odd_alvo": "2.30",
          "janela_tempo": "Janela de tempo",
          "logica": "Raciocínio",
          "alertas": "Alertas"
        }
      ]
    }
  ]
}

REGRAS OBRIGATÓRIAS:
- Todas as odds >= ${oddMinima}
- "tipo" = exatamente "pre-jogo" ou "ao-vivo"
- "confianca" = exatamente "Alta", "Media" ou "Baixa"
- "nivel_risco" = exatamente "Baixo", "Médio" ou "Alto"
- Todo texto em português brasileiro
- Use APENAS dados reais coletados, nunca invente
- Retorne APENAS JSON válido`;
}

// ===== PROMPT COLETA AO VIVO =====
function promptColetaAoVivo(jogo) {
  const agora = new Date();
  const horario = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const data = agora.toLocaleDateString("pt-BR");

  return `Pesquise AGORA (${horario} de ${data}) nos sites flashscore.com e sofascore.com o estado ATUAL do jogo:

${jogo}

Busque e retorne em texto detalhado:
1. PLACAR ATUAL do jogo
2. MINUTO atual do jogo
3. Posse de bola (%)
4. Total de chutes (e chutes no gol)
5. Escanteios
6. Cartões amarelos e vermelhos
7. Gols marcados (quem marcou e em que minuto)
8. Cartões (quem levou e em que minuto)
9. Substituições realizadas
10. Qual time está dominando a partida
11. Pressão e momentum atual
12. Alguma situação especial (VAR, lesão, etc.)

Se o jogo ainda não começou, informe o horário de início.
Se o jogo já terminou, informe o placar final e um resumo.
Seja preciso e use dados reais encontrados agora.`;
}

// ===== PROMPT JSON AO VIVO =====
function promptJsonAoVivo(jogo, oddMinima) {
  const agora = new Date();
  const horario = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return `Com os dados ao vivo coletados acima, gere EXATAMENTE este JSON (sem markdown, sem texto extra):

{
  "horario_analise": "${horario}",
  "jogo": "${jogo}",
  "minuto": "minuto atual encontrado",
  "placar_atual": "X x Y",
  "status_jogo": "Em andamento / Intervalo / Encerrado / Não iniciado",
  "resumo_momento": "2-3 frases descrevendo o estado atual e momentum do jogo",
  "time_dominante": "home ou away ou equal",
  "momentum": "Qual time está no controle e por quê, baseado nos dados coletados",
  "melhor_aposta_live": {
    "aposta": "Aposta exata a fazer AGORA",
    "mercado": "Nome do mercado",
    "odd_estimada": "1.95",
    "confianca": "Alta",
    "nivel_risco": "Baixo",
    "justificativa": "Por que esta é a melhor aposta agora — cite placar, stats, minuto e dinâmica",
    "janela_ideal": "Por quanto tempo esta oportunidade é válida",
    "alertas": "O que invalidaria esta aposta"
  },
  "aposta_alternativa": {
    "aposta": "Aposta alternativa caso as odds mudem",
    "mercado": "Mercado",
    "odd_estimada": "2.10",
    "justificativa": "Por que é uma boa alternativa agora"
  },
  "analise_estatisticas": "Análise profunda do que as stats atuais revelam sobre a trajetória do jogo",
  "proximo_evento_esperado": "O que é mais provável acontecer nos próximos minutos",
  "riscos_agora": "Riscos e pontos de atenção nos próximos minutos",
  "stats_live": [
    {"icone": "⏱️", "label": "Minuto", "valor": "minuto encontrado"},
    {"icone": "🏆", "label": "Placar", "valor": "placar encontrado"},
    {"icone": "📊", "label": "Posse", "valor": "X% x Y%"},
    {"icone": "🎯", "label": "Chutes", "valor": "X x Y"},
    {"icone": "🟩", "label": "Escanteios", "valor": "X x Y"},
    {"icone": "🟨", "label": "Amarelos", "valor": "X x Y"}
  ]
}

REGRAS:
- odd_estimada >= ${oddMinima}
- "confianca" = "Alta", "Media" ou "Baixa"
- "nivel_risco" = "Baixo", "Médio" ou "Alto"
- Todo texto em português brasileiro
- Baseie TUDO nos dados reais coletados agora
- Retorne APENAS JSON válido`;
}


// ===== RENDERIZA CARD DE APOSTA =====
function renderizarCardAposta(op, tipo) {
  if (!op) return "";
  const ac = op.analise_completa || {};
  const isLive   = op.tipo === "ao-vivo";
  const isMelhor = tipo === "melhor";
  const acId     = "acc-" + tipo;

  const confClass = { Alta: "confianca-alta", Media: "confianca-media", Baixa: "confianca-baixa" }[op.confianca] || "confianca-media";
  const confIcon  = { Alta: "✅", Media: "⚡", Baixa: "⚠️" }[op.confianca] || "⚡";
  const riskClass = { "Baixo":"risco-baixo", "Médio":"risco-medio", "Alto":"risco-alto" }[op.nivel_risco] || "risco-medio";
  const riskIcon  = { "Baixo":"🟢", "Médio":"🟡", "Alto":"🔴" }[op.nivel_risco] || "🟡";

  const statsHtml = (op.stats || []).map(s =>
    `<div class="stat-pill"><span>${s.icone}</span><span>${s.label}:</span><strong>${s.valor}</strong></div>`
  ).join("");

  const secoes = [
    { icone:"💡", titulo:"Por que esta aposta?", conteudo: ac.resumo },
    { icone:"📊", titulo:"Forma Recente",
      conteudo: ac.forma_mandante && ac.forma_visitante
        ? `<strong>🏠 Mandante:</strong> ${ac.forma_mandante}<br/><br/><strong>✈️ Visitante:</strong> ${ac.forma_visitante}`
        : null },
    { icone:"🤝", titulo:"Histórico H2H",        conteudo: ac.h2h },
    { icone:"🎯", titulo:"xG & Estatísticas",    conteudo: ac.xg_stats },
    { icone:"🚑", titulo:"Lesões & Suspensões",  conteudo: ac.lesoes_suspensoes },
    { icone:"♟️", titulo:"Análise Tática",       conteudo: ac.analise_tatica },
    { icone:"🌦️", titulo:"Fatores Externos",     conteudo: ac.fatores_externos },
    { icone:"📈", titulo:"Cenários Prováveis",   conteudo: ac.cenarios_provaveis },
    { icone:"⚠️", titulo:"Pontos de Atenção",    conteudo: ac.pontos_atencao },
  ].filter(s => s.conteudo);

  let escalacaoHtml = "";
  if (op.escalacao_esperada?.mandante || op.escalacao_esperada?.visitante) {
    escalacaoHtml = `
      <div class="escalacao-box">
        <div class="escalacao-titulo">⭐ Escalações Esperadas</div>
        <div class="escalacao-grid">
          <div class="escalacao-time"><span class="escalacao-label">🏠 Mandante</span><span>${op.escalacao_esperada.mandante || "—"}</span></div>
          <div class="escalacao-time"><span class="escalacao-label">✈️ Visitante</span><span>${op.escalacao_esperada.visitante || "—"}</span></div>
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
        <div class="op-jogo"><strong>${op.jogo}</strong><span>${op.competicao || ""}</span></div>
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

// ===== RENDERIZA AO VIVO (GATILHOS) =====
function renderizarAoVivo(lista) {
  if (!lista?.length) return "";
  let html = `
    <div class="ao-vivo-section" id="ao-vivo-section">
      <div class="ao-vivo-header">
        <div class="ao-vivo-dot-wrap"><span class="ao-vivo-dot"></span></div>
        <div>
          <div class="ao-vivo-title">🔴 GATILHOS IN-PLAY — AO VIVO</div>
          <div class="ao-vivo-subtitle">Monitore estas situações durante os jogos. Quando o gatilho ocorrer, entre na aposta.</div>
        </div>
      </div>`;

  lista.forEach(jogo => {
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
                    <span class="av-badge av-badge-odd">Odd: <strong>${op.odd_alvo}</strong></span>
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
                <div class="av-secao"><div class="av-secao-titulo">🧠 Lógica</div><div class="av-secao-corpo">${op.logica}</div></div>
                ${op.alertas ? `<div class="av-secao av-secao-alerta"><div class="av-secao-titulo">🚨 Quando NÃO entrar</div><div class="av-secao-corpo">${op.alertas}</div></div>` : ""}
              </div>
            </div>`).join("")}
        </div>
      </div>`;
  });

  html += `</div>`;
  return html;
}


// ===== RENDERIZA RESULTADO AO VIVO =====
function renderizarResultadoAoVivo(dados) {
  const ml  = dados.melhor_aposta_live || {};
  const alt = dados.aposta_alternativa  || {};

  const confClass = { Alta:"confianca-alta", Media:"confianca-media", Baixa:"confianca-baixa" }[ml.confianca] || "confianca-media";
  const confIcon  = { Alta:"✅", Media:"⚡", Baixa:"⚠️" }[ml.confianca] || "⚡";
  const riskClass = { "Baixo":"risco-baixo", "Médio":"risco-medio", "Alto":"risco-alto" }[ml.nivel_risco] || "risco-medio";
  const riskIcon  = { "Baixo":"🟢", "Médio":"🟡", "Alto":"🔴" }[ml.nivel_risco] || "🟡";

  const statsHtml = (dados.stats_live || []).map(s =>
    `<div class="stat-pill stat-pill-live"><span>${s.icone}</span><span>${s.label}:</span><strong>${s.valor}</strong></div>`
  ).join("");

  const statusCor = dados.status_jogo === "Encerrado" ? "var(--text2)" :
                    dados.status_jogo === "Não iniciado" ? "var(--warning)" : "var(--danger)";

  const html = `
    <div class="live-resultado-wrap" id="live-resultado-wrap-outer">

      <div class="live-resultado-header">
        <div class="live-resultado-placar">
          <div class="live-resultado-jogo">${dados.jogo || ""}</div>
          <div class="live-resultado-score">${dados.placar_atual || "—"}</div>
          <div class="live-resultado-min" style="color:${statusCor}">
            ⏱️ ${dados.minuto || "?"}' &nbsp;·&nbsp; ${dados.status_jogo || ""} &nbsp;·&nbsp; Análise às ${dados.horario_analise || ""}
          </div>
        </div>
        <div class="live-momentum-badge live-momentum-${dados.time_dominante || "equal"}">
          ${dados.time_dominante === "home" ? "🏠 Mandante Dominando" :
            dados.time_dominante === "away" ? "✈️ Visitante Dominando" : "⚖️ Equilíbrio"}
        </div>
      </div>

      ${statsHtml ? `<div class="op-stats live-stats-row">${statsHtml}</div>` : ""}

      <div class="live-momento">
        <div class="live-momento-titulo">🧠 Leitura do Momento</div>
        <div class="live-momento-texto">${dados.resumo_momento || ""}</div>
      </div>
      ${dados.momentum ? `
      <div class="live-momento live-momento-momentum">
        <div class="live-momento-titulo">📈 Momentum</div>
        <div class="live-momento-texto">${dados.momentum}</div>
      </div>` : ""}

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

      ${dados.analise_estatisticas ? `<div class="live-secao-detalhe"><div class="live-secao-titulo">📊 Análise das Estatísticas</div><div class="live-secao-corpo">${dados.analise_estatisticas}</div></div>` : ""}
      ${dados.proximo_evento_esperado ? `<div class="live-secao-detalhe"><div class="live-secao-titulo">🔮 Próximo Evento Esperado</div><div class="live-secao-corpo">${dados.proximo_evento_esperado}</div></div>` : ""}
      ${dados.riscos_agora ? `<div class="live-secao-detalhe live-secao-risco"><div class="live-secao-titulo">⚠️ Riscos Agora</div><div class="live-secao-corpo">${dados.riscos_agora}</div></div>` : ""}

      <div class="live-export-bar">
        <button class="btn-export btn-export-vivo" onclick="exportarImagem('live-resultado-wrap-outer', 'ao-vivo')">
          📸 Baixar Esta Análise Ao Vivo
        </button>
        <button class="btn-export" style="background:var(--bg4);color:var(--text2);border:1px solid var(--border);" onclick="analisarAoVivo()">
          🔄 Atualizar Análise
        </button>
      </div>
    </div>`;

  document.getElementById("resultado-ao-vivo").innerHTML = html;
  document.getElementById("resultado-ao-vivo").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===== EXPORTAR + ACCORDION =====
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
        <button class="btn-export" onclick="exportarImagem('resultados-inner', 'analise-completa')">⬇️ Apostas Pré-Jogo</button>
        <button class="btn-export btn-export-vivo" onclick="exportarImagem('ao-vivo-section', 'ao-vivo')">🔴 Gatilhos Ao Vivo</button>
      </div>
    </div>`;
}

async function exportarImagem(elementId, nomeArquivo) {
  const el = document.getElementById(elementId);
  if (!el) { alert("Seção não encontrada."); return; }
  const btn = event.currentTarget;
  const original = btn.innerHTML;
  btn.innerHTML = "⏳ Gerando...";
  btn.disabled = true;
  const accordions = el.querySelectorAll(".accordion-body");
  const estados = [];
  accordions.forEach(a => { estados.push(a.style.display); a.style.display = "block"; });
  try {
    const canvas = await html2canvas(el, { backgroundColor: "#0b0d12", scale: 2, useCORS: true, logging: false, scrollY: -window.scrollY });
    const hoje = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-");
    const link = document.createElement("a");
    link.download = `betanalytics-${nomeArquivo}-${hoje}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch(e) { alert("Erro: " + e.message); }
  finally {
    accordions.forEach((a, i) => { a.style.display = estados[i]; });
    btn.innerHTML = original;
    btn.disabled = false;
  }
}

function toggleAccordion(id, btn) {
  const body = document.getElementById(id);
  const isOpen = body.style.display !== "none";
  body.style.display = isOpen ? "none" : "block";
  if (btn) {
    btn.innerHTML = `${isOpen?"🔬":"🔼"} ${isOpen?"Ver":"Ocultar"} Análise Completa <span class="accordion-arrow">${isOpen?"▼":"▲"}</span>`;
  }
}


// ===== RENDERIZA TUDO =====
function renderizarResultados(dados) {
  let inner = "";
  if (dados.resumo_executivo) {
    inner += `
      <div class="exec-summary">
        <div class="exec-icon">📋</div>
        <div><div class="exec-title">Resumo Executivo</div><p>${dados.resumo_executivo}</p></div>
      </div>`;
  }
  inner += `
    <div class="resultado-header">
      <div class="icon">🎯</div>
      <div><h2>Análise Profissional Concluída</h2><p>${dados.analise_geral || ""}</p></div>
    </div>`;
  inner += renderizarCardAposta(dados.melhor_aposta, "melhor");
  inner += renderizarCardAposta(dados.aposta_secundaria, "secundaria");

  let html = `<div id="resultados-inner">${inner}</div>`;
  if (dados.analise_ao_vivo?.length) {
    html += `<div class="divisor-section"><span>🔴 GATILHOS IN-PLAY — AO VIVO</span></div>`;
    html += renderizarAoVivo(dados.analise_ao_vivo);
  }
  html += renderizarExportar();
  document.getElementById("resultados").innerHTML = html;
}

function mostrarPainelAoVivo(jogos) {
  const painel = document.getElementById("painel-ao-vivo");
  if (!painel) return;
  painel.style.display = "block";
  const linhas = jogos.split("\n").map(l => l.trim()).filter(Boolean);
  if (linhas.length === 1) {
    const jogo = linhas[0].split(" - ")[0].trim();
    const el = document.getElementById("live-jogo");
    if (el) el.value = jogo;
  }
}

// ===== ANALISAR PRÉ-JOGO =====
async function analisarJogos() {
  const apiKey    = document.getElementById("api-key").value.trim();
  const jogos     = document.getElementById("jogos-input").value.trim();
  const oddMinima = document.getElementById("odd-minima").value || "1.70";

  if (!apiKey) { mostrarErro("Insira sua chave da API Groq."); return; }
  if (!apiKey.startsWith("gsk_")) { mostrarErro("Chave inválida. Começa com <strong>gsk_</strong>. Acesse <a href='https://console.groq.com' target='_blank'>console.groq.com</a>"); return; }
  if (!jogos) { mostrarErro("Informe ao menos um jogo."); return; }

  salvarConfig();

  const btn     = document.getElementById("btn-analisar");
  const loading = document.getElementById("loading");

  btn.disabled = true;
  loading.style.display = "flex";
  document.getElementById("resultados").innerHTML = "";

  try {
    // PASSO 1: Coleta dados reais da web
    btn.innerHTML = `<span class="btn-spinner"></span> Buscando dados nos sites...`;
    const dadosColetados = await chamarGroqWeb(apiKey, promptColetaPreJogo(jogos));

    // PASSO 2: Gera JSON com análise
    btn.innerHTML = `<span class="btn-spinner"></span> Gerando análise...`;
    const respostaJson = await chamarGroqJson(apiKey, dadosColetados, promptJsonPreJogo(oddMinima));
    const dados = parseResposta(respostaJson);

    if (!dados.melhor_aposta) { mostrarErro("A IA não retornou análise. Tente novamente."); return; }

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

// ===== ANALISAR AO VIVO =====
async function analisarAoVivo() {
  const apiKey    = document.getElementById("api-key").value.trim();
  const jogo      = document.getElementById("live-jogo").value.trim();
  const oddMinima = document.getElementById("odd-minima").value || "1.70";

  if (!apiKey) { alert("Insira sua chave Groq na sidebar."); return; }
  if (!jogo)   { alert("Informe o nome do jogo."); return; }

  const btn       = document.getElementById("btn-live");
  const container = document.getElementById("resultado-ao-vivo");

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-spinner"></span> Buscando dados ao vivo...`;
  container.innerHTML = `
    <div class="loading-card" style="margin-top:12px;">
      <div class="loading-inner">
        <div class="loading-spinner"></div>
        <div class="loading-text">
          <strong>Buscando dados ao vivo de ${jogo}...</strong>
          <span>Consultando Flashscore, SofaScore e outros sites em tempo real</span>
        </div>
      </div>
    </div>`;

  try {
    // PASSO 1: Busca dados ao vivo reais
    const dadosLive = await chamarGroqWeb(apiKey, promptColetaAoVivo(jogo));

    // PASSO 2: Gera JSON
    btn.innerHTML = `<span class="btn-spinner"></span> Analisando...`;
    const respostaJson = await chamarGroqJson(apiKey, dadosLive, promptJsonAoVivo(jogo, oddMinima));
    const dados = parseResposta(respostaJson);

    renderizarResultadoAoVivo(dados);

  } catch(e) {
    mostrarErroLive(e.message || "Erro inesperado. Tente novamente.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `🔴 Buscar Dados Ao Vivo e Analisar`;
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  carregarConfig();
  document.getElementById("jogos-input").addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "Enter") analisarJogos();
  });
});
