# Conceitos do módulo 5, explicados pelo projeto

Guia de estudo em português: desenvolvimento com agentes de código, modernização de legado e Core Web Vitals.

## 1. O que é um agente de código

Um assistente de autocompletar sugere a próxima linha. Um **agente** trabalha em ciclo: lê o projeto, planeja, edita arquivos, roda comandos (testes, build, navegador), lê o resultado e corrige. Claude Code, Cursor (modo agente) e Gemini CLI funcionam assim.

O que muda para quem desenvolve: você deixa de digitar cada linha e passa a **definir o problema, as regras e a forma de verificar**. O agente escreve rápido; o que torna o resultado confiável é o ciclo de verificação.

## 2. Arquivos de regras

Cada ferramenta lê um arquivo no início da sessão: `CLAUDE.md` (Claude Code), `.cursor/rules` (Cursor), `GEMINI.md` (Gemini CLI). Veja o [`CLAUDE.md`](../CLAUDE.md) deste projeto.

O que vale colocar ali é **o que o agente não consegue adivinhar lendo o código**:
- os comandos (como testar, como medir);
- as convenções que têm motivo ("dinheiro sempre em centavos");
- as proibições ("nunca commitar `legacy/`", "nenhuma página pode ser também pasta");
- o que conta como "pronto" ("rode os testes e abra no navegador").

O que **não** vale: explicar o que o código já mostra ou repetir boas práticas genéricas. Arquivo de regras longo vira ruído.

Repare que a regra das pastas entrou no `CLAUDE.md` **depois** de o erro acontecer (AI-LOG, item 10). Arquivo de regras bom cresce assim: cada erro que custou caro vira uma linha.

## 3. Revisar código de IA com olhar crítico

Leia o [`AI-LOG.md`](AI-LOG.md). Dos 10 erros registrados, **só 3 foram pegos lendo código**; os outros foram pegos por teste, navegador ou medição. Por isso o processo importa mais que o prompt:

1. **Teste automatizado** pega regressão e afirmação falsa.
2. **Navegador** pega o que só aparece rodando (a rolagem errada, o 404).
3. **Medição** pega a melhoria que não aconteceu (o LCP de 3 s depois da reescrita).
4. **Desconfiar de resultado bom demais** (o checkout com LCP de 0,9 s estava medindo a página errada).

Na entrevista, esse arquivo é o seu diferencial: mostra que você usa IA e sabe onde ela erra.

## 4. Auditoria do legado

Antes de reescrever, inventarie. O Aviato tinha:

| Problema | Onde | Efeito |
| --- | --- | --- |
| 10 plugins jQuery em todas as páginas | `index.html` | JS e CSS que a página nem usa |
| Google Maps carregado na home | `<script src="maps.googleapis.com...">` | 103 KB e uma chave de API exposta, numa página sem mapa |
| Token do Instagram no HTML | `data-accessToken` | credencial pública; a API usada nem existe mais |
| Contador fixo em 2022 | `js/script.js` | promoção "acabando" há anos |
| Fontes pedidas e nunca carregadas | Playfair Display e Roboto Condensed no CSS | o design aparece com a fonte errada |
| Fonte de ícones de 190 KB em TTF | `themefisher-font` | o maior arquivo da home é uma fonte de ícones |
| Formulário com `action="post"` | busca no cabeçalho | envia para a URL `/post`, que não existe |
| Carrinho e checkout em HTML fixo | `cart.html` | não existe carrinho de verdade |
| 33 links `href="#"` | home | links que não levam a lugar nenhum |

Uma tabela dessas convence qualquer gestor de que a reescrita vale a pena, e é exatamente o tipo de tarefa em que o agente é muito bom (AI-LOG, "What the agent was good at").

## 5. Core Web Vitals

As métricas que o Google usa para medir a experiência:

- **LCP** (*Largest Contentful Paint*): quando o maior elemento da tela aparece. Bom: até 2,5 s.
- **CLS** (*Cumulative Layout Shift*): quanto a página "pula" enquanto carrega. Bom: até 0,1.
- **INP** (*Interaction to Next Paint*): quanto a página demora para responder a um clique. Só existe com usuário real; no laboratório, o **TBT** (*Total Blocking Time*) é o substituto.

