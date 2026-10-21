import { BiochemistryTopic } from '../types';

export const BIOCHEMISTRY_TOPICS: BiochemistryTopic[] = [
  {
    id: 'antioxidantes',
    order: 1,
    category: 'Fundamentos Moleculares',
    title: 'Antioxidantes',
    shortSummary: 'Compostos moleculares que retardam ou inibem a oxidação de biomoléculas vitais por mecanismos de transferência de hidrogênio ou elétrons.',
    introduction: 'Na bioquímica celular, um antioxidante é qualquer substância que, quando presente em baixas concentrações em comparação com um substrato oxidável (como lipídios de membrana, proteínas e DNA), retarda ou previne significativamente a oxidação desse substrato.',
    accessibleExplanation: 'Imagine o oxigênio como uma faca de dois gumes: essencial para a respiração de animais e plantas, mas capaz de produzir faíscas químicas instáveis durante o metabolismo. Os antioxidantes funcionam como escudos moleculares que absorvem essas faíscas antes que elas queimem as estruturas delicadas da célula. Na floresta amazônica, os frutos expostos à intensa radiação solar e à umidade desenvolveram uma verdadeira blindagem química de antioxidantes naturais para proteger suas próprias sementes.',
    scientificDetail: 'Do ponto de vista físico-químico, os antioxidantes primários atuam através de duas vias termodinâmicas fundamentais: a Transferência de Átomo de Hidrogênio (HAT - Hydrogen Atom Transfer) e a Transferência Simples de Elétron (SET - Single Electron Transfer). Na via HAT, governada pela Entalpia de Dissociação da Ligação O-H (BDE), o antioxidante doa um átomo de hidrogênio com seu elétron para o radical livre. Na via SET, regulada pelo Potencial de Ionização (IP), o antioxidante cede um elétron, gerando um radical intermediário estável cuja carga é deslocalizada por ressonância no anel aromático conjugado.',
    fruitExamples: [
      {
        fruitName: 'Camu-camu',
        fruitId: 'camu-camu',
        scientificName: 'Myrciaria dubia',
        description: 'Exibe a maior densidade de antioxidantes hidrossolúveis documentada no reino vegetal, combinando ácido L-ascórbico e elagitaninos.'
      },
      {
        fruitName: 'Açaí-do-Amazonas',
        fruitId: 'acai',
        scientificName: 'Euterpe precatoria',
        description: 'Apresenta complexo antioxidante polifenólico dominado por antocianinas que sequestram radicais peroxil na interface aquosa.'
      },
      {
        fruitName: 'Buriti',
        fruitId: 'buriti',
        scientificName: 'Mauritia flexuosa',
        description: 'Fornece antioxidantes lipofílicos (carotenoides e tocoferóis) que agem no interior hidrofóbico da bicamada lipídica de membranas.'
      }
    ],
    experimentalRelevance: 'A capacidade antioxidante total de extratos amazônicos é quantificada por ensaios espectrofotométricos de extinção de radicais, principalmente DPPH• (517 nm), ABTS•+ (734 nm) e ensaio FRAP (593 nm). Cada ensaio mede predominantemente uma das vias (HAT ou SET), justificando o uso concomitante de métodos analíticos complementares.',
    scientificLimitations: 'Resultados expressivos em testes in vitro (como ORAC ou DPPH) refletem unicamente a reatividade química no tubo de ensaio sob solventes orgânicos. Não equivalem diretamente a efeitos clínicos preventivos ou terapêuticos em seres humanos, visto que a absorção intestinal, o metabolismo de primeira passagem hepática e a excreção renal reduzem fortemente a concentração circulante dos bioativos intactos no plasma.',
    relatedTopicIds: ['radicais-livres', 'estresse-oxidativo', 'vitamina-c', 'antocianinas'],
    references: [
      {
        title: 'Free Radicals in Biology and Medicine (5th Edition)',
        authors: 'Halliwell, B., & Gutteridge, J. M. C.',
        journal: 'Oxford University Press',
        year: 2015,
        doi: '10.1093/acprof:oso/9780198717478.001.0001'
      },
      {
        title: 'Assays for hydrophilic and lipophilic antioxidant capacity (oxygen radical absorbance capacity (ORAC(FL))) of plasma and other biological and food samples',
        authors: 'Prior, R. L., Hoang, H., Gu, L., Wu, X., Bacchiocca, M., Howard, L., et al.',
        journal: 'Journal of Agricultural and Food Chemistry',
        year: 2003,
        doi: '10.1021/jf0262256'
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  },
  {
    id: 'radicais-livres',
    order: 2,
    category: 'Fundamentos Moleculares',
    title: 'Radicais Livres & Espécies Reativas',
    shortSummary: 'Átomos ou moléculas contendo um elétron desemparelhado em seu orbital externo, conferindo reatividade química instantânea com estruturas celulares.',
    introduction: 'Um radical livre é qualquer espécie química capaz de existência independente que contenha um ou mais elétrons desemparelhados em seus orbitais eletrônicos. No organismo, as mais relevantes pertencem à família das Espécies Reativas de Oxigênio (ROS) e Espécies Reativas de Nitrogênio (RNS).',
    accessibleExplanation: 'Pense nos elétrons dos átomos como dançarinos que preferem sempre estar aos pares. Quando uma molécula perde um elétron por radiação, poluição ou durante a produção de energia, ela fica com um "par incompleto". Isso a torna quimicamente voraz: ela roubará um elétron de qualquer molécula vizinha (uma proteína, uma membrana ou o DNA), transformando essa vizinha em outro radical livre e disparando uma reação em cadeia perigosa.',
    scientificDetail: 'Dentre as ROS fisiológicas, destacam-se o ânion superóxido (O₂•⁻), gerado por vazamento de elétrons nos complexos I e III da cadeia transportadora de elétrons mitocondrial; o peróxido de hidrogênio (H₂O₂), que embora não seja radical livre, é um intermediário oxidante difusível; e o radical hidroxila (•OH), formado através da reação de Fenton mediada por íons de ferro ferroso (Fe²⁺ + H₂O₂ → Fe³⁺ + •OH + OH⁻). O radical hidroxila possui meia-vida de apenas ~10⁻⁹ segundos e reage instantaneamente no sítio exato de sua formação com constantes de velocidade próximas do limite difusional (~10⁹ M⁻¹ s⁻¹).',
    fruitExamples: [
      {
        fruitName: 'Açaí-do-Amazonas',
        fruitId: 'acai',
        scientificName: 'Euterpe precatoria',
        description: 'Suas antocianinas possuem capacidade comprovada de neutralizar o ânion superóxido e inibir a formação do radical peroxinitrito (ONOO⁻).'
      },
      {
        fruitName: 'Camu-camu',
        fruitId: 'camu-camu',
        scientificName: 'Myrciaria dubia',
        description: 'O ácido L-ascórbico sequestra o radical hidroxila antes que este ataque macromoléculas celulares em ambiente citoplasmático.'
      }
    ],
    experimentalRelevance: 'Nos ensaios analíticos laboratoriais, utilizam-se radicais sintéticos estáveis como o DPPH• (2,2-difenil-1-picril-hidrazila) e o ABTS•+ para mensurar a taxa de descoloração fotoespectrométrica gerada pelo extrato do fruto ao doar hidrogênios e neutralizar o radical.',
    scientificLimitations: 'Radicais livres também cumprem papéis fisiológicos indispensáveis no organismo (como sinalização redox, proliferação celular modulada e eliminação de patógenos por macrófagos). Eliminar indiscriminadamente todo o tônus oxidativo celular com megadoses artificiais não é benéfico e pode causar o chamado "estresse redutivo".',
    relatedTopicIds: ['antioxidantes', 'estresse-oxidativo', 'vitamina-c'],
    references: [
      {
        title: 'Reactive oxygen species (ROS) and response to nutrition',
        authors: 'Sies, H.',
        journal: 'Frontiers in Physiology',
        year: 2020,
        doi: '10.3389/fphys.2020.00799'
      },
      {
        title: 'Cellular mechanisms of radical scavenging and antioxidant defense',
        authors: 'Pryor, W. A.',
        journal: 'Free Radical Biology and Medicine',
        year: 2000,
        doi: '10.1016/S0891-5849(00)00219-5'
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  },
  {
    id: 'estresse-oxidativo',
    order: 3,
    category: 'Fundamentos Moleculares',
    title: 'Estresse Oxidativo',
    shortSummary: 'Desbalanço entre a produção de espécies reativas e a capacidade dos sistemas biológicos de desintoxicação e reparo celular.',
    introduction: 'O estresse oxidativo ocorre quando o equilíbrio redox intracelular é rompido em favor do estado pró-oxidante. Esse desequilíbrio leva à modificação oxidativa deletéria de macromoléculas biológicas e interfere nas vias de sinalização de transcrição celular.',
    accessibleExplanation: 'Imagine uma balança: em um prato estão as espécies reativas produzidas pelo estresse, sol, toxinas e respiração; no outro prato estão as defesas antioxidantes naturais produzidas pelo próprio corpo (enzimas como superóxido dismutase e catalase) somadas aos nutrientes ingeridos na alimentação. Quando os radicais livres pesam mais do que as defesas conseguem neutralizar, a célula entra em estado de estresse oxidativo, acelerando o envelhecimento celular e lesando tecidos.',
    scientificDetail: 'O primeiro alvo estrutural do estresse oxidativo é a fração lipídica das membranas celulares, num processo denominado peroxidação lipídica. Ácidos graxos poli-insaturados perdem hidrogênios de seus grupos metilênicos (-CH₂-), originando hidroperóxidos lipídicos (LOOH) e compostos aldeídicos citotóxicos como o malondialdeído (MDA) e o 4-hidroxi-2-nonenal (4-HNE). No núcleo, a guanina do DNA é oxidada a 8-hidroxi-2\'-desoxiguanosina (8-OHdG), marcador canônico de dano genotóxico.',
    fruitExamples: [
      {
        fruitName: 'Buriti',
        fruitId: 'buriti',
        scientificName: 'Mauritia flexuosa',
        description: 'A alta densidade de beta-caroteno e tocoferóis atua na matriz de lipídios impedindo a propagação da peroxidação lipídica de membranas.'
      },
      {
        fruitName: 'Cubiu',
        fruitId: 'cubiu',
        scientificName: 'Solanum sessiliflorum',
        description: 'Os ácidos clorogênico e cafeico inibem a oxidação de lipoproteínas de baixa densidade (LDL) in vitro.'
      }
    ],
    experimentalRelevance: 'Em laboratório, a atenuação do estresse oxidativo celular pode ser avaliada in vitro medindo a diminuição dos níveis de MDA através da reação com Ácido Tiobarbitúrico (TBARS) ou quantificando a preservação da atividade de enzimas antioxidantes endógenas (SOD e Catalase).',
    scientificLimitations: 'A presença de antioxidantes em um fruto não significa que o seu consumo cure doenças crônicas ou impeça completamente o estresse oxidativo sistêmico. O estresse oxidativo humano envolve fatores genéticos, metabólicos, imunológicos e de estilo de vida multifatoriais que não são solucionados isoladamente por uma única matriz vegetal.',
    relatedTopicIds: ['antioxidantes', 'radicais-livres', 'oxidacao-enzimatica'],
    references: [
      {
        title: 'Oxidative stress: a concept in redox biology and medicine',
        authors: 'Sies, H., Berndt, C., & Jones, D. P.',
        journal: 'Physiological Reviews',
        year: 2017,
        doi: '10.1152/physrev.00037.2016'
      },
      {
        title: 'Biomarkers of oxidative stress and antioxidant status in humans',
        authors: 'Frijhoff, J., Winyard, P. G., Dos Santos, N., et al.',
        journal: 'Comprehensive Physiology',
        year: 2015,
        doi: '10.1002/cphy.c140026'
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  },
  {
    id: 'vitamina-c',
    order: 4,
    category: 'Classes Fitoquímicas',
    title: 'Vitamina C (Ácido L-Ascórbico)',
    shortSummary: 'Lactona hidrossolúvel com grupo enediol que doa dois elétrons em cascata reversível, co-fator enzimático essencial e doador de elétrons primário.',
    introduction: 'O ácido L-ascórbico é um nutriente orgânico essencial de baixo peso molecular, solúvel em água, que atua como co-fator de enzimas hidroxilases e como o mais potente agente redutor monovalente dos compartimentos biológicos aquosos.',
    accessibleExplanation: 'A vitamina C é uma das moléculas mais dinâmicas da natureza. Ao doar seus elétrons para desativar um radical livre, ela não se destrói de imediato: transforma-se em um intermediário muito tranquilo chamado semidesidroascorbato, que pode ser reciclado pelo metabolismo celular. Além disso, a vitamina C trabalha em equipe com a vitamina E: quando a vitamina E se desgasta protegendo as gorduras da célula, a vitamina C entra em ação e devolve a capacidade protetora da vitamina E.',
    scientificDetail: 'Estruturalmente, o ácido ascórbico é uma lactona de 6 carbonos com um grupo enediol vicinal nos carbonos C2 e C3 (pKa1 = 4,17; pKa2 = 11,57). Em pH fisiológico, mais de 99% encontra-se sob a forma do ânion monovalente ascorbato (AscH⁻). Ao ceder o primeiro elétron e próton, gera o radical semidesidroascorbato (Asc•⁻), espécie fracamente reativa devido à deslocalização da densidade eletrônica sobre o sistema tricetona conjugado. A perda do segundo elétron gera o ácido desidroascórbico (DHA).',
    fruitExamples: [
      {
        fruitName: 'Camu-camu',
        fruitId: 'camu-camu',
        scientificName: 'Myrciaria dubia',
        description: 'Recordista absoluto na Amazônia, atingindo 1.800 a 2.800 mg por 100g de polpa fresca (cerca de 30 a 50 vezes a concentração de uma laranja).'
      },
      {
        fruitName: 'Cubiu',
        fruitId: 'cubiu',
        scientificName: 'Solanum sessiliflorum',
        description: 'Fornece teores moderados (~14 mg/100g) sinergizados pelo pH ácido natural do fruto rico em ácido cítrico.'
      }
    ],
    experimentalRelevance: 'Em ensaios laboratoriais, o teor de ácido ascórbico é quantificado com precisão por Cromatografia Líquida de Alta Eficiência com Detecção por Arranjo de Diodos (HPLC-DAD) a 245 nm com fase móvel ácida (tampão fosfato pH 2,5) ou por titulometria oxirredutiva com 2,6-diclorofenolindofenol (DCPIP).',
    scientificLimitations: 'A vitamina C é altamente sensível ao calor aeróbio e ao oxigênio. Polpas de frutos amazônicos processadas sem controle estrito de temperatura e embalagem podem sofrer hidrólise irreversível da lactona em ácido 2,3-dicetogulônico, perdendo completamente sua atividade de vitamina e seu potencial antioxidante.',
    relatedTopicIds: ['antioxidantes', 'temperatura-estabilidade', 'oxidacao-enzimatica'],
    references: [
      {
        title: 'Vitamin C: the known, the unknown, and the goldilocks',
        authors: 'Padayatty, S. J., & Levine, M.',
        journal: 'Oral Diseases',
        year: 2016,
        doi: '10.1111/odi.12446'
      },
      {
        title: 'Chemical composition and vitamin C stability in camu-camu (Myrciaria dubia) pulp',
        authors: 'Yuyama, K., Aguiar, J. P. L., & Yuyama, L. K. O.',
        journal: 'Acta Amazonica',
        year: 2002,
        doi: '10.1590/1809-43922002322216'
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  },
  {
    id: 'antocianinas',
    order: 5,
    category: 'Classes Fitoquímicas',
    title: 'Antocianinas',
    shortSummary: 'Pigmentos polifenólicos flavonoides hidrossolúveis que conferem colorações roxas e azuis intensas, atuando na captura de radicais de oxigênio.',
    introduction: 'As antocianinas são pigmentos vegetais pertencentes à classe dos flavonoides (esqueleto carbônico C₆-C₃-C₆). São glicosídeos de antocianidinas caracterizadas pela presença do cátion flavílio (oxônio cíclico com carga positiva deslocalizada).',
    accessibleExplanation: 'São as tintas naturais mais impressionantes da flora amazônica, responsáveis pela tonalidade arroxeada profunda e quase negra do açaí maduro. Nas copas das palmeiras da floresta, a planta produz antocianinas para proteger suas bagas contra o excesso de raios ultravioleta do sol equatorial. Para a bioquímica, essas moléculas funcionam como amortecedores de radicais livres altamente eficientes graças aos múltiplos anéis químicos que compartilham elétrons com facilidade.',
    scientificDetail: 'A molécula básica de antocianidina é o cátion 2-fenilcromeno. A presença de grupos hidroxila fenólicos livres (-OH) nos anéis A e B, particularmente na posição C4\' e C3\', permite a pronta transferência de átomos de hidrogênio (HAT) para radicais peroxil. A conjugação estendida de duplas ligações deslocaliza o elétron remanescente sobre toda a estrutura cíclica, tornando o radical fenoxil resultante termodinamicamente inerte e incapaz de propagar lesões celulares.',
    fruitExamples: [
      {
        fruitName: 'Açaí-do-Amazonas',
        fruitId: 'acai',
        scientificName: 'Euterpe precatoria',
        description: 'Apresenta predominância das antocianinas cianidina-3-rutinosídeo e cianidina-3-glicosídeo em teores médios superiores aos do açaí-do-Pará (E. oleracea).'
      },
      {
        fruitName: 'Camu-camu',
        fruitId: 'camu-camu',
        scientificName: 'Myrciaria dubia',
        description: 'Sua casca madura acumula cianidina-3-glicosídeo e delfinidina-3-glicosídeo conferindo a pigmentação púrpura avermelhada.'
      }
    ],
    experimentalRelevance: 'O teor total de antocianinas monoméricas é quantificado pelo método analítico oficial do pH Diferencial (AOAC 2005.02), medindo a absorbância em tampão cloreto de potássio (pH 1,0) e acetato de sódio (pH 4,5) nos comprimentos de onda de 520 nm e 700 nm.',
    scientificLimitations: 'As antocianinas possuem baixa biodisponibilidade em humanos: menos de 1% a 2% da quantidade ingerida oralmente atinge a circulação sistêmica de forma intacta. A maior parte é catabolizada no cólon pela microbiota entérica em ácidos fenólicos menores (como ácido protocatecuico e ácido vanílico), que podem exercer efeitos biológicos próprios que ainda estão sob ativa investigação científica.',
    relatedTopicIds: ['antioxidantes', 'ph-antocianinas', 'temperatura-estabilidade'],
    references: [
      {
        title: 'Anthocyanins: Natural colorants with health-promoting properties',
        authors: 'Wallace, T. C., & Giusti, M. M.',
        journal: 'Annual Review of Food Science and Technology',
        year: 2015,
        doi: '10.1146/annurev-food-022814-015532'
      },
      {
        title: 'Comparative study on phytochemical composition and antioxidant capacities of Euterpe precatoria and Euterpe oleracea',
        authors: 'Kang, J., Thakali, K. M., Xie, C., Kondo, M., Tong, Y., Ou, B., et al.',
        journal: 'Journal of Agricultural and Food Chemistry',
        year: 2012,
        doi: '10.1021/jf204312v'
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  },
  {
    id: 'carotenoides',
    order: 6,
    category: 'Classes Fitoquímicas',
    title: 'Carotenoides',
    shortSummary: 'Tetraterpenos lipofílicos dotados de cadeia poliênica conjugada com capacidade singular de desativar oxigênio singlete fotoquímico.',
    introduction: 'Os carotenoides são pigmentos lipossolúveis isoprenoides de 40 carbonos (tetraterpenos) sintetizados por plantas e microrganismos. Subdividem-se em carotenos (hidrocarbonetos puros como o beta-caroteno) e xantofilas (contendo átomos de oxigênio, como luteína e zeaxantina).',
    accessibleExplanation: 'Se as antocianinas são os pigmentos roxos das águas da célula, os carotenoides são os pigmentos dourados, amarelos e avermelhados das gorduras e óleos. São eles que dão a cor viva à polpa do buriti e do tucumã. Por serem lipofílicos (amigos das gorduras), eles se instalam no interior das membranas que revestem nossas células, atuando como protetores solares internos que impedem a oxidação provocada pela luz e pelos radicais derivados de lipídios.',
    scientificDetail: 'A característica bioquímica mais relevante dos carotenoides é o seu sistema cromóforo de duplas ligações carbono-carbono conjugadas (geralmente entre 9 e 11 duplas ligações). Esse arranjo eletrônico permite a extinção física do oxigênio singlete (¹O₂), uma espécie excitada altamente destrutiva. O carotenoide recebe a energia de excitação eletrônica do oxigênio singlete passando para o estado triplete excitado (³Car*), e em seguida dissipa essa energia sob forma inofensiva de calor por vibração rotacional com o solvente, voltando ao estado fundamental sem ser consumido quimicamente.',
    fruitExamples: [
      {
        fruitName: 'Buriti',
        fruitId: 'buriti',
        scientificName: 'Mauritia flexuosa',
        description: 'Apresenta teores extraordinários de beta-caroteno (até 34.500 µg/100g de polpa), sendo a fonte vegetal de provitaminas A mais concentrada da bacia amazônica.'
      },
      {
        fruitName: 'Tucumã-do-Amazonas',
        fruitId: 'tucuma',
        scientificName: 'Astrocaryum aculeatum',
        description: 'Sua polpa oleosa é densa em all-trans-beta-caroteno e zeaxantina, dispersos em uma matriz rica em ácido oleico que maximiza a absorção.'
      }
    ],
    experimentalRelevance: 'A separação de isômeros geométricos (all-trans vs 9-cis e 13-cis) de carotenoides de buriti e tucumã é realizada por cromatografia líquida de fase reversa em coluna C30 polimérica acoplada a detector DAD (varredura de 400 a 500 nm), indispensável para mensurar taxas de fotoisomerização.',
    scientificLimitations: 'A absorção biológica de carotenoides depende estritamente da co-ingestão de lipídios dietéticos na refeição para formar micelas mistas com os sais biliares no lúmen do duodeno. Em indivíduos com esteatorreia ou dietas estritamente desprovidas de gorduras, a absorção de provitamina A a partir de fontes vegetais é drasticamente reduzida.',
    relatedTopicIds: ['antioxidantes', 'estresse-oxidativo', 'temperatura-estabilidade'],
    references: [
      {
        title: 'Identification and quantification of carotenoids, by HPLC-DAD-MS/MS, from Amazonian fruits: Tucumã (Astrocaryum aculeatum)',
        authors: 'Rosso, V. V., & Mercadante, A. Z.',
        journal: 'Journal of Food Composition and Analysis',
        year: 2007,
        doi: '10.1016/j.jfca.2007.03.004'
      },
      {
        title: 'Carotenoids: physical, chemical, and biological properties',
        authors: 'Britton, G.',
        journal: 'The FASEB Journal',
        year: 1995,
        doi: '10.1096/fasebj.9.15.8529834'
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  },
  {
    id: 'oxidacao-enzimatica',
    order: 7,
    category: 'Cinética & Estabilidade',
    title: 'Oxidação Enzimática & Escurecimento',
    shortSummary: 'Ação das enzimas polifenoloxidase (PPO) e peroxidase (POD) na formação de orto-quinonas e polímeros escuros que depreciam bioativos.',
    introduction: 'A oxidação enzimática é a principal causa bioquímica de deterioração sensorial e perda nutricional em frutos amazônicos pós-colheita. É catalisada por enzimas oxidoredutases nativas que utilizam oxigênio molecular ou peróxido para oxidar substratos fenólicos naturais.',
    accessibleExplanation: 'Sabe quando você corta uma maçã ou descasca um açaí e, em poucos minutos, a polpa exposta ao ar começa a ficar amarronzada e sem brilho? Isso não é magia nem podridão instantânea: são enzimas internas da planta (como a polifenoloxidase) que estavam guardadas em compartimentos separados e entram em contato com o ar e com os polifenóis assim que o tecido vegetal é ferido. Elas oxidam os antioxidantes benéficos, destruindo sua capacidade protetora e formando manchas escuras chamadas melaninas.',
    scientificDetail: 'A Polifenoloxidase (PPO) possui cobre em seu sítio ativo e catalisa duas reações sequenciais: a hidroxilação de monofenóis em orto-difenóis (atividade cresolase) e a oxidação dos orto-difenóis a orto-quinonas (atividade catecolase). As orto-quinonas são eletrófilos altamente reativos que sofrem condensação não enzimática espontânea e polimerização cruzada com grupos amino de proteínas e compostos fenólicos, gerando pigmentos insolúveis pardos (melaninas).',
    fruitExamples: [
      {
        fruitName: 'Açaí-do-Amazonas',
        fruitId: 'acai',
        scientificName: 'Euterpe precatoria',
        description: 'Exige branqueamento térmico imediato (80°C por 10 a 15 s) para inativar a PPO antes do despolpamento mecânico.'
      },
      {
        fruitName: 'Cubiu',
        fruitId: 'cubiu',
        scientificName: 'Solanum sessiliflorum',
        description: 'A elevada acidez natural (pH ~3,4 devido ao ácido cítrico) atua como inibidor natural da PPO, reduzindo sua atividade catalítica.'
      }
    ],
    experimentalRelevance: 'A cinética enzimática da PPO e POD é acompanhada espectrofotometricamente em cubeta termostatizada a 420 nm, medindo a velocidade inicial (V₀) de formação de o-quinonas em meio tamponado contendo catecol como substrato modelo.',
    scientificLimitations: 'A inativação de enzimas por tratamentos térmicos industriais agressivos (como pasteurizações prolongadas acima de 95°C) resolve o escurecimento enzimático, mas pode desencadear escurecimento não enzimático (Reação de Maillard) e degradação térmica de antocianinas e ácido ascórbico.',
    relatedTopicIds: ['antocianinas', 'vitamina-c', 'temperatura-estabilidade', 'ph-antocianinas'],
    references: [
      {
        title: 'Polyphenol oxidase in crops: biochemical properties and physiological roles',
        authors: 'Yoruk, R., & Marshall, M. R.',
        journal: 'Journal of Food Biochemistry',
        year: 2003,
        doi: '10.1111/j.1745-4514.2003.tb00293.x'
      },
      {
        title: 'Thermal inactivation of peroxidase and polyphenol oxidase in açaí (Euterpe oleracea) pulp',
        authors: 'Rogez, H.',
        journal: 'Açaí: preparo, composição e melhoramento da conservação (EDUFPA)',
        year: 2000
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  },
  {
    id: 'temperatura-estabilidade',
    order: 8,
    category: 'Cinética & Estabilidade',
    title: 'Temperatura & Estabilidade dos Compostos',
    shortSummary: 'Impacto da energia térmica nas constantes cinéticas de degradação de vitaminas e flavonoides segundo a teoria de Arrhenius.',
    introduction: 'A temperatura é a variável termodinâmica mais determinante na taxa de conservação de compostos bioativos durante a pós-colheita, transporte fluvial amazônico e processamento agroindustrial.',
    accessibleExplanation: 'Em química, o calor atua como um acelerador: quanto mais quente o ambiente, mais rápido as moléculas colidem entre si e se quebram. Na Amazônia, onde as temperaturas diurnas durante o transporte em barcos podem ultrapassar 35°C na sombra, os frutos perdem grande parte de suas vitaminas e antocianinas em questão de poucas horas se ficarem sem gelo. O resfriamento rápido a 4°C e o congelamento a -18°C "congelam o tempo químico", mantendo os bioativos preservados por meses.',
    scientificDetail: 'A cinética de degradação térmica da maioria dos antioxidantes polifenólicos e do ácido ascórbico segue um modelo cinético de primeira ordem aparente (ln [C]/[C₀] = -k × t). A dependência da constante de velocidade de degradação (k) com a temperatura absoluta (T em Kelvin) é descrita com precisão pela Equação de Arrhenius: k = A × exp(-Ea / RT), onde Ea representa a Energia de Ativação do processo degradativo e R é a constante universal dos gases.',
    fruitExamples: [
      {
        fruitName: 'Camu-camu',
        fruitId: 'camu-camu',
        scientificName: 'Myrciaria dubia',
        description: 'Sob temperatura ambiente (25°C), perde 35% de seu ácido L-ascórbico em 15 dias; sob congelamento (-18°C), retém 91% após 120 dias.'
      },
      {
        fruitName: 'Açaí-do-Amazonas',
        fruitId: 'acai',
        scientificName: 'Euterpe precatoria',
        description: 'A pasteurização rápida HTST (85°C / 15 s) garante retenção de 92% das antocianinas ao inativar enzimas sem tempo para hidrólise térmica severa.'
      }
    ],
    experimentalRelevance: 'Os parâmetros cinéticos (k, tempo de meia-vida t½ e valor D) são obtidos experimentalmente aquecendo amostras de polpa a banho-maria termostatizado em diferentes patamares (60°C, 70°C, 80°C e 90°C) com coletas periódicas e quantificação por espectrofotometria ou HPLC.',
    scientificLimitations: 'Modelos de Arrhenius assumem mecanismos reacionais unimoleculares constantes. Em matrizes complexas de frutos amazônicos contendo açúcares, pectina e ácidos graxos, podem ocorrer reações concorrentes secundárias e transições de fase líquida-vítrea durante o congelamento que alteram a energia de ativação aparente.',
    relatedTopicIds: ['antioxidantes', 'vitamina-c', 'oxidacao-enzimatica', 'ph-antocianinas'],
    references: [
      {
        title: 'Chemical kinetics of degradation of anthocyanins and vitamin C in fruit products: A review',
        authors: 'Patras, A., Brunton, N. P., O\'Donnell, C., & Tiwari, B. K.',
        journal: 'Food Chemistry',
        year: 2010,
        doi: '10.1016/j.foodchem.2009.12.018'
      },
      {
        title: 'Thermal stability and degradation kinetics of bioactive compounds in tropical fruits',
        authors: 'van Boekel, M. A. J. S.',
        journal: 'Comprehensive Reviews in Food Science and Food Safety',
        year: 2008,
        doi: '10.1111/j.1541-4337.2007.00030.x'
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  },
  {
    id: 'ph-antocianinas',
    order: 9,
    category: 'Cinética & Estabilidade',
    title: 'Influência do pH nas Antocianinas',
    shortSummary: 'O equilíbrio tautomérico dependente de prótons que governa a coloração e a estabilidade conformacional do cátion flavílio.',
    introduction: 'As antocianinas comportam-se em solução aquosa como indicadores naturais de pH devido à presença de prótons ionizáveis e oxigênio carregado no anel heterocíclico. O valor de pH do meio altera a estrutura molecular e determina a cor e a resistência oxidativa do pigmento.',
    accessibleExplanation: 'As antocianinas do açaí são verdadeiros camaleões químicos da floresta. Em meio bem ácido (pH baixo, como dentro de frutos ácidos), elas exibem sua coloração vermelha e roxa brilhante e estão em sua forma mais resistente e protetora. À medida que o ambiente se torna menos ácido ou neutro (pH acima de 4,5), a molécula sofre um ataque químico da água, perde sua cor e passa a se transformar em compostos incolores e amarelados que se decompõem com muita facilidade.',
    scientificDetail: 'Em solução aquosa, as antocianinas existem em um equilíbrio dinâmico reversível entre quatro espécies químicas principais governadas pelo pH: (1) Cátion Flavílio (vermelho-púrpura, estável em pH 1,0 a 3,0); (2) Base Quinoidal anidra desprotonada (azul/violeta, formada em pH 6,0 a 7,0); (3) Pseudobase Carbinol incolor (hemiacetal formado por hidratação nucleofílica da água na posição C2 em pH 4,0 a 5,0); e (4) Chalcona aberta (amarelo claro). Em pH > 4,5, a rápida hidratação e abertura do anel levam à perda irreversível da cor e clivagem em ácido vanílico e ácido protocatecuico.',
    fruitExamples: [
      {
        fruitName: 'Açaí-do-Amazonas',
        fruitId: 'acai',
        scientificName: 'Euterpe precatoria',
        description: 'Possui pH natural entre 4,2 e 4,8, faixa limítrofe onde coexistem o cátion flavílio e a base quinoidal. Pequenas variações de acidez impactam fortemente a coloração da polpa.'
      },
      {
        fruitName: 'Camu-camu',
        fruitId: 'camu-camu',
        scientificName: 'Myrciaria dubia',
        description: 'Seu pH naturalmente hiperácido (2,6 a 2,9) mantém as antocianinas da casca integralmente na forma do cátion flavílio, garantindo máxima estabilidade redox.'
      }
    ],
    experimentalRelevance: 'O método de pH diferencial baseia-se exatamente nesse comportamento: em pH 1,0 a absorbância a 520 nm é máxima devido à forma exclusiva de cátion flavílio; em pH 4,5 a absorbância é nula a 520 nm porque a molécula passa para a forma de pseudobase carbinol incolor. A diferença espectral reflete com precisão a concentração de antocianinas monoméricas intactas.',
    scientificLimitations: 'A proteção conferida pelo pH ácido não anula a sensibilidade das antocianinas à radiação UV e à presença de cátions metálicos de ferro ou cobre livre em equipamentos industriais de processamento desprovidos de aço inoxidável passivado.',
    relatedTopicIds: ['antocianinas', 'temperatura-estabilidade', 'oxidacao-enzimatica'],
    references: [
      {
        title: 'Structural transformations of anthocyanins in aqueous media',
        authors: 'Brouillard, R., & Delaporte, B.',
        journal: 'Journal of the American Chemical Society',
        year: 1977,
        doi: '10.1021/ja00468a015'
      },
      {
        title: 'Color stability and degradation of anthocyanins in açaí (Euterpe oleracea) pulp at different pH values',
        authors: 'Pacheco-Palencia, L. A., & Mertens-Talcott, S. U.',
        journal: 'Food Chemistry',
        year: 2007,
        doi: '10.1016/j.foodchem.2007.03.011'
      }
    ],
    updatedAt: '16/10/2026',
    verificationStatus: 'Validado por Literatura Indexada'
  }
];
