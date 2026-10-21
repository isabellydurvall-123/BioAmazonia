export type PublicationStatus = 
  | 'Publicado e Validado' 
  | 'Em Revisão por Pares' 
  | 'Pendente de Verificação';

export type EvidenceLevel = 
  | 'Comprovado por Múltiplos Estudos' 
  | 'Comprovado em Estudo Indexado' 
  | 'Evidência Preliminar / Requer Verificação';

export interface BioactiveCompoundDetail {
  name: string;
  chemicalClass: string;
  meanConcentration: string;
  evidenceLevel: EvidenceLevel;
  primaryAction: string;
  verificationNotice?: string;
}

export interface NutritionalItem {
  component: string;
  valuePer100g: string;
  unit: string;
  status: 'Confirmado' | 'Requer Verificação Adicional';
  sourceReference: string;
}

export interface StabilityFactor {
  factor: 'Temperatura' | 'Oxigênio / Atmosfera' | 'Radiação Luminosa (UV)' | 'pH do Meio' | 'Atividade de Água (aw)';
  sensitivityLevel: 'Muito Alta' | 'Alta' | 'Moderada' | 'Baixa';
  criticalThreshold: string;
  impactDescription: string;
}

export interface FruitReference {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  notes?: string;
}

export interface FruitSpecies {
  id: string;
  popularName: string;
  scientificName: string;
  family: string;
  botanicalSynonyms?: string[];
  description: string;
  morphology: string;
  habitat: string;
  harvestPeriod: string;
  bioactiveCompounds: BioactiveCompoundDetail[];
  nutritionalInfo: NutritionalItem[];
  stabilityFactors: StabilityFactor[];
  conservationGuidelines: {
    harvestBestPractices: string[];
    idealStorageCondition: string;
    packagingRecommendation: string;
    shelfLifeEstimate: string;
  };
  scientificReferences: FruitReference[];
  authorizedPhotographs: {
    url: string;
    caption: string;
    authorOrProvenance: string;
  }[];
  updatedAt: string;
  publicationStatus: PublicationStatus;
}

export type TopicCategory = 
  | 'Fundamentos Moleculares' 
  | 'Classes Fitoquímicas' 
  | 'Cinética & Estabilidade';

export interface BiochemistryFruitExample {
  fruitName: string;
  fruitId: string;
  scientificName: string;
  description: string;
}

export interface BiochemistryTopic {
  id: string;
  order: number;
  category: TopicCategory;
  title: string;
  shortSummary: string;
  introduction: string;
  accessibleExplanation: string;
  scientificDetail: string;
  fruitExamples: BiochemistryFruitExample[];
  experimentalRelevance: string;
  scientificLimitations: string;
  relatedTopicIds: string[];
  references: {
    title: string;
    authors: string;
    journal: string;
    year: number;
    doi?: string;
  }[];
  updatedAt: string;
  verificationStatus: 'Validado por Literatura Indexada' | 'Em Revisão por Pares' | 'Pendente de Verificação';
}

export type ExperimentType = 'vitamina-c' | 'oxidacao-enzimatica' | 'ph-antocianinas';
export type ExperimentRecordStatus = 'rascunho' | 'em_revisao' | 'publicado';
export type UserRole = 'admin' | 'researcher' | 'visitor';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  institution?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExperimentDataSource = 'cientifico_real' | 'demonstracao_inicial';

export interface UnifiedExperimentRecord {
  id: string;
  experimentType: ExperimentType;
  fruitOrSample: string;
  sampleCode: string;
  experimentalCondition: string;
  dateTime: string;
  methodUsed: string;
  units: string;
  measuredValues: Record<string, any>;
  observations: string;
  scientificInterpretation?: string;
  photoUrl?: string;
  responsibleName?: string;
  status: ExperimentRecordStatus;
  dataSource?: ExperimentDataSource;
  authorUid: string;
  authorEmail?: string;
  createdAt: string;
  updatedAt: string;
}

/* =========================================================================
   MODELOS DE DADOS DEDICADOS DOS EXPERIMENTOS CIENTÍFICOS
   ========================================================================= */

// EXPERIMENTO A — ESTABILIDADE DA VITAMINA C
export type VitaminCCondition = 'Fresco' | 'Refrigerado (48h)' | 'Fervido';
export type VitaminCFruit = 'Camu-camu (Myrciaria dubia)' | 'Cubiu (Solanum sessiliflorum)';

export interface VitaminCMeasurement {
  id: string;
  sampleCode: string;
  fruit: VitaminCFruit;
  condition: VitaminCCondition;
  sampleVolumeMl: number;
  starchIndicatorVolumeMl: number;
  iodineDropsCount: number;
  estimatedVolumeIodineMl: number;
  titrationEndpointColor: string;
  triplicateIndex: 1 | 2 | 3;
  date: string;
  analyst: string;
  studentNotes: string;
}

