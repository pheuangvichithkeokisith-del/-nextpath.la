import {
  AnswersMap,
  CareerClusterId,
  DimensionId,
  EvidenceItem,
  FamilyCommunicationGuide,
  MicroExperiment,
  PossiblePath,
  ReflectionReport,
  ReflectionSignal,
} from '../types/questionnaire';
import { CAREER_CLUSTERS, DIMENSIONS, LAO_PROVINCES, QUESTIONS } from '../data/questionnaireData';

export function calculateReflectionReport(answers: AnswersMap, sessionId: string): ReflectionReport {
  // 1. Calculate raw scores across 8 dimensions
  const dimensionScores: Record<DimensionId, number> = {
    practical: 0,
    creative: 0,
    analytical: 0,
    social: 0,
    enterprise: 0,
    technology: 0,
    nature: 0,
    culture: 0,
  };

  const evidenceItems: EvidenceItem[] = [];

  // Iterate over answered questions
  for (const q of QUESTIONS) {
    const rawAnswer = answers[q.id];
    if (!rawAnswer) continue;

    const answerIds = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
    const selectedOptions = q.options.filter((opt) => answerIds.includes(opt.id));
    const labels = selectedOptions.map((opt) => opt.label);

    let impactedDimensions: string[] = [];

    for (const opt of selectedOptions) {
      if (opt.dimensions) {
        for (const [dim, weight] of Object.entries(opt.dimensions)) {
          if (weight && dim in dimensionScores) {
            dimensionScores[dim as DimensionId] += weight;
            impactedDimensions.push(DIMENSIONS[dim as DimensionId]?.nameLo || dim);
          }
        }
      }
    }

    if (impactedDimensions.length > 0) {
      evidenceItems.push({
        questionId: q.id,
        questionTitle: q.title,
        userAnswerLabels: labels,
        reflectedTheme: Array.from(new Set(impactedDimensions)).join(', '),
        explanationLo: `ຄຳຕອບຂອງທ່ານໃນຂໍ້ນີ້ສະແດງເຖິງຄວາມສົນໃຈໃນດ້ານ "${Array.from(new Set(impactedDimensions)).join(', ')}" ເຊິ່ງຊ່ວຍສ້າງພາບຮູບແບບຄວາມຖະໜັດຂອງທ່ານ`,
      });
    }
  }

  // Demographics extraction
  const d1Val = answers['D1'] as string;
  const d2Val = answers['D2'] as string;
  const d3Val = answers['D3'] as string;

  const d1Opt = QUESTIONS.find((q) => q.id === 'D1')?.options.find((o) => o.id === d1Val);
  const d2Opt = QUESTIONS.find((q) => q.id === 'D2')?.options.find((o) => o.id === d2Val);
  const provinceObj = LAO_PROVINCES.find((p) => p.id === d3Val);

  const ageStage = d1Opt?.label || 'ໄວໜຸ່ມອາຍຸ 15 ປີຂຶ້ນໄປ';
  const currentTrack = d2Opt?.label || 'ສາຍການຮຽນທົ່ວໄປ';
  const provinceName = provinceObj ? provinceObj.nameLo : 'ປະເທດລາວ';

  // 2. Career Cluster Vector Analysis across 6 Major Academic & Vocational Clusters
  const clusterScores: Record<CareerClusterId, number> = {
    stem_tech: 0,
    finance_econ: 0,
    health_medical: 0,
    law_policy: 0,
    creative_media: 0,
    vocational_trade: 0,
  };

  // 2.1 Direct Alignment from Current School Track (D2)
  if (d2Val === 'd2_1') {
    // วิทย์-คณิต
    clusterScores.stem_tech += 4;
    clusterScores.health_medical += 4;
  } else if (d2Val === 'd2_2') {
    // ศิลป์-คำนวณ
    clusterScores.finance_econ += 5;
  } else if (d2Val === 'd2_3') {
    // ศิลป์-ภาษา และ สังคมศาสตร์
    clusterScores.law_policy += 5;
    clusterScores.creative_media += 2;
  } else if (d2Val === 'd2_4') {
    // สายอาชีพ / ปวช / ปวส
    clusterScores.vocational_trade += 5;
  }

  // 2.2 Domain Filter Anchor (Q8b - The Root Problem-Solving Instinct)
  const q8bVal = answers['Q8b'] as string;
  if (q8bVal === 'q8b_law') clusterScores.law_policy += 7;
  if (q8bVal === 'q8b_finance') clusterScores.finance_econ += 7;
  if (q8bVal === 'q8b_health') clusterScores.health_medical += 7;
  if (q8bVal === 'q8b_tech') clusterScores.stem_tech += 7;
  if (q8bVal === 'q8b_media') clusterScores.creative_media += 7;
  if (q8bVal === 'q8b_trade') clusterScores.vocational_trade += 7;

  // 2.3 Inspect Question Nuances across Modules
  // Q1 (Free Time)
  if (answers['Q1'] === 'q1_4') clusterScores.stem_tech += 2;
  if (answers['Q1'] === 'q1_6') clusterScores.finance_econ += 3;
  if (answers['Q1'] === 'q1_7') clusterScores.law_policy += 3;
  if (answers['Q1'] === 'q1_8') {
    clusterScores.vocational_trade += 2;
    clusterScores.health_medical += 2;
  }
  if (answers['Q1'] === 'q1_1') clusterScores.creative_media += 2;

  // Q3 (Clubs)
  if (answers['Q3'] === 'q3_2') clusterScores.stem_tech += 3;
  if (answers['Q3'] === 'q3_4') clusterScores.finance_econ += 3;
  if (answers['Q3'] === 'q3_6') clusterScores.law_policy += 4;
  if (answers['Q3'] === 'q3_7') clusterScores.health_medical += 4;
  if (answers['Q3'] === 'q3_8') clusterScores.vocational_trade += 4;
  if (answers['Q3'] === 'q3_1') clusterScores.creative_media += 3;

  // Q4 (Media / Feeds)
  if (answers['Q4'] === 'q4_4') clusterScores.stem_tech += 3;
  if (answers['Q4'] === 'q4_6') clusterScores.finance_econ += 4;
  if (answers['Q4'] === 'q4_7') clusterScores.health_medical += 4;
  if (answers['Q4'] === 'q4_8') clusterScores.law_policy += 4;
  if (answers['Q4'] === 'q4_1') clusterScores.vocational_trade += 3;

  // Q7 (Comfortable Subjects)
  if (answers['Q7'] === 'q7_5') clusterScores.stem_tech += 3;
  if (answers['Q7'] === 'q7_2') {
    clusterScores.stem_tech += 2;
    clusterScores.finance_econ += 2;
  }
  if (answers['Q7'] === 'q7_6') clusterScores.finance_econ += 4;
  if (answers['Q7'] === 'q7_7') clusterScores.health_medical += 4;
  if (answers['Q7'] === 'q7_8') clusterScores.law_policy += 4;
  if (answers['Q7'] === 'q7_1') clusterScores.vocational_trade += 3;
  if (answers['Q7'] === 'q7_4') clusterScores.creative_media += 3;

  // Q9 (Skills)
  const q9Answers = Array.isArray(answers['Q9']) ? answers['Q9'] : [answers['Q9']];
  if (q9Answers.includes('q9_2')) clusterScores.stem_tech += 4;
  if (q9Answers.includes('q9_4')) clusterScores.finance_econ += 4;
  if (q9Answers.includes('q9_9')) clusterScores.law_policy += 5;
  if (q9Answers.includes('q9_10')) clusterScores.health_medical += 5;
  if (q9Answers.includes('q9_11')) clusterScores.vocational_trade += 5;
  if (q9Answers.includes('q9_3')) clusterScores.creative_media += 4;

  // Q10 (Work Tools)
  if (answers['Q10'] === 'q10_1') clusterScores.stem_tech += 2;
  if (answers['Q10'] === 'q10_6') clusterScores.finance_econ += 4;
  if (answers['Q10'] === 'q10_7') clusterScores.health_medical += 4;
  if (answers['Q10'] === 'q10_8') clusterScores.law_policy += 4;
  if (answers['Q10'] === 'q10_3') {
    clusterScores.vocational_trade += 3;
    clusterScores.stem_tech += 2;
  }

  // Q11 (Role Models / Wow Factor)
  if (answers['Q11'] === 'q11_2') clusterScores.stem_tech += 3;
  if (answers['Q11'] === 'q11_6') clusterScores.law_policy += 4;
  if (answers['Q11'] === 'q11_7') clusterScores.finance_econ += 4;
  if (answers['Q11'] === 'q11_4') clusterScores.health_medical += 4;
  if (answers['Q11'] === 'q11_8') clusterScores.vocational_trade += 4;
  if (answers['Q11'] === 'q11_1') clusterScores.creative_media += 3;

  // Q16 (Who to help)
  if (answers['Q16'] === 'q16_5') clusterScores.stem_tech += 3;
  if (answers['Q16'] === 'q16_4') clusterScores.finance_econ += 3;
  if (answers['Q16'] === 'q16_6') clusterScores.health_medical += 4;
  if (answers['Q16'] === 'q16_7') clusterScores.law_policy += 4;
  if (answers['Q16'] === 'q16_3') clusterScores.creative_media += 3;

  // Q27 (Micro-experiment trial)
  if (answers['Q27'] === 'q27_1') clusterScores.stem_tech += 2;
  if (answers['Q27'] === 'q27_4') clusterScores.finance_econ += 3;
  if (answers['Q27'] === 'q27_6') clusterScores.law_policy += 4;
  if (answers['Q27'] === 'q27_7') clusterScores.health_medical += 4;
  if (answers['Q27'] === 'q27_8') clusterScores.vocational_trade += 4;
  if (answers['Q27'] === 'q27_2') clusterScores.creative_media += 3;

  // 2.4 Dimension Cross-Weights to Clusters
  clusterScores.law_policy += Math.round((dimensionScores.culture * 0.4) + (dimensionScores.analytical * 0.3));
  clusterScores.finance_econ += Math.round((dimensionScores.analytical * 0.4) + (dimensionScores.enterprise * 0.3));
  clusterScores.health_medical += Math.round((dimensionScores.social * 0.4) + (dimensionScores.analytical * 0.3));
  clusterScores.stem_tech += Math.round((dimensionScores.technology * 0.4) + (dimensionScores.analytical * 0.3));
  clusterScores.creative_media += Math.round((dimensionScores.creative * 0.4) + (dimensionScores.culture * 0.3));
  clusterScores.vocational_trade += Math.round((dimensionScores.practical * 0.4) + (dimensionScores.enterprise * 0.2));

  // Sort clusters by score
  const sortedClusters = (Object.keys(clusterScores) as CareerClusterId[]).sort(
    (a, b) => clusterScores[b] - clusterScores[a]
  );
  const primaryCluster = sortedClusters[0];
  const secondaryCluster = sortedClusters[1];

  // 3. Sort dimensions by score
  const sortedDimensions = (Object.keys(dimensionScores) as DimensionId[]).sort(
    (a, b) => dimensionScores[b] - dimensionScores[a]
  );

  const maxScore = Math.max(...Object.values(dimensionScores), 1);

  // Signals with Contextual Framing based on Primary Cluster
  const signals: ReflectionSignal[] = sortedDimensions.map((dimId) => {
    const meta = DIMENSIONS[dimId];
    const score = dimensionScores[dimId];
    const percentage = Math.round((score / maxScore) * 100);

    let levelText = 'ມີຄວາມສົນໃຈບາງສ່ວນ';
    if (percentage >= 75) {
      levelText = 'ເຫັນໄດ້ຊັດເຈນຫຼາຍ (Dominant)';
    } else if (percentage >= 50) {
      levelText = 'ມີຄວາມສົນໃຈໂດດເດັ່ນ (Strong)';
    } else if (percentage >= 30) {
      levelText = 'ມີຄວາມສົນໃຈປານກາງ (Moderate)';
    }

    let descriptionLo = meta.descriptionLo;

    // Cluster-specific nuance adaptation
    if (dimId === 'practical') {
      if (primaryCluster === 'stem_tech') {
        descriptionLo = 'ມັກການສ້າງຕົ້ນແບບ (Prototyping), ງານຫ້ອງທົດລອງ, ການຮື້-ປະກອບຮາດແວ ຫຼື ການຂຽນໂຄດແກ້ບັນຫາຕົວຈິງ';
      } else if (primaryCluster === 'vocational_trade') {
        descriptionLo = 'ມັກການລົງມືເຮັດຕົວຈິງດ້ວຍສີມືປານີດ, ສິລະປະການປຸງແຕ່ງອາຫານ, ງານບໍລິການ ແລະ ງານຊ່າງເຕັກນິກສະເພາະ';
      } else if (primaryCluster === 'health_medical') {
        descriptionLo = 'ມັກການປະຕິບັດການຄລີນິກ, ການປະຖົມພະຍາບານ, ງານຫ້ອງວິໄຈ ແລະ ການດູແລຄົນເຈັບຢ່າງໃກ້ຊິດ';
      }
    } else if (dimId === 'analytical') {
      if (primaryCluster === 'finance_econ') {
        descriptionLo = 'ມັກການວິເຄາະຕົວເລກ, ໂມເດວເສດຖະກິດ, ການກວດສອບງົບການເງິນ ແລະ ການປະເມີນຄວາມສ່ຽງທາງທຸລະກິດ';
      } else if (primaryCluster === 'law_policy') {
        descriptionLo = 'ມັກການໃຊ້ຕັກກະເຫດຜົນ, ການຕີຄວາມຂໍ້ກົດໝາຍ, ການກວດສອບຫຼັກຖານ ແລະ ການໂຕ້ແຍ້ງຢ່າງມີຫຼັກການ';
      } else if (primaryCluster === 'health_medical') {
        descriptionLo = 'ມັກການວິເຄາະອາການ, ລະບາດວິທະຍາ, ງານວິໄຈຊີວະການແພດ ແລະ ກົນໄກການປິ່ນປົວ';
      }
    } else if (dimId === 'culture') {
      if (primaryCluster === 'law_policy') {
        descriptionLo = 'ມັກການສຶກສາກົດໝາຍ, ປະຫວັດສາດການເມືອງ, ການພົວພັນສາກົນ, ພາສາຕ່າງປະເທດ ແລະ ຫຼັກການຍຸຕິທຳ';
      }
    }

    return {
      dimensionId: dimId,
      nameLo: meta.nameLo,
      nameEnHint: meta.nameEnHint,
      descriptionLo,
      levelText,
      intensity: percentage,
      accentColor: meta.accentColor,
    };
  });

  const primaryDim = sortedDimensions[0] || 'analytical';
  const secondaryDim = sortedDimensions[1] || 'technology';
  const tertiaryDim = sortedDimensions[2] || 'practical';

  const primaryMeta = DIMENSIONS[primaryDim];
  const secondaryMeta = DIMENSIONS[secondaryDim];
  const primaryClusterMeta = CAREER_CLUSTERS[primaryCluster];

  // Overview with Cluster Resonance
  const overview = {
    salutation: `ສະບາຍດີ, ນີ້ຄືພາບສະທ້ອນບາງມຸມມອງຈາກຄຳຕອບຂອງທ່ານ`,
    coreEssence: `ຈາກຄຳຕອບຂອງທ່ານ ທ່າແຮງທີ່ໂດດເດັ່ນທີ່ສຸດສອດຄ່ອງກັບກຸ່ມອາຊີບ "${primaryClusterMeta.nameLo}" (${primaryClusterMeta.nameEn}). ທ່ານມີພະລັງພິເສດໃນດ້ານ "${primaryMeta.nameLo}" ປະສານກັບ "${secondaryMeta.nameLo}". ສິ່ງນີ້ຊີ້ໃຫ້ເຫັນເຖິງໂຄງສ້າງຄວາມຄິດທີ່ພ້ອມເຕີບໂຕສູ່ການເປັນມືອາຊີບໃນສາຍນີ້.`,
    signals,
  };

  // Interests & Values
  const keyThemes = [
    {
      title: primaryMeta.nameLo,
      description: `ທ່ານມີຄວາມສຸກເມື່ອໄດ້ ${primaryMeta.descriptionLo.toLowerCase()}. ນີ້ຄືພື້ນທີ່ທີ່ເຮັດໃຫ້ທ່ານເກີດພາວະຈົດຈໍ່ (Flow State).`,
      enHint: primaryMeta.nameEnHint,
    },
    {
      title: secondaryMeta.nameLo,
      description: `ນອກຈາກນັ້ນ ທ່ານຍັງມີຄວາມສາມາດໃນການ ${secondaryMeta.descriptionLo.toLowerCase()}, ຊ່ວຍໃຫ້ທ່ານສາມາດນຳໃຊ້ທັກສະຫຼາຍດ້ານມາປະສານກັນ.`,
      enHint: secondaryMeta.nameEnHint,
    },
    {
      title: `ກຸ່ມອາຊີບເປົ້າໝາຍ: ${primaryClusterMeta.nameEn}`,
      description: primaryClusterMeta.descriptionLo,
      enHint: primaryClusterMeta.nameEn,
    },
  ];

  const interestsAndValues = {
    headline: 'ສິ່ງທີ່ທ່ານໃຫ້ຄວາມສຳຄັນ ແລະ ເປັນແຫຼ່ງພະລັງໃຈ',
    narrative: `ສຳລັບທ່ານໃນບໍລິບົດຂອງ ${provinceName}, ຄຸນຄ່າທີ່ແທ້ຈິງມາຈາກການໄດ້ພັດທະນາຕົນເອງໃນສິ່ງທີ່ຖະໜັດ ແລະ ສາມາດນຳເອົາຄວາມຮູ້ຄວາມສາມາດໄປສ້າງປະໂຫຍດ ແລະ ຄວາມໝັ້ນຄົງໃຫ້ກັບຄອບຄົວ ແລະ ສັງຄົມ.`,
    keyThemes,
  };

  // Working Styles
  const q5Ans = answers['Q5'] as string;
  let learningStyle = 'ມັກການຮຽນຮູ້ແບບລົງມືທົດລອງ ແລະ ເຫັນພາບຕົວຈິງ ຫຼາຍກວ່າການອ່ານທິດສະດີລ້າໆ';
  if (q5Ans === 'q5_2') learningStyle = 'ມັກການສຶກສາຂໍ້ມູນ, ຄົ້ນຄວ້າຫຼັກການ ແລະ ເບິ່ງໂຄງສ້າງລະບົບໃຫ້ເຂົ້າໃຈກ່ອນລົງມືເຮັດ';
  if (q5Ans === 'q5_3') learningStyle = 'ມັກການຮຽນຮູ້ຜ່ານການປຶກສາ, ການສົນທະນາກັບຜູ້ມີປະສົບການ ຫຼື ການຮ່ວມມືແບບທີມ';

  const workingStyles = {
    headline: 'ຮູບແບບການຮຽນຮູ້ ແລະ ບັນຍາກາດທີ່ເຮັດໃຫ້ທ່ານເຮັດໄດ້ດີ',
    learningStyle,
    thrivingEnvironment: 'ສະພາບແວດລ້ອມທີ່ເປີດໂອກາດໃຫ້ໄດ້ຄິດ, ໄດ້ລົງມື ແລະ ມີຄວາມຊັດເຈນໃນເປົ້າໝາຍ',
    teamRole: 'ຜູ້ປະສານຄວາມຄິດ ແລະ ລົງມືແກ້ໄຂບັນຫາໃຫ້ເກີດຜົນລັບຕົວຈິງ',
  };

  // Tensions
  const notedTensions: string[] = [];
  const q21Ans = answers['Q21'] as string;
  if (q21Ans === 'q21_1') notedTensions.push('ກັງວົນເລື່ອງການເລືອກສາຍຜິດ ແລະ ຢ້ານວ່າຕົນເອງຈະບໍ່ມັກມັນແທ້ໆ');
  if (q21Ans === 'q21_2') notedTensions.push('ກັງວົນເລື່ອງໂອກາດການມີວຽກເຮັດ ແລະ ຄວາມໝັ້ນຄົງທາງລາຍໄດ້ໃນອະນາຄົດ');
  if (q21Ans === 'q21_3') notedTensions.push('ມີຄວາມກັງວົນເລື່ອງຄວາມຄາດຫວັງຂອງພໍ່ແມ່ ແລະ ຄອບຄົວ');
  if (q21Ans === 'q21_5') notedTensions.push('ມີຂໍ້ຈຳກັດດ້ານຄ່າຮຽນ ຫຼື ໄລຍະທາງໃນການໄປສຶກສາຕໍ່');
  if (notedTensions.length === 0) notedTensions.push('ຕ້ອງການຄວາມໝັ້ນໃຈຫຼາຍຂຶ້ນກ່ອນການຕັດສິນໃຈໃຫຍ່');

  const tensionsAndUncertainties = {
    headline: 'ສິ່ງທີ່ກຳລັງກັງວົນ ແລະ ຄວາມຕຶງຄຽດໃນໃຈ',
    notedTensions,
    comfortingNote: 'ຄວາມກັງວົນທັງໝົດນີ້ເປັນເລື່ອງທຳມະດາຂອງທຸກຄົນ. ທ່ານບໍ່ຈຳເປັນຕ້ອງຕັດສິນທຸກຢ່າງໃນມື້ນີ້ ການເລີ່ມຕົ້ນດ້ວຍການທົດລອງນ້ອຍໆ ຈະຊ່ວຍໃຫ້ເຫັນຄຳຕອບທີ່ຊັດເຈນຂຶ້ນ.',
    reflectionPrompts: [
      'ຖ້າບໍ່ມີຄວາມກັງວົນເລື່ອງຄວາມຄິດເຫັນຂອງຄົນອື່ນ ເຈົ້າຢາກລອງເຮັດສິ່ງໃດຫຼາຍທີ່ສຸດ?',
      'ມີສິ່ງໃດທີ່ເຈົ້າສາມາດທົດລອງເຮັດໄດ້ໃນ 1 ອາທິດຂ້າງໜ້າ ໂດຍບໍ່ມີຄວາມສ່ຽງ?',
    ],
  };

  // 4. Generate Top 3 Paths Matched to Multi-Cluster Matrix
  const possiblePaths = generateClusterPaths(primaryCluster, secondaryCluster, provinceName);

  // 5. Generate Micro-experiments Tailored to Primary Cluster
  const suggestedExperiments = generateClusterMicroExperiments(primaryCluster);

  // 6. Stakeholder Translation Guide (Family Communication Guide)
  const familyCommunicationGuide = generateFamilyCommunicationGuide(possiblePaths);

  // 7. Profile Confidence
  const top1ClusterScore = clusterScores[primaryCluster] || 1;
  const top2ClusterScore = clusterScores[secondaryCluster] || 1;
  const isGeneralist = (top1ClusterScore - top2ClusterScore) / top1ClusterScore < 0.15;

  const profileConfidence = {
    levelText: (isGeneralist ? 'Multidisciplinary Explorer' : 'Specialist') as 'Specialist' | 'Multidisciplinary Explorer',
    score: isGeneralist ? 75 : 94,
    isGeneralist,
    adviceLo: isGeneralist
      ? `ໂປຣໄຟລ໌ຂອງທ່ານມີຄວາມສົນໃຈຫຼາກຫຼາຍລະຫວ່າງ "${CAREER_CLUSTERS[primaryCluster].nameLo}" ແລະ "${CAREER_CLUSTERS[secondaryCluster].nameLo}". ແນະນຳໃຫ້ລອງ Micro-experiments ຂອງທັງ 2 ສາຍນີ້ກ່ອນຕັດສິນໃຈ.`
      : `ໂປຣໄຟລ໌ຂອງທ່ານຊັດເຈນຫຼາຍໃນສາຍ "${CAREER_CLUSTERS[primaryCluster].nameLo}". ທ່າແຮງ ແລະ ຄວາມມັກຂອງທ່ານມີທິດທາງທີ່ໝັ້ນຄົງ.`,
  };

  // 8. 6-Month Action Roadmap
  const portfolioRoadmap = generatePortfolioRoadmap(possiblePaths[0], primaryCluster);

  // 9. AI Prompt Markdown
  const aiPromptMarkdown = generateAIPromptMarkdown({
    ageStage,
    currentTrack,
    provinceName,
    primaryCluster,
    primaryClusterMeta,
    primaryDim,
    secondaryDim,
    signals,
    possiblePaths,
    notedTensions,
    familyCommunicationGuide,
  });

  return {
    sessionId,
    createdAt: new Date().toISOString(),
    demographics: {
      ageStage,
      currentTrack,
      province: provinceName,
    },
    overview,
    interestsAndValues,
    workingStyles,
    tensionsAndUncertainties,
    careerCluster: {
      id: primaryCluster,
      nameLo: primaryClusterMeta.nameLo,
      nameEn: primaryClusterMeta.nameEn,
      descriptionLo: primaryClusterMeta.descriptionLo,
    },
    possiblePaths,
    suggestedExperiments,
    familyCommunicationGuide,
    portfolioRoadmap,
    profileConfidence,
    transparencyEvidence: evidenceItems,
    aiPromptMarkdown,
  };
}

