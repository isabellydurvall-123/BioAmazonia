import { 
  VitaminCMeasurement, 
  EnzymaticObservation, 
  AnthocyaninPHMeasurement 
} from '../types';

export const EXPERIMENT_PHOTOS = {
  titrationVitC: '/src/assets/images/titration_vitaminc_exp_1792173850539.jpg',
  enzymaticBrowning: '/src/assets/images/enzymatic_browning_exp_1792173850880.jpg',
  anthocyaninPH: '/src/assets/images/anthocyanin_ph_exp_1792173851951.jpg',
};

/* =========================================================================
   EXPERIMENTO A — ESTABILIDADE DA VITAMINA C (TITULAÇÃO IODOMÉTRICA)
   Protocolo: Titulação semi-quantitativa com tintura de iodo comercial diluída
   e solução indicadora de amido solúvel a 1% p/v.
   ========================================================================= */

export const INITIAL_VITAMINC_MEASUREMENTS: VitaminCMeasurement[] = [
  {
    id: 'vitc-01',
    sampleCode: 'CAMU-FRESH-T1',
    fruit: 'Camu-camu (Myrciaria dubia)',
    condition: 'Fresco',
    sampleVolumeMl: 5.0,
    starchIndicatorVolumeMl: 1.0,
    iodineDropsCount: 118,
    estimatedVolumeIodineMl: 5.9,
    titrationEndpointColor: 'Azul escuro persistente (>30s)',
    triplicateIndex: 1,
    date: '14/10/2026',
    analyst: 'Bancada 01 - Graduação Bioquímica',
    studentNotes: 'Polpa fresca imediatamente homogeneizada. Reação demandou grande volume de titulante até viragem estável.'
  },
  {
    id: 'vitc-02',
    sampleCode: 'CAMU-FRESH-T2',
    fruit: 'Camu-camu (Myrciaria dubia)',
    condition: 'Fresco',
    sampleVolumeMl: 5.0,
    starchIndicatorVolumeMl: 1.0,
    iodineDropsCount: 122,
    estimatedVolumeIodineMl: 6.1,
    titrationEndpointColor: 'Azul escuro persistente (>30s)',
    triplicateIndex: 2,
    date: '14/10/2026',
    analyst: 'Bancada 01 - Graduação Bioquímica',
    studentNotes: 'Repetição com boa reprodutibilidade em relação à triplicata 1.'
  },
  {
    id: 'vitc-03',
    sampleCode: 'CAMU-REF-T1',
    fruit: 'Camu-camu (Myrciaria dubia)',
    condition: 'Refrigerado (48h)',
    sampleVolumeMl: 5.0,
    starchIndicatorVolumeMl: 1.0,
    iodineDropsCount: 96,
    estimatedVolumeIodineMl: 4.8,
    titrationEndpointColor: 'Azul escuro persistente (>30s)',
    triplicateIndex: 1,
    date: '16/10/2026',
    analyst: 'Bancada 01 - Graduação Bioquímica',
    studentNotes: 'Amostra mantida sob refrigeração a 4°C em frasco âmbar fechado. Queda moderada no consumo de gotas.'
  },
  {
    id: 'vitc-04',
    sampleCode: 'CAMU-BOIL-T1',
    fruit: 'Camu-camu (Myrciaria dubia)',
    condition: 'Fervido',
    sampleVolumeMl: 5.0,
    starchIndicatorVolumeMl: 1.0,
    iodineDropsCount: 44,
    estimatedVolumeIodineMl: 2.2,
    titrationEndpointColor: 'Azul escuro persistente (>30s)',
    triplicateIndex: 1,
    date: '16/10/2026',
    analyst: 'Bancada 01 - Graduação Bioquímica',
    studentNotes: 'Polpa fervida em refluxo brando por 10 minutos. Redução drástica no número de gotas necessárias para viragem.'
  },
  {
    id: 'vitc-05',
    sampleCode: 'CUBIU-FRESH-T1',
    fruit: 'Cubiu (Solanum sessiliflorum)',
    condition: 'Fresco',
    sampleVolumeMl: 5.0,
    starchIndicatorVolumeMl: 1.0,
    iodineDropsCount: 14,
    estimatedVolumeIodineMl: 0.7,
    titrationEndpointColor: 'Azul escuro persistente (>30s)',
    triplicateIndex: 1,
    date: '14/10/2026',
    analyst: 'Bancada 02 - Agronomia',
    studentNotes: 'Polpa fresca triturada com água destilada. A viragem para azul ocorre com poucas gotas em comparação ao camu-camu.'
  },
  {
    id: 'vitc-06',
    sampleCode: 'CUBIU-REF-T1',
    fruit: 'Cubiu (Solanum sessiliflorum)',
    condition: 'Refrigerado (48h)',
    sampleVolumeMl: 5.0,
    starchIndicatorVolumeMl: 1.0,
    iodineDropsCount: 11,
    estimatedVolumeIodineMl: 0.55,
    titrationEndpointColor: 'Azul escuro persistente (>30s)',
    triplicateIndex: 1,
    date: '16/10/2026',
    analyst: 'Bancada 02 - Agronomia',
    studentNotes: 'Retenção aceitável do poder redutor sob refrigeração de 48 horas.'
  },
  {
    id: 'vitc-07',
    sampleCode: 'CUBIU-BOIL-T1',
    fruit: 'Cubiu (Solanum sessiliflorum)',
    condition: 'Fervido',
    sampleVolumeMl: 5.0,
    starchIndicatorVolumeMl: 1.0,
    iodineDropsCount: 4,
    estimatedVolumeIodineMl: 0.2,
    titrationEndpointColor: 'Azul escuro persistente (>30s)',
    triplicateIndex: 1,
    date: '16/10/2026',
    analyst: 'Bancada 02 - Agronomia',
    studentNotes: 'Amostra fervida por 10 minutos: ponto de viragem atingido quase imediatamente com apenas 4 gotas.'
  }
];