// EXPERIMENTO B — OXIDAÇÃO ENZIMÁTICA
export type EnzymaticCondition = 
  | 'Grupo de Controle (Sem Tratamento)' 
  | 'Tratado com Polpa de Buriti' 
  | 'Tratado com Polpa de Tucumã';

export type BrowningScaleScore = 0 | 1 | 2 | 3 | 4;

export interface EnzymaticObservation {
  id: string;
  sampleCode: string;
  condition: EnzymaticCondition;
  initialTime: string;
  observationTime: string;
  elapsedMinutes: number;
  browningScore: BrowningScaleScore;
  browningDescriptor: string;
  studentObservations: string;
  scientificInterpretation: string;
  photoUrl?: string;
  photoCaption?: string;
  analyst: string;
}

// EXPERIMENTO C — INFLUÊNCIA DO pH NAS ANTOCIANINAS
export interface AnthocyaninPHMeasurement {
  id: string;
  sampleCode: string;
  experimentalCondition: string;
  measuredPH: number | null;
  measurementMethod: 'pHmetro de Bancada Calibrado' | 'Fita Indicadora Universal' | 'Tampão Químico Padrão';
  observedColor: string;
  colorHex: string;
  dominantChemicalSpecies: string;
  timestamp: string;
  studentObservations: string;
  comparativeResultNote: string;
  photoUrl?: string;
  photoCaption?: string;
}

export type AntioxidantClass = 
  | 'Antocianinas' 
  | 'Ácido Ascórbico (Vitamina C)' 
  | 'Carotenoides' 
  | 'Polifenóis e Flavonoides' 
  | 'Tocoferóis e Ácidos Graxos';

export interface Fruit {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  predominantAntioxidant: AntioxidantClass;
  oracValue: number;
  vitaminC_mg: number;
  totalPhenolics_mgGAE: number;
  totalCarotenoids_mcg: number;
  anthocyanins_mg: number;
  image: string;
  imageAlt: string;
  description: string;
  biochemicalAction: string;
  habitat: string;
  traditionalUses: string;
  storageRecommendation: string;
  keyMetabolites: string[];
}

export interface StabilityRecord {
  id: string;
  fruitName: string;
  compoundTarget: string;
  processingMethod: 'In Natura (Polpa Fresca)' | 'Congelamento (-18°C)' | 'Refrigeração (4°C)' | 'Pasteurização HTST' | 'Liofilização';
  durationDays: number;
  temperatureCelsius: number;
  initialConcentration: string;
  finalConcentration: string;
  retentionPercent: number;
  kineticOrder: 'Ordem 1' | 'Ordem 0' | 'Bifásica';
  halfLifeDays: number;
  degradationFactor: 'Temperatura' | 'Oxigênio / Ar' | 'Radiação UV / Luz' | 'Variação de pH';
  scientificNote: string;
}

export interface ExperimentProtocol {
  id: string;
  code: string;
  name: string;
  principle: string;
  targetMolecules: string;
  wavelength_nm: number;
  unitExpressed: string;
  reagents: string[];
  steps: string[];
  calibrationModel: string;
  methodologyNotice: string;
}

export type PublicationType = 
  | 'Artigo Científico em Periódico Indexado' 
  | 'Livro Técnico / Capítulo' 
  | 'Norma Técnica / Farmacopeia' 
  | 'Comunicado Técnico / Manual Institucional' 
  | 'Documento Técnico / Boletim Institucional'
  | 'Tese / Dissertação Acadêmica';

export type ReferenceVerificationStatus = 
  | 'Validada por Literatura Indexada' 
  | 'Fonte Institucional Oficial' 
  | 'Em Verificação';

export interface ScientificReference {
  id: string;
  authors: string;
  title: string;
  year: number;
  journal: string;
  volumeAndPages?: string;
  doi?: string;
  url?: string;
  publicationType: PublicationType;
  relatedContents: string[];
  relatedFruits: string[];
  relatedExperiments: ('vitamina-c' | 'oxidacao-enzimatica' | 'ph-antocianinas')[];
  abstract?: string;
  keywords: string[];
  fruitFocus: string;
  createdAt?: string;
  verificationStatus: ReferenceVerificationStatus;
}

export type ConservationSourceType = 
  | 'Literatura Indexada' 
  | 'Institucional (EMBRAPA / INPA)' 
  | 'Observação Experimental do Projeto';

export interface ConservationGuideline {
  id: string;
  fruitId: string;
  fruitCommonName: string;
  scientificName: string;
  storageCondition: string;
  recommendation: string;
  compoundTarget: string;
  sourceType: ConservationSourceType;
  sourceCitation: string;
  sourceUrl?: string;
  relatedReferenceId?: string;
  updatedAt: string;
  applicationLimitations: string;
}

export type PageRoute = 
  | 'home' 
  | 'catalogo' 
  | 'fruto'
  | 'bioquimica' 
  | 'experimentos' 
  | 'conservacao' 
  | 'estabilidade' 
  | 'referencias' 
  | 'login' 
  | 'admin';