function generateClusterPaths(
  primary: CareerClusterId,
  secondary: CareerClusterId,
  province: string
): PossiblePath[] {
  switch (primary) {
    case 'law_policy':
      return [
        {
          pathNumber: 1,
          title: 'ນິຕິສາດ, ການຮ່າງສັນຍາ ແລະ ທີ່ປຶກສາກົດໝາຍ (Corporate & Legal Advisory)',
          subtitle: 'ການຕີຄວາມຂໍ້ກົດໝາຍ, ການກວດສອບສັນຍາທຸລະກິດ ແລະ ການວ່າຄວາມປົກປ້ອງສິດ',
          whyThisFits: 'ທ່ານມີທັກສະການວິເຄາະຢ່າງມີຫຼັກການ, ມັກການອ່ານ ແລະ ໃຫ້ຄວາມສຳຄັນກັບຄວາມຖືກຕ້ອງຍຸຕິທຳ ເສັ້ນທາງນີ້ເປັນຫຼັກຄ້ຳປະກັນຄວາມຖືກຕ້ອງຂອງອົງກອນ.',
          examplesInLaos: [
            'ທີ່ປຶກສາກົດໝາຍປະຈຳທະນາຄານ ແລະ ບໍລິສັດລົງທຶນສາກົນໃນລາວ',
            'ທະນາຍຄວາມວ່າຄວາມ ແລະ ທີ່ປຶກສາຄະດີແພ່ງ-ອາຍາ',
            'ເຈົ້າໜ້າທີ່ນິຕິກຳໃນລັດວິສາຫະກິດໄຟຟ້າລາວ, ບໍ່ແຮ່ ຫຼື ໂທລະຄົມ',
          ],
          fieldAreas: ['ນິຕິສາດທຸລະກິດ', 'ກົດໝາຍແພ່ງ ແລະ ອາຍາ', 'ກົດໝາຍການຄ້າສາກົນ'],
          archetypeTag: 'Corporate & Legal Advisory',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະຮຽນສາຍນິຕິສາດ ເພື່ອເປັນທີ່ປຶກສາກົດໝາຍໃຫ້ກັບບໍລິສັດໃຫຍ່, ທະນາຄານ ຫຼື ສອບບັນຈຸເປັນພະນັກງານໄອຍະການ/ສານ ເຊິ່ງເປັນສາຍງານທີ່ມີກຽດ ແລະ ໝັ້ນຄົງ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຜູ້ພິພາກສາ, ໄອຍະການ ຫຼື ນາຍທະນາຍຄວາມ',
            stabilityAngleLo: 'ທຸກບໍລິສັດ, ທະນາຄານ ແລະ ອົງການຈັດຕັ້ງລັດຕ້ອງມີນັກກົດໝາຍດູແລສັນຍາ ມີຄວາມຕ້ອງການສູງ ແລະ ເປັນວິຊາຊີບສະເພາະທີ່ມີໃບອະນຸຍາດ.',
          },
        },
        {
          pathNumber: 2,
          title: 'ການທູດ, ການພົວພັນສາກົນ ແລະ ນະໂຍບາຍ (Diplomacy & Public Policy)',
          subtitle: 'ການເຈລະຈາລະຫວ່າງປະເທດ, ການວິເຄາະນະໂຍບາຍ ແລະ ການປະສານງານອົງການຈັດຕັ້ງສາກົນ',
          whyThisFits: 'ທ່ານມີຄວາມສົນໃຈເລື່ອງການພົວພັນສັງຄົມ, ພາສາຕ່າງປະເທດ ແລະ ມຸມມອງລະດັບມະຫາພາກ ເສັ້ນທາງນີ້ເປີດໂອກາດໃຫ້ທ່ານເຊື່ອມຕໍ່ລາວກັບເວທີສາກົນ.',
          examplesInLaos: [
            'ເຈົ້າໜ້າທີ່ໃນກະຊວງການຕ່າງປະເທດ ຫຼື ສະຖານທູດຕ່າງປະເທດໃນລາວ',
            'Program Officer ໃນອົງການສະຫະປະຊາຊາດ (UN, UNDP, UNICEF, JICA)',
            'ນັກວິເຄາະນະໂຍບາຍການຄ້າ ແລະ ການຮ່ວມມືອາຊຽນ',
          ],
          fieldAreas: ['ການພົວພັນສາກົນ (IR)', 'ລັດຖະສາດ ແລະ ການປົກຄອງ', 'ນະໂຍບາຍສາທາລະນະ'],
          archetypeTag: 'Diplomacy & International Relations',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍກຳລັງສຶກສາສາຍການພົວພັນສາກົນ ແລະ ພາສາ ເພື່ອເຮັດວຽກໃນອົງການຈັດຕັ້ງສາກົນ (UN) ຫຼື ກະຊວງການຕ່າງປະເທດ ເຊິ່ງມີໂອກາດໄດ້ທຶນໄປຮຽນ ແລະ ເຮັດວຽກຕ່າງປະເທດ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ນັກການທູດ ຫຼື ເຈົ້າໜ້າທີ່ອົງການສາກົນ',
            stabilityAngleLo: 'ອົງການສາກົນ ແລະ ສະຖານທູດມີເງິນເດືອນ ແລະ ສະຫວັດດີການສູງຫຼາຍ ພ້ອມໂອກາດສຶກສາຕໍ່ຕ່າງປະເທດ.',
          },
        },
        {
          pathNumber: 3,
          title: 'ມະນຸດສາດ, ສຶກສາສາດ ແລະ ການສື່ສານນະໂຍບາຍ (Humanities & Education)',
          subtitle: 'ການຖ່າຍທອດຄວາມຮູ້, ການວິໄຈສັງຄົມ, ການແປພາສາ ແລະ ການສຶກສາ',
          whyThisFits: 'ທ່ານມີຫົວໃຈທີ່ຢາກແບ່ງປັນ, ເຂົ້າໃຈມະນຸດ ແລະ ຮັກໃນການສື່ສານທີ່ເລິກເຊິ່ງ ເສັ້ນທາງນີ້ຊ່ວຍສ້າງຄົນ ແລະ ສືບສານພູມປັນຍາ.',
          examplesInLaos: [
            'ອາຈານມະຫາວິທະຍາໄລ ຫຼື ຄູສອນພາສາຕ່າງປະເທດລະດັບສາກົນ',
            'ນັກແປເອກະສານທາງການ ແລະ ນັກພາສາສາດ',
            'ຜູ້ຈັດການໂຄງການພັດທະນາການສຶກສາໃນຊຸມຊົນ',
          ],
          fieldAreas: ['ສຶກສາສາດ', 'ມະນຸດສາດ ແລະ ພາສາສາດ', 'ການພັດທະນາສັງຄົມ'],
          archetypeTag: 'Humanities & Academic Education',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະເປັນອາຈານສອນໃນລະດັບວິທະຍາໄລ/ມະຫາວິທະຍາໄລ ຫຼື ເຮັດວຽກດ້ານການສຶກສາສາກົນ ເຊິ່ງເປັນອາຊີບທີ່ໄດ້ຮັບຄວາມເຄົາລົບ ແລະ ມີເວລາໝັ້ນຄົງ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ອາຈານສອນ ຫຼື ນັກວິຊາການການສຶກສາ',
            stabilityAngleLo: 'ສາຍການສຶກສາ ແລະ ພາສາຕ່າງປະເທດມີຄວາມໝັ້ນຄົງສູງ ແລະ ສາມາດສ້າງລາຍໄດ້ເສີມຈາກການແປ ແລະ ຝຶກອົບຮົມ.',
          },
        },
      ];

    case 'finance_econ':
      return [
        {
          pathNumber: 1,
          title: 'ການບັນຊີກວດສອບ, ວິເຄາະງົບ ແລະ ພາສີ (Corporate Audit & Accounting)',
          subtitle: 'ການວາງລະບົບບັນຊີ, ການກວດສອບງົບການເງິນ ແລະ ການຄຸ້ມຄອງຕົ້ນທຶນອົງກອນ',
          whyThisFits: 'ທ່ານມີຄວາມລະອຽດຮອບຄອບກັບຕົວເລກ, ມັກຄວາມເປັນລະບົບ ແລະ ຄວາມໂປ່ງໃສ ເສັ້ນທາງນີ້ເປັນຫົວໃຈຫຼັກຂອງທຸກທຸລະກິດ.',
          examplesInLaos: [
            'Auditor ໃນບໍລິສັດກວດສອບບັນຊີຊັ້ນນຳ (PwC, KPMG, EY, Deloitte Lao)',
            'Chief Accountant / ຫົວໜ້າບັນຊີໃນບໍລິສັດໃຫຍ່ ແລະ ລັດວິສາຫະກິດ',
            'ເຈົ້າໜ້າທີ່ກວດກາການເງິນ ແລະ ພາສີອາກອນ',
          ],
          fieldAreas: ['ການບັນຊີວິຊາຊີບ (CPA)', 'ການກວດສອບບັນຊີ', 'ການວາງແຜນພາສີອົງກອນ'],
          archetypeTag: 'Corporate Audit & Accounting',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະຮຽນສາຍບັນຊີວິຊາຊີບ (Certified Accountant) ເພື່ອກວດສອບບັນຊີໃຫ້ກັບບໍລິສັດໃຫຍ່ ແລະ ທະນາຄານ ເຊິ່ງເປັນວິຊາຊີບທີ່ບໍ່ມີມື້ຕົກງານ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຫົວໜ້າຝ່າຍບັນຊີ ແລະ ການເງິນ (CFO)',
            stabilityAngleLo: 'ກົດໝາຍກຳນົດໃຫ້ທຸກບໍລິສັດຕ້ອງມີນັກບັນຊີ ແລະ ຜ່ານການກວດສອບບັນຊີປະຈຳປີ ເຮັດໃຫ້ມີວຽກຮອງຮັບ 100%.',
          },
        },
        {
          pathNumber: 2,
          title: 'ເສດຖະສາດປະຍຸກ, ຕະຫຼາດທຶນ ແລະ ທະນາຄານ (Quantitative Economics & Banking)',
          subtitle: 'ການວິເຄາະແນວໂນ້ມເສດຖະກິດ, ການລົງທຶນ, ຕະຫຼາດຫຼັກຊັບ ແລະ ຍຸດທະສາດການເງິນ',
          whyThisFits: 'ທ່ານມັກເບິ່ງພາບລວມຂອງກົນໄກເສດຖະກິດ, ມັກການຄາດການ ແລະ ຕົວເລກ ເສັ້ນທາງນີ້ຊ່ວຍຂັບເຄື່ອນທຶນ ແລະ ການເຕີບໂຕ.',
          examplesInLaos: [
            'Investment Analyst ໃນຕະຫຼາດຫຼັກຊັບລາວ (LSX) ຫຼື ບໍລິສັດຫຼັກຊັບ',
            'Credit & Risk Analyst ໃນທະນາຄານທຸລະກິດ (BCEL, JDB, LDB)',
            'ນັກເສດຖະສາດວິເຄາະນະໂຍບາຍເງິນຕາ ໃນທະນາຄານແຫ່ງ ສປປ ລາວ (BOL)',
          ],
          fieldAreas: ['ເສດຖະສາດການເງິນ', 'ການທະນາຄານ ແລະ ຕະຫຼາດທຶນ', 'ການວິເຄາະຄວາມສ່ຽງ (Risk Management)'],
          archetypeTag: 'Quantitative Economics & Capital Markets',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະເຮັດວຽກໃນທະນາຄານ ຫຼື ຕະຫຼາດຫຼັກຊັບ ເປັນນັກວິເຄາະສິນເຊື່ອ ແລະ ການລົງທຶນ ເຊິ່ງມີສະຫວັດດີການດີ ແລະ ຄວາມໝັ້ນຄົງສູງ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຜູ້ຈັດການທະນາຄານ ຫຼື ນັກວິເຄາະເສດຖະກິດ',
            stabilityAngleLo: 'ພາກທະນາຄານ ແລະ ການເງິນໃນລາວມີໂຄງສ້າງເງິນເດືອນ ແລະ ໂບນັດທີ່ໝັ້ນຄົງທີ່ສຸດແຫ່ງໜຶ່ງ.',
          },
        },
        {
          pathNumber: 3,
          title: 'ການວິເຄາະຂໍ້ມູນທຸລະກິດ ແລະ ການເງິນດິຈິຕອນ (FinTech & Business Intelligence)',
          subtitle: 'ການໃຊ້ Dashboard, SQL, PowerBI ແລະ ເຄື່ອງມືດິຈິຕອນວາງແຜນການເງິນ',
          whyThisFits: 'ທ່ານປະສານທັກສະການວິເຄາະຕົວເລກເຂົ້າກັບເທັກໂນໂລຢີ ເສັ້ນທາງນີ້ກຳລັງເປັນທີ່ຕ້ອງການສູງໃນຍຸກ Digital Banking.',
          examplesInLaos: [
            'Financial Data Analyst ໃນລະບົບກະເປົາເງິນດິຈິຕອນ (BCEL One, u-money, M-Money)',
            'Business Intelligence Specialist ວາງແຜນລາຍຮັບໃຫ້ບໍລິສັດຂາຍຍ່ອຍ',
            'Pricing & Revenue Analyst ໃນສາຍການບິນ ຫຼື ບໍລິສັດໂທລະຄົມ',
          ],
          fieldAreas: ['FinTech', 'Business Intelligence (BI)', 'ການເງິນດິຈິຕອນ'],
          archetypeTag: 'FinTech & Business Analytics',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະເຮັດວຽກວິເຄາະຂໍ້ມູນການເງິນໃຫ້ແອັບທະນາຄານ (ເຊັ່ນ BCEL One) ເຊິ່ງເປັນສາຍງານໄອທີການເງິນທີ່ໄດ້ເງິນເດືອນສູງ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຫົວໜ້າຝ່າຍແຜນການຍຸດທະສາດການເງິນ',
            stabilityAngleLo: 'ການເງິນດິຈິຕອນກຳລັງເຕີບໂຕໄວຫຼາຍ ຄົນທີ່ຮູ້ທັງການເງິນ ແລະ ໄອທີ ເປັນທີ່ຕ້ອງການຫຼາຍທີ່ສຸດ.',
          },
        },
      ];

    case 'health_medical':
      return [
        {
          pathNumber: 1,
          title: 'ການແພດ, ທັນຕະແພດ ແລະ ການປິ່ນປົວຄລີນິກ (Clinical Medicine & Surgery)',
          subtitle: 'ການວິນິດໄສພະຍາດ, ການປິ່ນປົວ, ການຜ່າຕັດ ແລະ ການຊ່ວຍຊີວິດຜູ້ປ່ວຍ',
          whyThisFits: 'ທ່ານມີຄວາມຕັ້ງໃຈສູງໃນການຊ່ວຍເຫຼືອຄົນ, ມັກການຮຽນຮູ້ວິທະຍາສາດຮ່າງກາຍ ແລະ ມີຄວາມຮັບຜິດຊອບສູງ ເສັ້ນທາງນີ້ເປັນຫຼັກຄ້ຳປະກັນສຸຂະພາບຂອງຊາດ.',
          examplesInLaos: [
            'ທ່ານໝໍ / ແພດຊ່ຽວຊານໃນໂຮງໝໍສູນກາງ (ມະໂຫສົດ, ມິດຕະພາບ, 103, ເສດຖາທິຣາດ)',
            'ທັນຕະແພດ (ໝໍແຂ້ວ) ປະຈຳໂຮງໝໍ ຫຼື ຄລີນິກສະເພາະທາງ',
            'ແພດປະຈຳໂຮງໝໍແຂວງໃນ ' + province,
          ],
          fieldAreas: ['ແພດສາດທົ່ວໄປ ແລະ ສະເພາະທາງ', 'ທັນຕະແພດສາດ', 'ການແພດສຸກເສີນ'],
          archetypeTag: 'Clinical Medicine & Healthcare',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍກຳລັງຕັ້ງໃຈຮຽນສາຍການແພດ ເພື່ອເປັນທ່ານໝໍປິ່ນປົວຄົນເຈັບໃນໂຮງໝໍ ເຊິ່ງເປັນວິຊາຊີບທີ່ພໍ່ແມ່ຈະໄດ້ພູມໃຈ ແລະ ສັງຄົມໃຫ້ຄວາມເຄົາລົບສູງ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ທ່ານໝໍ ຫຼື ແພດຊ່ຽວຊານ',
            stabilityAngleLo: 'ເປັນວິຊາຊີບອັນດັບ 1 ທີ່ບໍ່ມີມື້ຕົກງານ ມີກຽດ ແລະ ໝັ້ນຄົງຕະຫຼອດຊີວິດ.',
          },
        },
        {
          pathNumber: 2,
          title: 'ເພສັດຊະສາດ ແລະ ວິທະຍາສາດຊີວະການແພດ (Pharmacy & Biomedical Sciences)',
          subtitle: 'ການຄົ້ນຄວ້າຢາ, ການຄຸ້ມຄອງການຈ່າຍຢາ, ການວິໄຈຫ້ອງແລັບ ແລະ ວັກຊີນ',
          whyThisFits: 'ທ່ານມັກວິທະຍາສາດ, ການທົດລອງເຄມີ-ຊີວະ ແລະ ຄວາມລະອຽດປານີດ ເສັ້ນທາງນີ້ຄວບຄຸມຄຸນນະພາບຢາ ແລະ ສານຊີວະການແພດ.',
          examplesInLaos: [
            'ເພສັດຊະກອນໂຮງໝໍ ຫຼື ເຈົ້າຂອງຮ້ານຂາຍຢາມາດຕະຖານ',
            'ນັກວິໄຈຢາໃນໂຮງງານຜະລິດຢາເລກ 2, ເລກ 3 ຂອງລາວ',
            'Medical Lab Technologist ປະຈຳສູນວິໄຈ ແລະ ຫ້ອງທົດລອງເລືອດ',
          ],
          fieldAreas: ['ເພສັດຊະສາດຄລີນິກ', 'ວິທະຍາສາດການຢາ', 'ເຕັກໂນໂລຊີຫ້ອງວິໄຈທາງການແພດ'],
          archetypeTag: 'Pharmacy & Biomedical Sciences',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະຮຽນເພສັດຊະສາດ ເພື່ອເປັນເພສັດຊະກອນໃນໂຮງໝໍ ຫຼື ເປີດທຸລະກິດຮ້ານຂາຍຢາມາດຕະຖານ ເຊິ່ງມີລາຍໄດ້ໝັ້ນຄົງ ແລະ ເປັນທີ່ຕ້ອງການ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ເພສັດຊະກອນ ຫຼື ນັກວິທະຍາສາດການຢາ',
            stabilityAngleLo: 'ຮ້ານຂາຍຢາ ແລະ ໂຮງງານຜະລິດຢາມີຄວາມຕ້ອງການເພສັດຊະກອນທີ່ມີໃບປະກອບວິຊາຊີບຕະຫຼອດເວລາ.',
          },
        },
        {
          pathNumber: 3,
          title: 'ສາທາລະນະສຸກ, ລະບາດວິທະຍາ ແລະ ພະຍາບານ (Public Health & Nursing)',
          subtitle: 'ການປ້ອງກັນພະຍາດ, ການວາງແຜນສຸຂະພາບຊຸມຊົນ, ໂພຊະນາການ ແລະ ການພະຍາບານ',
          whyThisFits: 'ທ່ານມີຄວາມເມດຕາ, ມັກການລົງພື້ນທີ່ຊຸມຊົນ ແລະ ໃສ່ໃຈຄຸນນະພາບຊີວິດຂອງຜູ້ຄົນ ເສັ້ນທາງນີ້ຊ່ວຍປ້ອງກັນພະຍາດກ່ອນເກີດ.',
          examplesInLaos: [
            'Public Health Officer ໃນໂຄງການຮ່ວມມືສາກົນ (Lao-Luxembourg, WHO, GIZ)',
            'ພະຍາບານວິຊາຊີບ (Registered Nurse) ໃນໂຮງໝໍສາກົນ ຫຼື ໂຮງໝໍລັດ',
            'ນັກໂພຊະນາການ ແລະ ນັກວາງແຜນສາທາລະນະສຸກແຂວງ ' + province,
          ],
          fieldAreas: ['ສາທາລະນະສຸກສາດ', 'ພະຍາບານສາດ', 'ລະບາດວິທະຍາ ແລະ ໂພຊະນາການ'],
          archetypeTag: 'Public Health & Nursing',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະເຮັດວຽກດ້ານສາທາລະນະສຸກ ແລະ ພະຍາບານໃນໂຮງໝໍ ຫຼື ອົງການອະນາໄມໂລກ (WHO) ເຊິ່ງມີວຽກທີ່ແນ່ນອນ ແລະ ໄດ້ຊ່ວຍເຫຼືອຄົນ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຫົວໜ້າພະຍາບານ ຫຼື ເຈົ້າໜ້າທີ່ສາທາລະນະສຸກ',
            stabilityAngleLo: 'ຄວາມຕ້ອງການພະຍາບານ ແລະ ເຈົ້າໜ້າທີ່ສາທາລະນະສຸກທົ່ວປະເທດຍັງຂາດແຄນຫຼາຍ ໂອກາດໄດ້ວຽກສູງ.',
          },
        },
      ];

    case 'vocational_trade':
      return [
        {
          pathNumber: 1,
          title: 'ສິລະປະການປຸງແຕ່ງອາຫານສາກົນ (Culinary Arts & Food Entrepreneurship)',
          subtitle: 'ການເປັນເຊຟມືອາຊີບ, ໂພຊະນາການ, ການອອກແບບເມນູ ແລະ ທຸລະກິດຮ້ານອາຫານ',
          whyThisFits: 'ທ່ານມັກການລົງມືເຮັດຕົວຈິງ, ມີຄວາມຄິດສ້າງສັນຜ່ານລົດຊາດ ແລະ ມັກເຫັນຜູ້ຄົນມີຄວາມສຸກ ເສັ້ນທາງນີ້ສ້າງລາຍໄດ້ ແລະ ຊື່ສຽງໄດ້ໄວ.',
          examplesInLaos: [
            'Executive Chef / Pastry Chef ໃນໂຮງແຮມ 5 ດາວ (ຫຼວງພະບາງ, ວຽງຈັນ)',
            'ເຈົ້າຂອງຮ້ານອາຫານ, ຄາເຟ່ ຫຼື ທຸລະກິດເບເກີຣີ',
            'Food Stylist & Consultant ອອກແບບເມນູໃຫ້ທຸລະກິດທ່ອງທ່ຽວ',
          ],
          fieldAreas: ['ສິລະປະການປຸງແຕ່ງອາຫານ', 'ການບໍລິຫານຮ້ານອາຫານ', 'ວິທະຍາສາດການອາຫານ'],
          archetypeTag: 'Culinary Arts & Gastronomy',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະສຶກສາສາຍສິລະປະອາຫານມາດຕະຖານສາກົນ ເພື່ອເປັນເຊຟໃນໂຮງແຮມໃຫຍ່ ຫຼື ເປີດຮ້ານອາຫານຂອງຕົນເອງ ເຊິ່ງເປັນທັກສະຕິດໂຕທີ່ຫາເງິນໄດ້ທຸກບ່ອນທົ່ວໂລກ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຫົວໜ້າພໍ່ຄົວ (Executive Chef) ຫຼື ເຈົ້າຂອງກິດຈະການ',
            stabilityAngleLo: 'ທຸລະກິດອາຫານ ແລະ ທ່ອງທ່ຽວໃນລາວເຕີບໂຕໄວຫຼາຍ ຄົນມີສີມືແທ້ຈິງມີລາຍໄດ້ສູງ ແລະ ບໍ່ມີມື້ຕົກງານ.',
          },
        },
        {
          pathNumber: 2,
          title: 'ການບໍລິຫານໂຮງແຮມ ແລະ ທ່ອງທ່ຽວລະດັບສູງ (Luxury Hospitality Management)',
          subtitle: 'ການຈັດການປະສົບການລູກຄ້າ, ການບໍລິການລະດັບສາກົນ ແລະ ທຸລະກິດທ່ອງທ່ຽວ',
          whyThisFits: 'ທ່ານມີທັກສະມະນຸດສຳພັນ, ມັກການບໍລິການ ແລະ ການຈັດການທີ່ເປັນມືອາຊີບ ເສັ້ນທາງນີ້ເປັນແກນກາງຂອງເສດຖະກິດລາວ.',
          examplesInLaos: [
            'Hotel Operations Manager ໃນຣີສອດລະດັບໂລກ (Amantaka, Rosewood, Pullman)',
            'Event & Banquet Manager ຈັດງານປະຊຸມສາກົນ ແລະ ງານລ້ຽງລະດັບປະເທດ',
            'ຜູ້ບໍລິຫານທຸລະກິດທ່ອງທ່ຽວແບບນິເວດ ແລະ ວັດທະນະທຳ',
          ],
          fieldAreas: ['ການໂຮງແຮມ ແລະ ຣີສອດ', 'ການບໍລິການລູກຄ້າລະດັບພຣີມຽມ', 'ການທ່ອງທ່ຽວສາກົນ'],
          archetypeTag: 'Luxury Hospitality Management',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະຮຽນສາຍບໍລິຫານການໂຮງແຮມສາກົນ ເພື່ອກ້າວຂຶ້ນເປັນຜູ້ຈັດການໂຮງແຮມ 5 ດາວ ເຊິ່ງມີເງິນເດືອນສູງ ແລະ ໄດ້ໃຊ້ພາສາຕ່າງປະເທດທຸກມື້"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຜູ້ຈັດການທົ່ວໄປໂຮງແຮມ (General Manager)',
            stabilityAngleLo: 'ປະເທດລາວເປັນເມືອງທ່ອງທ່ຽວ ໂຮງແຮມລະດັບສາກົນຕ້ອງການຜູ້ບໍລິຫານທີ່ມີທັກສະພາສາ ແລະ ມາດຕະຖານສູງ.',
          },
        },
        {
          pathNumber: 3,
          title: 'ຊ່າງເຕັກນິກຂັ້ນສູງ, ໄຟຟ້າ ແລະ ເມຄາໂທຣນິກ (Advanced Technical Trades)',
          subtitle: 'ການຕິດຕັ້ງ, ບຳລຸງຮັກສາລະບົບອຸດສາຫະກຳ, ໄຟຟ້າ, ຍານຍົນໄຟຟ້າ (EV) ແລະ ກົນຈັກ',
          whyThisFits: 'ທ່ານມັກງານຊ່າງ, ການສ້ອມແປງ, ເຂົ້າໃຈກົນໄກ ແລະ ການໃຊ້ເຄື່ອງມື ເສັ້ນທາງນີ້ເປັນທີ່ຕ້ອງການສູງທີ່ສຸດໃນພາກອຸດສາຫະກຳ.',
          examplesInLaos: [
            'ຊ່າງເຕັກນິກລະບົບໄຟຟ້າ ແລະ ພະລັງງານແສງຕາເວັນ/ເຂື່ອນ',
            'ຊ່າງເຕັກນິກຍານຍົນໄຟຟ້າ (EV Specialist) ໃນສູນບໍລິການລົດຍົນ',
            'Industrial Maintenance Technician ໃນເຂດເສດຖະກິດພິເສດ',
          ],
          fieldAreas: ['ໄຟຟ້າກຳລັງ ແລະ ຄວບຄຸມ', 'ເຕັກໂນໂລຊີຍານຍົນ', 'ເມຄາໂທຣນິກ ແລະ ລະບົບອັດຕະໂນມັດ'],
          archetypeTag: 'Advanced Technical Trades',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະຮຽນຊ່າງເຕັກນິກວິສະວະກຳຂັ້ນສູງ (ໄຟຟ້າ/ລົດໄຟຟ້າ EV) ເຊິ່ງເປັນສາຍທີ່ໂຮງງານ ແລະ ບໍລິສັດໃຫຍ່ຈ້າງທັນທີຫຼັງຮຽນຈົບ ບໍ່ຕ້ອງກັງວົນເລື່ອງວຽກ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຫົວໜ້າຊ່າງເຕັກນິກ ຫຼື ວິສະວະກອນພາກປະຕິບັດ',
            stabilityAngleLo: 'ຊ່າງເຕັກນິກທີ່ມີຝີມືແທ້ຈິງມີລາຍໄດ້ສູງກວ່າພະນັກງານຫ້ອງການທົ່ວໄປຫຼາຍ ແລະ ເປັນທີ່ຕ້ອງການຕະຫຼອດ.',
          },
        },
      ];

    case 'creative_media':
      return [
        {
          pathNumber: 1,
          title: 'ສະຖາປັດຕະຍະກຳ, ການອອກແບບພື້ນທີ່ ແລະ ພາຍໃນ (Architecture & Spatial Design)',
          subtitle: 'ການອອກແບບອາຄານ, ຕົກແຕ່ງພາຍໃນ, ການວາງຜັງ ແລະ ພື້ນທີ່ດິຈິຕອນ 3D',
          whyThisFits: 'ທ່ານມັກຄວາມຄິດສ້າງສັນປະສານກັບໂຄງສ້າງທີ່ຈັບຕ້ອງໄດ້ ເສັ້ນທາງນີ້ປ່ຽນຈິນຕະນາການໃຫ້ກາຍເປັນສິ່ງກໍ່ສ້າງທີ່ສວຍງາມ.',
          examplesInLaos: [
            'ສະຖາປະນິກອອກແບບເຮືອນ, ຣີສອດ ແລະ ຄາເຟ່ໃນລາວ',
            'Interior Designer ຕົກແຕ່ງພາຍໃນໂຮງແຮມ ແລະ ຫ້ອງການ',
            '3D Visualizer & Spatial Designer ສ້າງພາບຈຳລອງໂຄງການ',
          ],
          fieldAreas: ['ສະຖາປັດຕະຍະກຳສາດ', 'ການອອກແບບພາຍໃນ', '3D Architecture & Rendering'],
          archetypeTag: 'Architecture & Spatial Design',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະຮຽນສາຍສະຖາປັດຕະຍະກຳ ເພື່ອເປັນສະຖາປະນິກອອກແບບອາຄານ ແລະ ໂຄງການກໍ່ສ້າງ ເຊິ່ງເປັນວິຊາຊີບສະເພາະທາງທີ່ມີກຽດ ແລະ ລາຍໄດ້ສູງ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ສະຖາປະນິກ ຫຼື ຫົວໜ້າຝ່າຍອອກແບບ',
            stabilityAngleLo: 'ການຂະຫຍາຍຕົວຂອງຕົວເມືອງ ແລະ ທ່ອງທ່ຽວໃນລາວເຮັດໃຫ້ຕ້ອງການສະຖາປະນິກອອກແບບຮ້ານ, ໂຮງແຮມ ແລະ ບ້ານພັກຢ່າງຕໍ່ເນື່ອງ.',
          },
        },
        {
          pathNumber: 2,
          title: 'ການຜະລິດສື່ສ້າງສັນ, ຄອນເທັນຕ໌ ແລະ ການເລົ່າເລື່ອງ (Creative Media & Storytelling)',
          subtitle: 'ການກຳກັບ, ຕັດຕໍ່ວິດີໂອ, ການຂຽນບົດ, ພອດແຄສຕ໌ ແລະ ການສື່ສານແບຣນດ໌',
          whyThisFits: 'ທ່ານມີພອນສະຫວັນໃນການເລົ່າເລື່ອງ, ການສ້າງອາລົມ ແລະ ການຖ່າຍທອດຄວາມຄິດ ເສັ້ນທາງນີ້ຊ່ວຍຂັບເຄື່ອນກະແສສັງຄົມ.',
          examplesInLaos: [
            'Video Producer & Director ສ້າງໂຄສະນາ ແລະ ສາລະຄະດີ',
            'Creative Director ວາງແນວຄວາມຄິດສື່ໃຫ້ອົງກອນສາກົນ ແລະ ທຸລະກິດ',
            'Digital Content Strategist ສ້າງເນື້ອຫາປຸກພະລັງໃຫ້ຄົນລຸ້ນໃໝ່',
          ],
          fieldAreas: ['ສື່ສານມວນຊົນສ້າງສັນ', 'ການຜະລິດຮູບເງົາ ແລະ ວິດີໂອ', 'ການເລົ່າເລື່ອງດິຈິຕອນ'],
          archetypeTag: 'Creative Media Production',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍກຳລັງສຶກສາສາຍການຜະລິດສື່ ແລະ ໂຄສະນາດິຈິຕອນ ເພື່ອເຮັດວຽກກັບອົງການສາກົນ, ໂທລະພາບ ຫຼື ບໍລິສັດໃຫຍ່ ເຊິ່ງເປັນສາຍທີ່ທຸກແບຣນດ໌ຕ້ອງໃຊ້"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຜູ້ຜະລິດລາຍການ (Producer) ຫຼື ຫົວໜ້າຝ່າຍສື່ສານ',
            stabilityAngleLo: 'ທຸກອົງການສະຫະປະຊາຊາດ ແລະ ບໍລິສັດເອກະຊົນໃນລາວຕ້ອງການຄົນຜະລິດສື່ທີ່ມີຄຸນນະພາບສູງ.',
          },
        },
        {
          pathNumber: 3,
          title: 'ການອອກແບບ UX/UI ແລະ ຜະລິດຕະພັນດິຈິຕອນ (UX/UI & Digital Product Design)',
          subtitle: 'ການອອກແບບປະສົບການຜູ້ໃຊ້, ໜ້າຕາແອັບພລິເຄຊັນ ແລະ ເວັບໄຊໃຫ້ໃຊ້ງານງ່າຍ',
          whyThisFits: 'ທ່ານປະສານສິລະປະເຂົ້າກັບຄວາມເຂົ້າໃຈພຶດຕິກຳຄົນ ແລະ ເທັກໂນໂລຢີ ເສັ້ນທາງນີ້ເປັນທີ່ຕ້ອງການສູງໃນຍຸກແອັບມືຖື.',
          examplesInLaos: [
            'UX/UI Designer ສຳລັບແອັບທະນາຄານ ແລະ ອີຄອມເມີຊໃນລາວ',
            'Product Designer ໃນບໍລິສັດເທັກໂນໂລຢີ',
            'Design System Specialist ດູແລມາດຕະຖານການອອກແບບດິຈິຕອນ',
          ],
          fieldAreas: ['UX/UI Design', 'Design Thinking', 'Digital Product Strategy'],
          archetypeTag: 'UX/UI & Digital Product Design',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະເຮັດວຽກເປັນ UX/UI Designer ທີ່ອອກແບບໜ້າຈໍແອັບທະນາຄານ ແລະ ເວັບໄຊໃຫຍ່ ເຊິ່ງເປັນສາຍງານໄອທີທີ່ໄດ້ຮັບຄ່າຕອບແທນສູງ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຫົວໜ້າຝ່າຍອອກແບບຜະລິດຕະພັນເທັກໂນໂລຢີ',
            stabilityAngleLo: 'ຕະຫຼາດແອັບ ແລະ ດິຈິຕອນໃນອາຊຽນກຳລັງຂາດແຄນ UX/UI Designer ຢ່າງໜັກ ສາມາດເຮັດວຽກ Remote ໄດ້.',
          },
        },
      ];

    case 'stem_tech':
    default:
      return [
        {
          pathNumber: 1,
          title: 'Applied Tech & Product Innovation (ນະວັດຕະກຳ ແລະ ຜະລິດຕະພັນເທັກໂນໂລຊີ)',
          subtitle: 'ການນຳຄວາມຮູ້ວິທະຍາສາດ/ຄອມພິວເຕີ ມາສ້າງເປັນ Software ຫຼື ອຸປະກອນທີ່ແກ້ໄຂບັນຫາຕົວຈິງ',
          whyThisFits: 'ທ່ານມີການປະສົມປະສານລະຫວ່າງການລົງມືເຮັດ (Hands-on), ຄວາມຄິດສ້າງສັນ ແລະ ຄວາມຄິດເປັນລະບົບ ເສັ້ນທາງນີ້ຈະຊ່ວຍໃຫ້ທ່ານປ່ຽນໂຄດໃຫ້ກາຍເປັນຜະລິດຕະພັນ.',
          examplesInLaos: [
            'Product Manager / Associate PM ໃນບໍລິສັດເທັກໂນໂລຢີ ແລະ ທະນາຄານດິຈິຕອນໃນລາວ',
            'Full-stack Software Engineer ທີ່ເນັ້ນການແກ້ໄຂບັນຫາໃຫ້ຜູ້ໃຊ້ງານຕົວຈິງ',
            'Software Architect ອອກແບບລະບົບໃຫຍ່ໃຫ້ອົງກອນລັດ ແລະ ເອກະຊົນ',
          ],
          fieldAreas: ['ວິສະວະກຳຊອບແວ', 'ການອອກແບບຜະລິດຕະພັນດິຈິຕອນ', 'ເທັກໂນໂລຊີຂໍ້ມູນຂ່າວສານ (IT)'],
          archetypeTag: 'Applied Tech & Product Innovation',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະເຮັດວຽກເປັນ Software Engineer ຫຼື Product Manager ທີ່ອອກແບບລະບົບໄອທີໃຫ້ທະນາຄານ ແລະ ບໍລິສັດໃຫຍ່ ເຊິ່ງເປັນສາຍທີ່ເງິນເດືອນເລີ່ມຕົ້ນສູງທີ່ສຸດ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ວິສະວະກອນລະບົບໄອທີຂັ້ນສູງ',
            stabilityAngleLo: 'ສາຍງານນີ້ເປັນທີ່ຕ້ອງການສູງທີ່ສຸດໃນຕະຫຼາດແຮງງານປັດຈຸບັນ ທັງໃນພາກລັດ, ທະນາຄານໃຫຍ່ ແລະ ບໍລິສັດສາກົນ.',
          },
        },
        {
          pathNumber: 2,
          title: 'Data Science & Deep R&D (ວິທະຍາສາດຂໍ້ມູນ, AI ແລະ ການວິໄຈ)',
          subtitle: 'ການຄົ້ນຫາ Pattern ຈາກຂໍ້ມູນ, ການສ້າງໂມເດວທຳນາຍ ແລະ ການວິໄຈແບບ Deep Tech',
          whyThisFits: 'ທ່ານມີທັກສະການວິເຄາະ (Analytical) ທີ່ໂດດເດັ່ນ ມັກການຕັ້ງຄຳຖາມ ແລະ ໄຂຂໍ້ຂ້ອງໃຈ ເສັ້ນທາງນີ້ຈະເປີດໂອກາດໃຫ້ທ່ານໃຊ້ພະລັງຂອງຂໍ້ມູນ ແລະ AI.',
          examplesInLaos: [
            'Data Analyst / Business Intelligence ໃນທະນາຄານ, ບໍລິສັດໂທລະຄົມ ຫຼື ອົງການສາກົນ',
            'AI / Machine Learning Engineer ພັດທະນາລະບົບອັດຕະໂນມັດ',
            'Risk & Quantitative Analyst ວິເຄາະຄວາມສ່ຽງ ແລະ ວາງແຜນການເງິນ',
          ],
          fieldAreas: ['ວິທະຍາສາດຂໍ້ມູນ (Data Science)', 'ປັນຍາປະດິດ (AI)', 'ສະຖິຕິປະຍຸກ & ຄະນິດສາດ'],
          archetypeTag: 'Data Science & Deep R&D',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະເປັນນັກວິເຄາະຂໍ້ມູນ ແລະ AI Specialist ທີ່ຊ່ວຍວາງແຜນ ແລະ ປ້ອງກັນຄວາມສ່ຽງໃຫ້ກັບທະນາຄານ ແລະ ອົງກອນຂະໜາດໃຫຍ່"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ຫົວໜ້າຝ່າຍສະຖິຕິ ແລະ ຍຸດທະສາດແຜນການ',
            stabilityAngleLo: 'ທຸກໆ ອົງກອນໃນລາວ ແລະ ທົ່ວໂລກກຳລັງຂາດແຄນບຸກຄະລາກອນດ້ານຂໍ້ມູນ ເຮັດໃຫ້ມີໂອກາດໄດ້ຮັບທຶນການສຶກສາ ແລະ ເງິນເດືອນໝັ້ນຄົງ.',
          },
        },
        {
          pathNumber: 3,
          title: 'Hardware, IoT & Clean Engineering (ວິສະວະກຳຮາດແວ, ໄອໂອທີ ແລະ ພະລັງງານ)',
          subtitle: 'ການອອກແບບ, ປະກອບສ້າງ ແລະ ຂຽນໂຄດຄວບຄຸມອຸປະກອນ Microcontroller, IoT ແລະ ພະລັງງານ',
          whyThisFits: 'ທ່ານມີຄວາມສຸກກັບການຈັບຕ້ອງອຸປະກອນຕົວຈິງ ປະສານກັບທັກສະການຂຽນໂປຣແກຣມ ເສັ້ນທາງນີ້ຊ່ວຍໃຫ້ທ່ານສ້າງ Smart Devices ແລະ ລະບົບຄວບຄຸມ.',
          examplesInLaos: [
            'IoT Solutions Engineer ຕິດຕັ້ງລະບົບກວດວັດອັດຕະໂນມັດໃນໂຮງງານ/ອາຄານ',
            'Environmental & Clean Energy Engineer ໃນໂຄງການພະລັງງານແສງຕາເວັນ/ເຂື່ອນ',
            'Network & Infrastructure Engineer ດູແລສູນຂໍ້ມູນ Data Center',
          ],
          fieldAreas: ['ວິສະວະກຳໄຟຟ້າ-ເອເລັກໂຕຣນິກ', 'IoT & Embedded Systems', 'ພະລັງງານສະອາດ'],
          archetypeTag: 'Hardware, IoT & Clean Tech',
          familyTranslation: {
            suggestedScriptLo:
              'ເວລາລົມກັບພໍ່ແມ່ ໃຫ້ບອກວ່າ: "ຂ້ອຍຈະເຮັດວຽກເປັນວິສະວະກອນລະບົບເຄືອຂ່າຍ ແລະ ຮາດແວ (Hardware & Network Engineer) ທີ່ດູແລລະບົບໃຫ້ບໍລິສັດໂທລະຄົມ ແລະ ລັດວິສາຫະກິດ"',
            traditionalRoleEquivalent: 'ທຽບເທົ່າກັບ ວິສະວະກອນໂທລະຄົມມະນາຄົມ ແລະ ໄຟຟ້າລະດັບສູງ',
            stabilityAngleLo: 'ໂຄງສ້າງພື້ນຖານດິຈິຕອນໃນລາວ (5G, Data Centers) ກຳລັງຂະຫຍາຍຕົວ ເຮັດໃຫ້ຕ້ອງການວິສະວະກອນສາຍນີ້ເປັນຈຳນວນຫຼາຍ.',
          },
        },
      ];
  }
}

