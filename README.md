<div align="center">

# 🅿️ Pátio Central

### Sistema de Gestão de Estacionamento para Carros e Motos

Aplicação web completa para controlar a entrada e a saída de veículos, calcular cobranças automaticamente, acompanhar a ocupação das vagas e medir o faturamento do dia e do mês.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Sem dependências](https://img.shields.io/badge/dependências-zero-2ea44f?style=for-the-badge)
![Licença MIT](https://img.shields.io/badge/licença-MIT-blue?style=for-the-badge)

**[🔗 Acessar o sistema online](https://devsilvana521.github.io/ESTACIONAMENTO-PATIO-CENTRAL-FRANCA/)**

[Sobre](#-sobre-o-projeto) •
[Funcionalidades](#-funcionalidades) •
[Como foi feito](#-como-o-sistema-foi-feito) •
[Regras de cobrança](#-regras-de-cobrança) •
[Como executar](#-como-executar) •
[Estrutura](#-estrutura-do-projeto) •
[Aprendizados](#-desafios-e-aprendizados)

</div>

---

## 📋 Sobre o projeto

O **Pátio Central** nasceu da necessidade de trocar o caderno e a calculadora da guarita por uma ferramenta simples, rápida e confiável. O operador digita a placa, o sistema escolhe a vaga, registra o horário e, na saída, calcula o valor exato a cobrar conforme a tabela de preços.

O sistema foi construído **sem frameworks e sem bibliotecas externas**, usando só **HTML, CSS e JavaScript puros**. Ele roda direto no navegador, funciona sem servidor e guarda os dados no próprio computador com `localStorage`.

### Objetivos do projeto

- ⚡ **Agilidade na guarita:** registrar uma entrada em poucos segundos
- 🧮 **Cobrança sem erro:** cálculo automático com tolerância, horas adicionais e diária máxima
- 📊 **Visão do negócio:** quanto entrou hoje, no mês e qual a projeção de fechamento
- 🎨 **Interface atrativa:** visual inspirado na sinalização de garagens, com modo claro e escuro
- 📱 **Funcionar em qualquer tela:** computador, tablet ou celular

---

## 🖼️ Demonstração

> Crie a pasta `screenshots/` e salve as capturas de tela com os nomes abaixo.

| Modo claro | Modo escuro |
|:---:|:---:|
| ![Modo claro](screenshots/modo-claro.png) | ![Modo escuro](screenshots/modo-escuro.png) |

| Ticket de saída | Relatório de faturamento |
|:---:|:---:|
| ![Saída](screenshots/saida.png) | ![Relatório](screenshots/relatorio.png) |

| Versão mobile | Rodapé |
|:---:|:---:|
| ![Mobile](screenshots/mobile.png) | ![Rodapé](screenshots/rodape.png) |

---

## ✨ Funcionalidades

### 🚗 Entrada de veículos
- **Ticket numerado** em sequência (`000001`, `000002`…)
- Validação de placa nos formatos **Mercosul** (`ABC1D23`) e **antigo** (`ABC-1234`)
- Escolha entre **carro** e **moto**
- Vaga escolhida manualmente ou **atribuída automaticamente**
- Horário de entrada preenchido sozinho, com opção de ajuste
- Aviso imediato quando a placa já está no pátio
- **Ticket de entrada para impressão**

### 🗺️ Mapa do pátio
- **100 vagas para carros** (Setor A) e **100 vagas para motos** (Setor B)
- Visual de estacionamento real, com faixas pintadas no asfalto
- Cada vaga ocupada mostra a placa e o tempo de permanência
- Filtro para ver **todas**, só as **ocupadas** ou só as **livres**
- Clique numa vaga livre para escolhê-la ou numa ocupada para dar saída

### 🧾 Saída e cobrança
- Ticket de saída com entrada, saída, permanência e total a pagar
- Pagamento por **Pix**, **dinheiro** ou **cartão**
- **Comprovante de saída** pronto para impressora térmica de 80 mm
- **Desfazer saída** confirmada por engano
- **Cancelar entrada** registrada errada, sem gerar cobrança

### 💰 Painel financeiro
| Indicador | O que mostra |
|---|---|
| **Ganho hoje** | Total do dia e comparação percentual com o mesmo horário de ontem |
| **Ganho no mês** | Total do mês atual, com o nome do mês |
| **Média por dia** | Média diária do mês e **projeção** do fechamento |
| **A receber no pátio** | Quanto os veículos estacionados devem até agora |
| **Ocupação** | Vagas ocupadas de carros e motos, com barra de progresso |

### 📈 Relatório
- Períodos: **hoje**, **este mês**, **últimos 7 dias**, **últimos 30 dias** e **todo o período**
- Faturamento, número de saídas, ticket médio e permanência média
- Ganhos por **tipo de veículo** e por **forma de pagamento**
- Gráfico de **ganho por dia** com destaque para o melhor dia
- Gráfico de **entradas por horário** com destaque para o horário de pico
- **Exportação em CSV**, que abre direto no Excel

### ⚙️ Configurações
- **Tabela de preços** separada para carro e moto
- **Quantidade de vagas** ajustável de 1 a 200 por tipo
- **Backup** de todos os dados em `.json` e **importação** em outro computador

### 🎨 Interface
- **Seletor de tema ☀ Claro | 🌙 Escuro**, com a opção em uso destacada em amarelo
- Na primeira visita, segue o tema do computador, e a escolha do usuário fica salva
- Layout **responsivo**
- Placas desenhadas no padrão Mercosul
- Notificações na tela e janelas de confirmação próprias
- Atalhos: `F2` volta para a placa e `Esc` fecha janelas
- **Rodapé institucional** com endereço, telefone, WhatsApp, e-mail, horário de funcionamento e selo **"Aberto agora / Fechado agora"**
- Botão **"↑ Voltar ao topo"** no rodapé, com rolagem suave até o início da página

---

## 🛠️ Como o sistema foi feito

### 1. Planejamento

Antes do código, defini o fluxo real de uma guarita:

```
Veículo chega → digita a placa → sistema escolhe a vaga → imprime ticket
        ↓
Veículo sai → clica na vaga → sistema calcula o valor → recebe → imprime comprovante
```

A partir desse fluxo surgiram as três telas principais: o **formulário de entrada**, o **mapa do pátio** e as **tabelas de histórico e relatório**.

### 2. Identidade visual

O visual foi inspirado no próprio ambiente de um estacionamento:

- **Amarelo e preto** das faixas de sinalização de garagem
- **Asfalto escuro** com linhas pintadas no mapa de vagas
- **Placas no padrão Mercosul**, com a faixa azul "BRASIL"
- **Ticket com borda picotada**, como o papel da máquina

Para a tipografia, usei três fontes com papéis diferentes:

| Fonte | Uso |
|---|---|
| **Barlow Condensed** | Títulos e números grandes, com cara de placa de sinalização |
| **IBM Plex Sans** | Textos e formulários |
| **IBM Plex Mono** | Placas, horários e valores, para os números ficarem alinhados |

### 3. Tema claro e escuro com variáveis CSS

Todas as cores ficam em **variáveis CSS** (custom properties). O modo escuro só troca os valores dessas variáveis, sem duplicar nenhum estilo:

```css
:root {
  --bg: #e9ecef;
  --fg: #14181d;
  --accent: #f2b705;
}

:root[data-theme="dark"] {
  --bg: #101317;
  --fg: #e9edf1;
  --accent: #f5c022;
}
```

Na primeira visita o sistema segue o tema do computador (`prefers-color-scheme`). Quando o usuário escolhe um tema, a escolha fica salva.

#### Seletor de tema

A troca de tema é feita por um seletor com as duas opções lado a lado. A opção do tema em uso fica destacada, então o usuário sempre sabe em qual modo está:

```html
<div class="theme-switch" role="group" aria-label="Tema">
  <button class="theme-opt" data-theme-opt="light" aria-pressed="false">☀ Claro</button>
  <button class="theme-opt" data-theme-opt="dark" aria-pressed="true">🌙 Escuro</button>
</div>
```

O destaque usa o atributo de acessibilidade `aria-pressed`, que também informa leitores de tela qual opção está ativa:

```css
.theme-opt[aria-pressed="true"] {
  background: var(--accent);
  color: var(--accent-fg);
}
```

```js
function paintThemeBtn() {
  const atual = effTheme(); // 'light' ou 'dark'
  $$('[data-theme-opt]').forEach((b) =>
    b.setAttribute('aria-pressed', b.dataset.themeOpt === atual)
  );
}
```

### 4. Estado da aplicação

Todos os dados ficam em **um único objeto**, salvo no `localStorage` a cada alteração:

```js
const S = {
  active: [],   // veículos no pátio
  hist: [],     // saídas registradas
  prices: {},   // tabela de preços de carro e moto
  cap: {},      // quantidade de vagas
  seq: 0        // número do último ticket
};
```

A interface é sempre **redesenhada a partir desse estado**, com as funções `renderStats()`, `renderMap()` e `renderTable()`. Assim a tela nunca fica diferente dos dados.

### 5. Cálculo da cobrança

A regra de preço fica isolada na função `calc()`. Isso facilita testar a regra e trocá-la depois:

```js
function calc(tipo, ms) {
  const p = S.prices[tipo];
  const min = Math.ceil(ms / 60000);
  if (min <= p.tol) return 0;                     // tolerância grátis

  const dias = Math.floor(min / 1440);
  const resto = min % 1440;
  let valor = dias * p.dia;                       // diárias completas

  if (resto > 0) {
    const horas = resto <= 60
      ? p.h1                                      // só a 1ª hora
      : p.h1 + Math.ceil((resto - 60) / 60) * p.hAd;
    valor += Math.min(horas, p.dia);              // teto da diária
  }
  return valor;
}
```

### 6. Compatibilidade entre versões

O sistema evoluiu ao longo do desenvolvimento: ganhou número de ticket e passou de 30 para 200 vagas. Para quem já tinha dados salvos não perder nada, criei uma função de **migração**, que atualiza os dados antigos ao abrir o sistema:

```js
function migrate(s) {
  s.cap = s.cap || DEF_CAP;
  // registros antigos ganham número de ticket na ordem de entrada
  semTicket.forEach((v) => { v.ticket = ++s.seq; });
  return s;
}
```

### 7. Impressão de comprovantes

O comprovante é montado numa área escondida da página. Na hora de imprimir, uma regra `@media print` esconde todo o sistema e mostra só o comprovante, no tamanho de uma bobina de 80 mm:

```css
@media print {
  body > *:not(#printArea) { display: none !important; }
  #printArea { display: block !important; }
}
```

### 8. Exportação CSV e backup

Os arquivos são gerados direto no navegador com `Blob` e `URL.createObjectURL`, sem servidor. O CSV usa `;` como separador e BOM UTF-8, para o Excel em português abrir com acentos e colunas corretas.

### 9. Botão "Voltar ao topo"

Com 200 vagas, histórico e relatório, a página ficou comprida. Para não obrigar o operador a rolar tudo de volta, o rodapé ganhou um botão que leva direto ao topo:

```html
<button class="to-top" id="toTop" type="button" aria-label="Voltar ao topo da página">
  <svg class="ico"><use href="#i-arrow-up" /></svg>Voltar ao topo
</button>
```

A rolagem é suave, mas respeita quem configurou o computador para **reduzir animações** (`prefers-reduced-motion`). Nesse caso, a página vai direto ao topo, sem animação:

```js
$('#toTop').addEventListener('click', () => {
  const semAnimacao = matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: semAnimacao ? 'auto' : 'smooth' });
});
```

Ao passar o mouse, o botão fica amarelo e a seta sobe um pouco, indicando a ação:

```css
.to-top:hover { background: var(--accent); color: var(--accent-fg); }
.to-top:hover .ico { transform: translateY(-2px); }
```

### 10. Testes

Cada etapa foi testada simulando o uso real numa página automatizada (jsdom): entrada, saída, desfazer, cancelamento, relatórios, mudança no número de vagas, migração de dados antigos, troca de tema e o botão de voltar ao topo.

---

## 🧮 Regras de cobrança

1. **Dentro da tolerância** → isento
2. **Até 60 minutos** → valor da 1ª hora
3. **Mais de 60 minutos** → 1ª hora + cada hora adicional iniciada
4. **Teto diário** → cada período de 24 h nunca passa da diária máxima

### Tabela padrão (editável no sistema)

| Parâmetro | 🚗 Carro | 🏍️ Moto |
|---|---:|---:|
| 1ª hora | R$ 12,00 | R$ 6,00 |
| Hora adicional | R$ 6,00 | R$ 3,00 |
| Tolerância | 15 min | 15 min |
| Diária máxima | R$ 45,00 | R$ 22,00 |

### Exemplo: carro que ficou 2h 32min

```
1ª hora ............................ R$ 12,00
2 horas adicionais (2 × R$ 6,00) ... R$ 12,00
                                     ─────────
Total .............................. R$ 24,00
```

---

## 🚀 Como executar

### Abrir no computador

```bash
git clone https://github.com/wandersondfarias/Estacionamento-Central.git
cd Estacionamento-Central
```

Depois abra o arquivo `index.html` no navegador. Não precisa instalar nada.

### Com o Live Server (VS Code)

1. Instale a extensão **Live Server**
2. Clique com o botão direito em `index.html`
3. Escolha **Open with Live Server**

### Publicar no GitHub Pages

1. No repositório, abra **Settings → Pages**
2. Em **Branch**, escolha `main` e a pasta `/ (root)`
3. Clique em **Save**

### Personalizar o rodapé

No `index.html`, procure o comentário `RODAPÉ` e troque o endereço, o telefone, o WhatsApp, o e-mail, os horários e o CNPJ. O selo "Aberto agora" lê os horários escritos ali, então não é preciso mexer no JavaScript.

---

## 📁 Estrutura do projeto

```
Estacionamento-Central/
├── index.html      # Estrutura da página, ícones SVG e rodapé
├── style.css       # Visual, temas claro/escuro, responsividade e impressão
├── script.js       # Regras de negócio, cálculos, relatórios e armazenamento
├── screenshots/    # Imagens do README
├── LICENSE
└── README.md
```

### Organização do `script.js`

| Bloco | Responsabilidade |
|---|---|
| Armazenamento | `load()`, `save()` e `migrate()` |
| Cobrança | `calc()`: tolerância, horas e diária máxima |
| Tema | Seletor claro/escuro, destaque da opção ativa e preferência salva |
| Entrada | Validação da placa, escolha de vaga e ticket |
| Mapa | Desenho das 200 vagas com filtro |
| Indicadores | Ganho do dia, do mês, média e projeção |
| Tabelas | Pátio e histórico com busca por placa ou ticket |
| Relatório | Indicadores por período e gráficos |
| Saída | Ticket, cobrança, desfazer e cancelar |
| Comprovantes | Montagem e impressão |
| Configurações | Preços, vagas, backup e importação |
| Rodapé | Ano atual, status de funcionamento e botão voltar ao topo |

---

## 💻 Tecnologias e conceitos usados

| Tecnologia | Onde foi usada |
|---|---|
| **HTML5 semântico** | `header`, `section`, `footer`, `address`, `dialog` e acessibilidade com `aria-*` |
| **SVG inline** | Ícones de carro, moto, WhatsApp e outros, reaproveitados com `<use>` |
| **CSS Grid e Flexbox** | Layout do painel, mapa de vagas e rodapé |
| **Variáveis CSS** | Temas claro e escuro |
| **Media queries** | Responsividade, impressão e redução de movimento |
| **JavaScript ES6+** | Arrow functions, template strings, desestruturação, `Map` e `Set` |
| **Intl.NumberFormat** | Valores em Real (R$) |
| **localStorage** | Persistência dos dados |
| **Blob e FileReader** | Exportação de CSV e backup, importação de arquivos |
| **Google Fonts** | Barlow Condensed, IBM Plex Sans e IBM Plex Mono |

---

## 🧠 Desafios e aprendizados

- **Cálculo de tempo que vira o dia:** um carro que entra às 23h e sai à 1h precisa ser cobrado por 2 horas, não por "-22 horas". A solução foi somar 24 h sempre que a saída fica antes da entrada.
- **Desempenho com 200 vagas:** o mapa é redesenhado a cada 30 segundos. Usar `Map` para achar o veículo de cada vaga evitou percorrer a lista inteira 200 vezes.
- **Não perder dados ao atualizar o sistema:** a função de migração foi essencial quando o número de vagas e os tickets mudaram.
- **Janelas que apareciam sozinhas:** ao separar o código em três arquivos, as janelas de confirmação passaram a aparecer vazias ao abrir a página. Faltava a regra `[hidden]{display:none!important}`, que agora fica no início do CSS.
- **CSV no Excel brasileiro:** o Excel em português espera `;` como separador e precisa do BOM UTF-8 para mostrar os acentos.
- **Tema escuro de verdade:** não basta inverter as cores. Cada cor foi ajustada para manter contraste e legibilidade nos dois temas.
- **Botão de tema que confundia:** a primeira versão tinha um único botão que mostrava o modo para o qual ia mudar. No tema escuro, aparecia "Modo claro", e parecia que o sistema estava no tema errado. A solução foi trocar por um seletor com as duas opções visíveis, destacando a que está em uso. Foi uma lição de usabilidade: o botão precisa mostrar o estado atual, não só a ação.

---

## 🗺️ Próximas melhorias

- [x] Ticket numerado e impressão de comprovantes
- [x] Relatório de faturamento por período
- [x] Exportação para Excel (CSV)
- [x] Backup e restauração dos dados
- [x] 100 vagas para carros e 100 para motos
- [x] Ganho do dia e do mês com projeção
- [x] Rodapé com contatos e horário de funcionamento
- [x] Seletor de tema claro/escuro com indicação do tema ativo
- [x] Botão "Voltar ao topo" no rodapé
- [ ] Login de operadores com níveis de acesso
- [ ] Cadastro de mensalistas
- [ ] Leitura de ticket por código de barras ou QR Code
- [ ] Back-end com banco de dados (Node.js + PostgreSQL)
- [ ] Aplicativo instalável (PWA)

---

## 🤝 Como contribuir

1. Faça um **fork** do projeto
2. Crie uma branch: `git checkout -b feature/minha-melhoria`
3. Faça o commit: `git commit -m "feat: minha melhoria"`
4. Envie: `git push origin feature/minha-melhoria`
5. Abra um **Pull Request**

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE).

---

<div align="center">

### 👨‍💻 Autor

Desenvolvido por **SEU NOME**

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/wandersondfarias)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/SEU-USUARIO)

⭐ Se este projeto foi útil para você, deixe uma estrela no repositório!

</div>