**Laboratório vs campo.** O Lighthouse mede em laboratório: simula um celular médio com 4G lento. Os dados de campo (CrUX) vêm de usuários reais do Chrome. Este projeto não tem tráfego, então só tem laboratório. Saiba dizer isso numa entrevista.

**Medição justa.** As duas versões são servidas pelo mesmo servidor (`scripts/serve.mjs`), com gzip, e cada página é medida 3 vezes, usando a mediana. Sem isso, a comparação não vale nada (AI-LOG, itens 6 e 7).

## 6. CSR, SSG e hidratação

A lição mais importante do projeto (AI-LOG, item 8):

- **CSR** (*client-side rendering*): o servidor manda um HTML vazio e o JavaScript monta a página. O navegador só descobre a imagem principal depois que o JS baixa e roda. A primeira versão React ficou com LCP de ~3 s por isso.
- **SSG** (*static site generation*): no build, cada página é renderizada para HTML (`scripts/prerender.mjs`). O navegador já recebe o conteúdo e a imagem.
- **Hidratação:** o React "assume" o HTML pronto em vez de recriar tudo (`hydrateRoot` em `src/main.tsx`). Para isso, a primeira renderização no navegador tem que ser **idêntica** ao HTML.

E aí vem o problema: o carrinho está no `localStorage`, que não existe no build. Solução: o carrinho é um *external store* lido com `useSyncExternalStore`, que aceita um `getServerSnapshot` (carrinho vazio). O React hidrata com o carrinho vazio, igual ao HTML, e logo depois troca pelo carrinho salvo. Sem erro de hidratação, e há um teste Playwright que garante isso.

Páginas que dependem do visitante (carrinho, checkout) não são pré-renderizadas: vão como "casca" e são montadas no navegador. **Pré-renderize o que é igual para todo mundo.**

## 7. Testes

- **Vitest** para regras puras (`src/lib/*.test.ts`): carrinho, totais, validação, catálogo. São rápidos e cobrem casos chatos: quantidade fracionada, `localStorage` adulterado, CEP brasileiro num campo de ZIP americano.
- **Playwright** para a jornada de compra no build de produção, em desktop e celular. Os seletores são por **papel e nome acessível** (`getByRole("button", { name: "Add to cart" })`), não por classe CSS. Assim o teste enxerga a página como um leitor de tela, e um nome acessível errado quebra o teste (AI-LOG, item 5).

## 8. Detalhes que valem entrevista

- **Dinheiro em centavos:** `0.1 + 0.2` dá `0.30000000000000004`. Inteiros em centavos não têm esse problema.
- **Estado na URL:** a ordenação fica em `?sort=price-asc`. Dá para compartilhar o link, salvar nos favoritos e o botão "voltar" funciona.
- **Não confiar no `localStorage`:** o usuário pode editar. `parseSavedCart` valida cada linha.
- **Foco após navegação:** numa SPA, trocar de página não avisa o leitor de tela. O layout move o foco para o `h1` da nova página.

## Exercícios

1. **Use outro agente.** Instale o [Gemini CLI](https://github.com/google-gemini/gemini-cli) (grátis com a sua conta Google) e peça: "adicione um filtro de faixa de preço na página da loja, com testes". Revise o resultado com os critérios da seção 3 e registre no `AI-LOG.md` o que ele errou. Esse registro é **seu**, e vale mais do que qualquer item que eu escrevi.
2. **Quebre a hidratação de propósito.** Em `src/lib/cart-store.tsx`, troque `() => EMPTY` por `() => lines` no `getServerSnapshot` e rode `npm run test:e2e`. Qual teste falha, e por quê?
3. **Meça um ganho que ficou na mesa.** Na página de produto, as miniaturas da galeria (uns 80 px na tela) carregam as fotos de 1000 px. Rode `npm run measure`, proponha uma correção (com ou sem agente) e meça de novo. O que mudou em "Transferred" e no LCP? Se não mudou, por quê?
4. **Leia o relatório bruto.** Abra `reports/raw/legacy-home.json` no [Lighthouse Viewer](https://googlechrome.github.io/lighthouse/viewer/) e encontre a auditoria que aponta o Google Maps.
