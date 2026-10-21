# 🌿 BioAmazônia — Bioquímica de Frutos Amazônicos

<p align="center">
  <strong>Ciência, tecnologia e valorização da biodiversidade amazônica.</strong>
</p>

<p align="center">
  Uma plataforma web dedicada ao estudo da estabilidade de compostos antioxidantes em frutos amazônicos, reunindo conteúdos científicos, experimentos, registros de dados e informações sobre conservação nutricional.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Projeto-Pesquisa%20Cient%C3%ADfica-006B52?style=for-the-badge" alt="Pesquisa científica">
  <img src="https://img.shields.io/badge/Status-Em%20desenvolvimento-D9A441?style=for-the-badge" alt="Em desenvolvimento">
</p>

---

## 📖 Sobre o projeto

O **BioAmazônia** é uma plataforma web desenvolvida para apoiar a investigação científica e a divulgação de conhecimentos sobre compostos bioativos presentes em frutos da Amazônia.

O projeto tem como foco o estudo da estabilidade de compostos antioxidantes e dos fatores que podem influenciar suas características, como condições de armazenamento, temperatura, exposição ao ambiente e variações de pH.

A plataforma busca aproximar ciência e tecnologia por meio de um ambiente digital que organiza informações, facilita o registro de experimentos e permite consultar resultados científicos de maneira clara e acessível.

**Título da pesquisa:** *Bioquímica da Longevidade: Análise da Estabilidade de Compostos Antioxidantes em Frutos Amazônicos e sua Relação com a Promoção da Saúde Celular.*

## 🎯 Objetivos

- Organizar informações científicas sobre frutos amazônicos e seus compostos bioativos.
- Disponibilizar conteúdos educativos sobre bioquímica, antioxidantes e estabilidade nutricional.
- Apoiar o registro e a análise de experimentos laboratoriais.
- Apresentar resultados por meio de tabelas e gráficos.
- Reunir referências científicas para consulta e aprofundamento.
- Divulgar informações sobre conservação de frutos e estabilidade de seus componentes.
- Facilitar o acesso aos dados experimentais por meio de uma tabela digital.

## 🍇 Frutos estudados

O catálogo científico contempla cinco frutos amazônicos:

| Fruto | Nome científico |
|---|---|
| Camu-camu | *Myrciaria dubia* |
| Açaí-do-Amazonas | *Euterpe precatoria* |
| Tucumã | *Astrocaryum aculeatum* |
| Buriti | *Mauritia flexuosa* |
| Cubiu | *Solanum sessiliflorum* |

As informações apresentadas devem ser fundamentadas em referências científicas verificáveis. Os resultados experimentais próprios devem ser identificados separadamente dos dados provenientes da literatura.

## 🔬 Experimentos científicos

A proposta contempla três linhas experimentais:

### 1. Estabilidade da vitamina C

Investiga alterações relacionadas à vitamina C em amostras de frutos submetidas a diferentes condições de conservação e tratamento, utilizando um protocolo experimental definido.

### 2. Oxidação enzimática

Observa o escurecimento de amostras de maçã sob diferentes condições experimentais, com registro de tempo, imagens e observações.

### 3. Influência do pH nas antocianinas

Investiga alterações de cor em extratos de açaí submetidos a diferentes condições de pH, considerando as propriedades químicas dos pigmentos.

> **Nota científica:** mudanças de cor e observações visuais não equivalem, por si só, à quantificação de compostos bioativos ou à medição da capacidade antioxidante. As conclusões devem respeitar os limites dos métodos utilizados.

## ✨ Funcionalidades previstas

- **Catálogo de frutos:** consulta de informações botânicas e bioquímicas.
- **Conteúdos educativos:** materiais sobre antioxidantes, radicais livres, estresse oxidativo e estabilidade dos compostos.
- **Registro de experimentos:** organização de amostras, condições, medidas, datas e observações.
- **Tabelas e gráficos:** visualização de resultados registrados.
- **Tabela Digital de Estabilidade Nutricional:** consulta filtrável de resultados publicados.
- **Guia de conservação:** informações sobre conservação dos frutos com referências e condições documentadas.
- **Referências científicas:** organização de artigos, publicações e identificadores DOI.
- **Painel administrativo:** gerenciamento de conteúdos, registros e publicações.
- **Controle de acesso:** separação entre as permissões de administrador e pesquisador de bancada.
- **Acesso responsivo:** interface adaptável a computadores, tablets e celulares.
- **PWA:** possibilidade de instalação e acesso a determinados conteúdos sem conexão, conforme os recursos implementados.

*Os recursos estão sujeitos ao estágio de desenvolvimento e à validação de cada módulo.*

## 🛠️ Tecnologias

O projeto utiliza ou prevê a utilização das seguintes tecnologias, conforme a implementação de cada módulo:

- **JavaScript:** lógica e funcionalidades da aplicação.
- **React:** construção de interfaces por componentes, quando utilizado na configuração atual.
- **Vite:** ambiente de desenvolvimento e compilação.
- **Firebase Authentication:** autenticação de usuários.
- **Cloud Firestore:** armazenamento e consulta de dados.
- **Firebase Storage:** armazenamento de imagens e arquivos, caso habilitado.
- **HTML5 e CSS3:** estrutura e apresentação da interface.
- **Netlify:** opção de hospedagem e publicação da aplicação.

