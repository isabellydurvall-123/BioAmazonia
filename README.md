# 🌿 BioAmazônia — Bioquímica de Frutos Amazônicos

<p align="center">
  <strong>Ciência, tecnologia e valorização da biodiversidade amazônica.</strong>
</p>

<p align="center">
  Uma plataforma web e PWA dedicada ao estudo da estabilidade de compostos antioxidantes em frutos nativos da Amazônia, reunindo conteúdos científicos, experimentos laboratoriais de bancada, registros de dados físico-químicos e diretrizes para conservação pós-colheita.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Projeto-Pesquisa%20Cient%C3%ADfica-006B52?style=for-the-badge" alt="Pesquisa científica">
  <img src="https://img.shields.io/badge/Status-Em%20Produção-064d3f?style=for-the-badge" alt="Em Produção">
  <img src="https://img.shields.io/badge/PWA-Instalável%20Offline-1b4332?style=for-the-badge" alt="PWA Offline">
  <img src="https://img.shields.io/badge/TypeScript-React%2019-3178C6?style=for-the-badge" alt="TypeScript React">
</p>

---

## 📖 Sobre o projeto

O **BioAmazônia** é uma plataforma técnico-científica progressiva (PWA) desenvolvida para apoiar a investigação experimental e a divulgação de conhecimentos rigorosos sobre metabólitos secundários e compostos bioativos presentes em frutos da Amazônia.

O projeto tem como foco central a cinética de degradação e a estabilidade de antioxidantes sob diferentes fatores ambientais e tecnológicos, tais como:

- Condições de armazenamento e refrigeração/congelamento.
- Oxigênio atmosférico e métodos de desoxigenação (desaeramento e vácuo).
- Exposição luminosa (radiação ultravioleta e visível).
- Variações de potencial hidrogeniônico (pH).
- Tratamentos térmicos (branqueamento e pasteurização).

**Título da pesquisa:** _Bioquímica da Longevidade: Análise da Estabilidade de Compostos Antioxidantes em Frutos Amazônicos e sua Relação com a Promoção da Saúde Celular._

---

## 🎯 Objetivos

- **Catalogação Fitoquímica:** Organizar dados botânicos e físico-químicos sobre espécies frutíferas amazônicas e seus teores de metabólitos secundários.
- **Educação Científica:** Disponibilizar módulos didáticos estruturados sobre termodinâmica redox (HAT / SET), radicais livres, peroxidação lipídica e sinergia de matrizes vegetais nativas.
- **Registro Experimental de Bancada:** Facilitar a inserção, validação estatística e arquivamento de ensaios com controle de lotes, replicatas e rastreabilidade metodológica.
- **Tabela Dinâmica de Estabilidade:** Permitir filtragem multidimensional, visualização gráfica e exportação de dados analíticos brutos em CSV.
- **Guia Digital de Conservação:** Compilar recomendações técnicas baseadas na literatura indexada (EMBRAPA, INPA, SciELO, PubMed) e em observações laboratoriais próprias.
- **Repositório Bibliográfico:** Indexar referências científicas completas com links diretos, DOIs e autores verificados.
- **Funcionamento Offline (PWA):** Assegurar o acesso contínuo aos catálogos e registros em campo ou em áreas remotas da floresta, mesmo sem conexão com a internet.

---

## 🍇 Frutos Estudados no Catálogo

A base de dados contempla 6 espécies amazônicas com caracterização morfológica, perfil cromatográfico e nutricional:

| Fruto                | Nome científico                                       | Família Botânica | Composto Chave                                           |
| -------------------- | ----------------------------------------------------- | ---------------- | -------------------------------------------------------- |
| **Camu-camu**        | _Myrciaria dubia_ (Kunth) McVaugh                     | Myrtaceae        | Ácido L-ascórbico (Vitamina C: 1.600 a 6.110 mg/100g)    |
| **Açaí-do-Amazonas** | _Euterpe precatoria_ Mart.                            | Arecaceae        | Cianidina-3-rutinosídeo e cianidina-3-glicosídeo         |
| **Tucumã**           | _Astrocaryum aculeatum_ G.Mey.                        | Arecaceae        | Beta-caroteno e carotenoides totais (pró-vitamina A)     |
| **Buriti**           | _Mauritia flexuosa_ L.f.                              | Arecaceae        | Carotenoides lipofílicos e ácidos graxos monoinsaturados |
| **Cubiu**            | _Solanum sessiliflorum_ Dunal                         | Solanaceae       | Niacina, pectina e ácidos orgânicos (cítrico e málico)   |
| **Cupuaçu**          | _Theobroma grandiflorum_ (Willd. ex Spreng.) K.Schum. | Malvaceae        | Polifenóis, ácido ascórbico e teobromina                 |