function generateClusterMicroExperiments(primary: CareerClusterId): MicroExperiment[] {
  switch (primary) {
    case 'law_policy':
      return [
        {
          id: 'law_exp_1',
          title: 'ການທົດລອງສະຫຼຸບຍໍ້ຄະດີ ແລະ ສັນຍາຕົວຢ່າງ (Legal Briefing Validation)',
          timeCommitment: '1.5 ຊົ່ວໂມງ',
          description:
            'ຊອກຫາຕົວຢ່າງສັນຍາທຸລະກິດ (ເຊັ່ນ ສັນຍາເຊົ່າເຮືອນ, ສັນຍາຊື້ຂາຍອອນລາຍ ຫຼື ຂໍ້ກຳນົດການບໍລິການຂອງແອັບ) ແລ້ວອ່ານວິເຄາະ 3 ຂໍ້ສຳຄັນ: ສິດຂອງຜູ້ໃຊ້, ຂໍ້ຍົກເວັ້ນຄວາມຮັບຜິດຊອບ, ແລະ ຈຸດທີ່ມີຄວາມສ່ຽງ.',
          actionSteps: [
            'ດາວໂຫຼດຕົວຢ່າງສັນຍາມາດຕະຖານ 1 ສະບັບ',
            'ໃຊ້ປາກກາໄຮໄລ້ 3 ຈຸດທີ່ອາດເກີດການເອົາລັດເອົາປຽບ',
            'ຂຽນສະຫຼຸບ 1 ໜ້າເຈ້ຍ: "ຖ້າເຮົາເປັນທີ່ປຶກສາກົດໝາຍ ເຮົາຈະແນະນຳໃຫ້ແກ້ໄຂຈຸດໃດ?"',
          ],
          reassuranceNote: 'ບໍ່ຈຳເປັນຕ້ອງຮູ້ຄຳສັບກົດໝາຍທັງໝົດ ຈຸດປະສົງຄືການທົດສອບວ່າເຈົ້າເພີດເພີນກັບການ "ອ່ານຢ່າງລະອຽດ ແລະ ຊອກຫາຊ່ອງຫວ່າງ" ຫຼື ບໍ່.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າຮູ້ສຶກຕື່ນເຕັ້ນ ແລະ ພູມໃຈເມື່ອ "ຄົ້ນພົບຈຸດທີ່ປົກປ້ອງຜົນປະໂຫຍດໃຫ້ຜູ້ຄົນໄດ້" ຫຼື ບໍ່?',
        },
        {
          id: 'law_exp_2',
          title: 'ການສ້າງແຜນຜັງໂຕ້ແຍ້ງນະໂຍບາຍ (Policy Argument Mapping)',
          timeCommitment: '1 ຊົ່ວໂມງ',
          description:
            'ເລືອກຫົວຂໍ້ບັນຫາສັງຄົມ 1 ເລື່ອງ (ເຊັ່ນ: ການຄຸ້ມຄອງການຂາຍສິນຄ້າອອນລາຍ, ມາດຕະການຄວບຄຸມມົນລະພິດ, ຫຼື ນະໂຍບາຍການສຶກສາ) ແລ້ວຂຽນຕາຕະລາງ 2 ຝັ່ງ: ຝ່າຍເຫັນດີ (Pros) ແລະ ຝ່າຍຄັດຄ້ານ (Cons) ພ້ອມຫຼັກຖານອ້າງອີງ.',
          actionSteps: [
            'ກຳນົດຫົວຂໍ້ທີ່ສົນໃຈ',
            'ຂຽນເຫດຜົນຢ່າງໜ້ອຍ 3 ຂໍ້ຂອງແຕ່ລະຝັ່ງ ໂດຍບໍ່ເອົາອາລົມຕົນເອງເປັນຫຼັກ',
            'ສະຫຼຸບທາງອອກທີ່ເປັນກາງ ແລະ ປະຕິບັດໄດ້ຈິງ',
          ],
          reassuranceNote: 'ຈຸດປະສົງຄືການຝຶກຄວາມຄິດແບບນັກການທູດທີ່ຕ້ອງເຂົ້າໃຈມຸມມອງຂອງທຸກຝ່າຍ.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າມ່ວນກັບການ "ເບິ່ງບັນຫາຈາກຫຼາຍມຸມ ແລະ ສ້າງຂໍ້ໂຕ້ແຍ້ງທີ່ມີເຫດຜົນ" ຫຼື ບໍ່?',
        },
      ];

    case 'finance_econ':
      return [
        {
          id: 'fin_exp_1',
          title: 'ການສ້າງໂມເດວງົບປະມານທຸລະກິດຂະໜາດນ້ອຍ (Financial Modeling)',
          timeCommitment: '1.5 ຊົ່ວໂມງ',
          description:
            'ລອງສ້າງຕາຕະລາງ Excel ຫຼື Google Sheets ຈຳລອງທຸລະກິດຮ້ານກາເຟ ຫຼື ຮ້ານຂາຍເຄື່ອງອອນລາຍ 1 ຮ້ານ ໂດຍຄິດໄລ່: ຕົ້ນທຶນຄົງທີ່, ຕົ້ນທຶນຜັນແປ, ລາຄາຂາຍ, ແລະ ຈຸດຄຸ້ມທຶນ (Break-even Point).',
          actionSteps: [
            'ໃສ່ຕົວເລກຄ່າເຊົ່າ, ຄ່າວັດຖຸດິບ, ຄ່າແຮງງານຕໍ່ເດືອນ',
            'ຕັ້ງສູດຄຳນວນກຳໄລຂັ້ນຕົ້ນ ແລະ ກຳໄລສຸດທິ',
            'ທົດລອງປັບຕົວເລກ: ຖ້າຕົ້ນທຶນເພີ່ມຂຶ້ນ 20% ເຮົາຕ້ອງຂາຍໄດ້ຈັກຈອກຈຶ່ງຈະບໍ່ຂາດທຶນ?',
          ],
          reassuranceNote: 'ໃຊ້ສູດບວກ-ລົບ-ຄູນ-ຫານ ທຳມະດາ ຈຸດປະສົງຄືການເບິ່ງວ່າເຈົ້າມັກ "ຄວາມຊັດເຈນຂອງຕົວເລກ" ຫຼື ບໍ່.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າຮູ້ສຶກມ່ວນກັບການ "ປັບຕົວແປແລ້ວເຫັນຜົນກຳໄລປ່ຽນແປງຕໍ່ໜ້າຕໍ່ຕາ" ຫຼື ບໍ່?',
        },
        {
          id: 'fin_exp_2',
          title: 'ການແກະຮອຍງົບການເງິນບໍລິສັດຈິງ (Financial Teardown)',
          timeCommitment: '1 ຊົ່ວໂມງ',
          description:
            'ດາວໂຫຼດລາຍງານປະຈຳປີ ຫຼື ງົບການເງິນຂອງບໍລິສັດໃນຕະຫຼາດຫຼັກຊັບລາວ (LSX ເຊັ່ນ BCEL ຫຼື EDL-Gen) ມາເບິ່ງແຫຼ່ງທີ່ມາຂອງລາຍຮັບ ແລະ ລາຍຈ່າຍ.',
          actionSteps: [
            'ເຂົ້າເວັບໄຊ lsx.com.la ແລ້ວດາວໂຫຼດງົບການເງິນລ່າສຸດ',
            'ຊອກຫາ 3 ຕົວເລກ: ລາຍຮັບລວມ, ລາຍຈ່າຍລວມ, ແລະ ກຳໄລສຸດທິ',
            'ປຽບທຽບກັບປີຜ່ານມາວ່າເຕີບໃຫຍ່ຂຶ້ນ ຫຼື ຫຼຸດລົງຍ້ອນຫຍັງ',
          ],
          reassuranceNote: 'ບໍ່ຕ້ອງເຂົ້າໃຈທຸກບັນຊີ ເບິ່ງສະເພາະພາບລວມຂອງກະແສເງິນ.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າຮູ້ສຶກສົນໃຈຢາກຮູ້ວ່າ "ເງິນໄຫຼໄປໃສ ແລະ ທຸລະກິດສ້າງກຳໄລແນວໃດ" ຫຼື ບໍ່?',
        },
      ];

    case 'health_medical':
      return [
        {
          id: 'health_exp_1',
          title: 'ການສຶກສາ ແລະ ທົດລອງວັດແທກສັນຍານຊີບ (Vital Signs Protocol)',
          timeCommitment: '1 ຊົ່ວໂມງ',
          description:
            'ຮຽນຮູ້ວິທີການວັດແທກສັນຍານຊີບພື້ນຖານ (ກຳມະຈອນ/ອັດຕາການເຕັ້ນຂອງຫົວໃຈ, ອັດຕາການຫາຍໃຈ) ແລະ ສຶກສາຂັ້ນຕອນການຊ່ວຍຊີວິດເບື້ອງຕົ້ນ (CPR).',
          actionSteps: [
            'ຝຶກຈັບກຳມະຈອນທີ່ຂໍ້ມືຂອງຕົນເອງ ແລະ ຄົນໃນຄອບຄົວ 1 ຄົນ (ນັບໃນ 1 ນາທີ)',
            'ວັດແທກກ່ອນ ແລະ ຫຼັງອອກກຳລັງກາຍ 5 ນາທີ ແລ້ວບັນທຶກຄວາມແຕກຕ່າງ',
            'ເບິ່ງວິດີໂອສອນຂັ້ນຕອນ CPR ທີ່ຖືກຕ້ອງຕາມມາດຕະຖານຂອງກາແດງສາກົນ',
          ],
          reassuranceNote: 'ເປັນການທົດສອບຄວາມໃສ່ໃຈໃນກົນໄກຮ່າງກາຍ ແລະ ຄວາມສະຫງົບເວລາເຫັນເລື່ອງສຸຂະພາບ.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າຮູ້ສຶກສົນໃຈ ແລະ ບໍ່ຢ້ານກົວເວລາສຶກສາກ່ຽວກັບລະບົບຮ່າງກາຍ ແລະ ການດູແລຄົນເຈັບຫຼືບໍ່?',
        },
        {
          id: 'health_exp_2',
          title: 'ການສ້າງແຜນຜັງວິນິດໄສອາການພະຍາດ (Symptom Decision Tree)',
          timeCommitment: '1.5 ຊົ່ວໂມງ',
          description:
            'ເລືອກອາການທົ່ວໄປ 1 ຢ່າງ (ເຊັ່ນ: ໄຂ້ ຫຼື ເຈັບທ້ອງ) ແລ້ວຄົ້ນຄວ້າຫຼັກການທາງການແພດເພື່ອສ້າງ Flowchart ວ່າມີປັດໄຈໃດແດ່ທີ່ຊ່ວຍຈຳແນກພະຍາດ.',
          actionSteps: [
            'ຄົ້ນຄວ້າຂໍ້ມູນຈາກແຫຼ່ງທີ່ໜ້າເຊື່ອຖື (WHO, Mayo Clinic ຫຼື ຄູ່ມືສາທາລະນະສຸກ)',
            'ແຕ້ມ Flowchart: ຖ້າມີໄຂ້ + ໄອ = ສົງໄສທາງເດີນຫາຍໃຈ, ຖ້າມີໄຂ້ + ປວດຂໍ້ = ສົງໄສໄຂ້ເລືອດອອກ',
            'ບັນທຶກອາການສັນຍານອັນຕະລາຍ (Red Flags) ທີ່ຕ້ອງສົ່ງໂຮງໝໍທັນທີ',
          ],
          reassuranceNote: 'ຈຸດປະສົງຄືການທົດສອບຄວາມຄິດແບບວິນິດໄສຢ່າງເປັນລະບົບຂອງແພດ.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າມ່ວນກັບການ "ສືບຫາສາເຫດຂອງພະຍາດ ແລະ ວາງວິທີປ້ອງກັນ" ຫຼື ບໍ່?',
        },
      ];

    case 'vocational_trade':
      return [
        {
          id: 'trade_exp_1',
          title: 'ການທົດລອງຄິດໄລ່ຕົ້ນທຶນ ແລະ ປຸງແຕ່ງສູດອາຫານມາດຕະຖານ (Recipe Costing)',
          timeCommitment: '2 ຊົ່ວໂມງ',
          description:
            'ເລືອກເມນູອາຫານ ຫຼື ເຄື່ອງດື່ມ 1 ຢ່າງ (ເຊັ່ນ: ກາເຟສູດພິເສດ, ເບເກີຣີ ຫຼື ອາຫານຈານດ່ວນ) ແລ້ວຊັ່ງຕວງວັດແທກວັດຖຸດິບຢ່າງລະອຽດ ພ້ອມຄິດໄລ່ຕົ້ນທຶນຕໍ່ຈານ.',
          actionSteps: [
            'ຈົດບັນຊີລາຄາວັດຖຸດິບທຸກຢ່າງທີ່ຊື້ມາຈາກຕະຫຼາດ',
            'ຊັ່ງນ້ຳໜັກວັດຖຸດິບທີ່ໃຊ້ຈິງຕໍ່ 1 ຈານ ແລ້ວຄຳນວນຕົ້ນທຶນເງິນກີບ',
            'ລົງມືປຸງແຕ່ງ ແລະ ຈັດຈານ (Food Plating) ໃຫ້ສວຍງາມລະດັບໂຮງແຮມ',
          ],
          reassuranceNote: 'ເນັ້ນການຝຶກຄວາມປານີດ ແລະ ການຄິດແບບທຸລະກິດອາຫານມືອາຊີບ.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າຮູ້ສຶກພູມໃຈເມື່ອ "ເຫັນຜົນງານທີ່ສວຍງາມ, ແຊບ ແລະ ຄຸ້ມຄ່າຕົ້ນທຶນ" ຫຼື ບໍ່?',
        },
        {
          id: 'trade_exp_2',
          title: 'ການກວດສອບມາດຕະຖານການບໍລິການລູກຄ້າ (Service Journey Audit)',
          timeCommitment: '1.5 ຊົ່ວໂມງ',
          description:
            'ລອງໄປສັງເກດການເຮັດວຽກຂອງໂຮງແຮມ, ຄາເຟ່ ຫຼື ຮ້ານຄ້າທີ່ໄດ້ຮັບຄວາມນິຍົມ ໂດຍບັນທຶກ Touchpoints ການບໍລິການຕັ້ງແຕ່ລູກຄ້າຍ່າງເຂົ້າມາຈົນຮອດເຊັກບິນ.',
          actionSteps: [
            'ສັງເກດ 3 ຈຸດ: ການທັກທາຍ, ຄວາມໄວໃນການບໍລິການ, ແລະ ຄວາມສະອາດຂອງສະຖານທີ່',
            'ບັນທຶກສິ່ງທີ່ເຮັດໄດ້ດີເລີດ ແລະ ສິ່ງທີ່ຍັງສາມາດປັບປຸງໄດ້',
            'ຂຽນຂໍ້ສະເໜີແນະ 3 ຂໍ້ ຖ້າເຈົ້າເປັນຜູ້ຈັດການໂຮງແຮມ/ຮ້ານນັ້ນ',
          ],
          reassuranceNote: 'ຝຶກສາຍຕາຂອງຜູ້ບໍລິຫານງານບໍລິການລະດັບສາກົນ.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າໃສ່ໃຈໃນລາຍລະອຽດເລັກໆ ນ້ອຍໆ ທີ່ສ້າງຄວາມປະທັບໃຈໃຫ້ລູກຄ້າຫຼືບໍ່?',
        },
      ];

    case 'creative_media':
      return [
        {
          id: 'creative_exp_1',
          title: 'ການຜະລິດຄລິບເລົ່າເລື່ອງສັ້ນ 30 ວິນາທີ (Micro-Storytelling)',
          timeCommitment: '1.5 ຊົ່ວໂມງ',
          description:
            'ໃຊ້ໂທລະສັບມືຖືຖ່າຍ ແລະ ຕັດຕໍ່ຄລິບສັ້ນ 30 ວິນາທີ ທີ່ເລົ່າເລື່ອງກ່ຽວກັບ "ມຸມມອງທີ່ໜ້າສົນໃຈໃນບ້ານ ຫຼື ໂຮງຮຽນຂອງເຈົ້າ" ໂດຍໃຊ້ CapCut ຫຼື Canva.',
          actionSteps: [
            'ຂຽນ Storyboard ງ່າຍໆ 3 ຊັອດ: ເປີດເລື່ອງ, ຈຸດໜ້າສົນໃຈ, ແລະ ບົດສະຫຼຸບ',
            'ຖ່າຍຄລິບ 3-5 ມຸມກ້ອງທີ່ແຕກຕ່າງກັນ',
            'ຕັດຕໍ່ໃສ່ສຽງເພງ ແລະ ຂໍ້ຄວາມ Hook ຄົນເບິ່ງພາຍໃນ 3 ວິນາທີທຳອິດ',
          ],
          reassuranceNote: 'ບໍ່ຈຳເປັນຕ້ອງໃຊ້ກ້ອງມືອາຊີບ ພະລັງຢູ່ທີ່ "ມຸມມອງ ແລະ ການເລົ່າເລື່ອງ".',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າຮູ້ສຶກມ່ວນຈົນລືມເວລາເມື່ອໄດ້ "ຈັດລຽງພາບ ແລະ ສຽງໃຫ້ສື່ຄວາມໝາຍ" ຫຼື ບໍ່?',
        },
      ];

    case 'stem_tech':
    default:
      return [
        {
          id: 'stem_exp_1',
          title: 'ການທົດລອງ Wireframe ແອັບແກ້ບັນຫາຕົວຈິງ (Product Validation)',
          timeCommitment: '1.5 - 2 ຊົ່ວໂມງ',
          description:
            'ລອງແຕ້ມໂຄງຮ່າງໜ້າຈໍແອັບພລິເຄຊັນ (Wireframe) 3 ໜ້າຈໍ ທີ່ໃຊ້ແກ້ໄຂບັນຫານ້ອຍໆ ໃນໂຮງຮຽນ ຫຼື ທ້ອງຖິ່ນ (ເຊັ່ນ: ແອັບແບ່ງປັນບົດຮຽນ, ແອັບສັ່ງອາຫານໂຮງອາຫານ) ໂດຍໃຊ້ Figma (ຟຣີ) ຫຼື ແຕ້ມໃສ່ເຈ້ຍ.',
          actionSteps: [
            'ຂຽນ Problem Statement: "ບັນຫາທີ່ເພື່ອນນັກຮຽນພົບເລື້ອຍໆ ຄືຫຍັງ?"',
            'ແຕ້ມ 3 ໜ້າຈໍຫຼັກ: 1) ໜ້າຄົ້ນຫາ 2) ໜ້າລາຍລະອຽດ 3) ປຸ່ມກົດດຳເນີນການ',
            'ເອົາໄປໃຫ້ໝູ່ 1 ຄົນທົດລອງກົດ ແລະ ຖາມວ່າເຂົ້າໃຈ Flow ຫຼື ບໍ່',
          ],
          reassuranceNote: 'ບໍ່ຈຳເປັນຕ້ອງງາມເລີດ ຈຸດປະສົງຄືການທົດສອບວ່າເຈົ້າມ່ວນກັບການຄິດ Flow ການເຮັດວຽກຂອງລະບົບຫຼືບໍ່.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າຮູ້ສຶກເພີດເພີນກັບການ "ແກ້ໄຂບັນຫາໃຫ້ User" ແລະ "ຈັດວາງ Flow ລະບົບ" ຫຼື ບໍ່?',
        },
        {
          id: 'stem_exp_2',
          title: 'ການຊອກຫາ Insight ຈາກ Open Data (Data Science Validation)',
          timeCommitment: '1 - 2 ຊົ່ວໂມງ',
          description:
            'ດາວໂຫຼດ Open Data (ຂໍ້ມູນສາທາລະນະ) 1 ຊຸດ (ເຊັ່ນ: ຂໍ້ມູນສະພາບອາກາດ, ສະຖິຕິການສຶກສາ ຫຼື ເສດຖະກິດ) ແລ້ວລອງໃຊ້ Excel, Google Sheets ພລັອດກຣາຟຫາ Trend.',
          actionSteps: [
            'ຫາຂໍ້ມູນຟຣີຈາກ Kaggle ຫຼື Open Development Mekong (Lao PDR)',
            'ພລັອດກຣາຟແທ່ງ ຫຼື ເສັ້ນ ເພື່ອເບິ່ງການປ່ຽນແປງ',
            'ຕັ້ງຄຳຖາມ: "ມີແນວໂນ້ມ (Trend) ຫຍັງແດ່ທີ່ເກີດຂຶ້ນ?"',
          ],
          reassuranceNote: 'ພຽງໃຊ້ Pivot Table ຫຼື ກຣາຟງ່າຍໆ ເພື່ອເບິ່ງ Insight ກໍພໍ.',
          validationMetricLo: 'ຕົວຊີ້ວັດ: ເຈົ້າຮູ້ສຶກຕື່ນເຕັ້ນເວລາ "ຄົ້ນພົບຄວາມຈິງທີ່ເຊື່ອງຢູ່ໃນຕົວເລກ" ຫຼື ບໍ່?',
        },
      ];
  }
}