## 🔐 Perfis de acesso

O sistema prevê diferentes níveis de permissão para proteger os dados científicos.

| Perfil | Responsabilidades |
|---|---|
| Administrador / Curador científico | Gerenciar conteúdos, frutos, referências, usuários e permissões, conforme as regras do sistema. |
| Pesquisador de bancada | Registrar e consultar experimentos, inserir resultados e gerenciar seus registros experimentais dentro das permissões concedidas. |
| Visitante | Consultar conteúdos e resultados públicos disponibilizados pela plataforma. |

As permissões devem ser verificadas também nas regras do banco de dados e nos serviços de armazenamento, não apenas na interface.

## 💻 Como executar localmente

### Pré-requisitos

Antes de começar, instale:

- [Node.js](https://nodejs.org/) — versão compatível com o projeto.
- [Git](https://git-scm.com/) — para clonar o repositório.
- Um editor de código, como o [Visual Studio Code](https://code.visualstudio.com/).

Para verificar se o Node.js e o npm estão instalados, execute no terminal:

```bash
node -v
npm -v
```

### 1. Clone o repositório

Substitua `SEU_USUARIO` pelo nome de usuário ou pela organização proprietária do repositório:

```bash
git clone https://github.com/SEU_USUARIO/bioamazonia.git
```

Entre na pasta do projeto:

```bash
cd bioamazonia
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Se o projeto utilizar Firebase ou outras configurações externas, consulte os arquivos de configuração e o `.env.example`, caso exista.

Em projetos Vite, as variáveis públicas de configuração podem utilizar o prefixo `VITE_`. Por exemplo:

```env
VITE_FIREBASE_API_KEY=sua_chave
VITE_FIREBASE_AUTH_DOMAIN=seu_dominio
VITE_FIREBASE_PROJECT_ID=seu_projeto
VITE_FIREBASE_STORAGE_BUCKET=seu_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

Utilize os valores correspondentes ao projeto Firebase correto e ao código existente. Os nomes das variáveis devem corresponder aos utilizados pela aplicação.

**Segurança:** não inclua senhas, chaves privadas, credenciais de contas de serviço ou arquivos de configuração privilegiados no repositório público. A configuração pública do Firebase não substitui as regras de segurança do banco de dados.

### 4. Execute a aplicação

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para abrir no navegador, normalmente:

```text
http://localhost:5173
```

### 5. Gere a versão de produção

Para verificar se a aplicação compila corretamente:

```bash
npm run build
```

Para visualizar localmente a versão compilada, se o script estiver disponível:

```bash
npm run preview
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

## 🗂️ Organização do projeto

A estrutura pode variar conforme a implementação. Em uma aplicação React com Vite, uma organização possível é:

```text
bioamazonia/
├── public/
│   ├── imagens/
│   └── manifest.json
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── data/
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── README.md
```

Essa estrutura é ilustrativa. Mantenha a organização real do repositório e não crie pastas vazias apenas para reproduzir o exemplo.

## 🧪 Validação científica e qualidade dos dados

A plataforma deve priorizar:

- Identificação da origem de cada registro.
- Registro das condições experimentais e das unidades de medida.
- Separação entre resultados próprios, dados publicados e dados demonstrativos.
- Referências científicas verificáveis.
- Histórico de revisão e publicação, quando implementado.
- Proteção contra alterações e exclusões não autorizadas.
- Apresentação de limitações metodológicas e incertezas.

Os resultados devem ser interpretados dentro dos limites do protocolo experimental. A presença de compostos antioxidantes não constitui, isoladamente, comprovação de efeitos clínicos ou de benefícios específicos à saúde.

## 🤝 Contribuições

Contribuições para a melhoria da plataforma são bem-vindas, especialmente nas áreas de desenvolvimento web, interface e experiência do usuário, organização de dados, bioquímica e validação científica.

Para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua alteração.
3. Implemente e teste as modificações.
4. Descreva as mudanças realizadas.
5. Envie um pull request para revisão.

Alterações que afetem os resultados científicos, os protocolos ou as permissões de acesso devem ser acompanhadas de justificativa e revisão adequada.

## 📚 Referências científicas

As referências utilizadas na plataforma devem ser identificadas individualmente, com autores, título, ano de publicação, periódico ou instituição e DOI ou endereço eletrônico, quando disponível.

Consulte a seção **Referências** da aplicação para acessar as fontes vinculadas aos conteúdos e experimentos.

## 🌱 Impacto esperado

O BioAmazônia busca contribuir para a valorização da biodiversidade amazônica, a organização de informações científicas e a divulgação acessível de conhecimentos sobre bioquímica e estabilidade de compostos presentes em frutos regionais.

A proposta integra pesquisa, educação e tecnologia em um ambiente digital voltado à consulta, ao registro e à análise de informações científicas.

## 📄 Licença

A licença do projeto deverá ser definida pelos responsáveis. Até que uma licença seja adicionada ao repositório, não presuma que o código ou os materiais estejam liberados para reutilização irrestrita.

---

<p align="center">
  🌿 <strong>BioAmazônia</strong><br>
  <em>Conhecimento científico para valorizar a biodiversidade amazônica.</em>
</p>