> **Critério Científico:** Todas as informações foram fundamentadas em referências públicas verificáveis (EMBRAPA, SciELO, PubMed, INPA). Resultados obtidos nos ensaios práticos são sinalizados distintamente dos dados da literatura.

---

## 🔬 Linhas Experimentais de Bancada

A plataforma organiza 3 módulos de ensaios experimentais:

### 1. Estabilidade da Vitamina C (Titulação Iodométrica)

- **Método:** Oxirredução com solução de iodo padronizada em meio ácido, utilizando dispersão de amido como indicador do ponto de viragem.
- **Matrizes:** Polpas de Camu-camu (_Myrciaria dubia_) e Cubiu (_Solanum sessiliflorum_).
- **Tratamentos:** Polpa fresca (controle basal), refrigeração (4°C por 24h a 72h), congelamento (-18°C), tratamento térmico/fervura e exposição à luz UV.

### 2. Oxidação Enzimática & Escurecimento (Polifenoloxidase - PPO)

- **Método:** Acompanhamento cinético fotográfico com escala visual padronizada de browning (Graus 1 a 5).
- **Matrizes:** Amostras vegetais sob ação de polifenoloxidases nativas (amostra de maçã como controle analítico rápido, complementada por Buriti e Tucumã).
- **Tratamentos:** Controle sem aditivos, acidificação por ácido ascórbico nativo de camu-camu, tratamento térmico (inativação por branqueamento) e restrição de oxigênio (imersão em água/vácuo).

### 3. Influência do pH no Cátion Flavílio das Antocianinas

- **Método:** Espectrofotometria / colorimetria comparativa em escala tamponada de pH (1,0 a 12,0).
- **Matriz:** Extrato hidroalcoólico do epicarpo de Açaí (_Euterpe precatoria_).
- **Equilíbrio Químico:** Transição estrutural reversível entre o cátion flavílio (vermelho vivo em pH < 2,0), base quinoidal anidra (púrpura em pH neutro) e formas chalconas descoloridas ou degradadas em meio alcalino.

> **Nota Epistêmica:** Variações visuais e medidas colorimétricas qualitativas não substituem a cromatografia líquida de alta eficiência (HPLC). As conclusões expressam com rigor as fronteiras metodológicas dos ensaios de bancada.

---

## ✨ Funcionalidades da Plataforma