/* =========================================================================
   EXPERIMENTO B — OXIDAÇÃO ENZIMÁTICA EM MAÇÃ
   Escala Padronizada Proposta (0 a 4):
   Grau 0: Nulo / Polpa alva original (sem escurecimento perceptível)
   Grau 1: Leve / Amarelecimento tênue em < 25% da superfície
   Grau 2: Moderado / Manchas castanhas visíveis em 25% a 50% da área
   Grau 3: Acentuado / Escurecimento pardo em 50% a 75% da área
   Grau 4: Severo / Escurecimento marrom escuro em > 75% da área
   ========================================================================= */

export const BROWNING_SCALE_DESCRIPTORS = [
  { score: 0, label: 'Grau 0 - Nulo', description: 'Superfície alva original; ausência total de alteração cromática.' },
  { score: 1, label: 'Grau 1 - Leve', description: 'Amarelecimento incipiente superficial em menos de 25% da área da fatia.' },
  { score: 2, label: 'Grau 2 - Moderado', description: 'Formação nítida de manchas castanhas em 25% a 50% da superfície.' },
  { score: 3, label: 'Grau 3 - Acentuado', description: 'Pardejamento pronunciado contínuo em 50% a 75% da área exposta.' },
  { score: 4, label: 'Grau 4 - Severo', description: 'Escurecimento pardo-escuro denso e uniforme cobrindo mais de 75% da fatia.' }
];

