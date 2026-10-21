import { ExperimentProtocol } from '../types';

export const EXPERIMENT_PROTOCOLS: ExperimentProtocol[] = [
  {
    id: 'folin-ciocalteu',
    code: 'BIO-MET-01',
    name: 'Determinação de Compostos Fenólicos Totais (Folin-Ciocalteu)',
    principle: 'Redução do reagente fosfomolíbdico-fosfotúngstico em meio alcalino por fenóis redutores, formando um complexo cromóforo azul medido a 765 nm.',
    targetMolecules: 'Polifenóis totais, ácidos fenólicos, flavonoides e taninos hidrolisáveis.',
    wavelength_nm: 765,
    unitExpressed: 'mg de Equivalente de Ácido Gálico por 100g de polpa (mg EAG/100g)',
    reagents: [
      'Reagente de Folin-Ciocalteu diluído 1:10 em água deionizada',
      'Solução aquosa saturada de Carbonato de Sódio (Na2CO3 a 7,5% p/v)',
      'Padrão analítico de Ácido Gálico (pureza >= 98%, Sigma-Aldrich)',
      'Solvente extrator: Metanol/Água/Ácido Acético (70:28:2 v/v)'
    ],
    steps: [
      'Pipetar 500 µL do extrato vegetal centrifugado ou da curva padrão em tubos de ensaio âmbar.',
      'Adicionar 2,5 mL do reagente de Folin-Ciocalteu diluído (1:10) e homogeneizar em vórtex por 15 s.',
      'Aguardar repouso de 5 min à temperatura ambiente (22°C a 25°C) protegido da luz.',
      'Adicionar 2,0 mL de solução aquosa de Na2CO3 a 7,5% e homogeneizar novamente.',
      'Incubar os tubos em banho-maria termostatizado a 40°C por 30 minutos ou à temperatura ambiente por 2 horas no escuro.',
      'Realizar a leitura espectrofotométrica a 765 nm contra o branco de reagentes.'
    ],
    calibrationModel: 'Curva de regressão linear de ácido gálico de 10 a 100 mg/L (R² >= 0,998).',
    methodologyNotice: 'Demonstração metodológica: protocolo padronizado conforme diretrizes da Embrapa Agroindústria de Alimentos e AOAC Official Methods.'
  },
  {
    id: 'dpph-assay',
    code: 'BIO-MET-02',
    name: 'Ensaio de Varredura de Radical Livre DPPH•',
    principle: 'Descoloração do radical estável 2,2-difenil-1-picril-hidrazila (violeta profundo) em decorrência da doação de hidrogênio (mecanismo HAT) por compostos antioxidantes, gerando a forma reduzida DPPH-H (amarela).',
    targetMolecules: 'Antioxidantes lipofílicos e hidrofílicos com capacidade redutora de radicais livres.',
    wavelength_nm: 517,
    unitExpressed: 'Capacidade de sequestro percentual (%) e Concentração Inibitória Média (IC50 em µg/mL ou g fruto/g DPPH)',
    reagents: [
      'Solução de radical DPPH 0,06 mM em metanol grau HPLC (preparada sob luz atínica)',
      'Padrão sintético Trolox (ácido 6-hidroxi-2,5,7,8-tetrametilcromo-2-carboxílico) ou Ácido Ascórbico',
      'Metanol grau espectroscópico para diluição e branco espectral'
    ],
    steps: [
      'Transferir alíquota de 100 µL do extrato diluído em concentrações seriadas (ex: 25, 50, 100, 250, 500 µg/mL).',
      'Adicionar 3,9 mL da solução de trabalho de DPPH• (0,06 mM).',
      'Homogeneizar imediatamente e incubar à temperatura ambiente (25°C) protegido de luz direta por exatamente 30 minutos.',
      'Ler a absorbância a 517 nm contra branco com metanol.',
      'Calcular o percentual de inibição: % Inibição = [(Abs_controle - Abs_amostra) / Abs_controle] * 100.',
      'Plotar curva logarítmica de inibição vs concentração para determinar a IC50 por interpolação não linear.'
    ],
    calibrationModel: 'Curva padrão de Trolox (faixa 5 a 50 µM) para expressão em Equivalente Trolox (µmol TE/g).',
    methodologyNotice: 'Demonstração metodológica: protocolo validado de acordo com Brand-Williams et al. e Sánchez-Moreno et al.'
  },
  {
    id: 'abts-trolox',
    code: 'BIO-MET-03',
    name: 'Ensaio de Descoloração do Radical Cátion ABTS•+',
    principle: 'Oxidação do sal de ABTS por persulfato de potássio gerando o cromóforo verde-azulado ABTS•+, cuja absorção a 734 nm decresce na presença de antioxidantes doadores de elétrons (SET).',
    targetMolecules: 'Amplo espectro: bioativos lipofílicos e hidrofílicos (antocianinas, carotenoides e polifenóis).',
    wavelength_nm: 734,
    unitExpressed: 'µmol de Equivalente Trolox por grama de amostra (µmol TE/g)',
    reagents: [
      'Sal de ABTS [ácido 2,2\'-azino-bis(3-etilbenzotiazolin-6-sulfônico)] a 7,0 mM',
      'Persulfato de Potássio (K2S2O8) a 2,45 mM',
      'Etanol ou Tampão Fosfato Salino (PBS pH 7,4) para ajuste de absorbância inicial a 0,700 ± 0,020'
    ],
    steps: [
      'Misturar volumes iguais de ABTS 7 mM e persulfato 2,45 mM; incubar por 12 a 16 h no escuro para gerar o cátion radical.',
      'Diluir a solução mãe em etanol até obter absorbância de 0,700 (±0,02) a 734 nm.',
      'Adicionar 30 µL de amostra/padrão a 3,0 mL da solução diluída de ABTS•+.',
      'Homogeneizar e registrar a absorbância exatamente aos 6 minutos de reação a 30°C.'
    ],
    calibrationModel: 'Curva linear de Trolox (100 a 2000 µM), R² >= 0,999.',
    methodologyNotice: 'Demonstração metodológica: metodologia recomendada para matrizes densas e pigmentadas como açaí e camu-camu.'
  },
  {
    id: 'frap-ferric',
    code: 'BIO-MET-04',
    name: 'Poder Antioxidante de Redução do Ferro (Ensaio FRAP)',
    principle: 'Redução do complexo férrico incolor [Fe(III)-TPTZ]²⁺ ao complexo ferroso intensamente azul [Fe(II)-TPTZ]²⁺ em pH ácido por espécies redutoras.',
    targetMolecules: 'Antioxidantes de baixo peso molecular com potencial redox favorável (< 0,70 V).',
    wavelength_nm: 593,
    unitExpressed: 'µmol de Fe(II) reduzido por grama ou µmol TE/g',
    reagents: [
      'Tampão acetato de sódio 300 mM (pH 3,6)',
      'Solução de TPTZ (2,4,6-tripiridil-s-triazina) a 10 mM em HCl 40 mM',
      'Solução de Cloreto Férrico (FeCl3·6H2O) a 20 mM em água destilada',
      'Reagente FRAP de trabalho preparado na proporção 10:1:1 v/v a 37°C'
    ],
    steps: [
      'Preparar o reagente FRAP fresco misturando os 3 componentes e pré-aquecer a 37°C.',
      'Transferir 90 µL de amostra diluída, 270 µL de água destilada e 2,7 mL do reagente FRAP.',
      'Incubar a 37°C por 30 minutos em banho termostatizado.',
      'Medir absorbância a 593 nm contra branco com água.'
    ],
    calibrationModel: 'Curva com Sulfato Ferroso Heptaidratado (FeSO4·7H2O) de 100 a 1000 µM.',
    methodologyNotice: 'Demonstração metodológica: protocolo padrão Benzie & Strain.'
  }
];