- **Catálogo Científico Dinâmico:** Fichas botânicas completas, fotos autorizadas com identificação de espécimes, mapas de sazonalidade e teores nutricionais.
- **Fundamentação Bioquímica Integrada:** Módulos didáticos dinamicamente sincronizados com os estudos científicos indexados no banco de dados.
- **Tabela Pública de Estabilidade Nutricional:** Busca textual, filtros combinados por fruto, linha experimental, condição de conversão/armazenamento e datas, com gráficos de barras analíticos e exportação em CSV.
- **Guia Digital de Conservação Pós-Colheita:** Instruções práticas para produtores e pesquisadores evitarem perdas nutricionais, com vinculação direta aos artigos originais.
- **Biblioteca de 15 Referências Verificadas:** Artigos indexados da EMBRAPA, SciELO, PubMed e livros de referência com links diretos, DOIs e cópia rápida de citação formatada.
- **Painel Administrativo do Laboratório:** Gestão de espécies, tópicos didáticos, ensaios de bancada, diretrizes de conservação, referências e usuários com papéis diferenciados.
- **Progressive Web App (PWA):**
  - Ícone de identidade oficial **BA** em múltiplas resoluções.
  - Instalação direta no celular (Android/iOS) e no computador com 1 clique.
  - Funcionamento offline completo com indicador visual automático de conectividade (_heartbeat ping_).

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Strict typing, interfaces modulares).
- **Framework UI:** [React 19](https://react.dev/) com Hooks e componentes funcionais desacoplados.
- **Build Tool:** [Vite](https://vitejs.dev/) com compilação instantânea.
- **PWA & Service Worker:** `vite-plugin-pwa` e Workbox com estratégias _CacheFirst_ e _NetworkFirst_.
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) com paleta botânica customizada (`#064d3f`).
- **Backend & Armazenamento:**
  - **Firebase Authentication:** Gestão de identidades seguras com Google OAuth.
  - **Cloud Firestore:** Banco de dados NoSQL reativo para persistência de frutos, diretrizes, referências e experimentos.
  - **Fallback Local Cache:** Sincronização offline transparente via `localStorage` com recuperação automática.
- **Iconografia:** [Lucide React](https://lucide.dev/).

---

## 🔐 Perfis de Acesso e Controle de Permissões

| Perfil                            | Nível       | Responsabilidades e Capacidades                                                                                                                                                                  |
| --------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Curador Geral / Administrador** | Total       | Gerenciamento global de espécies, edição de tópicos de bioquímica, homologação e exclusão de experimentos, publicação de diretrizes, cadastro de referências e atribuição de papéis de usuários. |
| **Pesquisador de Bancada**        | Operacional | Cadastro de novos ensaios laboratoriais, inserção de medidas quantitativas, documentação de observações de campo e envio de registros para publicação.                                           |
| **Visitante**                     | Consulta    | Acesso irrestrito a todos os dados públicos: fichas de frutos, módulos educativos, tabela de estabilidade, referências e download de relatórios.                                                 |

---

## 💻 Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior).
- Gerenciador de pacotes `npm`.
- Git para versionamento de código.

Verifique as versões instaladas:

```bash
node -v
npm -v
```

### 1. Clonar o Repositório

```bash
git clone https://github.com/SEU_USUARIO/bioamazonia.git
cd bioamazonia
```

### 2. Instalar as Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as chaves do Firebase (utilize o modelo do `.env.example`):

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 4. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse a aplicação no navegador em:

```text
http://localhost:3000
```

### 5. Compilar para Produção

```bash
npm run build
```

### ⚠️ Solução de problemas: esbuild

Se ocorrer um erro relacionado ao `esbuild`, primeiro verifique a mensagem completa e a versão exigida pelas dependências.

Caso seja necessário utilizar a versão `0.28.x`, conforme a compatibilidade do projeto, execute:

```bash
npm install -D esbuild@^0.28.0
```

Em seguida, tente novamente:

```bash
npm run dev
```

Não force a atualização de dependências indiscriminadamente. Alterações de versão devem respeitar as dependências existentes e o arquivo `package-lock.json`.

---

## 🗂️ Estrutura de Diretórios

```text
bioamazonia/
├── public/
│   ├── imagens/                           # Imagens de frutos, experimentos e página inicial
│   ├── apple-touch-icon.png               # Ícone para dispositivos Apple
│   ├── icon.svg                           # Ícone vetorial da aplicação
│   ├── pwa-192x192.png                    # Ícone PWA (192x192)
│   ├── pwa-512x512.png                    # Ícone PWA (512x512)
│   └── pwa-maskable-512x512.png           # Ícone PWA adaptável
├── scripts/
│   └── generate-png-icons.js              # Geração de ícones PNG
├── src/
│   ├── components/                        # Componentes reutilizáveis da interface
│   │   ├── experiments/                   # Componentes dos experimentos
│   │   │   ├── DeleteExperimentModal.tsx
│   │   │   ├── ExperimentA_VitaminC.tsx
│   │   │   ├── ExperimentB_EnzymaticBrowning.tsx
│   │   │   ├── ExperimentC_AnthocyaninPH.tsx
│   │   │   └── ExperimentRecordFormModal.tsx
│   │   ├── Footer.tsx                     # Rodapé
│   │   ├── Navbar.tsx                     # Navegação principal
│   │   ├── OfflineIndicator.tsx           # Aviso de conexão offline
│   │   └── PWAInstallButton.tsx           # Botão de instalação do app
│   ├── contexts/                          # Contextos compartilhados da aplicação
│   │   └── AuthContext.tsx                # Autenticação e perfil do usuário
│   ├── data/                              # Dados estáticos de páginas e catálogos
│   │   ├── biochemistryTopicsData.ts
│   │   ├── conservationData.ts
│   │   ├── experimentsData.ts
│   │   ├── fruitsCatalogData.ts
│   │   ├── fruitsData.ts
│   │   ├── protocolsData.ts
│   │   ├── referencesData.ts
│   │   └── stabilityData.ts
│   ├── hooks/                             # Hooks React reutilizáveis
│   │   ├── useOnlineStatus.ts             # Detecção do estado da conexão
│   │   └── usePWAInstall.ts               # Fluxo de instalação PWA
│   ├── pages/                             # Páginas da aplicação
│   │   ├── AdminPage.tsx
│   │   ├── BiochemistryPage.tsx
│   │   ├── CatalogPage.tsx
│   │   ├── ConservationPage.tsx
│   │   ├── ExperimentsPage.tsx
│   │   ├── FruitDetailPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── ReferencesPage.tsx
│   │   └── StabilityPage.tsx
│   ├── services/                          # Integrações e persistência de dados
│   │   ├── conservationStorageService.ts
│   │   ├── experimentStorageService.ts
│   │   ├── firebase.ts
│   │   ├── fruitStorageService.ts
│   │   ├── referenceStorageService.ts
│   │   ├── topicStorageService.ts
│   │   └── userManagementService.ts
│   ├── types/
│   │   └── index.ts                       # Tipos compartilhados
│   ├── App.tsx                            # Composição e navegação da aplicação
│   ├── index.css                          # Estilos globais
│   └── main.tsx                           # Ponto de entrada React
├── firestore.rules                        # Regras de acesso do Firestore
├── index.html                             # Documento HTML principal
├── package.json                           # Dependências e comandos do projeto
├── package-lock.json                      # Lockfile do npm
├── bun.lock                               # Lockfile do Bun
├── tsconfig.json                          # Configuração do TypeScript
├── vite.config.ts                         # Configuração do Vite e do PWA
└── README.md                              # Documentação do projeto
```

---

## 📚 Referências Científicas Principais

Todas as referências cadastradas contam com links e identificadores verificáveis:

1. **Fujita et al. (2013)** — _Impact of spouted bed drying on bioactive compounds and antioxidant activity of camu-camu pulp._ Food Research International.
2. **Schauss et al. (2006)** — _Phytochemical and nutrient composition of the freeze-dried Amazonian palm berry, Euterpe oleracea Mart. (Açaí)._ J. Agric. Food Chem.
3. **Yuyama et al. (2002)** — _Camu-camu: a nova modalidade de consumo de vitamina C "in natura"._ Acta Amazonica / Embrapa.
4. **Chagas et al. (2012)** — _Avaliação do desempenho do camu-camu em terra firme na região de Manaus, AM._ Embrapa Amazônia Ocidental.
5. **Nascimento & Silva (2005)** — _Diferenciação do açaí-do-Amazonas (E. precatoria) do açaí-do-Pará (E. oleracea)._ Com. Técnico 29, Embrapa.
6. **Menezes et al. (2008)** — _Euterpe precatoria Mart.: boas práticas de produção na coleta e pós-coleta de açaí-solteiro._ Embrapa Acre.
7. **Ramos et al. (2018)** — _Tucumã (Astrocaryum aculeatum)._ Plantas para o Futuro – Região Norte (MMA / Embrapa).
8. **Ferreira & Gentil (2009)** — _Técnicas para facilitar a germinação das sementes de tucumã-do-Amazonas._ Com. Técnico 77, Embrapa.
9. **Sampaio et al. (2015)** — _Buriti (Mauritia flexuosa)._ Palmeiras Nativas do Brasil, Embrapa.
10. **Vieira & Bentes (2010)** — _Folder Buriti: descrição, habitat e usos._ Embrapa Rondônia.
11. **Menezes et al. (2012)** — _Biometria de frutos de buriti, Roraima: produção de polpa e óleo._ Embrapa Roraima.
12. **Maeda et al. (2007)** — _Estabilidade de ácido ascórbico e antocianinas em néctar de camu-camu._ Ciência e Tecnologia de Alimentos (SciELO).
13. **Barros et al. (2024)** — _Effects of distinct food preservation methods on the bioactive content and antioxidant capacity of tucumã-do-Amazonas._ PubMed / Food Chemistry.
14. **Serra et al. (2015)** — _Evaluation of Antioxidant Capacity of Solanum sessiliflorum (Cubiu) Extract: An In Vitro Assay._ PMC / Oxidative Medicine and Cellular Longevity.
15. **Rogez (2000)** — _Açaí: preparo, composição e melhoramento da conservação._ Embrapa Amazônia Oriental / EDUFPA.

---

## 🌱 Impacto Esperado

O **BioAmazônia** visa encurtar a distância entre a bancada de pesquisa e as comunidades produtoras locais, oferecendo uma plataforma tecnológica e transparente que:

- Valoriza a sociobiodiversidade e a bioeconomia sustentável da floresta em pé.
- Fornece respaldo técnico e científico para o aproveitamento integral e pós-colheita dos frutos nativos.
- Promove a formação científica continuada em bioquímica, botânica e ciências dos alimentos.

---

<p align="center">
  🌿 <strong>BioAmazônia</strong><br>
  <em>Conhecimento científico para valorizar a biodiversidade amazônica.</em>
</p>
