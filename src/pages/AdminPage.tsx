import React, { useState, useEffect, useMemo } from 'react';
import { 
  PageRoute, 
  ScientificReference, 
  ConservationGuideline, 
  PublicationType, 
  ReferenceVerificationStatus, 
  ConservationSourceType,
  FruitSpecies,
  BioactiveCompoundDetail,
  NutritionalItem,
  StabilityFactor,
  EvidenceLevel,
  BiochemistryTopic,
  BiochemistryFruitExample,
  UnifiedExperimentRecord,
  ExperimentType,
  ExperimentRecordStatus,
  ExperimentDataSource,
  TopicCategory,
  UserProfile,
  UserRole
} from '../types';
import { referenceStorageService } from '../services/referenceStorageService';
import { conservationStorageService } from '../services/conservationStorageService';
import { fruitStorageService } from '../services/fruitStorageService';
import { topicStorageService } from '../services/topicStorageService';
import { experimentStorageService } from '../services/experimentStorageService';
import { isMasterAdminEmail, userManagementService } from '../services/userManagementService';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  Leaf,
  Plus, 
  Download, 
  CheckCircle, 
  LogOut, 
  Search, 
  BookOpen, 
  Layers, 
  Edit3, 
  Trash2, 
  ThermometerSnowflake, 
  AlertTriangle, 
  ExternalLink, 
  X, 
  FlaskConical, 
  Check, 
  Sparkles, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  User, 
  Eye, 
  FileText, 
  Tag, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Users,
  UserCheck,
  UserPlus,
  ShieldAlert
} from 'lucide-react';

interface AdminPageProps {
  onLogout: () => void;
  onNavigate: (page: PageRoute, targetId?: string) => void;
}

interface SampleBatch {
  id: string;
  batchCode: string;
  species: string;
  harvestLocation: string;
  receivedDate: string;
  status: 'Concluído' | 'Em Análise' | 'Em Quarentena';
  analyst: string;
}

const PUBLICATION_TYPES: PublicationType[] = [
  'Artigo Científico em Periódico Indexado',
  'Livro Técnico / Capítulo',
  'Norma Técnica / Farmacopeia',
  'Comunicado Técnico / Manual Institucional',
  'Tese / Dissertação Acadêmica'
];