function generatePortfolioRoadmap(primaryPath: PossiblePath, cluster: CareerClusterId) {
  return {
    title: `Roadmap ສູ່ Portfolio 6 ເດືອນ: ${primaryPath.title}`,
    focusArea: primaryPath.subtitle,
    milestones: [
      {
        period: 'ເດືອນທີ 1 - 2: ທົດສອບຄວາມຮູ້ສຶກ (Validation & Foundations)',
        objective: 'ລອງເຮັດ Micro-experiments ແລະ ສຳຫຼວດຄວາມມັກຕົວຈິງ ໂດຍບໍ່ກົດດັນ',
        tasks: [
          'ເລີ່ມຕົ້ນລອງເຮັດ 1 Micro-experiment ໃນທ້າຍອາທິດ (ໃຊ້ເວລາ 1-2 ຊົ່ວໂມງ)',
          'ຕິດຕາມຊ່ອງ YouTube / ຊຸມຊົນວິຊາຊີບສາຍນີ້ໃນລາວ ແລະ ອາຊຽນ ອາທິດລະ 1 ຄລິບ',
          'ບັນທຶກ Journal ສັ້ນໆ: "ສິ່ງທີ່ມ່ວນທີ່ສຸດໃນອາທິດນີ້ຄືຫຍັງ?"',
        ],
        portfolioDeliverable: 'ບັນທຶກຄວາມຄິດທຳອິດ (Idea Journal) ຫຼື ຊິ້ນງານສະເກັດລົງເຈ້ຍ 1 ຊຸດ',
      },
      {
        period: 'ເດືອນທີ 3 - 4: ລົງມືສ້າງໂຄງການທົດລອງ (Mini-Project)',
        objective: 'ສ້າງຊິ້ນງານຂະໜາດນ້ອຍ 1 ຊິ້ນ ທີ່ແກ້ໄຂບັນຫາຕົວຈິງໃນໂຮງຮຽນ ຫຼື ຊຸມຊົນ',
        tasks: [
          'ກຳນົດ Problem Statement ຕົວຈິງທີ່ຕ້ອງການແກ້ໄຂ',
          'ເລີ່ມຕົ້ນສ້າງ Prototype ຫຼື ຊິ້ນງານທົດລອງຕົວຈິງ',
          'ຂໍ Feedback ຈາກໝູ່ເພື່ອນ ຫຼື ອາຈານ 2-3 ຄົນ ເພື່ອປັບປຸງ',
        ],
        portfolioDeliverable: 'Working Prototype (Demo Link, ບົດລາຍງານ, ຫຼື ຮູບຖ່າຍຊິ້ນງານຕົວຈິງ)',
      },
      {
        period: 'ເດືອນທີ 5 - 6: ປະກອບ Portfolio & Showcase',
        objective: 'ຈັດລະບຽບຜົນງານໃສ່ແຟ້ມສະສົມຜົນງານ ເພື່ອກຽມຍື່ນທຶນ, ສະໝັກຮຽນ ຫຼື ສະໝັກວຽກ',
        tasks: [
          'ຂຽນ Case Study ສັ້ນໆ 1 ໜ້າ: ບັນຫາຄືຫຍັງ? ວິທີແກ້ໄຂຄືຫຍັງ? ແລະ ຜົນລັບເປັນແນວໃດ?',
          'ສ້າງແຟ້ມສະສົມຜົນງານ (PDF, Notion ຫຼື Slide Showcase)',
          'ຝຶກເວົ້ານຳສະເໜີໂຄງການ 3 ນາທີ',
        ],
        portfolioDeliverable: '1-Page Project Case Study ພ້ອມລິ້ງ Demo ໃນ CV ຫຼື Portfolio Showcase',
      },
    ],
    resumeTipLo:
      '💡 ຄຳແນະນຳການຂຽນໃສ່ CV/Portfolio: ຢ່າຂຽນພຽງແຕ່ "ມີຄວາມຮູ້ດ້ານນີ້" ແຕ່ໃຫ້ຂຽນວ່າ: "ໄດ້ສຶກສາ ແລະ ພັດທະນາໂຄງການ [ຊື່ໂຄງການ] ເພື່ອແກ້ໄຂບັນຫາ [ລະບຸບັນຫາ] ໃຫ້ເກີດຜົນລັບຕົວຈິງ".',
  };
}