export const INITIAL_ENZYMATIC_OBSERVATIONS: EnzymaticObservation[] = [
  {
    id: 'enz-01',
    sampleCode: 'MACA-CTRL-00',
    condition: 'Grupo de Controle (Sem Tratamento)',
    initialTime: '08:30',
    observationTime: '08:30',
    elapsedMinutes: 0,
    browningScore: 0,
    browningDescriptor: 'Polpa recém-fatiada, coloração esbranquiçada uniforme.',
    studentObservations: 'Fatia de maçã recém-cortada em temperatura ambiente de 24°C.',
    scientificInterpretation: 'No instante t=0, as células foram rompidas mecanicamente, iniciando o contato entre a PPO vacuolar e os substratos fenólicos citoplasmáticos.',
    photoUrl: EXPERIMENT_PHOTOS.enzymaticBrowning,
    photoCaption: 'Amostras de controle recém-preparadas em placa de Petri.',
    analyst: 'Turma de Fisiologia Vegetal A'
  },
  {
    id: 'enz-02',
    sampleCode: 'MACA-CTRL-30',
    condition: 'Grupo de Controle (Sem Tratamento)',
    initialTime: '08:30',
    observationTime: '09:00',
    elapsedMinutes: 30,
    browningScore: 2,
    browningDescriptor: 'Manchas castanhas visíveis em cerca de 40% da superfície.',
    studentObservations: 'A borda e a região central começaram a amarelar e depois escurecer nitidamente.',
    scientificInterpretation: 'Ação catalítica intensa da polifenoloxidase oxidando o ácido clorogênico e catequinas em o-quinonas em meio aeróbio irrestrito.',
    photoUrl: EXPERIMENT_PHOTOS.enzymaticBrowning,
    photoCaption: 'Evolução de escurecimento no controle após 30 min ao ar.',
    analyst: 'Turma de Fisiologia Vegetal A'
  },
  {
    id: 'enz-03',
    sampleCode: 'MACA-CTRL-120',
    condition: 'Grupo de Controle (Sem Tratamento)',
    initialTime: '08:30',
    observationTime: '10:30',
    elapsedMinutes: 120,
    browningScore: 4,
    browningDescriptor: 'Escurecimento castanho profundo cobrindo toda a superfície da fatia.',
    studentObservations: 'Aspecto ressecado e escuro homogêneo em toda a fatia de maçã desprotegida.',
    scientificInterpretation: 'Polimerização extensiva de o-quinonas gerando pigmentos insolúveis de melanina de alto peso molecular.',
    photoUrl: EXPERIMENT_PHOTOS.enzymaticBrowning,
    photoCaption: 'Escurecimento severo (Grau 4) na maçã não tratada após 120 min.',
    analyst: 'Turma de Fisiologia Vegetal A'
  },
  {
    id: 'enz-04',
    sampleCode: 'MACA-BURITI-30',
    condition: 'Tratado com Polpa de Buriti',
    initialTime: '08:30',
    observationTime: '09:00',
    elapsedMinutes: 30,
    browningScore: 0,
    browningDescriptor: 'Superfície preservada sob película oleosa alaranjada do buriti.',
    studentObservations: 'A fina camada de óleo e polpa de buriti cobriu totalmente a maçã, sem alteração interna.',
    scientificInterpretation: 'Duplo efeito inibitório: a alta viscosidade lipofílica bloqueia a difusão física de oxigênio enquanto os tocoferóis reduzem espécies pró-oxidantes.',
    photoUrl: EXPERIMENT_PHOTOS.enzymaticBrowning,
    photoCaption: 'Proteção eficaz conferida pela película carotenoide de buriti.',
    analyst: 'Turma de Fisiologia Vegetal A'
  },
  {
    id: 'enz-05',
    sampleCode: 'MACA-BURITI-120',
    condition: 'Tratado com Polpa de Buriti',
    initialTime: '08:30',
    observationTime: '10:30',
    elapsedMinutes: 120,
    browningScore: 1,
    browningDescriptor: 'Apenas leve amarelamento em pequenos pontos onde a película adelgaçou.',
    studentObservations: 'A polpa de maçã permaneceu praticamente clara após duas horas de exposição ao ar.',
    scientificInterpretation: 'Excelente proteção antioxidante e física conferida pelos carotenoides e ácidos graxos monoinsaturados de Mauritia flexuosa.',
    photoUrl: EXPERIMENT_PHOTOS.enzymaticBrowning,
    photoCaption: 'Fatia com polpa de buriti mantendo coloração clara após 120 min.',
    analyst: 'Turma de Fisiologia Vegetal A'
  },
  {
    id: 'enz-06',
    sampleCode: 'MACA-TUCUMA-30',
    condition: 'Tratado com Polpa de Tucumã',
    initialTime: '08:30',
    observationTime: '09:00',
    elapsedMinutes: 30,
    browningScore: 0,
    browningDescriptor: 'Ausência de escurecimento na interface entre maçã e pasta de tucumã.',
    studentObservations: 'Fatia protegida com pasta de tucumã fresco triturado.',
    scientificInterpretation: 'A fração lipídica rica em ácido oleico atua como barreira hidrofóbica eficaz à permeação de O₂ atmosférico.',
    photoUrl: EXPERIMENT_PHOTOS.enzymaticBrowning,
    photoCaption: 'Pasta de tucumã cobrindo a polpa de maçã.',
    analyst: 'Turma de Fisiologia Vegetal A'
  },
  {
    id: 'enz-07',
    sampleCode: 'MACA-TUCUMA-120',
    condition: 'Tratado com Polpa de Tucumã',
    initialTime: '08:30',
    observationTime: '10:30',
    elapsedMinutes: 120,
    browningScore: 1,
    browningDescriptor: 'Escurecimento muito leve e restrito a bordas desprotegidas.',
    studentObservations: 'Quase nenhuma formação de coloração castanha na superfície sob a pasta.',
    scientificInterpretation: 'Carotenoides e lipídios de Astrocaryum aculeatum demonstraram efeito protetor expressivo contra a oxidação enzimática.',
    photoUrl: EXPERIMENT_PHOTOS.enzymaticBrowning,
    photoCaption: 'Retenção da cor alva na porção protegida por tucumã.',
    analyst: 'Turma de Fisiologia Vegetal A'
  }
];

