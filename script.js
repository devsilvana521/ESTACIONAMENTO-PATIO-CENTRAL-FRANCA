/* =========================================================
   Pátio Central · Sistema de gestão de estacionamento
   HTML + CSS + JavaScript puro · dados em localStorage
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Constantes ---------- */
  const KEY = 'patio-central-v1';
  const DEF_PRICES = { carro: { h1: 12, hAd: 6, tol: 15, dia: 45 }, moto: { h1: 6, hAd: 3, tol: 15, dia: 22 } };
  const DEF_CAP = { carro: 100, moto: 100 };
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const PAGAMENTOS = ['Pix', 'Dinheiro', 'Cartão'];
  const MIN = 60000, DIA = 86400000;

  /* ---------- Utilitários ---------- */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const pad = (n) => String(n).padStart(2, '0');
  const hm = (t) => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const dmhm = (t) => { const d = new Date(t); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' ' + hm(t); };
  const dataCompleta = (t) => { const d = new Date(t); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + hm(t); };
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const tk = (n) => String(n || 0).padStart(6, '0');
  const tipoNome = (t) => (t === 'carro' ? 'Carro' : 'Moto');
  const vagaLbl = (t, n) => (t === 'carro' ? 'A' : 'B') + pad(n);

  /* ---------- Armazenamento ---------- */
  function load() { try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) { /* sem acesso */ } return null; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sem acesso */ } }

  function seed() {
    const n = Date.now(), m = MIN;
    const hist = [
      { placa: 'NBV5D12', tipo: 'carro', entrada: n - 330 * m, saida: n - 250 * m, vaga: 3, pag: 'Pix' },
      { placa: 'KLA9022', tipo: 'moto', entrada: n - 300 * m, saida: n - 290 * m, vaga: 2, pag: '—' },
      { placa: 'TRC6G58', tipo: 'carro', entrada: n - 240 * m, saida: n - 95 * m, vaga: 4, pag: 'Cartão' },
      { placa: 'MOP2H71', tipo: 'moto', entrada: n - 200 * m, saida: n - 60 * m, vaga: 4, pag: 'Dinheiro' },
    ];
    const act = [
      { placa: 'PLM3E45', tipo: 'carro', entrada: n - 268 * m, vaga: 8, obs: 'Compass preto' },
      { placa: 'RTA4B21', tipo: 'carro', entrada: n - 152 * m, vaga: 1, obs: 'Onix prata' },
      { placa: 'SBX1F09', tipo: 'moto', entrada: n - 77 * m, vaga: 1, obs: 'CG 160' },
      { placa: 'QWE2C87', tipo: 'carro', entrada: n - 41 * m, vaga: 2, obs: 'HB20 branco' },
      { placa: 'OJU8A32', tipo: 'moto', entrada: n - 23 * m, vaga: 3, obs: 'Biz azul' },
      { placa: 'HGK7190', tipo: 'carro', entrada: n - 9 * m, vaga: 5, obs: 'Gol vermelho' },
    ];
    // Movimento fictício dos últimos 20 dias, para os ganhos do mês e o relatório terem o que mostrar
    let semente = 7;
    const rnd = () => { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; };
    const L = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
    const letra = () => L[Math.floor(rnd() * L.length)];
    const dig = () => Math.floor(rnd() * 10);
    for (let dAtras = 1; dAtras <= 20; dAtras++) {
      const dia0 = new Date(); dia0.setHours(0, 0, 0, 0); dia0.setDate(dia0.getDate() - dAtras);
      const fimDeSemana = [0, 6].includes(dia0.getDay());
      const qtd = (fimDeSemana ? 6 : 10) + Math.floor(rnd() * 9);
      for (let i = 0; i < qtd; i++) {
        const tipo = rnd() < 0.62 ? 'carro' : 'moto';
        const entrada = dia0.getTime() + (7 * 60 + Math.floor(rnd() * 11 * 60)) * m;
        const saida = entrada + (8 + Math.floor(rnd() * 330)) * m;
        const placa = letra() + letra() + letra() + dig() + (rnd() < 0.7 ? letra() : dig()) + dig() + dig();
        hist.push({ placa, tipo, entrada, saida, vaga: 1 + Math.floor(rnd() * 40), pag: PAGAMENTOS[Math.floor(rnd() * 3)] });
      }
    }
    let seq = 0;
    hist.sort((a, b) => a.entrada - b.entrada).forEach((h) => {
      h.ticket = ++seq; h.id = 'h' + seq;
      h.valor = calc(h.tipo, h.saida - h.entrada, DEF_PRICES);
      if (!h.valor) h.pag = '—';
    });
    act.forEach((a) => { a.ticket = ++seq; a.id = 'a' + seq; });
    hist.sort((a, b) => b.saida - a.saida);
    return { active: act, hist, prices: clone(DEF_PRICES), cap: clone(DEF_CAP), capV2: true, seq, sample: true };
  }

  // Garante compatibilidade com dados salvos em versões anteriores
  function migrate(s) {
    s.active = Array.isArray(s.active) ? s.active : [];
    s.hist = Array.isArray(s.hist) ? s.hist : [];
    s.prices = s.prices || clone(DEF_PRICES);
    s.cap = s.cap || clone(DEF_CAP);
    if (!s.capV2) { // versão com 100 vagas de cada tipo
      s.cap = { carro: Math.max(s.cap.carro || 0, DEF_CAP.carro), moto: Math.max(s.cap.moto || 0, DEF_CAP.moto) };
      s.capV2 = true;
    }
    s.seq = s.seq || 0;
    const semTicket = [...s.hist].reverse().concat(s.active).filter((v) => !v.ticket);
    semTicket.sort((a, b) => a.entrada - b.entrada).forEach((v) => { v.ticket = ++s.seq; });
    return s;
  }

  let S = migrate(load() || seed());

  /* ---------- Regra de cobrança ---------- */
  // Tolerância grátis → 1ª hora → horas adicionais iniciadas → teto da diária a cada 24 h
  function calc(tipo, ms, prices) {
    const p = (prices || S.prices)[tipo];
    const min = Math.max(0, Math.ceil(ms / MIN));
    if (min <= p.tol) return 0;
    const dias = Math.floor(min / 1440), resto = min % 1440;
    let v = dias * p.dia;
    if (resto > 0) {
      const r = resto <= 60 ? p.h1 : p.h1 + Math.ceil((resto - 60) / 60) * p.hAd;
      v += Math.min(r, p.dia);
    }
    return v;
  }

  function dur(ms) {
    const min = Math.max(0, Math.floor(ms / MIN));
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    return (d ? d + 'd ' : '') + (d || h ? h + 'h ' : '') + m + 'min';
  }

  /* ---------- Placas ---------- */
  const fmtPlate = (p) => (/^[A-Z]{3}\d{4}$/.test(p) ? p.slice(0, 3) + '-' + p.slice(3) : p);
  const plateHTML = (p, lg) => `<span class="plate${lg ? ' lg' : ''}"><b>BRASIL</b><span>${esc(fmtPlate(p))}</span></span>`;
  const pill = (t) => `<span class="pill ${t}"><svg><use href="#i-${t === 'carro' ? 'car' : 'moto'}"/></svg>${tipoNome(t)}</span>`;

  /* ---------- Tema claro / escuro ---------- */
  const root = document.documentElement;
  function effTheme() {
    const a = root.getAttribute('data-theme');
    if (a) return a;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  // O seletor mostra as duas opções; a opção destacada é o tema que está em uso
  function paintThemeBtn() {
    const atual = effTheme();
    $$('[data-theme-opt]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.themeOpt === atual));
  }
  try { const t = localStorage.getItem(KEY + '-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) { /* sem acesso */ }
  $$('[data-theme-opt]').forEach((b) => b.addEventListener('click', () => {
    const n = b.dataset.themeOpt;
    root.setAttribute('data-theme', n);
    try { localStorage.setItem(KEY + '-theme', n); } catch (e) { /* sem acesso */ }
    paintThemeBtn();
  }));
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintThemeBtn);
  paintThemeBtn();

  /* ---------- Notificações ---------- */
  function toast(msg, opt = {}) {
    const t = document.createElement('div');
    t.className = 'toast' + (opt.err ? ' err' : '');
    const s = document.createElement('span');
    s.textContent = msg;
    t.appendChild(s);
    if (opt.action) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'toast-act'; b.textContent = opt.action;
      b.addEventListener('click', () => { opt.fn(); t.remove(); });
      t.appendChild(b);
    }
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), opt.action ? 7000 : 3500);
  }

  /* ---------- Janela de confirmação ---------- */
  function ask(msg, yes, okLabel = 'Confirmar') {
    $('#cMsg').textContent = msg;
    $('#cYes').textContent = okLabel;
    $('#confirm').hidden = false;
    $('#cYes').onclick = () => { $('#confirm').hidden = true; yes(); };
    $('#cNo').onclick = () => { $('#confirm').hidden = true; };
    $('#cNo').focus();
  }

  /* ---------- Download de arquivos ---------- */
  function download(nome, conteudo, tipo) {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nome;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const stamp = () => { const d = new Date(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + pad(d.getHours()) + pad(d.getMinutes()); };

  /* ---------- Comprovante para impressão ---------- */
  function printReceipt(v, tipo) {
    const saida = tipo === 'saida';
    const p = S.prices[v.tipo];
    $('#printArea').innerHTML = `
      <div class="rc">
        <h1>Pátio Central</h1>
        <div class="c">Estacionamento</div>
        <div class="hr"></div>
        <div class="c"><b>${saida ? 'COMPROVANTE DE SAÍDA' : 'TICKET DE ENTRADA'}</b></div>
        <div class="c">Nº ${tk(v.ticket)}</div>
        <div class="plate-txt">${esc(fmtPlate(v.placa))}</div>
        <div class="r"><span>Veículo</span><span>${tipoNome(v.tipo)}${v.obs ? ' · ' + esc(v.obs) : ''}</span></div>
        <div class="r"><span>Vaga</span><span>${vagaLbl(v.tipo, v.vaga)}</span></div>
        <div class="r"><span>Entrada</span><span>${dataCompleta(v.entrada)}</span></div>
        ${saida ? `
          <div class="r"><span>Saída</span><span>${dataCompleta(v.saida)}</span></div>
          <div class="r"><span>Permanência</span><span>${dur(v.saida - v.entrada)}</span></div>
          <div class="r"><span>Pagamento</span><span>${esc(v.pag)}</span></div>
          <div class="hr"></div>
          <div class="r big"><span>TOTAL</span><span>${brl.format(v.valor)}</span></div>`
        : `
          <div class="hr"></div>
          <div>Tolerância: ${p.tol} min</div>
          <div>1ª hora: ${brl.format(p.h1)} · Adicional: ${brl.format(p.hAd)}/h</div>
          <div>Diária máxima: ${brl.format(p.dia)}</div>
          <div class="hr"></div>
          <div class="c">Guarde este ticket. Ele é necessário para a retirada do veículo.</div>`}
        <div class="hr"></div>
        <div class="c">Obrigado pela preferência!</div>
        <div class="c">Emitido em ${dataCompleta(Date.now())}</div>
      </div>`;
    window.print();
  }

  /* ---------- Formulário de entrada ---------- */
  const placaEl = $('#placa'), hint = $('#placaHint');
  const HINT_PADRAO = 'Formato Mercosul (ABC1D23) ou antigo (ABC-1234)';
  const tipoSel = () => document.querySelector('input[name=tipo]:checked').value;
  let pickSpot = null, lastNew = null;

  function freeSpots(t) {
    const used = new Set(S.active.filter((a) => a.tipo === t).map((a) => a.vaga));
    const r = [];
    for (let i = 1; i <= S.cap[t]; i++) if (!used.has(i)) r.push(i);
    return r;
  }
  function fillVagas(keep) {
    const t = tipoSel(), f = freeSpots(t), sel = $('#vaga'), cur = keep ?? sel.value;
    sel.innerHTML = '<option value="">Automática</option>' + f.map((n) => `<option value="${n}">${vagaLbl(t, n)}</option>`).join('');
    if (cur && f.includes(+cur)) sel.value = cur;
  }
  function setNowTime() { const d = new Date(); $('#hEnt').value = pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function setHint(msg, err) { hint.textContent = msg; hint.classList.toggle('err', !!err); placaEl.classList.toggle('bad', !!err); }

  placaEl.addEventListener('input', () => {
    const c = placaEl.selectionStart;
    placaEl.value = placaEl.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    placaEl.setSelectionRange(c, c);
    const p = placaEl.value.replace(/-/g, '');
    const dentro = p.length >= 7 && S.active.find((a) => a.placa === p);
    setHint(dentro ? `Este veículo já está no pátio, na vaga ${vagaLbl(dentro.tipo, dentro.vaga)}.` : HINT_PADRAO, !!dentro);
  });
  $$('input[name=tipo]').forEach((r) => r.addEventListener('change', () => { fillVagas(''); pickSpot = null; renderMap(); }));
  $('#vaga').addEventListener('change', (e) => { pickSpot = e.target.value ? { t: tipoSel(), n: +e.target.value } : null; renderMap(); });

  $('#fEntrada').addEventListener('submit', (e) => {
    e.preventDefault();
    const p = placaEl.value.replace(/-/g, '');
    if (!/^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(p)) { setHint('Placa inválida. Use 3 letras e 4 caracteres, ex.: ABC1D23.', true); placaEl.focus(); return; }
    if (S.active.some((a) => a.placa === p)) { setHint('Este veículo já está no pátio.', true); placaEl.focus(); return; }
    const t = tipoSel(), f = freeSpots(t);
    if (!f.length) { toast(`Sem vagas livres para ${t === 'carro' ? 'carros' : 'motos'}.`, { err: true }); return; }
    const vaga = $('#vaga').value ? +$('#vaga').value : f[0];

    let ent = Date.now();
    const tv = $('#hEnt').value;
    if (tv) {
      const [h, m] = tv.split(':').map(Number);
      const d = new Date(); d.setHours(h, m, 0, 0);
      if (d.getTime() > Date.now() + MIN) d.setDate(d.getDate() - 1); // horário no futuro = dia anterior
      ent = d.getTime();
    }

    const v = { id: 'v' + Date.now(), ticket: ++S.seq, placa: p, tipo: t, entrada: ent, vaga, obs: $('#obs').value.trim() };
    S.active.push(v);
    save();
    lastNew = v.id;
    toast(`Entrada ${fmtPlate(p)} · vaga ${vagaLbl(t, vaga)} · ticket ${tk(v.ticket)}`, { action: 'Imprimir ticket', fn: () => printReceipt(v, 'entrada') });
    placaEl.value = ''; $('#obs').value = ''; pickSpot = null;
    setHint(HINT_PADRAO); setNowTime(); fillVagas(''); render(); placaEl.focus();
  });

  /* ---------- Configurações ---------- */
  $$('[data-cfg]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-cfg]').forEach((x) => x.setAttribute('aria-selected', x === b));
    ['precos', 'vagas', 'dados'].forEach((k) => { $('#cfg-' + k).hidden = k !== b.dataset.cfg; });
  }));

  // Preços
  const ptSel = () => document.querySelector('input[name=pt]:checked').value;
  function fillPrices() {
    const p = S.prices[ptSel()];
    $('#p-h1').value = p.h1; $('#p-hAd').value = p.hAd; $('#p-tol').value = p.tol; $('#p-dia').value = p.dia;
    notePrices();
  }
  function notePrices() {
    const p = S.prices[ptSel()];
    $('#priceNote').textContent = `Até ${p.tol} min é grátis. Depois cobra ${brl.format(p.h1)} pela 1ª hora e ${brl.format(p.hAd)} por hora adicional, limitado a ${brl.format(p.dia)} a cada 24 h.`;
  }
  $$('input[name=pt]').forEach((r) => r.addEventListener('change', fillPrices));
  ['h1', 'hAd', 'tol', 'dia'].forEach((k) => $('#p-' + k).addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    const ok = !isNaN(v) && v >= 0;
    e.target.classList.toggle('bad', !ok);
    if (!ok) return;
    S.prices[ptSel()][k] = v; save(); notePrices(); renderLive();
  }));

  // Vagas
  function fillCaps() { $('#cap-carro').value = S.cap.carro; $('#cap-moto').value = S.cap.moto; }
  ['carro', 'moto'].forEach((t) => $('#cap-' + t).addEventListener('change', (e) => {
    const v = parseInt(e.target.value, 10);
    const maiorOcupada = Math.max(0, ...S.active.filter((a) => a.tipo === t).map((a) => a.vaga));
    if (isNaN(v) || v < 1 || v > 200) { toast('Informe um número de vagas entre 1 e 200.', { err: true }); fillCaps(); return; }
    if (v < maiorOcupada) { toast(`A vaga ${vagaLbl(t, maiorOcupada)} está ocupada. Libere-a antes de reduzir.`, { err: true }); fillCaps(); return; }
    S.cap[t] = v; save(); render();
    toast(`${t === 'carro' ? 'Carros' : 'Motos'}: ${v} vagas.`);
  }));

  // Backup
  $('#bkExport').addEventListener('click', () => {
    download(`patio-central-backup-${stamp()}.json`, JSON.stringify(S, null, 2), 'application/json');
    toast('Backup exportado.');
  });
  $('#bkFile').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!Array.isArray(d.active) || !Array.isArray(d.hist)) throw new Error();
        ask(`Importar o backup "${f.name}"? Os dados atuais serão substituídos.`, () => {
          S = migrate(d); S.sample = false; save(); fillPrices(); fillCaps(); render();
          toast('Backup importado.');
        }, 'Importar');
      } catch (err) { toast('Arquivo inválido. Escolha um backup exportado pelo Pátio Central.', { err: true }); }
      e.target.value = '';
    };
    r.readAsText(f);
  });
  $('#bkReset').addEventListener('click', () => ask('Apagar todos os veículos, o histórico e zerar a numeração dos tickets? Esta ação não pode ser desfeita.', () => {
    S = { active: [], hist: [], prices: S.prices, cap: S.cap, seq: 0, sample: false }; save(); render();
    toast('Todos os dados foram apagados.');
  }, 'Apagar tudo'));

  /* ---------- Mapa de vagas ---------- */
  function renderMap() {
    const now = Date.now();
    const filtro = document.querySelector('input[name=mf]:checked').value;
    ['carro', 'moto'].forEach((t) => {
      const box = t === 'carro' ? $('#spotsCar') : $('#spotsMoto');
      const porVaga = new Map(S.active.filter((a) => a.tipo === t).map((a) => [a.vaga, a]));
      let h = '';
      for (let i = 1; i <= S.cap[t]; i++) {
        const v = porVaga.get(i);
        if ((filtro === 'ocupadas' && !v) || (filtro === 'livres' && v)) continue;
        if (v) {
          h += `<button type="button" class="spot occ ${t}${v.id === lastNew ? ' new' : ''}" data-id="${v.id}" title="Ticket ${tk(v.ticket)} · entrada ${hm(v.entrada)}" aria-label="Vaga ${vagaLbl(t, i)}, ${fmtPlate(v.placa)}, dar saída"><span class="num">${vagaLbl(t, i)}</span><svg class="veh"><use href="#i-${t === 'carro' ? 'car' : 'moto'}"/></svg><span class="mini">${esc(fmtPlate(v.placa))}</span><span class="t">${dur(now - v.entrada)}</span></button>`;
        } else {
          const pk = pickSpot && pickSpot.t === t && pickSpot.n === i;
          h += `<button type="button" class="spot free${pk ? ' pick' : ''}" data-t="${t}" data-n="${i}" aria-label="Vaga ${vagaLbl(t, i)} livre, escolher"><span class="num">${vagaLbl(t, i)}</span></button>`;
        }
      }
      box.innerHTML = h;
      const fr = freeSpots(t).length;
      (t === 'carro' ? $('#lotCar') : $('#lotMoto')).textContent = fr + (fr === 1 ? ' livre' : ' livres');
    });
    lastNew = null;
  }
  $$('input[name=mf]').forEach((r) => r.addEventListener('change', renderMap));
  document.addEventListener('click', (e) => {
    const s = e.target.closest('.spot');
    if (!s) return;
    if (s.dataset.id) { openExit(s.dataset.id); return; }
    const t = s.dataset.t, n = +s.dataset.n;
    $('#t-' + t).checked = true;
    pickSpot = { t, n };
    fillVagas(String(n)); renderMap(); placaEl.focus();
    toast(`Vaga ${vagaLbl(t, n)} selecionada. Digite a placa.`);
  });

  /* ---------- Indicadores ---------- */
  function renderStats() {
    const now = Date.now();
    const c = S.active.filter((a) => a.tipo === 'carro').length, m = S.active.length - c;
    $('#sCar').innerHTML = `${c}<small>/${S.cap.carro}</small>`;
    $('#sMoto').innerHTML = `${m}<small>/${S.cap.moto}</small>`;
    $('#mCar').style.width = Math.min(100, (c / S.cap.carro) * 100) + '%';
    $('#mMoto').style.width = Math.min(100, (m / S.cap.moto) * 100) + '%';
    const soma = (l) => l.reduce((s, h) => s + h.valor, 0);
    const plural = (n, s, p) => n + ' ' + (n === 1 ? s : p);

    // Ganho do dia, comparado com o mesmo horário de ontem
    const hoje = S.hist.filter((h) => sameDay(h.saida, now));
    const ganhoHoje = soma(hoje);
    const ontem0 = new Date(now); ontem0.setHours(0, 0, 0, 0); ontem0.setDate(ontem0.getDate() - 1);
    const ganhoOntemAteAgora = soma(S.hist.filter((h) => h.saida >= ontem0.getTime() && h.saida <= now - DIA));
    $('#sRev').textContent = brl.format(ganhoHoje);
    let comp = '';
    if (ganhoOntemAteAgora > 0) {
      const dif = ((ganhoHoje - ganhoOntemAteAgora) / ganhoOntemAteAgora) * 100;
      comp = ` · <span class="${dif >= 0 ? 'trend-up' : 'trend-down'}">${dif >= 0 ? '▲' : '▼'} ${Math.abs(dif).toFixed(0)}%</span> vs ontem`;
    }
    $('#sRevSub').innerHTML = plural(hoje.length, 'saída', 'saídas') + comp;

    // Ganho do mês corrente e média por dia
    const d = new Date(now);
    const ini = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const mes = S.hist.filter((h) => h.saida >= ini);
    const ganhoMes = soma(mes);
    $('#sMesLbl').textContent = 'Ganho em ' + MESES[d.getMonth()];
    $('#sMes').textContent = brl.format(ganhoMes);
    $('#sMesSub').textContent = plural(mes.length, 'saída', 'saídas') + ' no mês';
    const diasCorridos = d.getDate();
    const diasNoMes = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const media = ganhoMes / diasCorridos;
    $('#sMed').textContent = brl.format(media);
    $('#sMedSub').textContent = `Projeção do mês: ${brl.format(media * diasNoMes)}`;
    $('#sOpen').textContent = brl.format(S.active.reduce((s, a) => s + calc(a.tipo, now - a.entrada), 0));
    $('#sOpenSub').textContent = `${S.active.length} veículo${S.active.length === 1 ? '' : 's'} estacionado${S.active.length === 1 ? '' : 's'}`;
    $('#tkNext').textContent = 'Ticket ' + tk(S.seq + 1);
  }

  /* ---------- Abas: pátio, histórico e relatório ---------- */
  let tab = 'ativos';
  $$('.tab').forEach((b) => b.addEventListener('click', () => {
    tab = b.dataset.tab;
    $$('.tab').forEach((x) => x.setAttribute('aria-selected', x === b));
    renderTable();
  }));
  $('#busca').addEventListener('input', renderTable);
  $('#periodo').addEventListener('change', renderTable);

  const match = (v, q) => !q || v.placa.includes(q) || tk(v.ticket).includes(q);

  function renderTable() {
    const q = $('#busca').value.toUpperCase().replace(/[^A-Z0-9]/g, ''), now = Date.now();
    $('#cAtivos').textContent = S.active.length;
    $('#cHist').textContent = S.hist.length;

    const rel = tab === 'rel';
    $('#busca').hidden = rel;
    $('#periodo').hidden = !rel;
    $('#csvBtn').hidden = tab === 'ativos';
    $('#clearHist').hidden = !(tab === 'hist' && S.hist.length);
    $('#report').hidden = !rel;
    $('#tblWrap').hidden = rel;
    const emp = $('#empty');

    if (rel) { emp.hidden = true; renderReport(); return; }

    if (tab === 'ativos') {
      $('#thead').innerHTML = '<tr><th>Ticket</th><th>Placa</th><th>Tipo</th><th>Vaga</th><th>Entrada</th><th>Permanência</th><th class="num">Valor atual</th><th></th></tr>';
      const rows = S.active.filter((a) => match(a, q)).sort((a, b) => a.entrada - b.entrada);
      $('#tbody').innerHTML = rows.map((a) => {
        const ms = now - a.entrada, v = calc(a.tipo, ms);
        return `<tr><td class="tk">${tk(a.ticket)}</td><td>${plateHTML(a.placa)}${a.obs ? `<div class="hint" style="margin-top:4px">${esc(a.obs)}</div>` : ''}</td><td>${pill(a.tipo)}</td><td class="mono">${vagaLbl(a.tipo, a.vaga)}</td><td class="mono">${hm(a.entrada)}</td><td class="mono">${dur(ms)}</td><td class="num">${v ? `<span class="money">${brl.format(v)}</span>` : '<span class="tol">Tolerância</span>'}</td><td class="num"><button type="button" class="btn btn-ghost btn-sm" data-exit="${a.id}">Dar saída</button></td></tr>`;
      }).join('');
      emp.hidden = rows.length > 0;
      emp.innerHTML = q ? `<strong>Nada encontrado</strong>Nenhum veículo no pátio com “${esc(q)}”.` : '<strong>Pátio vazio</strong>Registre a primeira entrada no formulário ao lado.';
    } else {
      $('#thead').innerHTML = '<tr><th>Ticket</th><th>Placa</th><th>Tipo</th><th>Entrada</th><th>Saída</th><th>Permanência</th><th>Pagamento</th><th class="num">Valor</th><th></th></tr>';
      const rows = S.hist.filter((h) => match(h, q));
      $('#tbody').innerHTML = rows.map((h) => `<tr><td class="tk">${tk(h.ticket)}</td><td>${plateHTML(h.placa)}</td><td>${pill(h.tipo)}</td><td class="mono">${dmhm(h.entrada)}</td><td class="mono">${dmhm(h.saida)}</td><td class="mono">${dur(h.saida - h.entrada)}</td><td>${esc(h.pag || '—')}</td><td class="num">${h.valor ? `<span class="money">${brl.format(h.valor)}</span>` : '<span class="tol">Isento</span>'}</td><td class="num"><button type="button" class="btn btn-ghost btn-sm" data-print="${h.id}" title="Imprimir comprovante" aria-label="Imprimir comprovante"><svg class="ico"><use href="#i-print"/></svg></button></td></tr>`).join('');
      emp.hidden = rows.length > 0;
      emp.innerHTML = q ? `<strong>Nada encontrado</strong>Nenhuma saída com “${esc(q)}”.` : '<strong>Sem saídas ainda</strong>As saídas registradas aparecem aqui.';
    }
    $('#tblWrap').hidden = !$('#tbody').children.length;
  }
  $('#tbody').addEventListener('click', (e) => {
    const x = e.target.closest('[data-exit]');
    if (x) { openExit(x.dataset.exit); return; }
    const p = e.target.closest('[data-print]');
    if (p) { const h = S.hist.find((v) => v.id === p.dataset.print); if (h) printReceipt(h, 'saida'); }
  });

  /* ---------- Relatório ---------- */
  function periodStart() {
    const per = $('#periodo').value;
    if (per === 'tudo') return 0;
    const d = new Date(); d.setHours(0, 0, 0, 0);
    if (per === 'mes') d.setDate(1);
    if (per === '7d') d.setDate(d.getDate() - 6);
    if (per === '30d') d.setDate(d.getDate() - 29);
    return d.getTime();
  }
  const rowsPeriodo = () => { const ini = periodStart(); return S.hist.filter((h) => h.saida >= ini); };

  function renderReport() {
    const rows = rowsPeriodo(), ini = periodStart();
    const total = rows.reduce((s, h) => s + h.valor, 0);
    const pagos = rows.filter((h) => h.valor > 0);
    const medio = pagos.length ? total / pagos.length : 0;
    const tempoMedio = rows.length ? rows.reduce((s, h) => s + (h.saida - h.entrada), 0) / rows.length : 0;

    const porTipo = ['carro', 'moto'].map((t) => {
      const r = rows.filter((h) => h.tipo === t);
      return { k: tipoNome(t), q: r.length, v: r.reduce((s, h) => s + h.valor, 0), cor: t === 'carro' ? 'var(--accent)' : 'var(--moto)' };
    });
    const porPag = PAGAMENTOS.concat('Isento').map((p) => {
      const r = rows.filter((h) => (p === 'Isento' ? !h.valor : h.pag === p && h.valor));
      return { k: p, q: r.length, v: r.reduce((s, h) => s + h.valor, 0), cor: p === 'Isento' ? 'var(--muted)' : 'var(--fg)' };
    });
    const maxT = Math.max(1, ...porTipo.map((x) => x.v));
    const maxP = Math.max(1, ...porPag.map((x) => x.q));

    const horas = new Array(24).fill(0);
    rows.concat(S.active.filter((a) => a.entrada >= ini)).forEach((v) => { horas[new Date(v.entrada).getHours()]++; });
    const maxH = Math.max(...horas);
    const pico = maxH ? horas.indexOf(maxH) : -1;

    const brk = (lista, max, campo) => lista.map((x) => `
      <div class="brk-row">
        <span>${x.k} <span class="q">· ${x.q}</span></span>
        <div class="brk-bar"><i style="width:${((campo === 'v' ? x.v : x.q) / max) * 100}%;background:${x.cor}"></i></div>
        <span class="money">${brl.format(x.v)}</span>
      </div>`).join('');

    // Ganhos por dia (ou por mês, quando o período é longo)
    let serieHTML = '';
    if ($('#periodo').value !== 'hoje') {
      const hoje0 = new Date(); hoje0.setHours(0, 0, 0, 0);
      let inicio = ini || (rows.length ? Math.min(...rows.map((h) => h.saida)) : hoje0.getTime());
      inicio = new Date(inicio); inicio.setHours(0, 0, 0, 0);
      const diasTotal = Math.round((hoje0 - inicio) / DIA) + 1;
      const porMes = diasTotal > 62;
      const barras = [];
      if (porMes) {
        const c = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
        while (c <= hoje0) {
          const a = c.getTime(), b = new Date(c.getFullYear(), c.getMonth() + 1, 1).getTime();
          barras.push({ lbl: MESES[c.getMonth()].slice(0, 3), tit: MESES[c.getMonth()] + '/' + c.getFullYear(), v: rows.filter((h) => h.saida >= a && h.saida < b).reduce((s, h) => s + h.valor, 0) });
          c.setMonth(c.getMonth() + 1);
        }
      } else {
        const c = new Date(inicio);
        while (c <= hoje0) {
          const a = c.getTime(), b = new Date(c.getFullYear(), c.getMonth(), c.getDate() + 1).getTime();
          barras.push({ lbl: pad(c.getDate()), tit: pad(c.getDate()) + '/' + pad(c.getMonth() + 1), v: rows.filter((h) => h.saida >= a && h.saida < b).reduce((s, h) => s + h.valor, 0) });
          c.setDate(c.getDate() + 1);
        }
      }
      const maxB = Math.max(0, ...barras.map((b) => b.v));
      const melhor = barras.findIndex((b) => b.v === maxB && maxB > 0);
      serieHTML = `
        <div class="rep-block">
          <h4>Ganho por ${porMes ? 'mês' : 'dia'} <small>${melhor >= 0 ? `Melhor ${porMes ? 'mês' : 'dia'}: ${barras[melhor].tit} · ${brl.format(maxB)}` : 'Sem ganhos no período'}</small></h4>
          <div class="days-wrap">
            <div class="days">${barras.map((b, i) => `<div class="d${b.v ? (i === melhor ? ' best' : '') : ' zero'}" title="${b.tit}: ${brl.format(b.v)}"><i style="height:${maxB ? Math.max(1.5, (b.v / maxB) * 100) : 1.5}%"></i></div>`).join('')}</div>
            <div class="days-lbl">${barras.map((b, i) => `<span>${barras.length <= 16 || i % 2 === 0 ? b.lbl : ''}</span>`).join('')}</div>
          </div>
        </div>`;
    }

    $('#report').innerHTML = `
      <div class="kpis">
        <div class="kpi"><span>Faturamento</span><b>${brl.format(total)}</b></div>
        <div class="kpi"><span>Saídas</span><b>${rows.length}</b></div>
        <div class="kpi"><span>Ticket médio</span><b>${brl.format(medio)}</b></div>
        <div class="kpi"><span>Permanência média</span><b>${rows.length ? dur(tempoMedio) : '—'}</b></div>
      </div>
      <div class="rep-grid">
        <div class="rep-block"><h4>Por tipo de veículo</h4><div class="brk">${brk(porTipo, maxT, 'v')}</div></div>
        <div class="rep-block"><h4>Por forma de pagamento</h4><div class="brk">${brk(porPag, maxP, 'q')}</div></div>
      </div>
      ${serieHTML}
      <div class="rep-block">
        <h4>Entradas por horário <small>${pico >= 0 ? `Pico às ${pad(pico)}h · ${maxH} entrada${maxH === 1 ? '' : 's'}` : 'Sem movimento no período'}</small></h4>
        <div class="hours">${horas.map((n, i) => `<div class="${n ? (i === pico ? 'peak' : '') : 'zero'}" style="height:${maxH ? Math.max(2, (n / maxH) * 100) : 2}%" title="${pad(i)}h: ${n} entrada${n === 1 ? '' : 's'}"></div>`).join('')}</div>
        <div class="hours-lbl">${horas.map((_, i) => `<span>${i % 3 === 0 ? pad(i) + 'h' : ''}</span>`).join('')}</div>
      </div>`;
  }

  /* ---------- Exportar CSV ---------- */
  $('#csvBtn').addEventListener('click', () => {
    const rows = tab === 'rel' ? rowsPeriodo() : S.hist;
    if (!rows.length) { toast('Não há saídas para exportar.', { err: true }); return; }
    const cab = ['Ticket', 'Placa', 'Tipo', 'Vaga', 'Entrada', 'Saída', 'Permanência (min)', 'Pagamento', 'Valor (R$)'];
    const lin = rows.map((h) => [tk(h.ticket), fmtPlate(h.placa), tipoNome(h.tipo), vagaLbl(h.tipo, h.vaga), dataCompleta(h.entrada), dataCompleta(h.saida), Math.round((h.saida - h.entrada) / MIN), h.pag || '—', h.valor.toFixed(2).replace('.', ',')]);
    const csv = '﻿' + [cab, ...lin].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    download(`patio-central-${tab === 'rel' ? 'relatorio' : 'historico'}-${stamp()}.csv`, csv, 'text/csv;charset=utf-8');
    toast(`${rows.length} registro${rows.length === 1 ? '' : 's'} exportado${rows.length === 1 ? '' : 's'}.`);
  });

  /* ---------- Saída de veículo ---------- */
  function openExit(id) {
    const a = S.active.find((x) => x.id === id);
    if (!a) return;
    const d = new Date();
    $('#mTitle').textContent = 'Registrar saída';
    $('#mVaga').textContent = 'Vaga ' + vagaLbl(a.tipo, a.vaga);
    $('#mBody').innerHTML = `
      <div class="ticket-plate">${plateHTML(a.placa, true)}</div>
      <dl class="kv">
        <dt>Ticket</dt><dd>${tk(a.ticket)}</dd>
        <dt>Veículo</dt><dd>${tipoNome(a.tipo)}${a.obs ? ' · ' + esc(a.obs) : ''}</dd>
        <dt>Entrada</dt><dd>${dmhm(a.entrada)}</dd>
        <dt><label for="hSai">Saída</label></dt><dd><input class="inp" type="time" id="hSai" value="${pad(d.getHours())}:${pad(d.getMinutes())}" style="width:auto;padding:4px 8px;font-family:var(--f-mono)"></dd>
        <dt>Permanência</dt><dd id="mDur"></dd>
        <dt><label for="mPag">Pagamento</label></dt><dd><select class="inp" id="mPag" style="width:auto;padding:4px 8px">${PAGAMENTOS.map((p) => `<option>${p}</option>`).join('')}</select></dd>
      </dl>
      <div class="total"><span>Total a pagar</span><b id="mTot"></b></div>
      <div class="hint" id="mRule"></div>
      <div class="ticket-actions"><button type="button" class="btn btn-ghost" id="mCancel">Voltar</button><button type="button" class="btn btn-primary" id="mOk">Confirmar saída</button></div>
      <button type="button" class="link-btn" id="mDel">Cancelar esta entrada (registro feito por engano)</button>`;
    const upd = () => {
      const s = exitTime(a), v = calc(a.tipo, s - a.entrada), p = S.prices[a.tipo];
      $('#mDur').textContent = dur(s - a.entrada);
      $('#mTot').textContent = brl.format(v);
      $('#mPag').disabled = v === 0;
      $('#mRule').textContent = v === 0 ? `Dentro da tolerância de ${p.tol} min. Saída sem cobrança.` : `1ª hora ${brl.format(p.h1)} + ${brl.format(p.hAd)}/h adicional · diária máx. ${brl.format(p.dia)}`;
    };
    $('#hSai').addEventListener('input', upd);
    upd();
    $('#mCancel').onclick = closeExit;
    $('#mOk').onclick = () => confirmExit(a);
    $('#mDel').onclick = () => ask(`Cancelar a entrada de ${fmtPlate(a.placa)} (ticket ${tk(a.ticket)})? O registro será removido sem cobrança.`, () => {
      S.active = S.active.filter((x) => x.id !== a.id); save(); closeExit(); render();
      toast(`Entrada ${tk(a.ticket)} cancelada.`);
    }, 'Cancelar entrada');
    $('#modal').hidden = false;
    $('#mOk').focus();
  }

  function exitTime(a) {
    const v = $('#hSai').value;
    if (!v) return Date.now();
    const [h, m] = v.split(':').map(Number);
    const d = new Date(); d.setHours(h, m, 0, 0);
    let t = d.getTime();
    while (t < a.entrada) t += DIA;
    return t;
  }

  function confirmExit(a) {
    const s = exitTime(a), v = calc(a.tipo, s - a.entrada);
    const reg = { ...a, saida: s, valor: v, pag: v ? $('#mPag').value : '—' };
    S.active = S.active.filter((x) => x.id !== a.id);
    S.hist.unshift(reg);
    save(); render();

    $('#mTitle').textContent = 'Saída registrada';
    $('#mBody').innerHTML = `
      <div class="done">
        <div class="ok"><svg><use href="#i-check"/></svg></div>
        <b>${brl.format(v)}</b>
        <span>${v ? esc(reg.pag) : 'Isento'} · ${dur(s - a.entrada)} · ticket ${tk(a.ticket)}</span>
      </div>
      <div class="ticket-plate">${plateHTML(a.placa, true)}</div>
      <div class="ticket-actions three">
        <button type="button" class="btn btn-ghost" id="dUndo">Desfazer</button>
        <button type="button" class="btn btn-ghost" id="dPrint"><svg class="ico"><use href="#i-print"/></svg>Imprimir</button>
        <button type="button" class="btn btn-primary" id="dOk">Concluir</button>
      </div>`;
    $('#dOk').onclick = closeExit;
    $('#dPrint').onclick = () => printReceipt(reg, 'saida');
    $('#dUndo').onclick = () => { undoExit(reg); closeExit(); };
    $('#dOk').focus();
  }

  function undoExit(reg) {
    if (!S.hist.some((h) => h.id === reg.id)) return;
    let vaga = reg.vaga;
    if (S.active.some((x) => x.tipo === reg.tipo && x.vaga === vaga)) {
      const f = freeSpots(reg.tipo);
      if (!f.length) { toast('Não há vaga livre para devolver o veículo ao pátio.', { err: true }); return; }
      vaga = f[0];
    }
    S.hist = S.hist.filter((h) => h.id !== reg.id);
    const { saida, valor, pag, ...volta } = reg;
    S.active.push({ ...volta, vaga });
    save(); render();
    toast(`Saída desfeita. ${fmtPlate(reg.placa)} voltou para a vaga ${vagaLbl(reg.tipo, vaga)}.`);
  }

  function closeExit() { $('#modal').hidden = true; }
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeExit(); });

  /* ---------- Ações gerais ---------- */
  $('#clearHist').addEventListener('click', () => ask('Apagar todo o histórico de saídas? O faturamento e o relatório também serão zerados.', () => {
    S.hist = []; save(); render(); toast('Histórico apagado.');
  }, 'Apagar histórico'));
  $('#clearSample').addEventListener('click', () => ask('Remover os veículos de exemplo e começar com o pátio vazio?', () => {
    S = { active: [], hist: [], prices: S.prices, cap: S.cap, seq: 0, sample: false }; save(); render();
    toast('Pronto. Pátio vazio.');
  }, 'Começar do zero'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('#confirm').hidden) $('#confirm').hidden = true;
      else closeExit();
    }
    if (e.key === 'F2') { e.preventDefault(); closeExit(); placaEl.focus(); }
  });

  /* ---------- Renderização ---------- */
  function renderLive() { renderStats(); renderMap(); renderTable(); }
  function render() { $('#sampleBar').hidden = !S.sample; fillVagas(); renderLive(); }

  function tick() {
    const d = new Date();
    $('#clock').textContent = pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + ' · ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }
  setInterval(tick, 1000); tick();

  /* ---------- Rodapé: ano e status de funcionamento ---------- */
  // Lê os horários escritos no rodapé (linha 1: seg–sex, linha 2: sábado, linha 3: domingo)
  function footerStatus() {
    const el = $('#footStatus');
    if (!el) return;
    const horarios = [...$$('.foot-hours dd')].map((dd) => dd.textContent.match(/(\d{1,2}):(\d{2})\D+(\d{1,2}):(\d{2})/));
    const d = new Date(), dia = d.getDay();
    const linha = dia === 0 ? 2 : dia === 6 ? 1 : 0;
    const h = horarios[linha];
    const agora = d.getHours() * 60 + d.getMinutes();
    const aberto = h && agora >= +h[1] * 60 + +h[2] && agora < +h[3] * 60 + +h[4];
    el.className = 'foot-status ' + (aberto ? 'open' : 'closed');
    el.textContent = aberto ? `Aberto agora · fecha às ${pad(h[3])}:${h[4]}` : 'Fechado agora';
    $('#footYear').textContent = d.getFullYear();
  }
  footerStatus();
  setInterval(footerStatus, 60000);

  /* ---------- Rodapé: botão voltar ao topo ---------- */
  $('#toTop').addEventListener('click', () => {
    const semAnimacao = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: semAnimacao ? 'auto' : 'smooth' });
  });
  setInterval(() => { renderStats(); renderMap(); if (tab === 'ativos') renderTable(); }, 30000);

  setNowTime(); fillPrices(); fillCaps(); render();
})();