function generateFamilyCommunicationGuide(possiblePaths: PossiblePath[]): FamilyCommunicationGuide {
  return {
    coreAdviceLo:
      'ພໍ່ແມ່ ແລະ ຄົນໃນຄອບຄົວສ່ວນໃຫຍ່ ບໍ່ໄດ້ຕໍ່ຕ້ານຄວາມຝັນຂອງເຈົ້າ ແຕ່ເຂົາເຈົ້າ "ກັງວົນເລື່ອງຄວາມໝັ້ນຄົງ ແລະ ຄວາມປອດໄພໃນຊີວິດ". ດັ່ງນັ້ນ ເວລາລົມກັບພໍ່ແມ່ ຢ່າໃຊ້ຄຳສັບທີ່ຟັງແລ້ວເບິ່ງຄືວຽກອະດິເລກ ຫຼື ວຽກທີ່ບໍ່ແນ່ນອນ. ໃຫ້ເຊື່ອມໂຍງສິ່ງທີ່ເຈົ້າມັກ ເຂົ້າກັບ "ຄວາມຕ້ອງການຂອງຕະຫຼາດແຮງງານ", "ໃບຮັບຮອງວິຊາຊີບ" ແລະ "ຄວາມໝັ້ນຄົງທາງລາຍໄດ້".',
    pathTranslations: possiblePaths.map((p) => ({
      pathTitle: p.title,
      whatNotToSayLo: p.familyTranslation?.suggestedScriptLo.split('ແຕ່ໃຫ້ບອກວ່າ:')[0] || 'ຢ່າໃຊ້ຄຳສັບທີ່ຟັງຄືວຽກຫຼິ້ນໆ',
      whatToSayLo: p.familyTranslation?.suggestedScriptLo.split('ແຕ່ໃຫ້ບອກວ່າ:')[1] || p.familyTranslation?.suggestedScriptLo || '',
      whyItBuildsTrustLo: p.familyTranslation?.stabilityAngleLo || 'ສ້າງຄວາມໝັ້ນໃຈໃຫ້ພໍ່ແມ່ວ່າມີວຽກຮອງຮັບແນ່ນອນ',
    })),
  };
}