/* =========================================================================
   EXPERIMENTO C — INFLUÊNCIA DO pH NAS ANTOCIANINAS (AÇAÍ E. PRECATÓRIA)
   Aviso Metodológico Fundamental:
   A variação de cor decorre do equilíbrio tautomérico reversível do anel
   cromóforo e não representa necessariamente consumo oxidativo ou degradação.
   ========================================================================= */

export const INITIAL_ANTHOCYANIN_PH_MEASUREMENTS: AnthocyaninPHMeasurement[] = [
  {
    id: 'ant-ph-01',
    sampleCode: 'ACAI-PH-01',
    experimentalCondition: 'Meio Hiperácido (Adição de HCl 0,1 M)',
    measuredPH: 1.4,
    measurementMethod: 'pHmetro de Bancada Calibrado',
    observedColor: 'Vermelho Rubi Intenso e Brilhante',
    colorHex: '#b91c1c',
    dominantChemicalSpecies: 'Cátion Flavílio (Forma Monomérica Protonada com Carga Positiva Deslocalizada)',
    timestamp: '15/10/2026 14:15',
    studentObservations: 'Ao adicionar as primeiras gotas de ácido, a cor roxo-escura típica transformou-se instantaneamente em vermelho vívido límpido.',
    comparativeResultNote: 'Em pH < 2, mais de 95% das antocianinas encontram-se na forma de cátion flavílio com absorbância máxima estrita a 520 nm.',
    photoUrl: EXPERIMENT_PHOTOS.anthocyaninPH,
    photoCaption: 'Extrato de açaí acidificado (tubo pH 1-2): coloração vermelha intensa do cátion flavílio.'
  },
  {
    id: 'ant-ph-02',
    sampleCode: 'ACAI-PH-02',
    experimentalCondition: 'Meio Ácido Natural (Polpa Pura com Água Deionizada)',
    measuredPH: 4.3,
    measurementMethod: 'pHmetro de Bancada Calibrado',
    observedColor: 'Roxo Violáceo Escuro Opaco',
    colorHex: '#4c1d95',
    dominantChemicalSpecies: 'Equilíbrio Misto: Cátion Flavílio (~20%) e Pseudobase Carbinol Incolor (~70%)',
    timestamp: '15/10/2026 14:25',
    studentObservations: 'Coloração clássica do açaí consumido na Amazônia, densa e profunda.',
    comparativeResultNote: 'O pH natural de Euterpe precatoria situa-se nesta faixa limítrofe onde a cor é atenuada pela hidratação nucleofílica da água.',
    photoUrl: EXPERIMENT_PHOTOS.anthocyaninPH,
    photoCaption: 'Amostra de açaí puro diluído em água (tubo pH 4.3): roxo violáceo característico.'
  },
  {
    id: 'ant-ph-03',
    sampleCode: 'ACAI-PH-03',
    experimentalCondition: 'Meio Neutro (Tampão Fosfato pH 7,0)',
    measuredPH: 7.0,
    measurementMethod: 'pHmetro de Bancada Calibrado',
    observedColor: 'Violeta Acinzentado / Azul Fosco',
    colorHex: '#334155',
    dominantChemicalSpecies: 'Base Quinoidal Anidra Desprotonada',
    timestamp: '15/10/2026 14:35',
    studentObservations: 'A solução perdeu o tom avermelhado e adquiriu um tom cinza-azulado fosco.',
    comparativeResultNote: 'A perda de prótons dos grupos fenólicos converte o cátion na base quinoidal, deslocando a absorbância para comprimentos de onda maiores (efeito batocrômico).',
    photoUrl: EXPERIMENT_PHOTOS.anthocyaninPH,
    photoCaption: 'Meio tamponado em pH 7.0: tom violeta-acinzentado da base quinoidal neutra.'
  },
  {
    id: 'ant-ph-04',
    sampleCode: 'ACAI-PH-04',
    experimentalCondition: 'Meio Alcalino Suave (Solução de Bicarbonato 0,1 M)',
    measuredPH: 8.6,
    measurementMethod: 'pHmetro de Bancada Calibrado',
    observedColor: 'Verde Musgo / Verde Azulado',
    colorHex: '#166534',
    dominantChemicalSpecies: 'Base Quinoidal Iônica e Chalcona Inicial',
    timestamp: '15/10/2026 14:45',
    studentObservations: 'Mudança drástica para verde escuro. Os estudantes acharam impressionante a transição rápida.',
    comparativeResultNote: 'A forma quinoidal sofre desprotonação adicional gerando ânions de cor verde intensa.',
    photoUrl: EXPERIMENT_PHOTOS.anthocyaninPH,
    photoCaption: 'Meio alcalino suave pH 8.6: coloração verde intensa característica de quinóides ionizados.'
  },
  {
    id: 'ant-ph-05',
    sampleCode: 'ACAI-PH-05',
    experimentalCondition: 'Meio Alcalino Forte (Adição de NaOH 0,1 M)',
    measuredPH: 11.8,
    measurementMethod: 'pHmetro de Bancada Calibrado',
    observedColor: 'Amarelo Pardo / Castanho Claro Degradado',
    colorHex: '#854d0e',
    dominantChemicalSpecies: 'Chalcona Aberta Desprotonada e Produtos de Clivagem',
    timestamp: '15/10/2026 15:00',
    studentObservations: 'Após alguns minutos em pH fortemente básico, a cor verde desvaneceu para um amarelo-amarronzado opaco irreversível.',
    comparativeResultNote: 'Em pH extremamente básico ocorre a clivagem do anel heterocíclico central (abertura em chalcona) e oxidação irreversível em ácidos fenólicos menores.',
    photoUrl: EXPERIMENT_PHOTOS.anthocyaninPH,
    photoCaption: 'Extrato sob hidróxido de sódio concentrado (pH ~11.8): clivagem para chalcona amarelada.'
  }
];
