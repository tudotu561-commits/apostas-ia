const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELO = "llama-3.3-70b-versatile";

function toggleApiKey() {
  const input = document.getElementById("api-key");
  input.type = input.type === "password" ? "text" : "password";
}

function mostrarErro(mensagem) {
  document.getElementById("resultados").innerHTML = `
    <div class="erro-card">
      <span style="font-size:1.4rem">⚠️</span>
      <div><strong>Erro</strong><br/>${mensagem}</div>
    </div>`;
}

function salvarApiKey(key) { try { localStorage.setItem("groq_api_key", key); } catch(e) {} }
function carregarApiKey() { try { const s = localStorage.getItem("groq_api_key"); if (s) document.getElementById("api-key").value = s; } catch(e) {} }

function montarPrompt(jogos, contextoExtra, oddMinima, incluirAoVivo, incluirPreJogo) {
  const tipos = [];
  if (incluirPreJogo) tipos.push("pré-jogo");
  if (incluirAoVivo) tipos.push("ao vivo (in-play)");

  return `Você é um especialista em análise de apostas esportivas de futebol com 20+ anos de experiência.

JOGOS PARA ANALISAR HOJE:
${jogos}
${contextoExtra ? `\nCONTEXTO ADICIONAL:\n${contextoExtra}` : ""}

CONFIGURAÇÕES:
- Odd MÍNIMA OBRIGATÓRIA: ${oddMinima} (NUNCA sugira abaixo disso)
- Tipos de mercado: ${tipos.join(" e ")}
- Competição: Copa do Mundo 2026

Analise com base em: histórico H2H, forma recente (últimos 5-10 jogos), desempenho na Copa 2026, estilo tático, contexto da fase, pressão por resultado.
Mercados possíveis: 1X2, ambas marcam, over/under gols, handicap asiático, escanteios, cartões.

Retorne SOMENTE este JSON (sem texto extra, sem markdown):

{
  "analise_geral": "Resumo dos jogos em 2-3 frases",
  "oportunidades": [
    {
      "rank": 1,
      "jogo": "Time A x Time B",
      "competicao": "Copa do Mundo 2026",
      "tipo": "pre-jogo",
      "mercado": "Nome do mercado",
      "aposta": "Descrição clara da aposta",
      "odd_estimada": "1.85",
      "confianca": "Alta",
      "analise": "Análise detalhada com dados e justificativa clara.",
      "stats": [
        {"icone": "⚽", "label": "Últimos 5 jogos", "valor": "4V 1E 0D"},
        {"icone": "📊", "label": "H2H", "valor": "3V 2E 1D"}
      ]
    },
    {
      "rank": 2,
      "jogo": "Time C x Time D",
      "competicao": "Copa do Mundo 2026",
      "tipo": "ao-vivo",
      "mercado": "Nome do mercado",
      "aposta": "Descrição clara",
      "odd_estimada": "2.10",
      "confianca": "Media",
      "analise": "Análise detalhada...",
      "stats": [{"icone": "🔥", "label": "Sequência", "valor": "3 sem perder"}]
    },
    {
      "rank": 3,
      "jogo": "Time E x Time F",
      "competicao": "Copa do Mundo 2026",
      "tipo": "pre-jogo",
      "mercado": "Nome do mercado",
      "aposta": "Descrição clara",
      "odd_estimada": "1.75",
      "confianca": "Alta",
      "analise": "Análise detalhada...",
      "stats": [{"icone": "📈", "label": "Aproveitamento", "valor": "78%"}]
    }
  ]
}

REGRAS: odds >= ${oddMinima} | tipo = "pre-jogo" ou "ao-vivo" | confianca = "Alta", "Media" ou "Baixa" | apenas JSON puro`;
}

async function chamarGroq(apiKey, prompt) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODELO,
      messages: [
        { role: "system", content: "Especialista em apostas esportivas. Responda em português brasileiro. Retorne apenas JSON quando solicitado." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("Chave de API inválida. Verifique em console.groq.com");
    if (res.status === 429) throw new Error("Limite atingido. Aguarde e tente novamente.");
    throw new Error(`Erro na API: ${err.error?.message || res.statusText}`);
  }

  return (await res.json()).choices[0].message.content;
}

function parseResposta(texto) {
  let limpo = texto.trim().replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"");
  try { return JSON.parse(limpo); } catch(e) {
    const m = limpo.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Não foi possível interpretar a resposta da IA. Tente novamente.");
  }
}