function generateAIPromptMarkdown(data: {
  ageStage: string;
  currentTrack: string;
  provinceName: string;
  primaryCluster: CareerClusterId;
  primaryClusterMeta: any;
  primaryDim: DimensionId;
  secondaryDim: DimensionId;
  signals: ReflectionSignal[];
  possiblePaths: PossiblePath[];
  notedTensions: string[];
  familyCommunicationGuide: FamilyCommunicationGuide;
}): string {
  const topSignals = data.signals
    .slice(0, 3)
    .map((s) => `- ${s.nameLo} (${s.nameEnHint}): ລະດັບ ${s.levelText} - ${s.descriptionLo}`)
    .join('\n');

  const paths = data.possiblePaths
    .map(
      (p) =>
        `- ທາງເລືອກທີ ${p.pathNumber}: ${p.title}\n  - ຄຳອະທິບາຍ: ${p.subtitle}\n  - ວິທີອະທິບາຍໃຫ້ພໍ່ແມ່ຟັງ: ${p.familyTranslation?.suggestedScriptLo || ''}`
    )
    .join('\n');

  const tensions = data.notedTensions.map((t) => `- ${t}`).join('\n');

  return `# ຂໍ້ມູນສະທ້ອນຕົນເອງ Next-path (Career OS ສຳລັບໄວໜຸ່ມລາວ)

## ບໍລິບົດຂອງຂ້ອຍ (User Context)
- ຊ່ວງອາຍຸ / ລະດັບ: ${data.ageStage}
- ສາຍການຮຽນປັດຈຸບັນ: ${data.currentTrack}
- ແຂວງ / ທີ່ຢູ່: ${data.provinceName}, ປະເທດລາວ
- ກຸ່ມອາຊີບທີ່ໂດດເດັ່ນ: ${data.primaryClusterMeta.nameLo} (${data.primaryClusterMeta.nameEn})

## ຮູບແບບຄວາມສົນໃຈ ແລະ ທ່າແຮງ (Context-Aware Patterns)
${topSignals}

## ຕົ້ນແບບອາຊີບ ແລະ ເສັ້ນທາງທີ່ລະບົບສະເໜີ (Career Archetypes)
${paths}

## ຄວາມກັງວົນ ຫຼື ຄວາມຕຶງຄຽດໃນໃຈ (Tensions & Family Context)
${tensions}

---

## ຄຳແນະນຳສຳລັບ AI (Instructions for AI)
1. ເຮັດໜ້າທີ່ເປັນ **"ທີ່ປຶກສາດ້ານອາຊີບ ແລະ ການສຶກສາທີ່ເຂົ້າໃຈໄວໜຸ່ມລາວໃນສາຍ ${data.primaryClusterMeta.nameEn}"**.
2. **ຫ້າມຕັດສິນ ຫຼື ຟັນທົງ** ວ່າຂ້ອຍຕ້ອງເປັນອາຊີບໃດອາຊີບໜຶ່ງຢ່າງເດັດຂາດ.
3. ຊ່ວຍຂ້ອຍແຕກຍ່ອຍໄອເດຍອອກເປັນ **Micro-experiments** ທີ່ສາມາດວັດຜົນຄວາມຮູ້ສຶກ ແລະ ທັກສະໄດ້ຈິງ (ໃຊ້ເວລາ 1-3 ຊົ່ວໂມງ).
4. **Stakeholder Translation Layer:** ຊ່ວຍຂ້ອຍຄິດຄຳເວົ້າ ຫຼື ບົດສົນທະນາທີ່ສຸພາບ ເພື່ອອະທິບາຍໃຫ້ພໍ່ແມ່ເຂົ້າໃຈວ່າສາຍງານທີ່ຂ້ອຍສົນໃຈ ມີຄວາມໝັ້ນຄົງ ແລະ ອະນາຄົດທີ່ດີແນວໃດ.
5. ໃຊ້ພາສາລາວທີ່ອົບອຸ່ນ, ມີຫຼັກການ, ບໍ່ໃຊ້ຄຳສັບວິຊາການທີ່ສັບສົນເກີນໄປ.

---
**ຄຳຖາມເລີ່ມຕົ້ນຂອງຂ້ອຍ:**
"ສະບາຍດີ! ຈາກຂໍ້ມູນຂ້າງເທິງ ຂ້ອຍຢາກຂໍຄຳແນະນຳການສື່ສານກັບພໍ່ແມ່ ແລະ ໄອເດຍການທົດລອງນ້ອຍໆ ເພື່ອພິສູດວ່າຂ້ອຍເໝາະກັບສາຍງານນີ້ແທ້ຫຼືບໍ່?"
`;
}
