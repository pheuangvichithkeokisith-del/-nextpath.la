export type DimensionId =
  | 'practical'
  | 'creative'
  | 'analytical'
  | 'social'
  | 'enterprise'
  | 'technology'
  | 'nature'
  | 'culture';

export type CareerClusterId =
  | 'law_policy'
  | 'finance_econ'
  | 'health_medical'
  | 'stem_tech'
  | 'creative_media'
  | 'vocational_trade';

export interface CareerClusterMeta {
  id: CareerClusterId;
  nameLo: string;
  nameEn: string;
  iconName: string;
  accentColor: string;
  descriptionLo: string;
}

export interface DimensionMeta {
  id: DimensionId;
  nameLo: string;
  nameEnHint: string;
  descriptionLo: string;
  iconName: string;
  accentColor: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  enHint?: string;
  dimensions?: Partial<Record<DimensionId, number>>;
  specialTag?: string;
}

export interface Question {
  id: string;
  moduleId: string;
  numberText: string;
  title: string;
  helpText?: string;
  type: 'single' | 'multiple' | 'select';
  minSelections?: number;
  maxSelections?: number;
  options: QuestionOption[];
  required: boolean;
}

export interface ModuleInfo {
  id: string;
  number: number;
  title: string;
  description: string;
  questionIds: string[];
}

export type AnswersMap = Record<string, string | string[]>;

export interface ReflectionSignal {
  dimensionId: DimensionId;
  nameLo: string;
  nameEnHint: string;
  descriptionLo: string;
  levelText: string; // e.g., 'ເຫັນໄດ້ຊັດເຈນ', 'ມີຄວາມສົນໃຈປານກາງ'
  intensity: number; // 0 to 100
  accentColor: string;
}

export interface FamilyTranslation {
  suggestedScriptLo: string;
  traditionalRoleEquivalent: string;
  stabilityAngleLo: string;
}

export interface PossiblePath {
  pathNumber: number; // 1, 2, 3
  title: string;
  subtitle: string;
  whyThisFits: string;
  examplesInLaos: string[];
  fieldAreas: string[];
  archetypeTag?: string;
  familyTranslation?: FamilyTranslation;
}

export interface MicroExperiment {
  id: string;
  title: string;
  timeCommitment: string;
  description: string;
  actionSteps: string[];
  reassuranceNote: string;
  validationMetricLo?: string;
}

export interface FamilyCommunicationGuide {
  coreAdviceLo: string;
  pathTranslations: Array<{
    pathTitle: string;
    whatNotToSayLo: string;
    whatToSayLo: string;
    whyItBuildsTrustLo: string;
  }>;
}

export interface PortfolioMilestone {
  period: string;
  objective: string;
  tasks: string[];
  portfolioDeliverable: string;
}

export interface PortfolioRoadmap {
  title: string;
  focusArea: string;
  milestones: PortfolioMilestone[];
  resumeTipLo: string;
}

export interface ProfileConfidence {
  levelText: 'Specialist' | 'Multidisciplinary Explorer';
  score: number;
  isGeneralist: boolean;
  adviceLo: string;
}

export interface EvidenceItem {
  questionId: string;
  questionTitle: string;
  userAnswerLabels: string[];
  reflectedTheme: string;
  explanationLo: string;
}

export interface ReflectionReport {
  sessionId: string;
  createdAt: string;
  demographics: {
    ageStage: string;
    currentTrack: string;
    province: string;
  };
  overview: {
    salutation: string;
    coreEssence: string;
    signals: ReflectionSignal[];
  };
  interestsAndValues: {
    headline: string;
    narrative: string;
    keyThemes: Array<{
      title: string;
      description: string;
      enHint?: string;
    }>;
  };
  workingStyles: {
    headline: string;
    learningStyle: string;
    teamRole: string;
    thrivingEnvironment: string;
  };
  tensionsAndUncertainties: {
    headline: string;
    comfortingNote: string;
    notedTensions: string[];
    reflectionPrompts: string[];
  };
  possiblePaths: PossiblePath[];
  careerCluster?: {
    id: CareerClusterId;
    nameLo: string;
    nameEn: string;
    descriptionLo: string;
  };
  suggestedExperiments: MicroExperiment[];
  familyCommunicationGuide?: FamilyCommunicationGuide;
  portfolioRoadmap?: PortfolioRoadmap;
  profileConfidence?: ProfileConfidence;
  transparencyEvidence: EvidenceItem[];
  aiPromptMarkdown: string;
}

export interface FeedbackData {
  sessionId: string;
  accuracyRating: number; // 1 - 5
  feltComfortable: boolean;
  comments: string;
  submittedAt: string;
}