export const AdminPage: React.FC<AdminPageProps> = ({ onLogout, onNavigate }) => {
  const { currentUser, isAdmin, isResearcher, isVisitor, loginWithGoogle, logout } = useAuth();

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<'fruits' | 'biochem' | 'experiments' | 'references' | 'conservation' | 'batches' | 'users'>('fruits');

  // Estados de Coleções Centrais
  const [fruits, setFruits] = useState<FruitSpecies[]>([]);
  const [topics, setTopics] = useState<BiochemistryTopic[]>([]);
  const [experiments, setExperiments] = useState<UnifiedExperimentRecord[]>([]);
  const [references, setReferences] = useState<ScientificReference[]>([]);
  const [guidelines, setGuidelines] = useState<ConservationGuideline[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Mensagens de Sucesso e Erro
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => {
      setNotice(null);
    }, 4500);
  };

  // Carregamento Inicial e Reatividade
  const refreshAll = async () => {
    setIsLoadingData(true);
    try {
      const [f, t, e, r, g] = await Promise.all([
        fruitStorageService.list('all', currentUser),
        topicStorageService.list('all', currentUser),
        experimentStorageService.list(undefined, 'all'),
        referenceStorageService.list(),
        conservationStorageService.list()
      ]);
      setFruits(f);
      setTopics(t);
      setExperiments(e);
      setReferences(r);
      setGuidelines(g);

      if (isAdmin) {
        const u = await userManagementService.listUsers(currentUser);
        setRegisteredUsers(u);
      }
    } catch (err: any) {
      console.warn('Erro ao carregar dados do painel:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshAll();

    const unsubFruit = fruitStorageService.subscribe(() => {
      fruitStorageService.list('all', currentUser).then(setFruits);
    });
    const unsubTopic = topicStorageService.subscribe(() => {
      topicStorageService.list('all', currentUser).then(setTopics);
    });
    const unsubExp = experimentStorageService.subscribe(() => {
      experimentStorageService.list(undefined, 'all').then(setExperiments);
    });
    const unsubRef = referenceStorageService.subscribe(() => {
      referenceStorageService.list().then(setReferences);
    });
    const unsubGuide = conservationStorageService.subscribe(() => {
      conservationStorageService.list().then(setGuidelines);
    });
    const unsubUsers = userManagementService.subscribe(() => {
      if (isAdmin) {
        userManagementService.listUsers(currentUser).then(setRegisteredUsers);
      }
    });

    return () => {
      unsubFruit();
      unsubTopic();
      unsubExp();
      unsubRef();
      unsubGuide();
      unsubUsers();
    };
  }, [currentUser, isAdmin]);

  // Modal de Confirmação para Operações Destrutivas
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const triggerConfirmDelete = (title: string, message: string, onConfirm: () => Promise<void>) => {
    setDeleteModal({
      isOpen: true,
      title,
      message,
      actionLabel: 'Excluir Definitivamente',
      onConfirm
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      await deleteModal.onConfirm();
      setDeleteModal(null);
    } catch (err: any) {
      showNotice('error', err.message || 'Falha na operação de exclusão.');
    } finally {
      setIsDeleting(false);
    }
  };

  // =========================================================================
  // GESTÃO DE USUÁRIOS & PESQUISADORES DE BANCADA (EXCLUSIVO ADMIN)
  // =========================================================================
  const [userSearch, setUserSearch] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserInstitution, setNewUserInstitution] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('researcher');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  const handleCreateResearcherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    setIsSubmittingUser(true);

    try {
      const created = await userManagementService.createResearcher({
        email: newUserEmail,
        displayName: newUserName,
        institution: newUserInstitution
      }, currentUser);

      showNotice('success', `Pesquisador de bancada "${created.displayName}" (${created.email}) cadastrado com sucesso! Quando este usuário acessar com sua conta Google, terá permissões de bancada concedidas.`);
      setIsUserModalOpen(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserInstitution('');
      const updated = await userManagementService.listUsers(currentUser);
      setRegisteredUsers(updated);
    } catch (err: any) {
      setUserFormError(err.message || 'Erro ao cadastrar pesquisador.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole, userDisplayName?: string) => {
    try {
      await userManagementService.updateUserRole(userId, newRole, currentUser);
      showNotice('success', `Permissão de ${userDisplayName || 'usuário'} alterada para ${newRole === 'admin' ? 'Administrador Curador' : newRole === 'researcher' ? 'Pesquisador de Bancada' : 'Visitante'}.`);
      const updated = await userManagementService.listUsers(currentUser);
      setRegisteredUsers(updated);
    } catch (err: any) {
      showNotice('error', err.message || 'Falha ao alterar permissão.');
    }
  };

  // Edição de Cadastro Existente (Nome, Instituição/Laboratório, Papel)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editUserInstitution, setEditUserInstitution] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('researcher');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [editUserError, setEditUserError] = useState<string | null>(null);

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setEditUserName(u.displayName || '');
    setEditUserInstitution(u.institution || '');
    setEditUserRole(u.role);
    setEditUserError(null);
    setIsEditUserModalOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditUserError(null);
    setIsUpdatingUser(true);

    try {
      const updated = await userManagementService.updateUserProfile(editingUser.uid, {
        displayName: editUserName,
        institution: editUserInstitution,
        role: editUserRole
      }, currentUser);

      showNotice('success', `Cadastro de "${updated.displayName}" atualizado com sucesso (Instituição: ${updated.institution}).`);
      setIsEditUserModalOpen(false);
      const list = await userManagementService.listUsers(currentUser);
      setRegisteredUsers(list);
    } catch (err: any) {
      setEditUserError(err.message || 'Falha ao atualizar dados do pesquisador.');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const handleDeleteUserAccess = (u: UserProfile) => {
    triggerConfirmDelete(
      `Revogar Acesso de ${u.displayName || u.email}?`,
      `Esta ação removerá o cadastro do usuário "${u.email}". Se ele fizer login novamente com o Google, retornará à condição padrão de Visitante.`,
      async () => {
        await userManagementService.deleteUser(u.uid, currentUser);
        showNotice('success', `Acesso de ${u.email} revogado.`);
        const updated = await userManagementService.listUsers(currentUser);
        setRegisteredUsers(updated);
      }
    );
  };

  // =========================================================================
  // 1. GERENCIAMENTO DE FRUTOS
  // =========================================================================
  const [fruitSearch, setFruitSearch] = useState('');
  const [fruitStatusFilter, setFruitStatusFilter] = useState<string>('all');
  const [isFruitModalOpen, setIsFruitModalOpen] = useState(false);
  const [editingFruit, setEditingFruit] = useState<FruitSpecies | null>(null);
  const [isSubmittingFruit, setIsSubmittingFruit] = useState(false);
  const [fruitFormError, setFruitFormError] = useState<string | null>(null);

  // Controle de abas da ficha completa do fruto
  const [fruitModalTab, setFruitModalTab] = useState<'geral' | 'bioativos' | 'nutricional' | 'estabilidade' | 'conservacao' | 'fotos_refs'>('geral');

  // Identificação e Botânica
  const [fruitId, setFruitId] = useState('');
  const [fruitPopularName, setFruitPopularName] = useState('');
  const [fruitScientificName, setFruitScientificName] = useState('');
  const [fruitFamily, setFruitFamily] = useState('');
  const [fruitSynonyms, setFruitSynonyms] = useState('');
  const [fruitDescription, setFruitDescription] = useState('');
  const [fruitMorphology, setFruitMorphology] = useState('');
  const [fruitHabitat, setFruitHabitat] = useState('');
  const [fruitHarvestPeriod, setFruitHarvestPeriod] = useState('');
  const [fruitPhotoUrl, setFruitPhotoUrl] = useState('');
  const [fruitPhotoCaption, setFruitPhotoCaption] = useState('');
  const [fruitPhotoProvenance, setFruitPhotoProvenance] = useState('');
  const [fruitSelectedRefs, setFruitSelectedRefs] = useState<string[]>([]);
  const [fruitPubStatus, setFruitPubStatus] = useState<'Publicado e Validado' | 'Em Revisão por Pares' | 'Pendente de Verificação'>('Publicado e Validado');

  // Informações Fitoquímicas & Metabolômicas Completas
  const [fruitBioactiveCompounds, setFruitBioactiveCompounds] = useState<BioactiveCompoundDetail[]>([]);
  const [fruitNutritionalInfo, setFruitNutritionalInfo] = useState<NutritionalItem[]>([]);
  const [fruitStabilityFactors, setFruitStabilityFactors] = useState<StabilityFactor[]>([]);
  const [fruitHarvestBestPractices, setFruitHarvestBestPractices] = useState<string>('');
  const [fruitIdealStorage, setFruitIdealStorage] = useState<string>('');
  const [fruitPackaging, setFruitPackaging] = useState<string>('');
  const [fruitShelfLife, setFruitShelfLife] = useState<string>('');

  const filteredFruits = useMemo(() => {
    return fruits.filter(f => {
      if (fruitSearch.trim()) {
        const term = fruitSearch.toLowerCase();
        const matchName = f.popularName.toLowerCase().includes(term) || f.scientificName.toLowerCase().includes(term);
        const matchFamily = f.family.toLowerCase().includes(term);
        if (!matchName && !matchFamily) return false;
      }
      if (fruitStatusFilter !== 'all') {
        if (fruitStatusFilter === 'publicado' && f.publicationStatus !== 'Publicado e Validado' && (f.publicationStatus as string) !== 'publicado') return false;
        if (fruitStatusFilter === 'em_revisao' && f.publicationStatus !== 'Em Revisão por Pares' && (f.publicationStatus as string) !== 'em_revisao') return false;
        if (fruitStatusFilter === 'rascunho' && f.publicationStatus !== 'Pendente de Verificação' && (f.publicationStatus as string) !== 'rascunho') return false;
      }
      return true;
    });
  }, [fruits, fruitSearch, fruitStatusFilter]);

  const handleOpenCreateFruit = () => {
    setEditingFruit(null);
    setFruitModalTab('geral');
    setFruitId('');
    setFruitPopularName('');
    setFruitScientificName('');
    setFruitFamily('');
    setFruitSynonyms('');
    setFruitDescription('');
    setFruitMorphology('');
    setFruitHabitat('');
    setFruitHarvestPeriod('');
    setFruitPhotoUrl('');
    setFruitPhotoCaption('');
    setFruitPhotoProvenance('');
    setFruitSelectedRefs([]);
    setFruitPubStatus('Em Revisão por Pares');
    
    // Iniciar dados completos com modelos de alta qualidade para facilitar o cadastro
    setFruitBioactiveCompounds([
      {
        name: 'Ácido L-Ascórbico (Vitamina C)',
        chemicalClass: 'Lactona Enediólica Hidrossolúvel',
        meanConcentration: '1.500 a 2.500 mg/100g de polpa',
        evidenceLevel: 'Comprovado por Múltiplos Estudos',
        primaryAction: 'Varredura de radicais livres oxigenados e doador de elétrons na regeneração de tocoferóis.'
      }
    ]);
    
    setFruitNutritionalInfo([
      { component: 'Umidade', valuePer100g: '86.4', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP & INPA' },
      { component: 'Valor Energético', valuePer100g: '52.0', unit: 'kcal', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Proteínas', valuePer100g: '1.1', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Bromatologia' },
      { component: 'Lipídios Totais', valuePer100g: '0.6', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Bromatologia' },
      { component: 'Carboidratos Disponíveis', valuePer100g: '10.8', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Fibra Alimentar Total', valuePer100g: '2.5', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' }
    ]);

    setFruitStabilityFactors([
      {
        factor: 'Temperatura',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Acima de 45°C em meio aeróbio',
        impactDescription: 'Acelera a clivagem oxidativa de compostos termolábeis e desnaturação de bioativos hidrossolúveis.'
      },
      {
        factor: 'Oxigênio / Atmosfera',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Contato com ar atmosférico livre',
        impactDescription: 'Oxidação rápida catalisada por enzimas endógenas (polifenoloxidase, peroxidase ou ascorbato oxidase).'
      },
      {
        factor: 'Radiação Luminosa (UV)',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Luz visível e UV direta',
        impactDescription: 'Foto-oxidação catalisada por radiação, induzindo cis-trans isomerização e clivagem de cromóforos.'
      },
      {
        factor: 'pH do Meio',
        sensitivityLevel: 'Moderada',
        criticalThreshold: 'Variações além da faixa natural',
        impactDescription: 'Deslocamento de equilíbrios iônicos tautoméricos com desestabilização da estrutura química.'
      }
    ]);

    setFruitHarvestBestPractices(
      'Colheita manual nas primeiras horas da manhã em maturação fisiológica ideal.\n' +
      'Evitar choque mecânico e danos no pericarpo durante o transporte fluvial e rodoviário.\n' +
      'Acondicionar em caixas plásticas higienizadas e perfuradas com capacidade máxima de 15 kg.'
    );
    setFruitIdealStorage('Refrigeração imediata a 4°C no transporte; congelamento da polpa a -18°C para conservação superior a 6 meses.');
    setFruitPackaging('Embalagens impermeáveis com barreira contra oxigênio e luz (laminado de polietileno/alumínio) seladas a vácuo.');
    setFruitShelfLife('Até 12 dias sob refrigeração (4°C) ou até 12 meses congelada (-18°C) mantendo retenção de fitoquímicos superior a 80%.');

    setFruitFormError(null);
    setIsFruitModalOpen(true);
  };

  const handleOpenEditFruit = (f: FruitSpecies) => {
    setEditingFruit(f);
    setFruitModalTab('geral');
    setFruitId(f.id);
    setFruitPopularName(f.popularName);
    setFruitScientificName(f.scientificName);
    setFruitFamily(f.family);
    setFruitSynonyms((f.botanicalSynonyms || []).join(', '));
    setFruitDescription(f.description);
    setFruitMorphology(f.morphology || '');
    setFruitHabitat(f.habitat || '');
    setFruitHarvestPeriod(f.harvestPeriod || '');
    const firstPhoto = f.authorizedPhotographs && f.authorizedPhotographs[0];
    setFruitPhotoUrl(firstPhoto ? firstPhoto.url : '');
    setFruitPhotoCaption(firstPhoto ? firstPhoto.caption : '');
    setFruitPhotoProvenance(firstPhoto ? firstPhoto.authorOrProvenance : '');
    setFruitSelectedRefs(f.scientificReferences ? f.scientificReferences.map(r => r.id) : []);
    setFruitPubStatus(f.publicationStatus as any || 'Publicado e Validado');

    // Carregar informações completas existentes ou definir padrões estruturados
    setFruitBioactiveCompounds(f.bioactiveCompounds && f.bioactiveCompounds.length > 0 ? [...f.bioactiveCompounds] : []);
    setFruitNutritionalInfo(f.nutritionalInfo && f.nutritionalInfo.length > 0 ? [...f.nutritionalInfo] : []);
    setFruitStabilityFactors(f.stabilityFactors && f.stabilityFactors.length > 0 ? [...f.stabilityFactors] : []);
    setFruitHarvestBestPractices((f.conservationGuidelines?.harvestBestPractices || []).join('\n'));
    setFruitIdealStorage(f.conservationGuidelines?.idealStorageCondition || '');
    setFruitPackaging(f.conservationGuidelines?.packagingRecommendation || '');
    setFruitShelfLife(f.conservationGuidelines?.shelfLifeEstimate || '');

    setFruitFormError(null);
    setIsFruitModalOpen(true);
  };

  // Funções de manipulação de Compostos Bioativos
  const handleAddBioactiveCompound = () => {
    setFruitBioactiveCompounds(prev => [
      ...prev,
      {
        name: '',
        chemicalClass: 'Composto Fenólico',
        meanConcentration: 'mg/100g',
        evidenceLevel: 'Comprovado em Estudo Indexado',
        primaryAction: 'Atividade antioxidante e sequestro de radicais livres.'
      }
    ]);
  };

  const handleUpdateBioactiveCompound = (index: number, field: keyof BioactiveCompoundDetail, value: any) => {
    setFruitBioactiveCompounds(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveBioactiveCompound = (index: number) => {
    setFruitBioactiveCompounds(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddBioactivePreset = (preset: 'vitc' | 'antocianina' | 'caroteno' | 'polifenol') => {
    if (preset === 'vitc') {
      setFruitBioactiveCompounds(prev => [
        ...prev,
        {
          name: 'Ácido L-Ascórbico (Vitamina C)',
          chemicalClass: 'Lactona Enediólica Hidrossolúvel',
          meanConcentration: '1.800 a 2.800 mg/100g de polpa fresca',
          evidenceLevel: 'Comprovado por Múltiplos Estudos',
          primaryAction: 'Doador universal de elétrons para inativação de radicais livres e regeneração do alfa-tocoferol.'
        }
      ]);
    } else if (preset === 'antocianina') {
      setFruitBioactiveCompounds(prev => [
        ...prev,
        {
          name: 'Cianidina-3-glicosídeo e Derivados',
          chemicalClass: 'Antocianina (Flavonoide Cátion Flavílio)',
          meanConcentration: '45 a 120 mg/100g',
          evidenceLevel: 'Comprovado em Estudo Indexado',
          primaryAction: 'Varredura de espécies reativas de oxigênio (ROS), fotoproteção celular e estabilização de membranas.'
        }
      ]);
    } else if (preset === 'caroteno') {
      setFruitBioactiveCompounds(prev => [
        ...prev,
        {
          name: 'All-trans-Beta-Caroteno',
          chemicalClass: 'Carotenoide Provitamina A Lipofílico',
          meanConcentration: '3.500 a 18.000 µg/100g',
          evidenceLevel: 'Comprovado em Estudo Indexado',
          primaryAction: 'Desativação estequiométrica de oxigênio singlete e proteção contra lipoperoxidação de membranas.'
        }
      ]);
    } else {
      setFruitBioactiveCompounds(prev => [
        ...prev,
        {
          name: 'Polifenóis Totais & Ácidos Fenólicos',
          chemicalClass: 'Compostos Fenólicos',
          meanConcentration: '450 a 950 mg GAE/100g',
          evidenceLevel: 'Comprovado em Estudo Indexado',
          primaryAction: 'Capacidade sequestrante de radicais peroxil e quelação de íons metálicos pró-oxidantes (Fe²⁺/Cu²⁺).'
        }
      ]);
    }
  };

  // Funções de manipulação de Itens Nutricionais
  const handleAddNutritionalItem = () => {
    setFruitNutritionalInfo(prev => [
      ...prev,
      {
        component: '',
        valuePer100g: '',
        unit: 'g',
        status: 'Confirmado',
        sourceReference: 'Tabela TACO / UNICAMP & INPA'
      }
    ]);
  };

  const handleUpdateNutritionalItem = (index: number, field: keyof NutritionalItem, value: any) => {
    setFruitNutritionalInfo(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveNutritionalItem = (index: number) => {
    setFruitNutritionalInfo(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoadDefaultNutritionalTable = () => {
    setFruitNutritionalInfo([
      { component: 'Umidade', valuePer100g: '85.4', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP & INPA' },
      { component: 'Valor Energético', valuePer100g: '58.0', unit: 'kcal', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Proteínas', valuePer100g: '1.2', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Bromatologia' },
      { component: 'Lipídios Totais', valuePer100g: '0.8', unit: 'g', status: 'Confirmado', sourceReference: 'Laboratório de Bromatologia' },
      { component: 'Carboidratos Disponíveis', valuePer100g: '11.5', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Fibra Alimentar Total', valuePer100g: '3.4', unit: 'g', status: 'Confirmado', sourceReference: 'Tabela TACO / UNICAMP' },
      { component: 'Cálcio', valuePer100g: '24.0', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' },
      { component: 'Ferro', valuePer100g: '0.9', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' },
      { component: 'Fósforo', valuePer100g: '18.0', unit: 'mg', status: 'Confirmado', sourceReference: 'Laboratório de Alimentos INPA' }
    ]);
  };

  // Funções de manipulação de Fatores de Estabilidade
  const handleAddStabilityFactor = () => {
    setFruitStabilityFactors(prev => [
      ...prev,
      {
        factor: 'Temperatura',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Acima de 40°C',
        impactDescription: 'Degradação acelerada dos compostos bioativos sob ação do calor.'
      }
    ]);
  };

  const handleUpdateStabilityFactor = (index: number, field: keyof StabilityFactor, value: any) => {
    setFruitStabilityFactors(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveStabilityFactor = (index: number) => {
    setFruitStabilityFactors(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoadDefaultStabilityFactors = () => {
    setFruitStabilityFactors([
      {
        factor: 'Temperatura',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Acima de 45°C em meio aeróbio',
        impactDescription: 'Acelera a clivagem oxidativa de compostos termolábeis e desnaturação de bioativos hidrossolúveis.'
      },
      {
        factor: 'Oxigênio / Atmosfera',
        sensitivityLevel: 'Muito Alta',
        criticalThreshold: 'Contato com ar atmosférico livre',
        impactDescription: 'Oxidação rápida catalisada por enzimas endógenas (polifenoloxidase, peroxidase ou ascorbato oxidase).'
      },
      {
        factor: 'Radiação Luminosa (UV)',
        sensitivityLevel: 'Alta',
        criticalThreshold: 'Luz visível e UV direta',
        impactDescription: 'Foto-oxidação catalisada por luz, induzindo cis-trans isomerização e fotodegradação.'
      },
      {
        factor: 'pH do Meio',
        sensitivityLevel: 'Moderada',
        criticalThreshold: 'Variações além da faixa ácida ótima',
        impactDescription: 'Deslocamento de equilíbrios iônicos tautoméricos com desestabilização da estrutura molecular.'
      }
    ]);
  };

  const handleSaveFruit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFruitFormError(null);
    setIsSubmittingFruit(true);

    try {
      const synArray = fruitSynonyms.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const photoArray = fruitPhotoUrl.trim() ? [{
        url: fruitPhotoUrl.trim(),
        caption: fruitPhotoCaption.trim() || `Espécime botânico de ${fruitPopularName}`,
        authorOrProvenance: fruitPhotoProvenance.trim() || 'Laboratório de Botânica Aplicada'
      }] : (editingFruit?.authorizedPhotographs || []);

      const mappedRefs = fruitSelectedRefs.map(refId => {
        const found = references.find(r => r.id === refId);
        if (found) {
          return {
            id: found.id,
            title: found.title,
            authors: found.authors,
            journal: found.journal,
            year: found.year,
            doi: found.doi
          };
        }
        return null;
      }).filter(Boolean) as any[];

      const harvestPracticesArray = fruitHarvestBestPractices
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const fruitData: FruitSpecies = {
        id: editingFruit ? editingFruit.id : fruitId.trim().toLowerCase().replace(/\s+/g, '-'),
        popularName: fruitPopularName.trim(),
        scientificName: fruitScientificName.trim(),
        family: fruitFamily.trim(),
        botanicalSynonyms: synArray,
        description: fruitDescription.trim(),
        morphology: fruitMorphology.trim() || 'Morfologia padronizada documentada conforme literatura botânica de referência.',
        habitat: fruitHabitat.trim() || 'Ecossistemas fluviais e florestas de terra firme da bacia amazônica.',
        harvestPeriod: fruitHarvestPeriod.trim() || 'Safra sazonal documentada.',
        bioactiveCompounds: fruitBioactiveCompounds,
        nutritionalInfo: fruitNutritionalInfo,
        stabilityFactors: fruitStabilityFactors,
        conservationGuidelines: {
          harvestBestPractices: harvestPracticesArray.length > 0 ? harvestPracticesArray : ['Colheita manual em ponto ótimo de maturação fisiológica.'],
          idealStorageCondition: fruitIdealStorage.trim() || 'Refrigeração protegida de radiação luminosa.',
          packagingRecommendation: fruitPackaging.trim() || 'Embalagem de barreira a oxigênio selada.',
          shelfLifeEstimate: fruitShelfLife.trim() || 'Conforme parâmetros de atividade de água e cadeia de frio.'
        },
        scientificReferences: mappedRefs.length > 0 ? mappedRefs : (editingFruit?.scientificReferences || []),
        authorizedPhotographs: photoArray,
        updatedAt: new Date().toLocaleDateString('pt-BR'),
        publicationStatus: fruitPubStatus
      };

      if (editingFruit) {
        await fruitStorageService.update(fruitData, currentUser);
        showNotice('success', `Espécie "${fruitData.popularName}" atualizada com sucesso com todos os parâmetros completos.`);
      } else {
        await fruitStorageService.create(fruitData, currentUser);
        showNotice('success', `Espécie "${fruitData.popularName}" cadastrada com sucesso com todos os dados fitoquímicos e nutricionais completos.`);
      }

      setIsFruitModalOpen(false);
    } catch (err: any) {
      setFruitFormError(err.message || 'Erro ao salvar informações da espécie.');
    } finally {
      setIsSubmittingFruit(false);
    }
  };

  const handleFruitQuickStatus = async (f: FruitSpecies, newStatus: 'Publicado e Validado' | 'Em Revisão por Pares' | 'Pendente de Verificação') => {
    try {
      await fruitStorageService.update({
        ...f,
        publicationStatus: newStatus
      }, currentUser);
      showNotice('success', `Estado de publicação de "${f.popularName}" alterado para ${newStatus}.`);
    } catch (err: any) {
      showNotice('error', err.message || 'Falha ao alterar estado de publicação.');
    }
  };

  const handleDeleteFruit = (f: FruitSpecies) => {
    triggerConfirmDelete(
      `Excluir Espécie "${f.popularName}"?`,
      `Esta ação removerá permanentemente a ficha taxonômica de ${f.scientificName} (${f.popularName}) do banco de dados fitoquímico. Apenas o administrador curador pode executar esta ação.`,
      async () => {
        await fruitStorageService.delete(f.id, currentUser);
        showNotice('success', `Espécie "${f.popularName}" excluída permanentemente.`);
      }
    );
  };

  // =========================================================================
  // 2. GERENCIAMENTO DE CONTEÚDOS EDUCATIVOS (BIOQUÍMICA)
  // =========================================================================
  const [topicSearch, setTopicSearch] = useState('');
  const [topicCategoryFilter, setTopicCategoryFilter] = useState<string>('all');
  const [topicStatusFilter, setTopicStatusFilter] = useState<string>('all');
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<BiochemistryTopic | null>(null);
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [topicFormError, setTopicFormError] = useState<string | null>(null);

  const [topicId, setTopicId] = useState('');
  const [topicOrder, setTopicOrder] = useState<number>(1);
  const [topicCategory, setTopicCategory] = useState<TopicCategory>('Fundamentos Moleculares');
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSummary, setTopicSummary] = useState('');
  const [topicIntro, setTopicIntro] = useState('');
  const [topicAccessible, setTopicAccessible] = useState('');
  const [topicScientificDetail, setTopicScientificDetail] = useState('');
  const [topicRelevance, setTopicRelevance] = useState('');
  const [topicLimitations, setTopicLimitations] = useState('');
  const [topicFruitExamples, setTopicFruitExamples] = useState<BiochemistryFruitExample[]>([]);
  const [topicRelatedIds, setTopicRelatedIds] = useState<string[]>([]);
  const [topicSelectedRefs, setTopicSelectedRefs] = useState<string[]>([]);
  const [topicStatus, setTopicStatus] = useState<'Validado por Literatura Indexada' | 'Em Revisão por Pares' | 'Pendente de Verificação'>('Validado por Literatura Indexada');

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      if (topicSearch.trim()) {
        const term = topicSearch.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(term);
        const matchSummary = t.shortSummary.toLowerCase().includes(term);
        if (!matchTitle && !matchSummary) return false;
      }
      if (topicCategoryFilter !== 'all' && t.category !== topicCategoryFilter) return false;
      if (topicStatusFilter !== 'all') {
        if (topicStatusFilter === 'publicado' && t.verificationStatus !== 'Validado por Literatura Indexada' && (t.verificationStatus as string) !== 'publicado') return false;
        if (topicStatusFilter === 'em_revisao' && t.verificationStatus !== 'Em Revisão por Pares' && (t.verificationStatus as string) !== 'em_revisao') return false;
        if (topicStatusFilter === 'rascunho' && t.verificationStatus !== 'Pendente de Verificação' && (t.verificationStatus as string) !== 'rascunho') return false;
      }
      return true;
    });
  }, [topics, topicSearch, topicCategoryFilter, topicStatusFilter]);

  const handleOpenCreateTopic = () => {
    setEditingTopic(null);
    setTopicId('');
    setTopicOrder(topics.length + 1);
    setTopicCategory('Fundamentos Moleculares');
    setTopicTitle('');
    setTopicSummary('');
    setTopicIntro('');
    setTopicAccessible('');
    setTopicScientificDetail('');
    setTopicRelevance('');
    setTopicLimitations('');
    setTopicFruitExamples([]);
    setTopicRelatedIds([]);
    setTopicSelectedRefs([]);
    setTopicStatus('Em Revisão por Pares');
    setTopicFormError(null);
    setIsTopicModalOpen(true);
  };

  const handleOpenEditTopic = (t: BiochemistryTopic) => {
    setEditingTopic(t);
    setTopicId(t.id);
    setTopicOrder(t.order);
    setTopicCategory(t.category);
    setTopicTitle(t.title);
    setTopicSummary(t.shortSummary || t.introduction || '');
    setTopicIntro(t.introduction || t.shortSummary || '');
    setTopicAccessible(t.accessibleExplanation);
    setTopicScientificDetail(t.scientificDetail);
    setTopicRelevance(t.experimentalRelevance);
    setTopicLimitations(t.scientificLimitations);
    setTopicFruitExamples(t.fruitExamples ? JSON.parse(JSON.stringify(t.fruitExamples)) : []);
    setTopicRelatedIds(t.relatedTopicIds ? [...t.relatedTopicIds] : []);
    setTopicSelectedRefs([]);
    setTopicStatus(t.verificationStatus as any || 'Validado por Literatura Indexada');
    setTopicFormError(null);
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopicFormError(null);
    setIsSubmittingTopic(true);

    try {
      const mappedRefs = topicSelectedRefs.map(refId => {
        const found = references.find(r => r.id === refId);
        if (found) {
          return {
            title: found.title,
            authors: found.authors,
            journal: found.journal,
            year: found.year,
            doi: found.doi
          };
        }
        return null;
      }).filter(Boolean) as any[];

      const finalIntro = topicIntro.trim() || topicSummary.trim() || `Fundamentos conceituais e bioquímicos de ${topicTitle.trim()} na biodiversidade amazônica.`;
      const finalSummary = topicSummary.trim() || topicIntro.trim() || `Estudo bioquímico sobre ${topicTitle.trim()}.`;

      const topicData: BiochemistryTopic = {
        id: editingTopic ? editingTopic.id : topicId.trim().toLowerCase().replace(/\s+/g, '-'),
        order: Number(topicOrder),
        category: topicCategory,
        title: topicTitle.trim(),
        shortSummary: finalSummary,
        introduction: finalIntro,
        accessibleExplanation: topicAccessible.trim(),
        scientificDetail: topicScientificDetail.trim(),
        fruitExamples: topicFruitExamples,
        experimentalRelevance: topicRelevance.trim(),
        scientificLimitations: topicLimitations.trim(),
        relatedTopicIds: topicRelatedIds,
        references: mappedRefs.length > 0 ? mappedRefs : (editingTopic?.references || []),
        updatedAt: new Date().toLocaleDateString('pt-BR'),
        verificationStatus: topicStatus
      };

      if (editingTopic) {
        await topicStorageService.update(topicData, currentUser);
        showNotice('success', `Tópico educativo "${topicData.title}" atualizado com sucesso.`);
      } else {
        await topicStorageService.create(topicData, currentUser);
        showNotice('success', `Tópico educativo "${topicData.title}" cadastrado com sucesso.`);
      }

      setIsTopicModalOpen(false);
    } catch (err: any) {
      setTopicFormError(err.message || 'Erro ao salvar conteúdo educativo.');
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const handleTopicQuickStatus = async (t: BiochemistryTopic, newStatus: 'Validado por Literatura Indexada' | 'Em Revisão por Pares' | 'Pendente de Verificação') => {
    try {
      await topicStorageService.update({
        ...t,
        verificationStatus: newStatus
      }, currentUser);
      showNotice('success', `Status do conteúdo "${t.title}" alterado para ${newStatus}.`);
    } catch (err: any) {
      showNotice('error', err.message || 'Falha ao alterar status de publicação.');
    }
  };

  const handleDeleteTopic = (t: BiochemistryTopic) => {
    triggerConfirmDelete(
      `Excluir Conteúdo Educativo "${t.title}"?`,
      `Esta ação removerá este módulo explicativo da base de dados.`,
      async () => {
        await topicStorageService.delete(t.id, currentUser);
        showNotice('success', `Conteúdo "${t.title}" excluído.`);
      }
    );
  };

  // =========================================================================
  // 3. GERENCIAMENTO DE REGISTROS EXPERIMENTAIS (BANCADA)
  // =========================================================================
  const [expTypeFilter, setExpTypeFilter] = useState<'all' | ExperimentType>('all');
  const [expStatusFilter, setExpStatusFilter] = useState<'all' | ExperimentRecordStatus>('all');
  const [expSearch, setExpSearch] = useState('');
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<UnifiedExperimentRecord | null>(null);
  const [isSubmittingExp, setIsSubmittingExp] = useState(false);
  const [expFormError, setExpFormError] = useState<string | null>(null);

  const [expId, setExpId] = useState('');
  const [expType, setExpType] = useState<ExperimentType>('vitamina-c');
  const [expFruitOrSample, setExpFruitOrSample] = useState('');
  const [expSampleCode, setExpSampleCode] = useState('');
  const [expCondition, setExpCondition] = useState('');
  const [expDateTime, setExpDateTime] = useState('');
  const [expMethod, setExpMethod] = useState('');
  const [expUnits, setExpUnits] = useState('');
  const [expObservations, setExpObservations] = useState('');
  const [expInterpretation, setExpInterpretation] = useState('');
  const [expPhotoUrl, setExpPhotoUrl] = useState('');
  const [expAnalyst, setExpAnalyst] = useState('');
  const [expStatus, setExpStatus] = useState<ExperimentRecordStatus>('rascunho');
  const [expDataSource, setExpDataSource] = useState<ExperimentDataSource>('cientifico_real');

  const [vitCVolume, setVitCVolume] = useState('5.0');
  const [vitCDrops, setVitCDrops] = useState('18');
  const [enzScore, setEnzScore] = useState('2');
  const [enzElapsed, setEnzElapsed] = useState('60');
  const [phVal, setPhVal] = useState('3.2');
  const [phColor, setPhColor] = useState('Vermelho Vivo / Flavílio');
  const [phHex, setPhHex] = useState('#e11d48');

  const filteredExperiments = useMemo(() => {
    return experiments.filter(e => {
      if (expTypeFilter !== 'all' && e.experimentType !== expTypeFilter) return false;
      if (expStatusFilter !== 'all' && e.status !== expStatusFilter) return false;
      if (expSearch.trim()) {
        const term = expSearch.toLowerCase();
        const matchCode = e.sampleCode.toLowerCase().includes(term);
        const matchSample = e.fruitOrSample.toLowerCase().includes(term);
        const matchCond = e.experimentalCondition.toLowerCase().includes(term);
        if (!matchCode && !matchSample && !matchCond) return false;
      }
      return true;
    });
  }, [experiments, expTypeFilter, expStatusFilter, expSearch]);

  const handleOpenCreateExp = () => {
    setEditingExp(null);
    setExpId(`exp-${Date.now()}`);
    setExpType('vitamina-c');
    setExpFruitOrSample('Camu-camu (Myrciaria dubia)');
    setExpSampleCode(`CAMU-${Math.floor(100 + Math.random() * 900)}`);
    setExpCondition('Fresco (Polpa recém-despolpada)');
    setExpDateTime(new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setExpMethod('Titulação iodométrica semi-quantitativa');
    setExpUnits('gotas de I₂ em 5,0 mL de extrato');
    setExpObservations('Amostra límpida, coloração vermelha característica.');
    setExpInterpretation('Preservação integral da lactona do ácido L-ascórbico.');
    setExpPhotoUrl('https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80');
    setExpAnalyst(currentUser?.displayName || 'Pesquisador de Bancada');
    setExpStatus('em_revisao');
    setExpDataSource('cientifico_real');
    setVitCVolume('5.0');
    setVitCDrops('22');
    setExpFormError(null);
    setIsExpModalOpen(true);
  };

  const handleOpenEditExp = (e: UnifiedExperimentRecord) => {
    setEditingExp(e);
    setExpId(e.id);
    setExpType(e.experimentType);
    setExpFruitOrSample(e.fruitOrSample);
    setExpSampleCode(e.sampleCode);
    setExpCondition(e.experimentalCondition);
    setExpDateTime(e.dateTime);
    setExpMethod(e.methodUsed);
    setExpUnits(e.units);
    setExpObservations(e.observations);
    setExpInterpretation(e.scientificInterpretation || '');
    setExpPhotoUrl(e.photoUrl || '');
    setExpAnalyst(e.responsibleName || '');
    setExpStatus(e.status);
    setExpDataSource(e.dataSource || 'cientifico_real');

    if (e.measuredValues) {
      if (e.experimentType === 'vitamina-c') {
        setVitCVolume(String(e.measuredValues.sampleVolumeMl || '5.0'));
        setVitCDrops(String(e.measuredValues.iodineDropsCount || '15'));
      } else if (e.experimentType === 'oxidacao-enzimatica') {
        setEnzScore(String(e.measuredValues.browningScore ?? '2'));
        setEnzElapsed(String(e.measuredValues.elapsedMinutes ?? '60'));
      } else if (e.experimentType === 'ph-antocianinas') {
        setPhVal(String(e.measuredValues.measuredPH ?? '3.5'));
        setPhColor(e.measuredValues.observedColor || 'Vermelho Intenso');
        setPhHex(e.measuredValues.colorHex || '#e11d48');
      }
    }

    setExpFormError(null);
    setIsExpModalOpen(true);
  };

  const handleSaveExp = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpFormError(null);
    setIsSubmittingExp(true);

    try {
      let measuredValues: Record<string, any> = {};

      if (expType === 'vitamina-c') {
        measuredValues = {
          sampleVolumeMl: Number(vitCVolume),
          starchIndicatorVolumeMl: 1.0,
          iodineDropsCount: Number(vitCDrops),
          estimatedVolumeIodineMl: Number(vitCDrops) * 0.05,
          triplicateIndex: 1
        };
      } else if (expType === 'oxidacao-enzimatica') {
        measuredValues = {
          elapsedMinutes: Number(enzElapsed),
          browningScore: Number(enzScore),
          observationTime: expDateTime.split(' ')[1] || '10:00'
        };
      } else if (expType === 'ph-antocianinas') {
        measuredValues = {
          measuredPH: Number(phVal),
          measurementMethod: 'pHmetro de Bancada Calibrado',
          observedColor: phColor,
          colorHex: phHex,
          dominantChemicalSpecies: Number(phVal) < 4 ? 'Cátion Flavílio (Estável)' : 'Base Quinoidal Anódica'
        };
      }

      const expData: Omit<UnifiedExperimentRecord, 'createdAt' | 'updatedAt'> = {
        id: expId,
        experimentType: expType,
        fruitOrSample: expFruitOrSample.trim(),
        sampleCode: expSampleCode.trim().toUpperCase(),
        experimentalCondition: expCondition.trim(),
        dateTime: expDateTime.trim(),
        methodUsed: expMethod.trim(),
        units: expUnits.trim(),
        measuredValues,
        observations: expObservations.trim(),
        scientificInterpretation: expInterpretation.trim() || undefined,
        photoUrl: expPhotoUrl.trim() || undefined,
        responsibleName: expAnalyst.trim() || currentUser?.displayName,
        status: expStatus,
        dataSource: expDataSource,
        authorUid: currentUser?.uid || 'researcher-local',
        authorEmail: currentUser?.email
      };

      if (editingExp) {
        await experimentStorageService.update({
          ...editingExp,
          ...expData,
          createdAt: editingExp.createdAt,
          updatedAt: new Date().toISOString()
        }, currentUser);
        showNotice('success', `Registro experimental ${expData.sampleCode} atualizado com sucesso.`);
      } else {
        await experimentStorageService.create(expData, currentUser);
        showNotice('success', `Novo ensaio de bancada ${expData.sampleCode} registrado no banco.`);
      }

      setIsExpModalOpen(false);
    } catch (err: any) {
      setExpFormError(err.message || 'Falha ao registrar dados do experimento.');
    } finally {
      setIsSubmittingExp(false);
    }
  };

  const handleQuickExpStatus = async (exp: UnifiedExperimentRecord, newStatus: ExperimentRecordStatus) => {
    try {
      await experimentStorageService.update({
        ...exp,
        status: newStatus
      }, currentUser);
      showNotice('success', `Status do ensaio ${exp.sampleCode} alterado para "${newStatus.replace('_', ' ')}".`);
    } catch (err: any) {
      showNotice('error', err.message || 'Ação não autorizada pelo controle de acesso.');
    }
  };

  const handleDeleteExp = (exp: UnifiedExperimentRecord) => {
    triggerConfirmDelete(
      `Excluir Ensaio ${exp.sampleCode}?`,
      `Você está prestes a remover o registro analítico "${exp.sampleCode}". Essa ação não pode ser desfeita.`,
      async () => {
        await experimentStorageService.delete(exp.id, currentUser);
        showNotice('success', `Registro ${exp.sampleCode} removido com sucesso.`);
      }
    );
  };

  // =========================================================================
  // 4. GERENCIAMENTO DE REFERÊNCIAS
  // =========================================================================
  const [refSearchFilter, setRefSearchFilter] = useState('');
  const [refStatusFilter, setRefStatusFilter] = useState('all');
  const [refFruitFilter, setRefFruitFilter] = useState('all');
  const [isRefModalOpen, setIsRefModalOpen] = useState(false);
  const [editingRef, setEditingRef] = useState<ScientificReference | null>(null);
  const [isRefSubmitting, setIsRefSubmitting] = useState(false);
  const [refFormError, setRefFormError] = useState<string | null>(null);

  const [refFormTitle, setRefFormTitle] = useState('');
  const [refFormAuthors, setRefFormAuthors] = useState('');
  const [refFormJournal, setRefFormJournal] = useState('');
  const [refFormYear, setRefFormYear] = useState<number>(new Date().getFullYear());
  const [refFormVolume, setRefFormVolume] = useState('');
  const [refFormDoi, setRefFormDoi] = useState('');
  const [refFormUrl, setRefFormUrl] = useState('');
  const [refFormPubType, setRefFormPubType] = useState<PublicationType>('Artigo Científico em Periódico Indexado');
  const [refFormFruitFocus, setRefFormFruitFocus] = useState('Camu-camu');
  const [refFormFruits, setRefFormFruits] = useState<string[]>(['camu-camu']);
  const [refFormExperiments, setRefFormExperiments] = useState<('vitamina-c' | 'oxidacao-enzimatica' | 'ph-antocianinas')[]>([]);
  const [refFormContents, setRefFormContents] = useState('vitamina-c, antioxidantes');
  const [refFormAbstract, setRefFormAbstract] = useState('');
  const [refFormKeywords, setRefFormKeywords] = useState('');
  const [refFormStatus, setRefFormStatus] = useState<ReferenceVerificationStatus>('Validada por Literatura Indexada');

  const filteredReferences = useMemo(() => {
    return references.filter(r => {
      if (refSearchFilter.trim()) {
        const term = refSearchFilter.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(term);
        const matchAuthors = r.authors.toLowerCase().includes(term);
        const matchJournal = r.journal.toLowerCase().includes(term);
        const matchDoi = (r.doi || '').toLowerCase().includes(term);
        if (!matchTitle && !matchAuthors && !matchJournal && !matchDoi) return false;
      }
      if (refStatusFilter !== 'all' && r.verificationStatus !== refStatusFilter) return false;
      if (refFruitFilter !== 'all' && !r.relatedFruits.includes(refFruitFilter)) return false;
      return true;
    });
  }, [references, refSearchFilter, refStatusFilter, refFruitFilter]);

  const handleOpenRefCreate = () => {
    setEditingRef(null);
    setRefFormTitle('');
    setRefFormAuthors('');
    setRefFormJournal('');
    setRefFormYear(new Date().getFullYear());
    setRefFormVolume('');
    setRefFormDoi('');
    setRefFormUrl('');
    setRefFormPubType('Artigo Científico em Periódico Indexado');
    setRefFormFruitFocus('Camu-camu');
    setRefFormFruits(['camu-camu']);
    setRefFormExperiments([]);
    setRefFormContents('vitamina-c, antioxidantes');
    setRefFormAbstract('');
    setRefFormKeywords('');
    setRefFormStatus('Validada por Literatura Indexada');
    setRefFormError(null);
    setIsRefModalOpen(true);
  };

  const handleOpenRefEdit = (r: ScientificReference) => {
    setEditingRef(r);
    setRefFormTitle(r.title);
    setRefFormAuthors(r.authors);
    setRefFormJournal(r.journal);
    setRefFormYear(r.year);
    setRefFormVolume(r.volumeAndPages || '');
    setRefFormDoi(r.doi || '');
    setRefFormUrl(r.url || '');
    setRefFormPubType(r.publicationType);
    setRefFormFruitFocus(r.fruitFocus);
    setRefFormFruits(r.relatedFruits || []);
    setRefFormExperiments(r.relatedExperiments || []);
    setRefFormContents((r.relatedContents || []).join(', '));
    setRefFormAbstract(r.abstract || '');
    setRefFormKeywords((r.keywords || []).join(', '));
    setRefFormStatus(r.verificationStatus);
    setRefFormError(null);
    setIsRefModalOpen(true);
  };

  const handleRefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefFormError(null);
    setIsRefSubmitting(true);

    try {
      const contentsArray = refFormContents.split(',').map(c => c.trim().toLowerCase()).filter(c => c.length > 0);
      const keywordsArray = refFormKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);

      const refData: ScientificReference = {
        id: editingRef ? editingRef.id : `ref-${Date.now()}`,
        title: refFormTitle.trim(),
        authors: refFormAuthors.trim(),
        journal: refFormJournal.trim(),
        year: Number(refFormYear),
        volumeAndPages: refFormVolume.trim() || undefined,
        doi: refFormDoi.trim() || undefined,
        url: refFormUrl.trim() || (refFormDoi.trim() ? `https://doi.org/${refFormDoi.trim()}` : undefined),
        publicationType: refFormPubType,
        fruitFocus: refFormFruitFocus,
        relatedFruits: refFormFruits,
        relatedExperiments: refFormExperiments,
        relatedContents: contentsArray,
        abstract: refFormAbstract.trim() || undefined,
        keywords: keywordsArray,
        verificationStatus: refFormStatus,
        createdAt: editingRef?.createdAt || new Date().toISOString()
      };

      if (editingRef) {
        await referenceStorageService.update(refData, currentUser);
        showNotice('success', `Referência "${refData.title.slice(0, 40)}..." atualizada com sucesso.`);
      } else {
        await referenceStorageService.create(refData, currentUser);
        showNotice('success', `Referência cadastrada no acervo oficial.`);
      }

      setIsRefModalOpen(false);
    } catch (err: any) {
      setRefFormError(err.message || 'Erro ao salvar referência.');
    } finally {
      setIsRefSubmitting(false);
    }
  };

  const handleToggleRefStatus = async (r: ScientificReference, newStatus: ReferenceVerificationStatus) => {
    try {
      await referenceStorageService.update({
        ...r,
        verificationStatus: newStatus
      }, currentUser);
      showNotice('success', `Status de verificação alterado para: ${newStatus}`);
    } catch (err: any) {
      showNotice('error', err.message || 'Falha ao alterar estado de verificação.');
    }
  };

  const handleDeleteRef = (r: ScientificReference) => {
    triggerConfirmDelete(
      `Excluir Referência Científica?`,
      `Você está prestes a excluir "${r.title}".`,
      async () => {
        await referenceStorageService.delete(r.id, currentUser);
        showNotice('success', 'Referência científica excluída.');
      }
    );
  };

  // =========================================================================
  // 5. GUIA DE CONSERVAÇÃO
  // =========================================================================
  const [guideSearchFilter, setGuideSearchFilter] = useState('');
  const [guideFruitFilter, setGuideFruitFilter] = useState('all');
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<ConservationGuideline | null>(null);
  const [isGuideSubmitting, setIsGuideSubmitting] = useState(false);
  const [guideFormError, setGuideFormError] = useState<string | null>(null);

  const [guideFruitId, setGuideFruitId] = useState<string>('camu-camu');
  const [guideStorageCondition, setGuideStorageCondition] = useState('');
  const [guideRecommendation, setGuideRecommendation] = useState('');
  const [guideCompoundTarget, setGuideCompoundTarget] = useState('');
  const [guideSourceType, setGuideSourceType] = useState<ConservationSourceType>('Literatura Indexada');
  const [guideSourceCitation, setGuideSourceCitation] = useState('');
  const [guideSourceUrl, setGuideSourceUrl] = useState('');
  const [guideRelatedRefId, setGuideRelatedRefId] = useState('');
  const [guideLimitations, setGuideLimitations] = useState('');

  const filteredGuidelines = useMemo(() => {
    return guidelines.filter(g => {
      if (guideSearchFilter.trim()) {
        const term = guideSearchFilter.toLowerCase();
        const matchFruit = g.fruitCommonName.toLowerCase().includes(term) || g.scientificName.toLowerCase().includes(term);
        const matchRec = g.recommendation.toLowerCase().includes(term);
        const matchCond = g.storageCondition.toLowerCase().includes(term);
        if (!matchFruit && !matchRec && !matchCond) return false;
      }
      if (guideFruitFilter !== 'all' && g.fruitId !== guideFruitFilter) return false;
      return true;
    });
  }, [guidelines, guideSearchFilter, guideFruitFilter]);

  const handleOpenGuideCreate = () => {
    setEditingGuide(null);
    setGuideFruitId(fruits[0]?.id || 'camu-camu');
    setGuideStorageCondition('Congelamento a -18°C em atmosfera anaeróbia');
    setGuideRecommendation('Armazenar a polpa integral em recipientes herméticos opacos com barreira contra luz UV.');
    setGuideCompoundTarget('Ácido L-Ascórbico (Vitamina C)');
    setGuideSourceType('Literatura Indexada');
    setGuideSourceCitation('Manual Técnico Pós-Colheita EMBRAPA / INPA (2024)');
    setGuideSourceUrl('');
    setGuideRelatedRefId('');
    setGuideLimitations('Válido exclusivamente para polpas sem adição de conservantes químicos em cadeia contínua de frio.');
    setGuideFormError(null);
    setIsGuideModalOpen(true);
  };

  const handleOpenGuideEdit = (g: ConservationGuideline) => {
    setEditingGuide(g);
    setGuideFruitId(g.fruitId);
    setGuideStorageCondition(g.storageCondition);
    setGuideRecommendation(g.recommendation);
    setGuideCompoundTarget(g.compoundTarget);
    setGuideSourceType(g.sourceType);
    setGuideSourceCitation(g.sourceCitation);
    setGuideSourceUrl(g.sourceUrl || '');
    setGuideRelatedRefId(g.relatedReferenceId || '');
    setGuideLimitations(g.applicationLimitations);
    setGuideFormError(null);
    setIsGuideModalOpen(true);
  };

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuideFormError(null);
    setIsGuideSubmitting(true);

    const selectedFruit = fruits.find(f => f.id.toLowerCase() === guideFruitId.toLowerCase());
    const common = selectedFruit ? selectedFruit.popularName : (guideFruitId || 'Fruto Amazônico');
    const scientific = selectedFruit ? selectedFruit.scientificName : '';

    try {
      const gData: ConservationGuideline = {
        id: editingGuide ? editingGuide.id : `guide-${Date.now()}`,
        fruitId: guideFruitId,
        fruitCommonName: common,
        scientificName: scientific,
        storageCondition: guideStorageCondition.trim(),
        recommendation: guideRecommendation.trim(),
        compoundTarget: guideCompoundTarget.trim(),
        sourceType: guideSourceType,
        sourceCitation: guideSourceCitation.trim(),
        sourceUrl: guideSourceUrl.trim() || undefined,
        relatedReferenceId: guideRelatedRefId || undefined,
        updatedAt: new Date().toLocaleDateString('pt-BR'),
        applicationLimitations: guideLimitations.trim()
      };

      if (editingGuide) {
        await conservationStorageService.update(gData, currentUser);
        showNotice('success', `Diretriz de conservação para ${gData.fruitCommonName} atualizada.`);
      } else {
        await conservationStorageService.create(gData, currentUser);
        showNotice('success', `Nova diretriz de conservação publicada no guia digital.`);
      }

      setIsGuideModalOpen(false);
    } catch (err: any) {
      setGuideFormError(err.message || 'Erro ao salvar diretriz de conservação.');
    } finally {
      setIsGuideSubmitting(false);
    }
  };

  const handleDeleteGuide = (g: ConservationGuideline) => {
    triggerConfirmDelete(
      `Excluir Diretriz de ${g.fruitCommonName}?`,
      `Você removerá esta recomendação pós-colheita do Guia Digital público.`,
      async () => {
        await conservationStorageService.delete(g.id, currentUser);
        showNotice('success', 'Diretriz de conservação removida.');
      }
    );
  };

  // =========================================================================
  // 6. LOTES DE AMOSTRAS DE BANCADA
  // =========================================================================
  const [batches, setBatches] = useState<SampleBatch[]>([
    {
      id: 'b-01',
      batchCode: 'LOTE-AM-2026-089',
      species: 'Myrciaria dubia (Camu-camu)',
      harvestLocation: 'Rio Negro / Barcelos - AM',
      receivedDate: '12/10/2026',
      status: 'Concluído',
      analyst: 'Dra. M. Siqueira'
    },
    {
      id: 'b-02',
      batchCode: 'LOTE-PA-2026-104',
      species: 'Euterpe precatoria (Açaí-do-Amazonas)',
      harvestLocation: 'Tefé - AM',
      receivedDate: '14/10/2026',
      status: 'Em Análise',
      analyst: 'MSc. T. Guimarães'
    },
    {
      id: 'b-03',
      batchCode: 'LOTE-RR-2026-042',
      species: 'Mauritia flexuosa (Buriti)',
      harvestLocation: 'Cantá - RR',
      receivedDate: '15/10/2026',
      status: 'Em Análise',
      analyst: 'Dr. R. Peixoto'
    },
    {
      id: 'b-04',
      batchCode: 'LOTE-AM-2026-077',
      species: 'Astrocaryum aculeatum (Tucumã)',
      harvestLocation: 'Manacapuru - AM',
      receivedDate: '16/10/2026',
      status: 'Concluído',
      analyst: 'Bioquímico J. Alencar'
    },
    {
      id: 'b-05',
      batchCode: 'LOTE-AM-2026-093',
      species: 'Solanum sessiliflorum (Cubiu)',
      harvestLocation: 'São Gabriel da Cachoeira - AM',
      receivedDate: '16/10/2026',
      status: 'Em Quarentena',
      analyst: 'Dra. K. Yuyama'
    }
  ]);

  const [batchSearch, setBatchSearch] = useState('');
  const [newCommonName, setNewCommonName] = useState('');
  const [newScientificName, setNewScientificName] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newAnalyst, setNewAnalyst] = useState('');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommonName || !newScientificName) return;

    const newBatch: SampleBatch = {
      id: `b-${Date.now()}`,
      batchCode: `LOTE-AMB-2026-${Math.floor(100 + Math.random() * 900)}`,
      species: `${newScientificName} (${newCommonName})`,
      harvestLocation: newOrigin || 'Bacia Amazônica Central',
      receivedDate: new Date().toLocaleDateString('pt-BR'),
      status: 'Em Análise',
      analyst: newAnalyst || currentUser?.displayName || 'Pesquisador Responsável'
    };

    setBatches([newBatch, ...batches]);
    setIsBatchModalOpen(false);
    setNewCommonName('');
    setNewScientificName('');
    setNewOrigin('');
    setNewAnalyst('');
    showNotice('success', `Lote analítico ${newBatch.batchCode} registrado na recepção.`);
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "Tipo,Identificador,Nome,Status,Data\n" +
        fruits.map(f => `Fruto,${f.id},"${f.popularName}",${f.publicationStatus},${f.updatedAt}`).join("\n") + "\n" +
        topics.map(t => `Topico,${t.id},"${t.title}",${t.verificationStatus},${t.updatedAt}`).join("\n") + "\n" +
        experiments.map(e => `Experimento,${e.sampleCode},"${e.fruitOrSample}",${e.status},${e.dateTime}`).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `bioamazonia_relatorio_geral_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      showNotice('success', 'Relatório geral exportado com sucesso.');
    }, 400);
  };

  // =========================================================================
  // BARREIRA DE SEGURANÇA RBAC (SE USUÁRIO NÃO FOR AUTORIZADO)
  // =========================================================================
  if (!isResearcher && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Área Restrita aos Pesquisadores &amp; Curadores
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            O painel de gerenciamento do BioAmazônia é protegido por regras de segurança no Firestore. Para cadastrar ou editar frutos, conteúdos educativos, referências e dados de bancada, é necessário possuir autorização prévia de <strong>Pesquisador de Bancada</strong> ou <strong>Administrador Curador</strong>.
          </p>
        </div>

        {/* Informação sobre o usuário atual */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-md mx-auto space-y-4 text-left">
          {currentUser ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-mono text-slate-400">Conta Autenticada</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  Visitante
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-900">{currentUser.displayName}</div>
                <div className="text-xs font-mono text-slate-500">{currentUser.email}</div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-900 leading-relaxed">
                <strong>Regra de Acesso:</strong> Somente o Administrador Curador pode cadastrar e autorizar um Pesquisador de Bancada. Para obter permissões de bancada, solicite à coordenação científica o cadastramento do seu e-mail institucional.
              </div>
              <button
                onClick={async () => {
                  await logout();
                  onLogout();
                  onNavigate('login');
                }}
                className="w-full py-2 px-3 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Desconectar / Entrar com Outra Conta
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <p className="text-xs text-slate-600">
                Você não está conectado. Acesse com sua conta Google institucional cadastrada:
              </p>
              <button
                onClick={loginWithGoogle}
                className="w-full py-2.5 px-4 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Entrar com Conta Google Institucional
              </button>
            </div>
          )}
        </div>

        <div>
          <button
            onClick={() => onNavigate('home')}
            className="text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors"
          >
            ← Retornar à Consulta Pública
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Cabeçalho da Área Administrativa */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Painel Administrativo &amp; Curadoria Científica
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Gestão Integrada BioAmazônia
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-mono">
            <span>Usuário: <strong className="text-slate-800">{currentUser?.displayName || currentUser?.email}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Instituição: <strong className="text-emerald-900 font-bold">{currentUser?.institution || 'Não informada'}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Permissão: <strong className={isAdmin ? 'text-purple-700' : 'text-emerald-700'}>{isAdmin ? 'Administrador Curador' : 'Pesquisador de Bancada'}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-800 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Firestore Conectado
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            {isExporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
          <button
            onClick={async () => {
              await logout();
              onLogout();
              onNavigate('login');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            Encerrar Sessão
          </button>
        </div>
      </div>

      {/* Banner de Feedback (Sucesso / Erro) */}
      {notice && (
        <div className={`p-3.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
          notice.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}>
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{notice.message}</span>
          </div>
          <button onClick={() => setNotice(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cartões Métricos das Coleções */}
      <div className={`grid gap-3 sm:gap-4 ${isAdmin ? 'grid-cols-2 sm:grid-cols-6' : 'grid-cols-2 sm:grid-cols-5'}`}>
        <div 
          onClick={() => setActiveTab('fruits')}
          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'fruits' ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Espécies de Frutos</span>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{fruits.length}</span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Catálogo taxonômico</span>
        </div>

        <div 
          onClick={() => setActiveTab('biochem')}
          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'biochem' ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Conteúdos Educativos</span>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{topics.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Tópicos fitoquímicos</span>
        </div>

        <div 
          onClick={() => setActiveTab('experiments')}
          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'experiments' ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Ensaios de Bancada</span>
          <span className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">{experiments.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Experimentos A, B e C</span>
        </div>

        <div 
          onClick={() => setActiveTab('references')}
          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'references' ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Referências Indexadas</span>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{references.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">DOIs e periódicos</span>
        </div>

        <div 
          onClick={() => setActiveTab('conservation')}
          className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
            activeTab === 'conservation' ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Guia de Conservação</span>
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{guidelines.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Diretrizes pós-colheita</span>
        </div>

        {isAdmin && (
          <div 
            onClick={() => setActiveTab('users')}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-purple-50/80 border-purple-600 ring-1 ring-purple-600' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">Pesquisadores</span>
            <span className="text-2xl font-bold font-mono text-purple-900 tabular-nums">{registeredUsers.length}</span>
            <span className="text-[10px] text-purple-600 block mt-0.5">Gestão de Permissões</span>
          </div>
        )}
      </div>

      {/* Menu Principal de Abas */}
      <div className="border-b border-slate-200 flex flex-wrap items-center gap-2 sm:gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('fruits')}
          className={`py-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'fruits'
              ? 'border-emerald-800 text-emerald-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Gerenciamento de Frutos ({fruits.length})
        </button>

        <button
          onClick={() => setActiveTab('biochem')}
          className={`py-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'biochem'
              ? 'border-emerald-800 text-emerald-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Conteúdos Educativos ({topics.length})
        </button>

        <button
          onClick={() => setActiveTab('experiments')}
          className={`py-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'experiments'
              ? 'border-emerald-800 text-emerald-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          Experimentos de Bancada ({experiments.length})
        </button>

        <button
          onClick={() => setActiveTab('references')}
          className={`py-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'references'
              ? 'border-emerald-800 text-emerald-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Referências Científicas ({references.length})
        </button>

        <button
          onClick={() => setActiveTab('conservation')}
          className={`py-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'conservation'
              ? 'border-emerald-800 text-emerald-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ThermometerSnowflake className="w-3.5 h-3.5" />
          Guia de Conservação ({guidelines.length})
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`py-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'batches'
              ? 'border-emerald-800 text-emerald-950 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Lotes de Amostras ({batches.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2.5 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-purple-700 text-purple-950 font-bold'
                : 'border-transparent text-purple-700 hover:text-purple-950'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Pesquisadores &amp; Acessos ({registeredUsers.length})
          </button>
        )}
      </div>

      {/* =====================================================================
          ABA EXCLUSIVA DO ADMIN: GESTÃO DE PESQUISADORES E PERMISSÕES
          ===================================================================== */}
      {isAdmin && activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-5 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-800 uppercase">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                Controle de Acesso — Somente o Administrador Pode Cadastrar
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                Cadastro e Homologação de Pesquisadores de Bancada
              </h2>
              <p className="text-xs text-slate-500">
                Gerencie quem possui permissão no banco de dados Firestore para registrar ensaios de bancada e editar espécies fitoquímicas.
              </p>
            </div>

            <button
              onClick={() => {
                setNewUserEmail('');
                setNewUserName('');
                setNewUserInstitution('');
                setNewUserRole('researcher');
                setUserFormError(null);
                setIsUserModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md transition-colors shrink-0 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Cadastrar Pesquisador de Bancada
            </button>
          </div>

          {/* Guia de Atribuições: O que faz o Pesquisador de Bancada */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase font-mono tracking-wide">
              <FlaskConical className="w-4 h-4 text-emerald-700" />
              Atribuições do Pesquisador de Bancada no Sistema
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  1. Ensaios Laboratoriais
                </div>
                <p className="text-[11px] leading-relaxed">
                  Insere e atualiza ensaios de bancada: Titulação de Vitamina C, Oxidação Enzimática e Estabilidade de Antocianinas por pH.
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  2. Curadoria e Fitoquímica
                </div>
                <p className="text-[11px] leading-relaxed">
                  Cadastra frutos, associa fotografias autorizadas, sugere diretrizes de conservação e anexa referências bibliográficas.
                </p>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-purple-900 text-[11px] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  3. Fluxo de Publicação e Restrições
                </div>
                <p className="text-[11px] leading-relaxed">
                  Salva em Rascunho ou submete para Revisão. <strong>Não pode</strong> excluir dados permanentemente nem cadastrar outros usuários.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase font-mono">
                  <th className="py-2.5 px-3">Pesquisador / Usuário</th>
                  <th className="py-2.5 px-3">E-mail Institucional</th>
                  <th className="py-2.5 px-3">Instituição / Laboratório</th>
                  <th className="py-2.5 px-3">Permissão Atual (Role)</th>
                  <th className="py-2.5 px-3">Data Cadastro</th>
                  <th className="py-2.5 px-3 text-right">Ações do Administrador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {registeredUsers.map((u) => {
                  const isMasterAdmin = isMasterAdminEmail(u.email);
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {u.displayName || 'Sem nome informado'}
                          {isMasterAdmin && (
                            <span className="text-[9px] bg-purple-100 text-purple-800 font-mono px-1.5 py-0.2 rounded font-semibold">
                              Admin Master
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">UID: {u.uid.slice(0, 16)}...</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-800">{u.email}</td>
                      <td className="py-3 px-3 text-slate-600">{u.institution || 'Não informada'}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : u.role === 'researcher'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <UserCheck className="w-3 h-3" />
                          {u.role === 'admin' ? 'Administrador Curador' : u.role === 'researcher' ? 'Pesquisador de Bancada' : 'Visitante'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {!isMasterAdmin && (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.role !== 'researcher' && (
                              <button
                                onClick={() => handleUpdateRole(u.uid, 'researcher', u.displayName)}
                                className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                                title="Promover a Pesquisador de Bancada"
                              >
                                Tornar Pesquisador
                              </button>
                            )}

                            {u.role !== 'visitor' && (
                              <button
                                onClick={() => handleUpdateRole(u.uid, 'visitor', u.displayName)}
                                className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                                title="Rebaixar para Visitante"
                              >
                                Tornar Visitante
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                              title="Editar Nome e Instituição"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteUserAccess(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Revogar Acesso"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 1: GERENCIAMENTO DE FRUTOS
          ===================================================================== */}
      {activeTab === 'fruits' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fruitSearch}
                  onChange={(e) => setFruitSearch(e.target.value)}
                  placeholder="Pesquisar por nome ou família..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
                />
              </div>

              <select
                value={fruitStatusFilter}
                onChange={(e) => setFruitStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="all">Todos os Estados</option>
                <option value="publicado">Publicado e Validado</option>
                <option value="em_revisao">Em Revisão por Pares</option>
                <option value="rascunho">Pendente de Verificação</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateFruit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Fruto
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase font-mono">
                  <th className="py-2.5 px-3">Espécie &amp; Taxonomia</th>
                  <th className="py-2.5 px-3">Família</th>
                  <th className="py-2.5 px-3">Fotografia</th>
                  <th className="py-2.5 px-3">Referências</th>
                  <th className="py-2.5 px-3">Última Revisão</th>
                  <th className="py-2.5 px-3">Publicação</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredFruits.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{f.popularName}</div>
                      <div className="text-[11px] italic text-slate-500 font-serif">{f.scientificName}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{f.family}</td>
                    <td className="py-3 px-3">
                      {f.authorizedPhotographs && f.authorizedPhotographs.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <img 
                            src={f.authorizedPhotographs[0].url} 
                            alt={f.popularName} 
                            className="w-8 h-8 rounded object-cover border border-slate-200" 
                          />
                          <span className="text-[10px] text-slate-500">{f.authorizedPhotographs.length} foto(s)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">Sem fotografia</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {f.scientificReferences ? `${f.scientificReferences.length} associada(s)` : '0'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{f.updatedAt}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        f.publicationStatus === 'Publicado e Validado' || (f.publicationStatus as string) === 'publicado'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : f.publicationStatus === 'Em Revisão por Pares' || (f.publicationStatus as string) === 'em_revisao'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {f.publicationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onNavigate('fruto', f.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                          title="Acessar Página Completa do Fruto"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-800" />
                          <span>Acessar Página Completa do Fruto</span>
                        </button>
                        {isAdmin && (f.publicationStatus !== 'Publicado e Validado' && (f.publicationStatus as string) !== 'publicado') && (
                          <button
                            onClick={() => handleFruitQuickStatus(f, 'Publicado e Validado')}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Aprovar e Publicar Oficialmente"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditFruit(f)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded transition-colors"
                          title="Editar Ficha da Espécie"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteFruit(f)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir Espécie (Apenas Administrador)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 2: CONTEÚDOS EDUCATIVOS (BIOQUÍMICA)
          ===================================================================== */}
      {activeTab === 'biochem' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Pesquisar assuntos..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
                />
              </div>

              <select
                value={topicCategoryFilter}
                onChange={(e) => setTopicCategoryFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="all">Todas as Categorias</option>
                <option value="Fundamentos Moleculares">Fundamentos Moleculares</option>
                <option value="Classes Fitoquímicas">Classes Fitoquímicas</option>
                <option value="Cinética & Estabilidade">Cinética & Estabilidade</option>
              </select>

              <select
                value={topicStatusFilter}
                onChange={(e) => setTopicStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="all">Todos os Estados</option>
                <option value="publicado">Validado por Literatura</option>
                <option value="em_revisao">Em Revisão por Pares</option>
                <option value="rascunho">Pendente de Verificação</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateTopic}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Assunto Educativo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase font-mono">
                  <th className="py-2.5 px-3">Ordem &amp; Título</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Biodiversidade em Foco</th>
                  <th className="py-2.5 px-3">Relacionados</th>
                  <th className="py-2.5 px-3">Resumo Acessível</th>
                  <th className="py-2.5 px-3">Referências</th>
                  <th className="py-2.5 px-3">Última Revisão</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTopics.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="font-mono text-xs text-slate-400">#{t.order}</span>
                        {t.title}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-emerald-800 font-mono text-[11px] whitespace-nowrap">{t.category}</td>
                    <td className="py-3 px-3">
                      {t.fruitExamples && t.fruitExamples.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {t.fruitExamples.map((fe, i) => (
                            <span key={i} className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                              {fe.fruitName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Sem espécies vinculadas</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {t.relatedTopicIds && t.relatedTopicIds.length > 0 ? (
                        <span className="text-emerald-800 font-semibold">{t.relatedTopicIds.length} tópicos</span>
                      ) : (
                        <span className="text-slate-400 italic">0</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={t.shortSummary}>
                      {t.shortSummary}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {t.references ? `${t.references.length} ref.` : '0'}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{t.updatedAt}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        t.verificationStatus === 'Validado por Literatura Indexada' || (t.verificationStatus as string) === 'publicado'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : t.verificationStatus === 'Em Revisão por Pares' || (t.verificationStatus as string) === 'em_revisao'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {t.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && (t.verificationStatus !== 'Validado por Literatura Indexada' && (t.verificationStatus as string) !== 'publicado') && (
                          <button
                            onClick={() => handleTopicQuickStatus(t, 'Validado por Literatura Indexada')}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Aprovar e Publicar no Portal"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditTopic(t)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded transition-colors"
                          title="Editar Conteúdo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteTopic(t)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir Conteúdo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 3: EXPERIMENTOS DE BANCADA
          ===================================================================== */}
      {activeTab === 'experiments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={expSearch}
                  onChange={(e) => setExpSearch(e.target.value)}
                  placeholder="Código, fruto ou condição..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
                />
              </div>

              <select
                value={expTypeFilter}
                onChange={(e) => setExpTypeFilter(e.target.value as any)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="all">Todos os Experimentos</option>
                <option value="vitamina-c">Exp A: Vitamina C (Titulação)</option>
                <option value="oxidacao-enzimatica">Exp B: Oxidação Enzimática</option>
                <option value="ph-antocianinas">Exp C: pH &amp; Antocianinas</option>
              </select>

              <select
                value={expStatusFilter}
                onChange={(e) => setExpStatusFilter(e.target.value as any)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="all">Todos os Estados</option>
                <option value="publicado">Publicado (Oficial)</option>
                <option value="em_revisao">Em Revisão</option>
                <option value="rascunho">Rascunho de Bancada</option>
              </select>
            </div>

            <button
              onClick={handleOpenCreateExp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Registro Experimental
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase font-mono">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Experimento</th>
                  <th className="py-2.5 px-3">Fruto / Amostra</th>
                  <th className="py-2.5 px-3">Condição</th>
                  <th className="py-2.5 px-3">Valor / Medição</th>
                  <th className="py-2.5 px-3">Data &amp; Hora</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExperiments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">{e.sampleCode}</td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                      {e.experimentType === 'vitamina-c' && <span className="text-emerald-800 font-semibold">Exp A: Vit C</span>}
                      {e.experimentType === 'oxidacao-enzimatica' && <span className="text-amber-800 font-semibold">Exp B: Oxidação</span>}
                      {e.experimentType === 'ph-antocianinas' && <span className="text-purple-800 font-semibold">Exp C: pH Antocianina</span>}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">{e.fruitOrSample}</td>
                    <td className="py-3 px-3 text-slate-600">{e.experimentalCondition}</td>
                    <td className="py-3 px-3 font-mono text-slate-800">
                      {e.experimentType === 'vitamina-c' && (
                        <span>{e.measuredValues?.iodineDropsCount} gotas (~{e.measuredValues?.estimatedVolumeIodineMl} mL)</span>
                      )}
                      {e.experimentType === 'oxidacao-enzimatica' && (
                        <span>Grau {e.measuredValues?.browningScore} / 4 ({e.measuredValues?.elapsedMinutes} min)</span>
                      )}
                      {e.experimentType === 'ph-antocianinas' && (
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-3 h-3 rounded-full border border-slate-300 shrink-0" 
                            style={{ backgroundColor: e.measuredValues?.colorHex || '#ccc' }} 
                          />
                          <span>pH {e.measuredValues?.measuredPH} ({e.measuredValues?.observedColor})</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{e.dateTime}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        e.status === 'publicado'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : e.status === 'em_revisao'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {e.status === 'publicado' ? 'Publicado' : e.status === 'em_revisao' ? 'Em Revisão' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && e.status !== 'publicado' && (
                          <button
                            onClick={() => handleQuickExpStatus(e, 'publicado')}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Publicar Resultado Oficialmente"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {e.status === 'rascunho' && (
                          <button
                            onClick={() => handleQuickExpStatus(e, 'em_revisao')}
                            className="p-1 text-amber-700 hover:bg-amber-50 rounded"
                            title="Submeter para Revisão"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditExp(e)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded transition-colors"
                          title="Editar Registro"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExp(e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 4: ACERVO DE REFERÊNCIAS
          ===================================================================== */}
      {activeTab === 'references' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={refSearchFilter}
                  onChange={(e) => setRefSearchFilter(e.target.value)}
                  placeholder="Pesquisar título, autor, DOI..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
                />
              </div>

              <select
                value={refStatusFilter}
                onChange={(e) => setRefStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="all">Todos os Estados de Verificação</option>
                <option value="Validada por Literatura Indexada">Validada por Literatura</option>
                <option value="Fonte Institucional Oficial">Fonte Institucional</option>
                <option value="Em Verificação">Em Verificação (Pendente)</option>
              </select>

              <select
                value={refFruitFilter}
                onChange={(e) => setRefFruitFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="all">Todos os Frutos ({fruits.length})</option>
                {fruits.map(f => (
                  <option key={f.id} value={f.id}>{f.popularName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenRefCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Referência
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase font-mono">
                  <th className="py-2.5 px-3">Título &amp; Autores</th>
                  <th className="py-2.5 px-3">Ano / Periódico</th>
                  <th className="py-2.5 px-3">DOI / Identificador</th>
                  <th className="py-2.5 px-3">Conteúdos &amp; Frutos</th>
                  <th className="py-2.5 px-3">Estado de Verificação</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReferences.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 max-w-sm">
                      <div className="font-bold text-slate-900">{r.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{r.authors}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-mono text-slate-900 font-semibold">{r.year}</div>
                      <div className="text-[11px] text-slate-500 italic max-w-xs truncate">{r.journal}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {r.doi ? (
                        <a 
                          href={r.url || `https://doi.org/${r.doi}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-emerald-800 hover:underline flex items-center gap-1"
                        >
                          {r.doi}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400">Sem DOI</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {r.relatedFruits?.map(rf => (
                          <span key={rf} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                            {rf}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        r.verificationStatus === 'Validada por Literatura Indexada'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : r.verificationStatus === 'Fonte Institucional Oficial'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {r.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && r.verificationStatus === 'Em Verificação' && (
                          <button
                            onClick={() => handleToggleRefStatus(r, 'Validada por Literatura Indexada')}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Aprovar Verificação Científica"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenRefEdit(r)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded transition-colors"
                          title="Editar Metadados da Referência"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteRef(r)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir Referência"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 5: GUIA DE CONSERVAÇÃO
          ===================================================================== */}
      {activeTab === 'conservation' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={guideSearchFilter}
                  onChange={(e) => setGuideSearchFilter(e.target.value)}
                  placeholder="Pesquisar diretriz, fruto..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
                />
              </div>

              <select
                value={guideFruitFilter}
                onChange={(e) => setGuideFruitFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs border border-slate-300 rounded-md bg-white text-slate-700"
              >
                <option value="all">Todos os Frutos ({fruits.length})</option>
                {fruits.map(f => (
                  <option key={f.id} value={f.id}>{f.popularName}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenGuideCreate}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Diretriz de Conservação
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase font-mono">
                  <th className="py-2.5 px-3">Fruto &amp; Espécie</th>
                  <th className="py-2.5 px-3">Condição de Armazenamento</th>
                  <th className="py-2.5 px-3">Recomendação Pós-Colheita</th>
                  <th className="py-2.5 px-3">Tipo de Fonte</th>
                  <th className="py-2.5 px-3">Composto Alvo</th>
                  <th className="py-2.5 px-3">Revisado Em</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredGuidelines.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{g.fruitCommonName}</div>
                      <div className="text-[11px] italic text-slate-500">{g.scientificName}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{g.storageCondition}</td>
                    <td className="py-3 px-3 max-w-sm text-slate-600 truncate" title={g.recommendation}>
                      {g.recommendation}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        g.sourceType === 'Literatura Indexada'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : g.sourceType === 'Institucional (EMBRAPA / INPA)'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {g.sourceType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{g.compoundTarget}</td>
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{g.updatedAt}</td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenGuideEdit(g)}
                          className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-slate-100 rounded transition-colors"
                          title="Editar Diretriz"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteGuide(g)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Excluir Diretriz"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          ABA 6: LOTES DE AMOSTRAS DE BANCADA
          ===================================================================== */}
      {activeTab === 'batches' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                placeholder="Filtrar por código ou espécie..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 text-slate-800"
              />
            </div>

            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar Entrada de Lote
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase font-mono">
                  <th className="py-2.5 px-3">Código do Lote</th>
                  <th className="py-2.5 px-3">Espécie Botânica</th>
                  <th className="py-2.5 px-3">Origem / Bacia Fluvial</th>
                  <th className="py-2.5 px-3">Data de Entrada</th>
                  <th className="py-2.5 px-3">Responsável</th>
                  <th className="py-2.5 px-3 text-right">Status do Laudo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {batches
                  .filter(b => 
                    b.batchCode.toLowerCase().includes(batchSearch.toLowerCase()) ||
                    b.species.toLowerCase().includes(batchSearch.toLowerCase()) ||
                    b.harvestLocation.toLowerCase().includes(batchSearch.toLowerCase())
                  )
                  .map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">{b.batchCode}</td>
                      <td className="py-3 px-3 italic whitespace-nowrap">{b.species}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">{b.harvestLocation}</td>
                      <td className="py-3 px-3 font-mono tabular-nums whitespace-nowrap text-slate-500">{b.receivedDate}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">{b.analyst}</td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono ${
                          b.status === 'Concluído'
                            ? 'bg-emerald-50 text-emerald-800 font-semibold'
                            : b.status === 'Em Análise'
                            ? 'bg-amber-50 text-amber-800 font-semibold'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CADASTRAR PESQUISADOR DE BANCADA (EXCLUSIVO ADMIN)
          ===================================================================== */}
      {isAdmin && isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-700" />
                Cadastrar Pesquisador de Bancada
              </h2>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-950 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                Homologação de Acesso Institucional
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Informe o e-mail Google que o pesquisador usará para login. Ele terá acesso autorizado para registrar amostras, medições de bancada e diretrizes no banco de dados.
              </p>
            </div>

            {userFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{userFormError}</span>
              </div>
            )}

            <form onSubmit={handleCreateResearcherSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail do Pesquisador (Conta Google) *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="ex: pesquisador@gmail.com ou institucional"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-700 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Completo do Pesquisador *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="ex: Dra. Beatriz Santos"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Instituição / Laboratório</label>
                <input
                  type="text"
                  value={newUserInstitution}
                  onChange={(e) => setNewUserInstitution(e.target.value)}
                  placeholder="ex: Laboratório de Fitoquímica / INPA / UFAM"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingUser ? 'Cadastrando...' : 'Autorizar Pesquisador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: EDITAR CADASTRO DE PESQUISADOR / USUÁRIO (EXCLUSIVO ADMIN)
          ===================================================================== */}
      {isAdmin && isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-purple-700" />
                Editar Cadastro de Pesquisador
              </h2>
              <button onClick={() => setIsEditUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-950 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                Atualização de Metadados e Instituição
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                As alterações na instituição (ex: <strong>LabTec-UEA</strong>) e nome do pesquisador serão salvas no banco de dados e refletidas na sessão do usuário.
              </p>
            </div>

            {editUserError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editUserError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-md bg-slate-100 text-slate-600 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Completo do Pesquisador *</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  placeholder="ex: Adailton Costa"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Instituição / Laboratório *</label>
                <input
                  type="text"
                  required
                  value={editUserInstitution}
                  onChange={(e) => setEditUserInstitution(e.target.value)}
                  placeholder="ex: LabTec-UEA ou INPA"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Permissão / Papel no Sistema *</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-700"
                >
                  <option value="researcher">Pesquisador de Bancada (Acesso a ensaios e curadoria)</option>
                  <option value="visitor">Visitante (Apenas consulta pública)</option>
                  <option value="admin">Administrador Curador (Gestão total)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isUpdatingUser ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CADASTRAR / EDITAR FRUTO
          ===================================================================== */}
      {isFruitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100/70 rounded-lg text-emerald-900">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    {editingFruit ? `Editar Ficha da Espécie: ${editingFruit.popularName}` : 'Cadastrar Nova Espécie de Fruto'}
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {editingFruit ? `ID: ${editingFruit.id} · Preencha a ficha botânica e fitoquímica completa` : 'Cadastre as informações botânicas, metabolômicas, bromatológicas e cinéticas'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(editingFruit || fruitId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsFruitModalOpen(false);
                      onNavigate('fruto', editingFruit ? editingFruit.id : fruitId);
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md transition-colors shadow-2xs"
                    title="Acessar Página Completa do Fruto"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Acessar Página Completa do Fruto</span>
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setIsFruitModalOpen(false)} 
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Abas de Navegação da Ficha Completa */}
            <div className="border-b border-slate-200 bg-white px-6 shrink-0 overflow-x-auto flex gap-1 pt-2">
              <button
                type="button"
                onClick={() => setFruitModalTab('geral')}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  fruitModalTab === 'geral'
                    ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>1. Identificação Botânica</span>
              </button>

              <button
                type="button"
                onClick={() => setFruitModalTab('bioativos')}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  fruitModalTab === 'bioativos'
                    ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>2. Fitoquímica &amp; Bioativos ({fruitBioactiveCompounds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFruitModalTab('nutricional')}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  fruitModalTab === 'nutricional'
                    ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>3. Composição Centesimal ({fruitNutritionalInfo.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFruitModalTab('estabilidade')}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  fruitModalTab === 'estabilidade'
                    ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <ThermometerSnowflake className="w-3.5 h-3.5" />
                <span>4. Estabilidade Cinética ({fruitStabilityFactors.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFruitModalTab('conservacao')}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  fruitModalTab === 'conservacao'
                    ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>5. Manejo &amp; Conservação</span>
              </button>

              <button
                type="button"
                onClick={() => setFruitModalTab('fotos_refs')}
                className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  fruitModalTab === 'fotos_refs'
                    ? 'border-emerald-800 text-emerald-900 bg-emerald-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>6. Fotos &amp; Referências ({fruitSelectedRefs.length})</span>
              </button>
            </div>

            {/* Formulário com Scroll Interno */}
            <form onSubmit={handleSaveFruit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {fruitFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{fruitFormError}</span>
                </div>
              )}

              {/* Botão de Atalho em Telas Menores para Acessar Página Completa */}
              {(editingFruit || fruitId) && (
                <div className="sm:hidden p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-emerald-900 font-medium">Visualizar espécime cadastrado:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFruitModalOpen(false);
                      onNavigate('fruto', editingFruit ? editingFruit.id : fruitId);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 rounded shadow-2xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Acessar Página Completa</span>
                  </button>
                </div>
              )}

              {/* =========================================================================
                  ABA 1: IDENTIFICAÇÃO BOTÂNICA & TAXONOMIA
                  ========================================================================= */}
              {fruitModalTab === 'geral' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Identificador Slug (ID único para rota #fruto/id) *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!!editingFruit}
                        value={fruitId}
                        onChange={(e) => setFruitId(e.target.value)}
                        placeholder="ex: camu-camu, acai, tucuma, buriti, cubiu"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        Usado na URL direta: <code className="font-mono text-emerald-800">#fruto/{fruitId || 'id-do-fruto'}</code>
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Popular *</label>
                      <input
                        type="text"
                        required
                        value={fruitPopularName}
                        onChange={(e) => setFruitPopularName(e.target.value)}
                        placeholder="ex: Camu-camu, Tucumã, Buriti, Açaí, Cubiu"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Científico Botânico Completo *</label>
                      <input
                        type="text"
                        required
                        value={fruitScientificName}
                        onChange={(e) => setFruitScientificName(e.target.value)}
                        placeholder="ex: Myrciaria dubia (Kunth) McVaugh"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 italic font-serif"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Família Botânica *</label>
                      <input
                        type="text"
                        required
                        value={fruitFamily}
                        onChange={(e) => setFruitFamily(e.target.value)}
                        placeholder="ex: Myrtaceae, Arecaceae, Solanaceae"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Sinônimos Botânicos Taxonômicos (separados por vírgula)</label>
                    <input
                      type="text"
                      value={fruitSynonyms}
                      onChange={(e) => setFruitSynonyms(e.target.value)}
                      placeholder="ex: Psidium dubium Kunth, Eugenia grandiglandulosa Kiaersk."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 italic"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Descrição Botânica &amp; Ecológica *</label>
                    <textarea
                      required
                      rows={3}
                      value={fruitDescription}
                      onChange={(e) => setFruitDescription(e.target.value)}
                      placeholder="Descrição geral do hábito vegetal, ecologia na bacia amazônica e importância fitoquímica..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Características Morfológicas do Fruto &amp; Planta *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={fruitMorphology}
                      onChange={(e) => setFruitMorphology(e.target.value)}
                      placeholder="Bagas ou drupas globosas, peso médio em gramas, diâmetro, consistência do pericarpo, mesocarpo carnoso e sementes..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Apresentado em destaque na seção "Características Morfológicas" da página completa do fruto.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Habitat &amp; Ocorrência Natural</label>
                      <input
                        type="text"
                        value={fruitHabitat}
                        onChange={(e) => setFruitHabitat(e.target.value)}
                        placeholder="ex: Florestas de igapó e várzeas inundáveis dos rios Negro e Solimões"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Período de Colheita / Safra</label>
                      <input
                        type="text"
                        value={fruitHarvestPeriod}
                        onChange={(e) => setFruitHarvestPeriod(e.target.value)}
                        placeholder="ex: Dezembro a Maio (sazonalidade de cheia e vazante)"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Estado de Publicação Científica *</label>
                    <select
                      value={fruitPubStatus}
                      onChange={(e) => setFruitPubStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="Publicado e Validado">Publicado e Validado (Exibido publicamente no Catálogo e Home)</option>
                      <option value="Em Revisão por Pares">Em Revisão por Pares (Visível a pesquisadores e administradores)</option>
                      <option value="Pendente de Verificação">Pendente de Verificação / Rascunho Interno</option>
                    </select>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  ABA 2: FITOQUÍMICA & COMPOSTOS BIOATIVOS
                  ========================================================================= */}
              {fruitModalTab === 'bioativos' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                        Compostos Bioativos &amp; Metabolômica ({fruitBioactiveCompounds.length})
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Alimente a seção "Compostos Bioativos Documentados" da página completa do fruto com concentrações e mecanismos bioquímicos.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddBioactiveCompound}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Composto</span>
                      </button>
                    </div>
                  </div>

                  {/* Modelos rápidos pré-programados */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] font-mono text-slate-500">Inserir modelo pré-configurado:</span>
                    <button
                      type="button"
                      onClick={() => handleAddBioactivePreset('vitc')}
                      className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-emerald-50 text-[11px] font-mono text-emerald-900 hover:border-emerald-300"
                    >
                      + Vitamina C
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBioactivePreset('antocianina')}
                      className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-purple-50 text-[11px] font-mono text-purple-900 hover:border-purple-300"
                    >
                      + Antocianinas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBioactivePreset('caroteno')}
                      className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-amber-50 text-[11px] font-mono text-amber-900 hover:border-amber-300"
                    >
                      + Beta-Caroteno
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBioactivePreset('polifenol')}
                      className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-blue-50 text-[11px] font-mono text-blue-900 hover:border-blue-300"
                    >
                      + Polifenóis Totais
                    </button>
                  </div>

                  {fruitBioactiveCompounds.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs space-y-2">
                      <FlaskConical className="w-6 h-6 mx-auto text-slate-400" />
                      <p>Nenhum composto bioativo registrado para este fruto.</p>
                      <button
                        type="button"
                        onClick={handleAddBioactiveCompound}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Primeiro Composto
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {fruitBioactiveCompounds.map((comp, idx) => (
                        <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-lg space-y-3 text-xs relative">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="font-bold text-slate-800 font-mono text-xs">
                              #{idx + 1} — {comp.name || 'Novo Composto Bioativo'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveBioactiveCompound(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="Remover Composto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nome do Composto *</label>
                              <input
                                type="text"
                                required
                                value={comp.name}
                                onChange={(e) => handleUpdateBioactiveCompound(idx, 'name', e.target.value)}
                                placeholder="ex: Ácido L-Ascórbico, Cianidina-3-glicosídeo"
                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Classe Química *</label>
                              <input
                                type="text"
                                required
                                value={comp.chemicalClass}
                                onChange={(e) => handleUpdateBioactiveCompound(idx, 'chemicalClass', e.target.value)}
                                placeholder="ex: Flavonoide, Carotenoide, Lactona Enediólica"
                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Concentração Média *</label>
                              <input
                                type="text"
                                required
                                value={comp.meanConcentration}
                                onChange={(e) => handleUpdateBioactiveCompound(idx, 'meanConcentration', e.target.value)}
                                placeholder="ex: 1.800 a 2.800 mg/100g de polpa"
                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nível de Evidência Científica</label>
                              <select
                                value={comp.evidenceLevel}
                                onChange={(e) => handleUpdateBioactiveCompound(idx, 'evidenceLevel', e.target.value as EvidenceLevel)}
                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                              >
                                <option value="Comprovado por Múltiplos Estudos">Comprovado por Múltiplos Estudos</option>
                                <option value="Comprovado em Estudo Indexado">Comprovado em Estudo Indexado</option>
                                <option value="Evidência Preliminar / Requer Verificação">Evidência Preliminar / Requer Verificação</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Nota de Verificação (opcional)</label>
                              <input
                                type="text"
                                value={comp.verificationNotice || ''}
                                onChange={(e) => handleUpdateBioactiveCompound(idx, 'verificationNotice', e.target.value)}
                                placeholder="ex: Dependente do estádio de maturação do fruto..."
                                className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Ação Bioquímica Primária / Função Protetora *</label>
                            <input
                              type="text"
                              required
                              value={comp.primaryAction}
                              onChange={(e) => handleUpdateBioactiveCompound(idx, 'primaryAction', e.target.value)}
                              placeholder="ex: Doador de elétrons para sequestro de radicais livres de oxigênio e regeneração do tocoferol."
                              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  ABA 3: COMPOSIÇÃO CENTESIMAL & BROMATOLOGIA
                  ========================================================================= */}
              {fruitModalTab === 'nutricional' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                        Composição Centesimal &amp; Nutricional ({fruitNutritionalInfo.length})
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Alimente a tabela bromatológica da página completa (base: 100g de polpa fresca).
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleLoadDefaultNutritionalTable}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded"
                        title="Carregar tabela centesimal padrão com umidade, lipídios, carboidratos, etc."
                      >
                        Carregar Tabela Padrão (TACO)
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNutritionalItem}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Item</span>
                      </button>
                    </div>
                  </div>

                  {fruitNutritionalInfo.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs space-y-2">
                      <BookOpen className="w-6 h-6 mx-auto text-slate-400" />
                      <p>Nenhum item nutricional cadastrado para este fruto.</p>
                      <button
                        type="button"
                        onClick={handleLoadDefaultNutritionalTable}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded"
                      >
                        Preencher Tabela TACO / INPA Padrão
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-mono font-semibold text-slate-600 uppercase">
                            <th className="py-2 px-3">Componente</th>
                            <th className="py-2 px-3 w-28">Teor (100g)</th>
                            <th className="py-2 px-3 w-20">Unidade</th>
                            <th className="py-2 px-3 w-40">Status</th>
                            <th className="py-2 px-3">Fonte / Referência</th>
                            <th className="py-2 px-2 text-center w-12">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {fruitNutritionalInfo.map((nutri, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  required
                                  value={nutri.component}
                                  onChange={(e) => handleUpdateNutritionalItem(idx, 'component', e.target.value)}
                                  placeholder="ex: Umidade, Proteínas, Vitamina C"
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  required
                                  value={nutri.valuePer100g}
                                  onChange={(e) => handleUpdateNutritionalItem(idx, 'valuePer100g', e.target.value)}
                                  placeholder="ex: 88.5"
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-mono font-bold"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  required
                                  value={nutri.unit}
                                  onChange={(e) => handleUpdateNutritionalItem(idx, 'unit', e.target.value)}
                                  placeholder="g, mg, kcal"
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded font-mono"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={nutri.status}
                                  onChange={(e) => handleUpdateNutritionalItem(idx, 'status', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded"
                                >
                                  <option value="Confirmado">Confirmado</option>
                                  <option value="Requer Verificação Adicional">Requer Verificação</option>
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={nutri.sourceReference}
                                  onChange={(e) => handleUpdateNutritionalItem(idx, 'sourceReference', e.target.value)}
                                  placeholder="ex: Tabela TACO / UNICAMP & INPA"
                                  className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-slate-600 font-mono text-[11px]"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveNutritionalItem(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  title="Remover Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  ABA 4: CINÉTICA & FATORES DE ESTABILIDADE
                  ========================================================================= */}
              {fruitModalTab === 'estabilidade' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                        Fatores que Influenciam a Estabilidade ({fruitStabilityFactors.length})
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Alimente os limites críticos de degradação térmica, foto-oxidação e variações de pH do fruto.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleLoadDefaultStabilityFactors}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded"
                      >
                        Carregar 4 Fatores Padrão
                      </button>
                      <button
                        type="button"
                        onClick={handleAddStabilityFactor}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Fator</span>
                      </button>
                    </div>
                  </div>

                  {fruitStabilityFactors.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs space-y-2">
                      <ThermometerSnowflake className="w-6 h-6 mx-auto text-slate-400" />
                      <p>Nenhum fator cinético registrado para este fruto.</p>
                      <button
                        type="button"
                        onClick={handleLoadDefaultStabilityFactors}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded"
                      >
                        Carregar Parâmetros Padrão
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {fruitStabilityFactors.map((fact, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                            <span className="font-bold text-slate-800 font-mono text-[11px]">
                              Fator #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveStabilityFactor(idx)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-600 uppercase font-mono block mb-0.5">Estressor Ambiental</label>
                              <select
                                value={fact.factor}
                                onChange={(e) => handleUpdateStabilityFactor(idx, 'factor', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                              >
                                <option value="Temperatura">Temperatura</option>
                                <option value="Oxigênio / Atmosfera">Oxigênio / Atmosfera</option>
                                <option value="Radiação Luminosa (UV)">Radiação Luminosa (UV)</option>
                                <option value="pH do Meio">pH do Meio</option>
                                <option value="Atividade de Água (aw)">Atividade de Água (aw)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-semibold text-slate-600 uppercase font-mono block mb-0.5">Sensibilidade</label>
                              <select
                                value={fact.sensitivityLevel}
                                onChange={(e) => handleUpdateStabilityFactor(idx, 'sensitivityLevel', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                              >
                                <option value="Muito Alta">Muito Alta</option>
                                <option value="Alta">Alta</option>
                                <option value="Moderada">Moderada</option>
                                <option value="Baixa">Baixa</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 uppercase font-mono block mb-0.5">Limiar Crítico Operacional</label>
                            <input
                              type="text"
                              required
                              value={fact.criticalThreshold}
                              onChange={(e) => handleUpdateStabilityFactor(idx, 'criticalThreshold', e.target.value)}
                              placeholder="ex: Acima de 45°C em meio aeróbio, pH > 4.0"
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-slate-600 uppercase font-mono block mb-0.5">Descrição do Mecanismo Cinético</label>
                            <textarea
                              rows={2}
                              required
                              value={fact.impactDescription}
                              onChange={(e) => handleUpdateStabilityFactor(idx, 'impactDescription', e.target.value)}
                              placeholder="Mecanismo de clivagem molecular, desnaturação ou oxidação do bioativo..."
                              className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  ABA 5: MANEJO & CONSERVAÇÃO PÓS-COLHEITA
                  ========================================================================= */}
              {fruitModalTab === 'conservacao' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                      Diretrizes Técnicas de Conservação &amp; Cadeia de Frio
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Configure as recomendações operacionais exibidas na Seção 5 da página completa de {fruitPopularName || 'fruto'}.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Boas Práticas de Colheita e Transporte (uma por linha) *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={fruitHarvestBestPractices}
                      onChange={(e) => setFruitHarvestBestPractices(e.target.value)}
                      placeholder="Colher nas primeiras horas da manhã...&#10;Evitar choque mecânico e abrasão...&#10;Acondicionar em caixas higienizadas..."
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Cada linha digitada será exibida como um ponto com marcador na página completa do fruto.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Condição Térmica Ideal *</label>
                      <input
                        type="text"
                        required
                        value={fruitIdealStorage}
                        onChange={(e) => setFruitIdealStorage(e.target.value)}
                        placeholder="ex: Refrigeração a 4°C no transporte; congelamento a -18°C"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Recomendação de Embalagem *</label>
                      <input
                        type="text"
                        required
                        value={fruitPackaging}
                        onChange={(e) => setFruitPackaging(e.target.value)}
                        placeholder="ex: Barreira de oxigênio e luz selada a vácuo"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Estimativa de Vida Útil *</label>
                      <input
                        type="text"
                        required
                        value={fruitShelfLife}
                        onChange={(e) => setFruitShelfLife(e.target.value)}
                        placeholder="ex: Até 12 dias a 4°C ou até 12 meses a -18°C"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  ABA 6: FOTOGRAFIAS & REFERÊNCIAS CIENTÍFICAS
                  ========================================================================= */}
              {fruitModalTab === 'fotos_refs' && (
                <div className="space-y-5 text-xs">
                  {/* Fotografia Autorizada */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 font-mono uppercase">
                      <ImageIcon className="w-4 h-4 text-emerald-800" />
                      Fotografia Botânica Autorizada para Divulgação
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                      <div className="sm:col-span-8 space-y-2.5">
                        <div>
                          <label className="text-[11px] text-slate-600 block mb-1 font-semibold">URL da Imagem *</label>
                          <input
                            type="url"
                            value={fruitPhotoUrl}
                            onChange={(e) => setFruitPhotoUrl(e.target.value)}
                            placeholder="https://exemplo.org/imagem-fruto.jpg"
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Legenda Descritiva da Foto</label>
                            <input
                              type="text"
                              value={fruitPhotoCaption}
                              onChange={(e) => setFruitPhotoCaption(e.target.value)}
                              placeholder={`ex: Frutos maduros de ${fruitPopularName || 'espécie'}`}
                              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-600 block mb-1 font-semibold">Autor / Proveniência / Herbário</label>
                            <input
                              type="text"
                              value={fruitPhotoProvenance}
                              onChange={(e) => setFruitPhotoProvenance(e.target.value)}
                              placeholder="ex: INPA / Herbário / Embrapa"
                              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preview da Fotografia */}
                      <div className="sm:col-span-4 bg-white border border-slate-200 rounded-lg overflow-hidden aspect-[4/3] flex items-center justify-center relative">
                        {fruitPhotoUrl ? (
                          <img
                            src={fruitPhotoUrl}
                            alt="Pré-visualização"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center p-3 text-slate-400">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-[10px]">Sem imagem vinculada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Associação de Referências Científicas */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Associar Artigos e Referências Científicas Indexadas ({fruitSelectedRefs.length} selecionadas)
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      Os artigos selecionados serão exibidos automaticamente na seção "Referências Científicas Associadas" da página do fruto.
                    </p>

                    <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-md p-2.5 space-y-1.5 bg-slate-50/50">
                      {references.map((r) => {
                        const isSelected = fruitSelectedRefs.includes(r.id);
                        return (
                          <label key={r.id} className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1.5 rounded transition-colors">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFruitSelectedRefs([...fruitSelectedRefs, r.id]);
                                } else {
                                  setFruitSelectedRefs(fruitSelectedRefs.filter(id => id !== r.id));
                                }
                              }}
                              className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-emerald-900 bg-emerald-50 px-1 rounded border border-emerald-200">
                                  [{r.year}]
                                </span>
                                <span className="font-medium text-slate-900 truncate">{r.title}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate font-mono">
                                {r.authors} · <em>{r.journal}</em>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Rodapé com Ações do Modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <div>
                  {(editingFruit || fruitId) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsFruitModalOpen(false);
                        onNavigate('fruto', editingFruit ? editingFruit.id : fruitId);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-950 underline underline-offset-4"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Acessar Página Completa do Fruto
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFruitModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFruit}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    {isSubmittingFruit ? 'Salvando Ficha...' : editingFruit ? 'Atualizar Ficha Completa' : 'Cadastrar Espécie Completa'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CADASTRAR / EDITAR CONTEÚDO EDUCATIVO
          ===================================================================== */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-800" />
                {editingTopic ? `Editar Conteúdo: ${editingTopic.title}` : 'Cadastrar Conteúdo Educativo'}
              </h2>
              <button onClick={() => setIsTopicModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {topicFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{topicFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Identificador Slug *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingTopic}
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    placeholder="ex: antocianinas, ph"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ordem de Exibição *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={topicOrder}
                    onChange={(e) => setTopicOrder(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Categoria *</label>
                  <select
                    value={topicCategory}
                    onChange={(e) => setTopicCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="Fundamentos Moleculares">Fundamentos Moleculares</option>
                    <option value="Classes Fitoquímicas">Classes Fitoquímicas</option>
                    <option value="Cinética & Estabilidade">Cinética & Estabilidade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Título do Tópico *</label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="ex: Ácido Ascórbico e Cinética de Degradação Térmica"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Resumo Curto Introdutório *</label>
                <input
                  type="text"
                  required
                  value={topicSummary}
                  onChange={(e) => setTopicSummary(e.target.value)}
                  placeholder="Visão panorâmica em 1 ou 2 frases curtas..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mensagem Introdutória Contextual *
                  <span className="font-normal text-slate-500 block text-[11px]">
                    Texto de destaque exibido logo abaixo do nome do assunto e acima de "Compreendendo o Conceito".
                  </span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={topicIntro}
                  onChange={(e) => setTopicIntro(e.target.value)}
                  placeholder="Introdução contextual ampla apresentando os fundamentos e relevância fitoquímica deste tema..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Explicação em Linguagem Acessível *</label>
                <textarea
                  required
                  rows={3}
                  value={topicAccessible}
                  onChange={(e) => setTopicAccessible(e.target.value)}
                  placeholder="Explicação didática destinada a estudantes e público leigo..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Detalhamento Físico-Químico e Mecanístico *</label>
                <textarea
                  required
                  rows={3}
                  value={topicScientificDetail}
                  onChange={(e) => setTopicScientificDetail(e.target.value)}
                  placeholder="Mecanismos de reação, orbitais, vias de transferência HAT/SET..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono text-[11px]"
                />
              </div>

              {/* Seção: Biodiversidade em Foco (Ocorrência nos Frutos Amazônicos) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                      Biodiversidade em Foco · Ocorrência nos Frutos Amazônicos
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Vincule as espécies botânicas estudadas e descreva o papel bioquímico específico neste conteúdo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const firstFruit = fruits[0];
                      setTopicFruitExamples([
                        ...topicFruitExamples,
                        {
                          fruitId: firstFruit ? firstFruit.id : 'fruto-novo',
                          fruitName: firstFruit ? firstFruit.popularName : 'Novo Fruto',
                          scientificName: firstFruit ? firstFruit.scientificName : 'Espécie botânica',
                          description: ''
                        }
                      ]);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 rounded-md transition-colors self-start sm:self-auto shrink-0 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Fruto em Foco
                  </button>
                </div>

                {topicFruitExamples.length === 0 ? (
                  <div className="p-3 bg-white border border-dashed border-slate-300 rounded-lg text-center text-xs text-slate-500">
                    Nenhuma espécie associada ainda. Clique em "Adicionar Fruto em Foco" para selecionar espécies amazônicas do catálogo.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {topicFruitExamples.map((ex, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-mono text-slate-500 block">Fruto do Catálogo:</label>
                              <select
                                value={ex.fruitId}
                                onChange={(e) => {
                                  const selId = e.target.value;
                                  const selectedFruit = fruits.find(f => f.id === selId);
                                  const updated = [...topicFruitExamples];
                                  if (selectedFruit) {
                                    updated[idx] = {
                                      ...updated[idx],
                                      fruitId: selectedFruit.id,
                                      fruitName: selectedFruit.popularName,
                                      scientificName: selectedFruit.scientificName
                                    };
                                  } else {
                                    updated[idx] = {
                                      ...updated[idx],
                                      fruitId: selId
                                    };
                                  }
                                  setTopicFruitExamples(updated);
                                }}
                                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-emerald-700"
                              >
                                {fruits.map(f => (
                                  <option key={f.id} value={f.id}>
                                    {f.popularName} ({f.scientificName})
                                  </option>
                                ))}
                                <option value="personalizado">Outra espécie (Personalizada)...</option>
                              </select>
                            </div>

                            {ex.fruitId === 'personalizado' ? (
                              <div>
                                <label className="text-[10px] font-mono text-slate-500 block">Nome do Fruto:</label>
                                <input
                                  type="text"
                                  value={ex.fruitName}
                                  onChange={(e) => {
                                    const updated = [...topicFruitExamples];
                                    updated[idx].fruitName = e.target.value;
                                    setTopicFruitExamples(updated);
                                  }}
                                  placeholder="Nome da espécie..."
                                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="text-[10px] font-mono text-slate-500 block">Nome Científico:</label>
                                <span className="font-serif italic text-xs text-emerald-950 block pt-1 truncate">
                                  {ex.scientificName}
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setTopicFruitExamples(topicFruitExamples.filter((_, i) => i !== idx));
                            }}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors self-start mt-4"
                            title="Remover fruto deste estudo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono text-slate-500 block mb-0.5">
                            Ocorrência e Papel Específico nesta Espécie:
                          </label>
                          <textarea
                            rows={2}
                            value={ex.description}
                            onChange={(e) => {
                              const updated = [...topicFruitExamples];
                              updated[idx].description = e.target.value;
                              setTopicFruitExamples(updated);
                            }}
                            placeholder={`Descreva a concentração, mecanismo de ação ou estabilidade em ${ex.fruitName}...`}
                            className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção: Conteúdos Relacionados Recomendados */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-2">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono block">
                  Conteúdos Relacionados Recomendados ({topicRelatedIds.length} selecionados)
                </label>
                <p className="text-[11px] text-slate-500">
                  Selecione outros tópicos da plataforma para indicar como leitura complementar recomendada ao leitor.
                </p>
                <div className="max-h-36 overflow-y-auto border border-slate-300 rounded-md p-2 space-y-1 bg-white">
                  {topics
                    .filter(t => !editingTopic || t.id !== editingTopic.id)
                    .map(t => {
                      const isChecked = topicRelatedIds.includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTopicRelatedIds([...topicRelatedIds, t.id]);
                              } else {
                                setTopicRelatedIds(topicRelatedIds.filter(id => id !== t.id));
                              }
                            }}
                            className="rounded text-emerald-800 focus:ring-emerald-700"
                          />
                          <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1 rounded">
                            {t.category}
                          </span>
                          <span className="font-medium text-slate-900 truncate">{t.title}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Relevância nos Experimentos</label>
                  <textarea
                    rows={2}
                    value={topicRelevance}
                    onChange={(e) => setTopicRelevance(e.target.value)}
                    placeholder="Conexão com os ensaios de bancada..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Limitações Científicas</label>
                  <textarea
                    rows={2}
                    value={topicLimitations}
                    onChange={(e) => setTopicLimitations(e.target.value)}
                    placeholder="Limitações in vitro..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Associação de Referências */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Associar Referências Científicas ({topicSelectedRefs.length} selecionadas)
                </label>
                <div className="max-h-28 overflow-y-auto border border-slate-300 rounded-md p-2 space-y-1.5 bg-slate-50/50">
                  {references.map((r) => {
                    const isSelected = topicSelectedRefs.includes(r.id);
                    return (
                      <label key={r.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTopicSelectedRefs([...topicSelectedRefs, r.id]);
                            } else {
                              setTopicSelectedRefs(topicSelectedRefs.filter(id => id !== r.id));
                            }
                          }}
                          className="rounded text-emerald-800 focus:ring-emerald-700"
                        />
                        <span className="font-mono text-[11px] text-slate-500">[{r.year}]</span>
                        <span className="truncate">{r.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Estado de Publicação *</label>
                <select
                  value={topicStatus}
                  onChange={(e) => setTopicStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="Validado por Literatura Indexada">Validado por Literatura Indexada (Visível ao público)</option>
                  <option value="Em Revisão por Pares">Em Revisão por Pares (Apenas pesquisadores autenticados)</option>
                  <option value="Pendente de Verificação">Pendente de Verificação (Rascunho)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTopic}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingTopic ? 'Salvando...' : editingTopic ? 'Atualizar Assunto' : 'Cadastrar Assunto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CADASTRAR / EDITAR ENSAIO EXPERIMENTAL
          ===================================================================== */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-800" />
                {editingExp ? `Editar Ensaio: ${editingExp.sampleCode}` : 'Registrar Ensaio Experimental de Bancada'}
              </h2>
              <button onClick={() => setIsExpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {expFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{expFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveExp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Módulo Experimental *</label>
                  <select
                    value={expType}
                    onChange={(e) => setExpType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="vitamina-c">Experimento A — Estabilidade da Vitamina C</option>
                    <option value="oxidacao-enzimatica">Experimento B — Oxidação Enzimática</option>
                    <option value="ph-antocianinas">Experimento C — Influência do pH nas Antocianinas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Código da Amostra *</label>
                  <input
                    type="text"
                    required
                    value={expSampleCode}
                    onChange={(e) => setExpSampleCode(e.target.value.toUpperCase())}
                    placeholder="ex: CAMU-FRESH-T1"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Fruto ou Amostra Analisada *</label>
                  <input
                    type="text"
                    required
                    value={expFruitOrSample}
                    onChange={(e) => setExpFruitOrSample(e.target.value)}
                    placeholder="ex: Camu-camu (Myrciaria dubia)"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Condição Experimental *</label>
                  <input
                    type="text"
                    required
                    value={expCondition}
                    onChange={(e) => setExpCondition(e.target.value)}
                    placeholder="ex: Fresco, Refrigerado (48h), Fervido..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Valores Específicos por Tipo de Experimento */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="text-xs font-semibold text-slate-800">
                  Valores Analíticos Registrados em Bancada ({expType})
                </div>

                {expType === 'vitamina-c' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Volume da Amostra (mL)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={vitCVolume}
                        onChange={(e) => setVitCVolume(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Gotas de I₂ Tituladas</label>
                      <input
                        type="number"
                        value={vitCDrops}
                        onChange={(e) => setVitCDrops(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {expType === 'oxidacao-enzimatica' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Grau de Escurecimento (0 a 4)</label>
                      <select
                        value={enzScore}
                        onChange={(e) => setEnzScore(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                      >
                        <option value="0">0 — Sem alteração perceptível</option>
                        <option value="1">1 — Escurecimento leve</option>
                        <option value="2">2 — Escurecimento moderado</option>
                        <option value="3">3 — Escurecimento acentuado</option>
                        <option value="4">4 — Escurecimento severo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Tempo Decorrido (minutos)</label>
                      <input
                        type="number"
                        value={enzElapsed}
                        onChange={(e) => setEnzElapsed(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {expType === 'ph-antocianinas' && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Valor de pH Medido</label>
                      <input
                        type="number"
                        step="0.01"
                        value={phVal}
                        onChange={(e) => setPhVal(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Cor Observada</label>
                      <input
                        type="text"
                        value={phColor}
                        onChange={(e) => setPhColor(e.target.value)}
                        placeholder="ex: Roxo-azulado"
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">Código Hexadecimal</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={phHex}
                          onChange={(e) => setPhHex(e.target.value)}
                          className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0"
                        />
                        <input
                          type="text"
                          value={phHex}
                          onChange={(e) => setPhHex(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Data e Hora da Medição *</label>
                  <input
                    type="text"
                    required
                    value={expDateTime}
                    onChange={(e) => setExpDateTime(e.target.value)}
                    placeholder="16/10/2026 14:30"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Método Analítico Utilizado *</label>
                  <input
                    type="text"
                    required
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value)}
                    placeholder="ex: Titulação com amido 1%"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Observações de Bancada *</label>
                <textarea
                  required
                  rows={2}
                  value={expObservations}
                  onChange={(e) => setExpObservations(e.target.value)}
                  placeholder="Aspecto visual, comportamento da viragem..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Interpretação Bioquímica</label>
                <textarea
                  rows={2}
                  value={expInterpretation}
                  onChange={(e) => setExpInterpretation(e.target.value)}
                  placeholder="Relação com os compostos bioativos..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Fotografia do Ensaio (URL)</label>
                  <input
                    type="url"
                    value={expPhotoUrl}
                    onChange={(e) => setExpPhotoUrl(e.target.value)}
                    placeholder="https://exemplo.org/bancada.jpg"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Pesquisador Responsável</label>
                  <input
                    type="text"
                    value={expAnalyst}
                    onChange={(e) => setExpAnalyst(e.target.value)}
                    placeholder="Nome do analista"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Origem dos Dados *</label>
                  <select
                    value={expDataSource}
                    onChange={(e) => setExpDataSource(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="cientifico_real">Ensaio Laboratorial Genuíno (Bancada)</option>
                    <option value="demonstracao_inicial">Calibração Piloto Inicial</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Estado de Publicação *</label>
                  <select
                    value={expStatus}
                    onChange={(e) => setExpStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="rascunho">Rascunho (Privado à bancada)</option>
                    <option value="em_revisao">Em Revisão (Aguardando curador)</option>
                    <option value="publicado">Publicado (Disponível aos visitantes)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExpModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExp}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmittingExp ? 'Registrando...' : editingExp ? 'Salvar Alterações' : 'Cadastrar Ensaio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CADASTRAR / EDITAR REFERÊNCIA
          ===================================================================== */}
      {isRefModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-800" />
                {editingRef ? 'Editar Referência Científica' : 'Cadastrar Referência Científica'}
              </h2>
              <button onClick={() => setIsRefModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {refFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{refFormError}</span>
              </div>
            )}

            <form onSubmit={handleRefSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Título da Publicação / Livro / Norma *</label>
                <input
                  type="text"
                  required
                  value={refFormTitle}
                  onChange={(e) => setRefFormTitle(e.target.value)}
                  placeholder="ex: Bioactive compounds and antioxidant capacity in Amazonian fruits"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Autores *</label>
                <input
                  type="text"
                  required
                  value={refFormAuthors}
                  onChange={(e) => setRefFormAuthors(e.target.value)}
                  placeholder="ex: Yuyama, K., Silva, F. A., & Aguiar, J. P. L."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Revista, Livro ou Instituição *</label>
                  <input
                    type="text"
                    required
                    value={refFormJournal}
                    onChange={(e) => setRefFormJournal(e.target.value)}
                    placeholder="ex: Food Chemistry / EMBRAPA Amazônia Ocidental"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ano de Publicação *</label>
                  <input
                    type="number"
                    required
                    min={1900}
                    max={2030}
                    value={refFormYear}
                    onChange={(e) => setRefFormYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">DOI (Digital Object Identifier)</label>
                  <input
                    type="text"
                    value={refFormDoi}
                    onChange={(e) => setRefFormDoi(e.target.value)}
                    placeholder="ex: 10.1016/j.foodchem.2021.130987"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tipo de Publicação *</label>
                  <select
                    value={refFormPubType}
                    onChange={(e) => setRefFormPubType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {PUBLICATION_TYPES.map(pt => (
                      <option key={pt} value={pt}>{pt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Conteúdos Relacionados (vírgulas)</label>
                <input
                  type="text"
                  value={refFormContents}
                  onChange={(e) => setRefFormContents(e.target.value)}
                  placeholder="vitamina-c, antioxidantes, antocianinas"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono text-[11px]"
                />
              </div>

              {/* Frutos Relacionados */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Frutos Relacionados ({fruits.length} cadastrados)</label>
                <div className="flex flex-wrap gap-2">
                  {fruits.map(f => {
                    const isChecked = refFormFruits.includes(f.id);
                    return (
                      <label key={f.id} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer bg-slate-50 border border-slate-200 px-2 py-1 rounded hover:border-emerald-500">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRefFormFruits([...refFormFruits, f.id]);
                            } else {
                              setRefFormFruits(refFormFruits.filter(id => id !== f.id));
                            }
                          }}
                          className="rounded text-emerald-800 focus:ring-emerald-700"
                        />
                        <span>{f.popularName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Estado de Verificação *</label>
                <select
                  value={refFormStatus}
                  onChange={(e) => setRefFormStatus(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="Validada por Literatura Indexada">Validada por Literatura Indexada</option>
                  <option value="Fonte Institucional Oficial">Fonte Institucional Oficial</option>
                  <option value="Em Verificação">Em Verificação (Pendente)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRefModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRefSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isRefSubmitting ? 'Salvando...' : editingRef ? 'Atualizar Referência' : 'Cadastrar Referência'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CADASTRAR / EDITAR DIRETRIZ DE CONSERVAÇÃO
          ===================================================================== */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ThermometerSnowflake className="w-5 h-5 text-emerald-800" />
                {editingGuide ? 'Editar Diretriz de Conservação' : 'Cadastrar Diretriz de Conservação'}
              </h2>
              <button onClick={() => setIsGuideModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {guideFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{guideFormError}</span>
              </div>
            )}

            <form onSubmit={handleGuideSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Fruto Alvo *</label>
                  <select
                    value={guideFruitId}
                    onChange={(e) => setGuideFruitId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {fruits.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.popularName} ({f.scientificName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Composto ou Característica *</label>
                  <input
                    type="text"
                    required
                    value={guideCompoundTarget}
                    onChange={(e) => setGuideCompoundTarget(e.target.value)}
                    placeholder="ex: Ácido L-Ascórbico / Antocianinas"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 block">Condição de Armazenamento *</label>
                  <span className="text-[10px] text-slate-500">Selecione da lista ou digite nova</span>
                </div>
                <input
                  type="text"
                  required
                  list="admin-guide-conditions-list"
                  value={guideStorageCondition}
                  onChange={(e) => setGuideStorageCondition(e.target.value)}
                  placeholder="ex: Congelamento (-18°C) em frasco opaco com vácuo"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <datalist id="admin-guide-conditions-list">
                  {Array.from(new Set(guidelines.map(g => (g.storageCondition || '').trim()).filter(Boolean))).map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Recomendação Pós-Colheita *</label>
                <textarea
                  required
                  rows={3}
                  value={guideRecommendation}
                  onChange={(e) => setGuideRecommendation(e.target.value)}
                  placeholder="Instrução técnica clara para evitar oxidação ou degradação..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tipo de Origem / Fonte *</label>
                  <select
                    value={guideSourceType}
                    onChange={(e) => setGuideSourceType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="Literatura Indexada">Literatura Indexada (Estudo revisado por pares)</option>
                    <option value="Institucional (EMBRAPA / INPA)">Institucional (Manual EMBRAPA / INPA)</option>
                    <option value="Observação Experimental do Projeto">Observação Experimental do Projeto BioAmazônia</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Citação da Fonte *</label>
                  <input
                    type="text"
                    required
                    value={guideSourceCitation}
                    onChange={(e) => setGuideSourceCitation(e.target.value)}
                    placeholder="ex: EMBRAPA Amazônia Ocidental (2024)"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Limitações de Aplicação &amp; Cuidados *</label>
                <textarea
                  required
                  rows={2}
                  value={guideLimitations}
                  onChange={(e) => setGuideLimitations(e.target.value)}
                  placeholder="Limitações e restrições analíticas..."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGuideModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isGuideSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isGuideSubmitting ? 'Salvando...' : editingGuide ? 'Atualizar Diretriz' : 'Cadastrar Diretriz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: ENTRADA DE NOVO LOTE DE AMOSTRA
          ===================================================================== */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-800" />
                Registrar Entrada de Lote de Amostras
              </h2>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Comum do Fruto *</label>
                <input
                  type="text"
                  required
                  value={newCommonName}
                  onChange={(e) => setNewCommonName(e.target.value)}
                  placeholder="ex: Camu-camu, Buriti"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Espécie Científica *</label>
                <input
                  type="text"
                  required
                  value={newScientificName}
                  onChange={(e) => setNewScientificName(e.target.value)}
                  placeholder="ex: Myrciaria dubia"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 italic font-serif"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Origem / Bacia Fluvial</label>
                <input
                  type="text"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  placeholder="ex: Rio Negro / Barcelos - AM"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Analista Responsável</label>
                <input
                  type="text"
                  value={newAnalyst}
                  onChange={(e) => setNewAnalyst(e.target.value)}
                  placeholder="Nome do analista"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md shadow-xs transition-colors"
                >
                  Registrar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: CONFIRMAÇÃO DE OPERAÇÃO DESTRUTIVA
          ===================================================================== */}
      {deleteModal && deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {deleteModal.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {deleteModal.message}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 font-mono">
              Atenção: Apenas administradores curadores possuem autorização no banco de dados para efetivar exclusões permanentes.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Excluindo...' : deleteModal.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
