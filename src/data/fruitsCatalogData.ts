import { FruitSpecies } from '../types';

export const FRUITS_CATALOG: FruitSpecies[] = [
  {
    id: 'camu-camu',
    popularName: 'Camu-camu',
    scientificName: 'Myrciaria dubia (Kunth) McVaugh',
    family: 'Myrtaceae',
    botanicalSynonyms: ['Psidium dubium Kunth', 'Eugenia grandiglandulosa Kiaersk.'],
    description: 'Arbusto ribeirinho de pequeno porte nativo das margens de rios e lagos de águas escuras da Amazônia Ocidental. Seus frutos esféricos de casca avermelhada a purpúrea abrigam uma polpa translúcida com a maior concentração de ácido L-ascórbico documentada na flora mundial.',
    morphology: 'Bagas globosas de 2 a 4 cm de diâmetro, pesando entre 8 e 14 g. Casca lisa, brilhante e adstringente; mesocarpo carnoso e suculento envolvendo de 1 a 4 sementes reniformes.',
    habitat: 'Florestas de igapó e várzeas inundáveis dos rios Negro, Solimões, Ucaiali e bacia do Alto Amazonas.',
    harvestPeriod: 'Dezembro a Maio (período de vazante e enchente dos rios amazônicos).',
    bioactiveCompounds: [
      {
        name: 'Ácido L-Ascórbico (Vitamina C)',
        chemicalClass: 'Lactona Enediólica Hidrossolúvel',
        meanConcentration: '1.800 a 2.800 mg/100g de polpa fresca integral',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Doador universal de elétrons para inativação de radicais livres hidroxila (•OH) e regeneração do alfa-tocoferol em membranas celulares.'
      },
      {
        name: 'Ácido Elágico e Elagitaninos',
        chemicalClass: 'Ácido Fenólico Polifenólico',
        meanConcentration: '120 a 180 mg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Varredura de radicais peroxil lipídicos e quelação de cátions bivalentes Fe²⁺.'
      },
      {
        name: 'Cianidina-3-glicosídeo',
        chemicalClass: 'Antocianina (Flavonoide Cátion Flavílio)',
        meanConcentration: '35 a 52 mg/100g (concentrada na casca madura)',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Pigmento fotoprotetor com sequestro de ânions superóxido (O₂•⁻).'
      },
      {
        name: 'Quercetina e Derivados Glicosilados',
        chemicalClass: 'Flavonol',
        meanConcentration: '15 a 24 mg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Inibição alostérica da enzima lipoxigenase e diminuição da inflamação celular.'
      },
      {
        name: 'Betacaroteno Residual',
        chemicalClass: 'Carotenoide',
        meanConcentration: '350 a 550 µg/100g',
        evidenceLevel: 'Evidência Preliminar / Requer Verificação',
        primaryAction: 'Desativação de oxigênio singlete.',
        verificationNotice: 'Teor altamente variável conforme a insolação do dossel fluvial; necessita de quantificação por HPLC em matrizes secas adicionais.'
      }
    ],
    nutritionalInfo: [
      { component: 'Umidade', valuePer100g: '92,4', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP & INPA' },
      { component: 'Valor Energético', valuePer100g: '25,0', unit: 'kcal', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Proteínas', valuePer100g: '0,5', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Lipídios Totais', valuePer100g: '0,2', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Carboidratos Disponíveis', valuePer100g: '5,9', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Fibra Alimentar Total', valuePer100g: '1,1', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Cálcio', valuePer100g: '15,7', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' },
      { component: 'Potássio', valuePer100g: '83,0', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' },
      { component: 'Zinco Residual', valuePer100g: '0,2', unit: 'mg', status: 'Requer Verificação Adicional', sourceReference: 'Estudo piloto regional (amostragem restrita a 3 municípios)' }
    ],
    stabilityFactors: [
      {
        factor: 'Temperatura',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Acima de 45°C em meio aeróbio',
        impactDescription: 'Aceleração da clivagem térmica do anel lactona do ácido L-ascórbico gerando ácido 2,3-dicetogulônico biologicamente inativo.'
      },
      {
        factor: 'Oxigênio / Atmosfera',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Contato com ar atmosférico livre',
        impactDescription: 'Ação rápida da enzima ascorbato oxidase endógena e oxidação direta a ácido desidroascórbico.'
      },
      {
        factor: 'pH do Meio',
        sensitivityLevel: 'Moderada',
        criticalThreshold: 'pH superior a 3,5',
        impactDescription: 'O pH naturalmente ácido da polpa (2,6 a 2,9) estabiliza o ascorbato; elevações de pH desestabilizam a molécula drasticamente.'
      },
      {
        factor: 'Radiação Luminosa (UV)',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Luz visível e UV direta',
        impactDescription: 'Foto-oxidação catalisada por traços de íons metálicos livres presentes na polpa fresca.'
      }
    ],
    conservationGuidelines: {
      harvestBestPractices: [
        'Colher nas primeiras horas da manhã quando o fruto atinge a maturação "de vez" (transição verde-avermelhada).',
        'Evitar o choque mecânico e a ruptura da casca para prevenir extravasamento celular e ativação da ascorbato oxidase.',
        'Acondicionar em caixas plásticas vazadas higienizadas com capacidade máxima de 10 kg.'
      ],
      idealStorageCondition: 'Refrigeração imediata a 4°C no barco coletor; congelamento a -18°C para conservação superior a 6 meses.',
      packagingRecommendation: 'Embalagens impermeáveis a oxigênio com barreira óptica total (laminado de alumínio ou polietileno âmbar selado a vácuo).',
      shelfLifeEstimate: 'Até 12 dias sob refrigeração (4°C) ou até 12 meses congelada (-18°C) com retenção de vitamina C superior a 88%.'
    },
    scientificReferences: [
      {
        id: 'ref-camu-01',
        title: 'Camu-camu (Myrciaria dubia): A review on nutritional properties, functional potential and post-harvest preservation',
        authors: 'Akter, M. S., Oh, S., Eun, J. B., & Ahmed, M.',
        journal: 'Food Research International',
        year: 2011,
        doi: '10.1016/j.foodres.2011.01.008'
      },
      {
        id: 'ref-camu-02',
        title: 'Composição química e teor de vitamina C de frutos de camu-camu em diferentes estádios de maturação',
        authors: 'Yuyama, K., Aguiar, J. P. L., & Yuyama, L. K. O.',
        journal: 'Acta Amazonica',
        year: 2002,
        doi: '10.1590/1809-43922002322216'
      }
    ],
    authorizedPhotographs: [
      {
        url: '/imagens/camu_camu_botanical_1792170879044.jpg',
        caption: 'Frutos maduros de camu-camu (Myrciaria dubia) exibindo casca avermelhada e polpa translúcida seccionada.',
        authorOrProvenance: 'Acervo BioAmazônia (Documentação Botânica Autenticada)'
      }
    ],
    updatedAt: '16/10/2026',
    publicationStatus: 'Publicado e Validado'
  },
  {
    id: 'acai',
    popularName: 'Açaí-do-Amazonas',
    scientificName: 'Euterpe precatoria Mart.',
    family: 'Arecaceae',
    botanicalSynonyms: ['Euterpe petiolata Burret', 'Euterpe jatapuensis Barb.Rodr.'],
    description: 'Palmeira monocaul (caule único não perfilhador) de grande estatura nativa de florestas primárias de terra firme e várzeas da Amazônia Ocidental e Central. Diferencia-se de Euterpe oleracea pela morfologia solitária do estipe e por apresentar concentrações significativamente mais elevadas de polifenóis totais e antocianinas monoméricas na fração comestível.',
    morphology: 'Estipe solitário e ereto, atingindo até 25 m de altura. Infrutescências em cacho com centenas de drupas globosas de 1 a 1,8 cm, de epicarpo preto-violáceo recoberto por fina cera cerosa acinzentada.',
    habitat: 'Sub-bosque e dossel de florestas primárias de terra firme bem drenadas e margens fluviais de terra firme no Amazonas, Acre e Rondônia.',
    harvestPeriod: 'Maio a Novembro (pico de frutificação na Amazônia Central e Ocidental).',
    bioactiveCompounds: [
      {
        name: 'Cianidina-3-rutinosídeo e Cianidina-3-glicosídeo',
        chemicalClass: 'Antocianinas (Polifenóis)',
        meanConcentration: '410 a 680 mg/100g de matéria seca da polpa',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Neutralização direta de radicais peroxil (ROO•) e superóxido através do mecanismo HAT com alta deslocalização eletrônica no cátion flavílio.'
      },
      {
        name: 'Orientina e Homoorientina',
        chemicalClass: 'Flavonas C-Glicosiladas',
        meanConcentration: '180 a 290 mg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Proteção lipofílica de membranas e inibição da lipoperoxidação induzida por cátions de ferro livre.'
      },
      {
        name: 'Ácido Vanílico e Ácido Ferúlico',
        chemicalClass: 'Ácidos Hidroxicinâmicos',
        meanConcentration: '45 a 85 mg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Ação antioxidante secundária e estabilização de lipídios insaturados.'
      },
      {
        name: 'Ácido P-Cumarílico Conjugado',
        chemicalClass: 'Ácido Fenólico',
        meanConcentration: '12 a 22 mg/100g',
        evidenceLevel: 'Evidência Preliminar / Requer Verificação',
        primaryAction: 'Antioxidante acessório.',
        verificationNotice: 'Identificado preliminarmente em extratos do Médio Solimões; cinética dependente do estágio de maturação exato.'
      }
    ],
    nutritionalInfo: [
      { component: 'Umidade', valuePer100g: '85,2', unit: 'g', status: 'Confirmado', sourceReference: 'Estudo Bromatológico INPA / Embrapa Amazônia Ocidental' },
      { component: 'Valor Energético', valuePer100g: '68,0', unit: 'kcal', status: 'Confirmado', sourceReference: 'Laboratório de Fitoquímica INPA' },
      { component: 'Proteínas', valuePer100g: '1,2', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Fitoquímica INPA' },
      { component: 'Lipídios Totais (Predomínio Oleico)', valuePer100g: '4,8', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela de Lipídios Nativos INPA' },
      { component: 'Carboidratos Disponíveis', valuePer100g: '3,6', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Fitoquímica INPA' },
      { component: 'Fibras Alimentares Totais', valuePer100g: '4,3', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Fitoquímica INPA' },
      { component: 'Cálcio', valuePer100g: '38,0', unit: 'mg', status: 'Confirmado', sourceReference: 'Embrapa Amazônia Ocidental' },
      { component: 'Ferro Disponível', valuePer100g: '0,9', unit: 'mg', status: 'Confirmado', sourceReference: 'Nota Técnica Nutricional INPA' },
      { component: 'Vitamina E (Alfa-tocoferol)', valuePer100g: '2,4', unit: 'mg', status: 'Requer Verificação Adicional', sourceReference: 'Determinação preliminar cromatográfica' }
    ],
    stabilityFactors: [
      {
        factor: 'Temperatura',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Acima de 60°C por mais de 5 minutos',
        impactDescription: 'Degradação térmica do anel cromeno das antocianinas, provocando abertura do anel flavílio e formação de chalconas descoradas incolores.'
      },
      {
        factor: 'pH do Meio',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'pH superior a 4,2',
        impactDescription: 'Deslocamento do equilíbrio tautomérico do cátion flavílio vermelho/roxo para formas hemiacetais e quinoidais instáveis.'
      },
      {
        factor: 'Oxigênio / Atmosfera',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Exposição aeróbia contínua',
        impactDescription: 'Oxidação enzimática acelerada pela polifenoloxidase (PPO) e peroxidase (POD) nativas com escurecimento da polpa.'
      },
      {
        factor: 'Radiação Luminosa (UV)',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Luz visível constante',
        impactDescription: 'Fotodegradação direta dos grupos glicosilados gerando fragmentos fenólicos menores.'
      }
    ],
    conservationGuidelines: {
      harvestBestPractices: [
        'Colheita manual de cachos com corte de pedúnculo limpo, evitando queda livre que causa amassamento dos frutos.',
        'Realizar lavagem e sanitização prévia em água clorada (50 ppm) para eliminação de resíduos florestais e microrganismos de solo.',
        'Branqueamento térmico rápido da casca (80°C por 10 a 15 s) para inativação enzimática imediata de PPO.'
      ],
      idealStorageCondition: 'Polpa despolpada congelada a -18°C ou liofilizada em pó hermético.',
      packagingRecommendation: 'Embalagens plásticas multicamadas opacas com barreira contra luz UV e permeabilidade nula ao oxigênio.',
      shelfLifeEstimate: 'Fruto in natura: até 48 horas sob sombra fresca; polpa congelada pasteurizada: até 12 meses.'
    },
    scientificReferences: [
      {
        id: 'ref-acai-01',
        title: 'Comparative study on phytochemical composition and antioxidant capacities of Euterpe precatoria and Euterpe oleracea',
        authors: 'Kang, J., Thakali, K. M., Xie, C., Kondo, M., Tong, Y., Ou, B., et al.',
        journal: 'Journal of Agricultural and Food Chemistry',
        year: 2012,
        doi: '10.1021/jf204312v'
      },
      {
        id: 'ref-acai-02',
        title: 'Teores de fenólicos totais e atividade antioxidante in vitro de polpa de açaí (Euterpe precatoria Mart.) da Amazônia Central',
        authors: 'Yuyama, L. K. O., Aguiar, J. P. L., Silva, Filho D. F., & Yuyama, K.',
        journal: 'Acta Amazonica',
        year: 2011,
        doi: '10.1590/S0044-59672011000200008'
      }
    ],
    authorizedPhotographs: [
      {
        url: '/imagens/acai_botanical_1792170877764.jpg',
        caption: 'Cacho maduro com drupas de açaí ricas em antocianinas sob o dossel de palmeira amazônica.',
        authorOrProvenance: 'Acervo BioAmazônia (Documentação Botânica Autenticada)'
      }
    ],
    updatedAt: '16/10/2026',
    publicationStatus: 'Publicado e Validado'
  },
  {
    id: 'tucuma',
    popularName: 'Tucumã-do-Amazonas',
    scientificName: 'Astrocaryum aculeatum G.Mey.',
    family: 'Arecaceae',
    botanicalSynonyms: ['Astrocaryum tucuma Mart.', 'Astrocaryum aureum Griseb.'],
    description: 'Palmeira espinescente comum em áreas de terra firme e clareiras antropizadas da Amazônia Central. Seus frutos ovoides contêm uma polpa amarela a alaranjada intensa, altamente apreciada na culinária cabocla e extraordinariamente rica em carotenoides pró-vitamina A e ácidos graxos monoinsaturados.',
    morphology: 'Palmeira de caule solitário densamente coberto por anéis de espinhos escuros. Fruto ovoide a globoso de 4 a 6 cm de comprimento, peso médio de 40 a 60 g, com epicarpo coriáceo amarelado-esverdeado e mesocarpo fibroso-oleoso aderente ao endocarpo lenhoso.',
    habitat: 'Florestas de terra firme, capoeiras secundárias e agroecossistemas tradicionais nos estados do Amazonas, Roraima e Pará.',
    harvestPeriod: 'Janeiro a Julho (safra mais expressiva nos meses chuvosos).',
    bioactiveCompounds: [
      {
        name: 'All-trans-beta-caroteno (Pró-vitamina A)',
        chemicalClass: 'Carotenoide Hidrocarboneto Lipofílico',
        meanConcentration: '3.800 a 5.200 µg/100g de polpa fresca integral',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Conversão enzimática em retinol (vitamina A) na mucosa entérica e desativação física de oxigênio singlete celular.'
      },
      {
        name: 'Alfa-caroteno e Zeaxantina',
        chemicalClass: 'Carotenoides e Xantofilas',
        meanConcentration: '420 a 710 µg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Fotoproteção retiniana e captura de radicais peroxil em meio lipídico intracelular.'
      },
      {
        name: 'Ácido Oleico (Ômega-9)',
        chemicalClass: 'Ácido Graxo Monoinsaturado C18:1',
        meanConcentration: '62% a 68% da fração lipídica total',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Veículo lipofílico natural que otimiza a bioacessibilidade micelar dos carotenoides no trato gastrointestinal.'
      },
      {
        name: 'Alfa-tocoferol (Vitamina E)',
        chemicalClass: 'Tocoferol Lipofílico',
        meanConcentration: '3,2 a 4,8 mg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Inibição direta da peroxidação de lipídios da membrana plasmática celular.'
      },
      {
        name: 'Compostos Fenólicos Não Conjugados',
        chemicalClass: 'Polifenóis Hidrofílicos',
        meanConcentration: '110 a 160 mg GAE/100g',
        evidenceLevel: 'Evidência Preliminar / Requer Verificação',
        primaryAction: 'Atividade redutora acessória.',
        verificationNotice: 'Fração polar em quantificação laboratorial preliminar via extração metanólica assistida por ultrassom.'
      }
    ],
    nutritionalInfo: [
      { component: 'Umidade', valuePer100g: '53,6', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP & INPA' },
      { component: 'Valor Energético', valuePer100g: '262,0', unit: 'kcal', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Proteínas', valuePer100g: '2,1', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Lipídios Totais', valuePer100g: '19,1', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Carboidratos Disponíveis', valuePer100g: '26,5', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Fibra Alimentar Total', valuePer100g: '12,7', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Vitamina A (Equivalente de Atividade de Retinol)', valuePer100g: '450,0', unit: 'µg RAE', status: 'Confirmado', sourceReference: 'Laboratório de Nutrição INPA' },
      { component: 'Potássio', valuePer100g: '412,0', unit: 'mg', status: 'Confirmado', sourceReference: 'Determinação mineral por Espectrometria de Absorção Atômica' },
      { component: 'Magnésio', valuePer100g: '28,0', unit: 'mg', status: 'Requer Verificação Adicional', sourceReference: 'Amostragem preliminar de feiras de Manaus' }
    ],
    stabilityFactors: [
      {
        factor: 'Radiação Luminosa (UV)',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Exposição direta à luz solar na comercialização',
        impactDescription: 'Fotoisomerização dos carotenoides da conformação all-trans (mais ativa) para formas cis (menor valor biológico pró-vitamina A).'
      },
      {
        factor: 'Temperatura',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Temperaturas acima de 65°C por tempo prolongado',
        impactDescription: 'Termo-oxidação das duplas ligações poliênicas conjugadas e rancificação oxidativa da matriz de ácidos graxos.'
      },
      {
        factor: 'Oxigênio / Atmosfera',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Polpa descascada exposta ao ar livre',
        impactDescription: 'Perda progressiva de carotenoides e amarelecimento opaco pela formação de epóxidos e apocarotenoides.'
      },
      {
        factor: 'Atividade de Água (aw)',
        sensitivityLevel: 'Moderada',
        criticalThreshold: 'aw intermediária em temperatura ambiente',
        impactDescription: 'Propensão a contaminação fúngica e degradação enzimática lipolítica.'
      }
    ],
    conservationGuidelines: {
      harvestBestPractices: [
        'Colher os cachos no ponto exato de maturação fisiológica (frutos começam a soltar-se naturalmente do ráquis).',
        'Não descascar os frutos antes do transporte para preservar a proteção natural conferida pelo epicarpo coriáceo.',
        'Transportar em caixas plásticas ventiladas ao abrigo da radiação solar direta.'
      ],
      idealStorageCondition: 'Fruto com casca: estocagem em local fresco e arejado (20°C a 24°C) por até 5 dias; lascas de polpa: seladas a vácuo e congeladas (-18°C).',
      packagingRecommendation: 'Embalagens termoformadas a vácuo com atmosfera modificada de nitrogênio para a polpa em lascas.',
      shelfLifeEstimate: 'Lascas congeladas a vácuo (-18°C): retenção de carotenoides de 88% por até 180 dias.'
    },
    scientificReferences: [
      {
        id: 'ref-tucuma-01',
        title: 'Identification and quantification of carotenoids, by HPLC-DAD-MS/MS, from Amazonian fruits: Tucumã (Astrocaryum aculeatum)',
        authors: 'Rosso, V. V., & Mercadante, A. Z.',
        journal: 'Journal of Food Composition and Analysis',
        year: 2007,
        doi: '10.1016/j.jfca.2007.03.004'
      },
      {
        id: 'ref-tucuma-02',
        title: 'Composição físico-química e nutricional de frutos de tucumã (Astrocaryum aculeatum Meyer) procedentes do estado do Amazonas',
        authors: 'Yuyama, L. K. O., Aguiar, J. P. L., Yuyama, K., et al.',
        journal: 'Acta Amazonica',
        year: 2008,
        doi: '10.1590/S0044-59672008000100018'
      }
    ],
    authorizedPhotographs: [
      {
        url: '/imagens/tucuma_botanical_1792172044272.jpg',
        caption: 'Frutos de tucumã inteiros e partidos ao meio revelando a polpa alaranjada fibrosa e o endocarpo escuro.',
        authorOrProvenance: 'Acervo BioAmazônia (Documentação Botânica Autenticada)'
      }
    ],
    updatedAt: '16/10/2026',
    publicationStatus: 'Publicado e Validado'
  },
  {
    id: 'buriti',
    popularName: 'Buriti',
    scientificName: 'Mauritia flexuosa L.f.',
    family: 'Arecaceae',
    botanicalSynonyms: ['Mauritia vinifera Mart.', 'Mauritia sagus Schult. & Schult.f.'],
    description: 'Palmeira monumental típica de áreas inundadas, buritizais e veredas que cortam todo o bioma amazônico. Seus frutos são cobertos por escamas losangulares marrom-avermelhadas e sua polpa oleosa é uma das maiores fontes vegetais de beta-caroteno e tocoferóis conhecidas pela ciência.',
    morphology: 'Drupa elipsoide a subglobosa de 4 a 7 cm de comprimento e 3 a 5 cm de largura, pesando entre 30 e 80 g. Epicarpo formado por escamas duras imbricadas de brilho ceroso; mesocarpo espesso (3 a 5 mm), oleoso e avermelhado-alaranjado envolvendo semente esférica.',
    habitat: 'Brejos permanentes, nascentes de igarapés, veredas e margens de lagos em planícies de inundação da Amazônia.',
    harvestPeriod: 'Dezembro a Junho (com variações regionais entre as bacias do Pará, Amazonas e Roraima).',
    bioactiveCompounds: [
      {
        name: 'Beta-caroteno Total (All-trans e 9-cis)',
        chemicalClass: 'Carotenoide Pro-vitamínico A',
        meanConcentration: '28.000 a 34.500 µg/100g de polpa fresca integral',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Potente desativação física de oxigênio singlete (¹O₂) por transferência de energia e proteção lipofílica de tecidos celulares.'
      },
      {
        name: 'Alfa-tocoferol e Gama-tocoferol',
        chemicalClass: 'Vitamina E Natural',
        meanConcentration: '11,0 a 16,5 mg/100g de óleo de polpa',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Interrupção da cascata de peroxidação lipídica em membranas ricas em ácidos graxos insaturados.'
      },
      {
        name: 'Ácido Graxo Oleico (C18:1 cis-9)',
        chemicalClass: 'Ácido Graxo Monoinsaturado',
        meanConcentration: '72% a 78% do perfil lipídico total',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Estabilidade físico-química superior contra rancificação e excelente veículo carreador de bioativos lipofílicos.'
      },
      {
        name: 'Luteína e Criptoxantina',
        chemicalClass: 'Xantofilas',
        meanConcentration: '1.200 a 1.950 µg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Proteção retiniana contra danos induzidos por espectro de luz azul.'
      },
      {
        name: 'Polifenóis Hidrossolúveis Residuais',
        chemicalClass: 'Ácidos Fenólicos',
        meanConcentration: '80 a 130 mg GAE/100g',
        evidenceLevel: 'Evidência Preliminar / Requer Verificação',
        primaryAction: 'Antioxidante secundário.',
        verificationNotice: 'Teor modesto na polpa oleosa; ensaios em andamento para avaliar a fração de compostos fenólicos ligados a fibras.'
      }
    ],
    nutritionalInfo: [
      { component: 'Umidade', valuePer100g: '69,2', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Valor Energético', valuePer100g: '145,0', unit: 'kcal', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Proteínas', valuePer100g: '1,8', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Lipídios Totais', valuePer100g: '10,5', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Carboidratos Disponíveis', valuePer100g: '10,1', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Fibras Alimentares Totais', valuePer100g: '5,8', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Vitamina A (RAE)', valuePer100g: '2.600,0', unit: 'µg RAE', status: 'Confirmado', sourceReference: 'Determinação por HPLC / Embrapa Agroindústria de Alimentos' },
      { component: 'Cálcio', valuePer100g: '82,0', unit: 'mg', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Fósforo', valuePer100g: '24,0', unit: 'mg', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' }
    ],
    stabilityFactors: [
      {
        factor: 'Radiação Luminosa (UV)',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Exposição contínua a luz natural ou fluorescente',
        impactDescription: 'Ruptura das ligações duplas conjugadas do beta-caroteno com rápida descoloração (branqueamento) e perda de bioatividade.'
      },
      {
        factor: 'Oxigênio / Atmosfera',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Presença de oxigênio do ar em recipientes não selados',
        impactDescription: 'Auto-oxidação de ácidos graxos insaturados com geração de peróxidos lipídicos e radicais livres secundários.'
      },
      {
        factor: 'Temperatura',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Aquecimento acima de 75°C por tempo prolongado',
        impactDescription: 'Degradação térmica dos tocoferóis e isomerização cis dos carotenoides all-trans.'
      },
      {
        factor: 'pH do Meio',
        sensitivityLevel: 'Baixa',
        criticalThreshold: 'Variações entre pH 4,0 e 7,0',
        impactDescription: 'Compostos lipofílicos mantêm-se estáveis na faixa de pH habitual das polpas e óleos naturais.'
      }
    ],
    conservationGuidelines: {
      harvestBestPractices: [
        'Apanhar preferencialmente frutos caídos no chão da mata ou água límpida, verificando integridade das escamas.',
        'Macerar em água morna (máximo 40°C) por até 2 horas para amolecimento da polpa antes do despolpamento.',
        'Não utilizar temperaturas excessivas de água de maceração para evitar perda térmica de carotenoides.'
      ],
      idealStorageCondition: 'Polpa pura congelada a -18°C; óleo de buriti estocado em frascos de vidro âmbar selados com atmosfera de nitrogênio.',
      packagingRecommendation: 'Embalagens com barreira óptica absoluta (vidro âmbar, latas ou sacos multicamadas laminados a vácuo).',
      shelfLifeEstimate: 'Polpa congelada selada a vácuo: até 12 meses com retenção de carotenoides de 85% a 90%.'
    },
    scientificReferences: [
      {
        id: 'ref-buriti-01',
        title: 'Carotenoids and fatty acid profile of buriti (Mauritia flexuosa) pulp and oil: Stability during thermal processing',
        authors: 'Rosso, V. V., & Mercadante, A. Z.',
        journal: 'Journal of the Brazilian Chemical Society',
        year: 2007,
        doi: '10.1590/S0103-50532007000300021'
      },
      {
        id: 'ref-buriti-02',
        title: 'Photoprotective and antioxidant properties of buriti (Mauritia flexuosa) oil in cutaneous applications',
        authors: 'Zanatta, C. F., Mitjans, M., Urgatondo, V., Rocha-Filho, P. A., & Vinardell, M. P.',
        journal: 'Food and Chemical Toxicology',
        year: 2010,
        doi: '10.1016/j.fct.2009.10.038'
      }
    ],
    authorizedPhotographs: [
      {
        url: '/imagens/buriti_botanical_1792170878800.jpg',
        caption: 'Fruto silvestre de buriti exibindo casca escamosa geométrica e polpa alaranjada rica em beta-caroteno.',
        authorOrProvenance: 'Acervo BioAmazônia (Documentação Botânica Autenticada)'
      }
    ],
    updatedAt: '16/10/2026',
    publicationStatus: 'Publicado e Validado'
  },
  {
    id: 'cubiu',
    popularName: 'Cubiu (Maná-Cubiu)',
    scientificName: 'Solanum sessiliflorum Dunal',
    family: 'Solanaceae',
    botanicalSynonyms: ['Solanum topiro Dunal', 'Solanum alibile S.Moore'],
    description: 'Espécie herbácea a subarbustiva domesticada historicamente pelos povos originários da bacia amazônica. Seus frutos bagas globosos ou ovoides de coloração amarelo-dourada a alaranjada contêm polpa translúcida muito suculenta, acídula e aromática, destacando-se pelos expressivos teores de ácido cítrico, pectina solúvel e niacina (vitamina B3).',
    morphology: 'Arbusto de 1 a 2 m de altura. Frutos do tipo baga, variando de 4 a 10 cm de comprimento e pesando de 50 a 300 g. Epicarpo pubescente quando jovem e liso na maturidade; mesocarpo espesso e polpa mucilaginosa com numerosas sementes discoides.',
    habitat: 'Clareiras, margens de cursos d\'água e quintais agroflorestais tradicionais da Amazônia Central, Ocidental e Alto Rio Negro.',
    harvestPeriod: 'Produção contínua durante todo o ano, com picos de safra entre Dezembro e Abril.',
    bioactiveCompounds: [
      {
        name: 'Pectina Solúvel de Alta Metoxilação',
        chemicalClass: 'Polissacarídeo Estrutural / Fibra Solúvel',
        meanConcentration: '1,1 a 1,6 g/100g de polpa fresca integral',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Formação de matrizes em gel no trato digestivo, desaceleração da absorção glicêmica e modulação benéfica da microbiota entérica.'
      },
      {
        name: 'Niacina (Vitamina B3)',
        chemicalClass: 'Vitamina do Complexo B (Ácido Nicotínico)',
        meanConcentration: '1,8 a 2,5 mg/100g (concentração atípica elevada para frutos)',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Coenzima carreadora de hidrogênio (NAD⁺/NADP⁺) nos ciclos celulares respiratórios e vias de oxirredução mitocondrial.'
      },
      {
        name: 'Ácido Clorogênico e Ácido Caféico',
        chemicalClass: 'Ácidos Hidroxicinâmicos',
        meanConcentration: '48 a 72 mg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Varredura de radicais peroxil e inibição da oxidação de frações lipoproteicas plasmáticas.'
      },
      {
        name: 'Ácido Cítrico e Ácido Málico Livres',
        chemicalClass: 'Ácidos Orgânicos Alifáticos',
        meanConcentration: '2,2 a 3,1 g/100g de ácidos totais tituláveis',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Promovem pH naturalmente baixo (pH 3,2 a 3,6), atuando como conservante redox e potencializador da biodisponibilidade de minerais.'
      },
      {
        name: 'Glicoisoalcaloides Esteroidais Residuais (Solamargina/Solasonina)',
        chemicalClass: 'Glicoalcaloides de Solanáceas',
        meanConcentration: 'Traços (< 2,5 mg/100g em frutos maduros)',
        evidenceLevel: 'Evidência Preliminar / Requer Verificação',
        primaryAction: 'Metabólitos secundários de defesa botânica.',
        verificationNotice: 'Em frutos maduros os teores são seguros e quase indetectáveis, mas necessitam de validação cromatográfica estrita para frutos verdes.'
      }
    ],
    nutritionalInfo: [
      { component: 'Umidade', valuePer100g: '89,5', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Nutrição do INPA' },
      { component: 'Valor Energético', valuePer100g: '32,0', unit: 'kcal', status: 'Confirmado', sourceReference: 'Laboratório de Nutrição do INPA' },
      { component: 'Proteínas', valuePer100g: '0,9', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Nutrição do INPA' },
      { component: 'Lipídios Totais', valuePer100g: '0,2', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Nutrição do INPA' },
      { component: 'Carboidratos Disponíveis', valuePer100g: '6,5', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Nutrição do INPA' },
      { component: 'Fibra Alimentar Total', valuePer100g: '2,4', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Nutrição do INPA' },
      { component: 'Niacina (Vitamina B3)', valuePer100g: '2,1', unit: 'mg', status: 'Confirmado', sourceReference: 'Estudos Nutricionais INPA (Silva Filho et al.)' },
      { component: 'Vitamina C (Ácido Ascórbico)', valuePer100g: '14,0', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' },
      { component: 'Cálcio', valuePer100g: '18,0', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' },
      { component: 'Ferro', valuePer100g: '0,6', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' },
      { component: 'Fósforo', valuePer100g: '22,0', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' }
    ],
    stabilityFactors: [
      {
        factor: 'Temperatura',
        sensitivityLevel: 'Moderada',
        criticalThreshold: 'Acima de 85°C por mais de 20 minutos',
        impactDescription: 'A pectina sofre despolimerização e hidrólise de ligações glicosídicas se mantida em aquecimento excessivo prolongado.'
      },
      {
        factor: 'pH do Meio',
        sensitivityLevel: 'Baixa',
        criticalThreshold: 'pH superior a 4,5',
        impactDescription: 'O meio acídulo natural (pH ~3,4) confere excelente estabilidade microbiológica e preservação dos ácidos orgânicos.'
      },
      {
        factor: 'Oxigênio / Atmosfera',
        sensitivityLevel: 'Moderada',
        criticalThreshold: 'Contato da polpa triturada com ar livre',
        impactDescription: 'Pode ocorrer escurecimento enzimático suave por polifenoloxidase se a polpa for processada sem branqueamento prévio.'
      },
      {
        factor: 'Radiação Luminosa (UV)',
        sensitivityLevel: 'Baixa',
        criticalThreshold: 'Luz direta contínua',
        impactDescription: 'A niacina e os ácidos orgânicos são substancialmente mais fotoestáveis do que antocianinas ou carotenoides.'
      }
    ],
    conservationGuidelines: {
      harvestBestPractices: [
        'Colher com tesoura de poda deixando 1 cm de pedúnculo para evitar infecções fúngicas no polo de inserção.',
        'Realizar seleção rigorosa descartando frutos que apresentem perfurações de broca-do-fruto.',
        'Lavar em água corrente e secar em esteira ventilada à sombra.'
      ],
      idealStorageCondition: 'Frutos frescos inteiros mantêm-se viáveis em ambiente fresco (18°C a 22°C) por até 8 dias; polpa pasteurizada sob congelamento (-18°C).',
      packagingRecommendation: 'Embalagens plásticas tipo pouch seladas hermeticamente ou potes de vidro esterilizados para geleias e pastas concentradas.',
      shelfLifeEstimate: 'Polpa congelada pasteurizada (-18°C): vida útil superior a 12 meses com retenção integral da niacina e pectina.'
    },
    scientificReferences: [
      {
        id: 'ref-cubiu-01',
        title: 'Maná-cubiu (Solanum sessiliflorum Dunal): Aspectos agronômicos, nutricionais e potencial agroindustrial',
        authors: 'Silva Filho, D. F., Yuyama, L. K. O., Aguiar, J. P. L., & Oliveira, M. C.',
        journal: 'Acta Amazonica',
        year: 2005,
        doi: '10.1590/S0044-59672005000400014'
      },
      {
        id: 'ref-cubiu-02',
        title: 'Chemical composition and nutritional value of cubiu (Solanum sessiliflorum) fruit from Central Amazon',
        authors: 'Marx, F., Andrade, E. H. A., & Maia, J. G. S.',
        journal: 'Zeitschrift für Lebensmitteluntersuchung und -Forschung A',
        year: 1998,
        doi: '10.1007/s002170050289'
      }
    ],
    authorizedPhotographs: [
      {
        url: '/imagens/cubiu_botanical_1792172044686.jpg',
        caption: 'Bagas maduras de cubiu (Solanum sessiliflorum) com casca dourada e fruto seccionado expondo sementes e polpa acídula.',
        authorOrProvenance: 'Acervo BioAmazônia (Documentação Botânica Autenticada)'
      }
    ],
    updatedAt: '16/10/2026',
    publicationStatus: 'Publicado e Validado'
  },
];