function renderizarResultados(dados) {
  const ranks = ["🥇","🥈","🥉"];
  const rankClass = ["rank-1","rank-2","rank-3"];

  let html = `
    <div class="resultado-header">
      <div class="icon">🎯</div>
      <div>
        <h2>Análise Concluída — ${dados.oportunidades.length} Oportunidades</h2>
        <p>${dados.analise_geral || "Análise baseada em histórico e estatísticas."}</p>
      </div>
    </div>`;

  dados.oportunidades.forEach((op, i) => {
    const isLive = op.tipo === "ao-vivo";
    const badgeTipo = isLive
      ? `<span class="badge badge-live">🔴 Ao Vivo</span>`
      : `<span class="badge badge-pre">📋 Pré-Jogo</span>`;
    const cClass = {Alta:"confianca-alta",Media:"confianca-media",Baixa:"confianca-baixa"}[op.confianca]||"confianca-media";
    const cIcone = {Alta:"✅",Media:"⚡",Baixa:"⚠️"}[op.confianca]||"⚡";
    const statsHtml = (op.stats||[]).map(s=>`<div class="stat-pill"><span>${s.icone}</span><span>${s.label}:</span><strong>${s.valor}</strong></div>`).join("");

    html += `
      <div class="oportunidade-card ${rankClass[i]||""}">
        <div class="op-header">
          <div class="op-rank">${ranks[i]||"🎯"}</div>
          <div class="op-jogo"><strong>${op.jogo}</strong><span>${op.competicao||"Copa do Mundo 2026"}</span></div>
          <div class="op-badges">${badgeTipo}<span class="badge badge-confianca ${cClass}">${cIcone} ${op.confianca}</span></div>
        </div>
        <div class="op-body">
          <div class="op-aposta">
            <div class="op-aposta-info">
              <span class="op-aposta-tipo">${op.mercado}</span>
              <span class="op-aposta-nome">${op.aposta}</span>
            </div>
            <div class="op-odd">
              <span class="op-odd-label">Odd Est.</span>
              <span class="op-odd-valor">${op.odd_estimada}</span>
            </div>
          </div>
          <div class="op-analise">${op.analise}</div>
          ${statsHtml?`<div class="op-stats">${statsHtml}</div>`:""}
        </div>
      </div>`;
  });

  document.getElementById("resultados").innerHTML = html;
}

async function analisarJogos() {
  const apiKey = document.getElementById("api-key").value.trim();
  const jogos = document.getElementById("jogos-input").value.trim();
  const contexto = document.getElementById("contexto-extra").value.trim();
  const oddMinima = document.getElementById("odd-minima").value || "1.70";
  const aoVivo = document.getElementById("ao-vivo").checked;
  const preJogo = document.getElementById("pre-jogo").checked;

  if (!apiKey) { mostrarErro("Insira sua chave da API Groq."); return; }
  if (!apiKey.startsWith("gsk_")) { mostrarErro("Chave inválida. A chave Groq começa com <strong>gsk_</strong>. Acesse <a href='https://console.groq.com' target='_blank'>console.groq.com</a>"); return; }
  if (!jogos) { mostrarErro("Informe ao menos um jogo para analisar."); return; }
  if (!aoVivo && !preJogo) { mostrarErro("Selecione ao menos um tipo: pré-jogo ou ao vivo."); return; }

  salvarApiKey(apiKey);

  const btn = document.getElementById("btn-analisar");
  const loading = document.getElementById("loading");
  btn.disabled = true;
  btn.textContent = "⏳ Analisando...";
  loading.style.display = "flex";
  document.getElementById("resultados").innerHTML = "";

  try {
    const prompt = montarPrompt(jogos, contexto, oddMinima, aoVivo, preJogo);
    const resposta = await chamarGroq(apiKey, prompt);
    const dados = parseResposta(resposta);
    if (!dados.oportunidades?.length) { mostrarErro("A IA não encontrou oportunidades. Adicione mais jogos."); return; }
    renderizarResultados(dados);
  } catch(e) {
    mostrarErro(e.message || "Erro inesperado. Tente novamente.");
  } finally {
    btn.disabled = false;
    btn.textContent = "🔍 Analisar com IA";
    loading.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarApiKey();
  document.getElementById("jogos-input").addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "Enter") analisarJogos();
  });
});
