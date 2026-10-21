import { ConservationGuideline } from '../types';

export const CONSERVATION_GUIDELINES: ConservationGuideline[] = [
  // ================= CAMU-CAMU =================
  {
    id: 'cons-camu-01',
    fruitId: 'camu-camu',
    fruitCommonName: 'Camu-camu',
    scientificName: 'Myrciaria dubia',
    storageCondition: 'Congelamento da Polpa Desaerada (-18°C a -20°C)',
    recommendation: 'A polpa extraída deve ser imediatamente desaerada sob vácuo brando e envasada em recipientes herméticos opacos à luz antes do congelamento a -18°C. Sob essas condições, a retenção de ácido L-ascórbico atinge de 85% a 92% após 180 dias de estocagem.',
    compoundTarget: 'Ácido L-Ascórbico (Vitamina C)',
    sourceType: 'Literatura Indexada',
    sourceCitation: 'Rodrigues et al. (2016) — Embrapa Roraima; Akter et al. (2011) — Food Res. Int.',
    sourceUrl: 'https://doi.org/10.1016/j.foodres.2011.01.008',
    relatedReferenceId: 'ref-01',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Exige manutenção ininterrupta da cadeia de frio (-18°C). Flutuações térmicas no freezer e descongelamentos parciais aceleram a clivagem enzimática e auto-oxidação do ácido ascórbico a ácido desidroascórbico.'
  },
  {
    id: 'cons-camu-02',
    fruitId: 'camu-camu',
    fruitCommonName: 'Camu-camu',
    scientificName: 'Myrciaria dubia',
    storageCondition: 'Refrigeração de Frutos Inteiros (4°C a 6°C)',
    recommendation: 'Armazenar os frutos inteiros maduros e intactos em caixas plásticas higienizadas e ventiladas a 4°C–6°C com umidade relativa de 85% a 90%. A taxa respiratória é desacelerada, preservando a acidez titulável.',
    compoundTarget: 'Vitamina C e Integridade do Epicarpo',
    sourceType: 'Institucional (EMBRAPA / INPA)',
    sourceCitation: 'Yuyama et al. (2002) — Acta Amazonica; Manual Técnico INPA',
    sourceUrl: 'https://doi.org/10.1590/1809-43922002322216',
    relatedReferenceId: 'ref-02',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Vida de prateleira limitada a 5–7 dias. Após esse período, ocorre senescência celular natural, amolecimento do mesocarpo e perda gradual de 15% a 25% da vitamina C por metabolismo respiratório residual.'
  },
  {
    id: 'cons-camu-03',
    fruitId: 'camu-camu',
    fruitCommonName: 'Camu-camu',
    scientificName: 'Myrciaria dubia',
    storageCondition: 'Degradação Térmica sob Fervura / Aquecimento Direto (~98°C)',
    recommendation: 'Evitar cocção prolongada e aquecimento direto da polpa acima de 70°C. O poder redutor do ácido ascórbico sofre forte degradação térmica não-enzimática irreversível sob altas temperaturas mantidas.',
    compoundTarget: 'Termolabilidade do Ácido Ascórbico',
    sourceType: 'Observação Experimental do Projeto',
    sourceCitation: 'Experimento A — Ensaio de Estabilidade da Vitamina C (BioAmazônia, 2026)',
    relatedReferenceId: 'ref-10',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Observação experimental direta obtida em banho termostatizado por 10 minutos. Este resultado reflete aquecimento doméstico contínuo e NÃO deve ser extrapolado diretamente para processos industriais de pasteurização rápida (HTST 85°C por 15 segundos).'
  },
  {
    id: 'cons-camu-04',
    fruitId: 'camu-camu',
    fruitCommonName: 'Camu-camu',
    scientificName: 'Myrciaria dubia',
    storageCondition: 'Liofilização e Secagem sob Baixa Temperatura',
    recommendation: 'A polpa liofilizada em pó preserva mais de 94% dos bioativos originais quando armazenada em sachês laminados metalizados selados a vácuo ao abrigo de umidade.',
    compoundTarget: 'Elagitaninos e Vitamina C',
    sourceType: 'Literatura Indexada',
    sourceCitation: 'Fujita et al. (2013) — Food Research International',
    sourceUrl: 'https://doi.org/10.1016/j.foodres.2013.07.025',
    relatedReferenceId: 'ref-08',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Elevado custo de equipamento e insumos. O pó é altamente higroscópico; qualquer infiltração de vapor de água reidrata a matriz e desestabiliza imediatamente os polifenóis.'
  },

  // ================= AÇAÍ =================
  {
    id: 'cons-acai-01',
    fruitId: 'acai',
    fruitCommonName: 'Açaí-do-Amazonas',
    scientificName: 'Euterpe precatoria',
    storageCondition: 'Congelamento de Polpa Branqueada e Pasteurizada (-18°C)',
    recommendation: 'Antes do despolpamento, submeter os frutos ao choque térmico (80°C por 10 segundos seguido de resfriamento imediato a 4°C) para inativação completa de polifenoloxidase (PPO) e peroxidase (POD), prevenindo a perda enzimática de antocianinas durante o congelamento a -18°C.',
    compoundTarget: 'Antocianinas Monoméricas e Ácidos Graxos',
    sourceType: 'Institucional (EMBRAPA / INPA)',
    sourceCitation: 'Rogez (2000) — Embrapa Amazônia Oriental / EDUFPA; Schauss et al. (2006)',
    sourceUrl: 'https://doi.org/10.1021/jf060976g',
    relatedReferenceId: 'ref-04',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Se a inativação enzimática não for realizada de forma uniforme, a peroxidase residual degrada até 40% das antocianinas mesmo sob congelamento a -18°C ao longo de 60 dias.'
  },
  {
    id: 'cons-acai-02',
    fruitId: 'acai',
    fruitCommonName: 'Açaí-do-Amazonas',
    scientificName: 'Euterpe precatoria',
    storageCondition: 'Equilíbrio Ácido-Base e Meios com pH Variável',
    recommendation: 'Manter a polpa em seu pH ácido natural (3,8 a 4,5). O clareamento visual em pHs neutros ou alcalinos decorre do equilíbrio tautomérico reversível para pseudobase carbinol incolor e formas quinoidais azuis.',
    compoundTarget: 'Equilíbrio Estrutural Tautomérico das Antocianinas',
    sourceType: 'Observação Experimental do Projeto',
    sourceCitation: 'Experimento C — Ensaio de Influência do pH nas Antocianinas (BioAmazônia, 2026)',
    relatedReferenceId: 'ref-09',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Observação de bancada realizada em solução tamponada modelo. A estabilização da cor vermelha em pH hiperácido artificial (< 2,0) não deve ser utilizada como método de consumo humano direto.'
  },
  {
    id: 'cons-acai-03',
    fruitId: 'acai',
    fruitCommonName: 'Açaí-do-Amazonas',
    scientificName: 'Euterpe precatoria',
    storageCondition: 'Polpa Fresca Não Pasteurizada à Temperatura Ambiente (20°C a 26°C)',
    recommendation: 'A polpa fresca in natura sem tratamento térmico deve ser consumida em no máximo 2 horas após a extração ou imediatamente refrigerada a 4°C por no máximo 24 horas.',
    compoundTarget: 'Segurança Microbiológica e Oxidação Rápida',
    sourceType: 'Institucional (EMBRAPA / INPA)',
    sourceCitation: 'Manual de Boas Práticas do Açaí — Embrapa / MAPA / Anvisa',
    updatedAt: '16/10/2026',
    applicationLimitations: 'A alta densidade de nutrientes e acidez moderada do açaí propicia fermentação rápida por leveduras e degradação oxidativa de até 50% dos pigmentos em 6 horas exposto ao ar ambiente.'
  },

  // ================= TUCUMÃ =================
  {
    id: 'cons-tucuma-01',
    fruitId: 'tucuma',
    fruitCommonName: 'Tucumã',
    scientificName: 'Astrocaryum aculeatum',
    storageCondition: 'Refrigeração de Frutos Descascados / Fatiados (4°C a 8°C)',
    recommendation: 'Fatias de tucumã devem ser conservadas em embalagens herméticas seladas a vácuo sob refrigeração. A presença da fração lipídica rica em ácido oleico ajuda a isolar os tecidos internos da dessecação rápida.',
    compoundTarget: 'Ácido Oleico e Beta-caroteno',
    sourceType: 'Literatura Indexada',
    sourceCitation: 'Sagrillo et al. (2015) — J. Food Biochem.; Rosso & Mercadante (2007)',
    sourceUrl: 'https://doi.org/10.1111/jfbc.12154',
    relatedReferenceId: 'ref-07',
    updatedAt: '16/10/2026',
    applicationLimitations: 'A polpa fatiada perde umidade superficial após 48 horas se não estiver hermeticamente selada, acelerando o enrugamento celular e a oxidação dos lipídios de superfície.'
  },
  {
    id: 'cons-tucuma-02',
    fruitId: 'tucuma',
    fruitCommonName: 'Tucumã',
    scientificName: 'Astrocaryum aculeatum',
    storageCondition: 'Barreira Física contra Escurecimento Enzimático de Alimentos',
    recommendation: 'A polpa de tucumã possui viscosidade lipídica e tocoferóis capazes de formar um biofilme superficial que retarda o escurecimento por polifenoloxidase quando aplicado sobre superfícies vegetais lesadas.',
    compoundTarget: 'Oclusão Lipofílica de Oxigênio (O₂)',
    sourceType: 'Observação Experimental do Projeto',
    sourceCitation: 'Experimento B — Ensaio de Oxidação Enzimática (BioAmazônia, 2026)',
    relatedReferenceId: 'ref-05',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Observação experimental qualitativa padronizada em fatias de maçã em bancada (120 min). A ação decorre predominantemente da barreira física à difusão de oxigênio; não representa inativação enzimática molecular definitiva.'
  },

  // ================= BURITI =================
  {
    id: 'cons-buriti-01',
    fruitId: 'buriti',
    fruitCommonName: 'Buriti',
    scientificName: 'Mauritia flexuosa',
    storageCondition: 'Polpa e Óleo em Frascos Âmbar Fechados (15°C a 20°C ou Refrigeração)',
    recommendation: 'Armazenar o óleo ou a polpa despolpada estritamente em recipientes opacos ou de vidro âmbar selados. A proteção contra a luz solar e luzes fluorescentes brancas é o fator determinante de estabilidade.',
    compoundTarget: 'All-trans-Beta-Caroteno e Alfa-Tocoferol',
    sourceType: 'Literatura Indexada',
    sourceCitation: 'Rosso & Mercadante (2007) — J. Agric. Food Chem.',
    sourceUrl: 'https://doi.org/10.1021/jf070542w',
    relatedReferenceId: 'ref-05',
    updatedAt: '16/10/2026',
    applicationLimitations: 'O betacaroteno do buriti é altamente suscetível à foto-oxidação: a exposição contínua à luz ambiente pode degradar mais de 40% dos carotenoides em 30 dias mesmo em temperatura ambiente amena.'
  },
  {
    id: 'cons-buriti-02',
    fruitId: 'buriti',
    fruitCommonName: 'Buriti',
    scientificName: 'Mauritia flexuosa',
    storageCondition: 'Proteção Antioxidante Lipofílica em Superfícies',
    recommendation: 'A polpa amarela de buriti demonstra alta capacidade de retenção de frescor e supressão de radicais livres secundários devido à sinergia entre carotenoides e vitamina E natural.',
    compoundTarget: 'Supressão de Oxigênio Singlete e Radicais Peroxil',
    sourceType: 'Observação Experimental do Projeto',
    sourceCitation: 'Experimento B — Ensaio de Oxidação Enzimática (BioAmazônia, 2026)',
    relatedReferenceId: 'ref-05',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Ensaio em modelo de escurecimento de maçã exposta ao ar. Os resultados não eliminam a necessidade de manter a polpa ao abrigo de calor extremo e radiação ultravioleta.'
  },

  // ================= CUBIU =================
  {
    id: 'cons-cubiu-01',
    fruitId: 'cubiu',
    fruitCommonName: 'Cubiu',
    scientificName: 'Solanum sessiliflorum',
    storageCondition: 'Refrigeração Pós-Colheita em Temperatura Moderada (8°C a 10°C)',
    recommendation: 'Armazenar os frutos inteiros sob temperaturas amenas de 8°C a 10°C. O cubiu deve ser mantido limpo e seco em caixas perfuradas para manter a turgidez sem injúria por frio.',
    compoundTarget: 'Pectina Solúvel, Ácido Cítrico e Vitamina C',
    sourceType: 'Institucional (EMBRAPA / INPA)',
    sourceCitation: 'Yuyama et al. (2013) — Acta Amazonica; Laboratório de Alimentos INPA',
    sourceUrl: 'https://doi.org/10.1590/S0044-59672013000400010',
    relatedReferenceId: 'ref-06',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Fruto altamente suscetível ao dano por frio (chilling injury) se mantido abaixo de 5°C por mais de 5 dias, apresentando escurecimento de casca e colapso de polpa.'
  },
  {
    id: 'cons-cubiu-02',
    fruitId: 'cubiu',
    fruitCommonName: 'Cubiu',
    scientificName: 'Solanum sessiliflorum',
    storageCondition: 'Processamento Térmico Moderado e Fervura (~98°C)',
    recommendation: 'Devido à sua acidez natural alta (pH em torno de 3,2 a 3,5) e matriz rica em pectinas solúveis, a degradação da vitamina C residual sob cocção ocorre em ritmo percentual previsível.',
    compoundTarget: 'Ácido Ascórbico em Matriz Ácida Pectínica',
    sourceType: 'Observação Experimental do Projeto',
    sourceCitation: 'Experimento A — Ensaio de Estabilidade da Vitamina C (BioAmazônia, 2026)',
    relatedReferenceId: 'ref-10',
    updatedAt: '16/10/2026',
    applicationLimitations: 'Embora a perda percentual observada na fervura de 10 min seja similar à do camu-camu (~70% de redução no número de gotas de titulante), o teor absoluto de vitamina C do cubiu é cerca de dez vezes menor.'
  }
];
