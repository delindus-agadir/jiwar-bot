/**
 * Calculates the effectiveness rate for a member based on quality evaluations and activity contributions.
 * 
 * New System (70% Quality + 30% Contribution):
 * - Quality: Average of evaluations (0-25 points)
 * - Contribution: Points from activities (6/8/12 per activity)
 * 
 * @param {Array} evaluations - Array of evaluation objects { date: string, score: number, maxScore: number }
 * @param {number} contributionPoints - Total contribution points from activities
 * @returns {number} Effectiveness rate (0-100)
 */
export const calculateEffectiveness = (evaluations, contributionPoints = 0) => {
  if (!evaluations || evaluations.length === 0) {
    // If no evaluations, use only contribution points
    return Math.min(contributionPoints * 4, 100); // Scale contribution to 0-100
  }

  // 1. Calculate Quality Average (0-25 scale)
  let totalQuality = 0;
  let validEvaluationsCount = 0;

  evaluations.forEach(ev => {
    if (ev.maxScore && ev.maxScore > 0) {
      totalQuality += ev.score;
      validEvaluationsCount++;
    }
  });

  const qualityAvg = validEvaluationsCount > 0 ? totalQuality / validEvaluationsCount : 0;

  // 2. Normalize to 0-100 scale
  const qualityScore = (qualityAvg / 25) * 100; // Convert 0-25 to 0-100
  const contributionScore = Math.min((contributionPoints / 25) * 100, 100); // Scale contribution

  // 3. Final Weighted Score (70% Quality + 30% Contribution)
  const finalScore = (qualityScore * 0.70) + (contributionScore * 0.30);

  return Math.round(finalScore * 10) / 10; // Round to 1 decimal
};

/**
 * Calculate monthly score with weights
 * @param {number} qualityScore - Quality score (0-25)
 * @param {number} contributionScore - Contribution points from activities
 * @returns {number} Weighted monthly score
 */
export const calculateMonthlyScore = (qualityScore, contributionScore) => {
  const qualityWeight = 0.7;  // 70%
  const contributionWeight = 0.3;  // 30%

  return (qualityScore * qualityWeight) + (contributionScore * contributionWeight);
};

/**
 * Returns the classification based on the effectiveness rate.
 * @param {number} rate 
 * @returns {object} { label: string, color: string, grade: string }
 */
export const getClassification = (rate) => {
  if (rate >= 90) return { label: 'الصفوة', color: '#FFD700', grade: 'elite' }; // Gold
  if (rate >= 75) return { label: 'المتميزون', color: '#C0C0C0', grade: 'distinguished' }; // Silver
  if (rate >= 50) return { label: 'المحوريون', color: '#CD7F32', grade: 'pivotal' }; // Bronze
  if (rate >= 25) return { label: 'الصاعدون', color: '#4CAF50', grade: 'rising' }; // Green
  return { label: 'المتراجعون', color: '#F44336', grade: 'regressing' }; // Red
};

export const CRITERIA = [
  { id: 'attendance', label: 'الحضور والانضباط', max: 5, options: [{ label: 'حضور في الوقت', val: 5 }, { label: 'تأخير بسيط', val: 3 }, { label: 'غياب غير مبرر', val: 0 }] },
  { id: 'interaction', label: 'التفاعل والانتماء', max: 5, options: [{ label: 'مشاركة فعالة', val: 5 }, { label: 'مشاركة عادية', val: 3 }, { label: 'سلبية', val: 0 }] },
  { id: 'work', label: 'العمل والإتقان', max: 5, options: [{ label: 'إنجاز ممتاز', val: 5 }, { label: 'إنجاز جيد', val: 4 }, { label: 'عدم الإنجاز', val: 0 }] },
  { id: 'creativity', label: 'الاجتهاد والإبداع', max: 5, options: [{ label: 'أفكار جديدة', val: 5 }, { label: 'اجتهاد متوسط', val: 3 }, { label: 'بدون اجتهاد', val: 0 }] },
  { id: 'ethics', label: 'الخلق والآداب', max: 5, options: [{ label: 'احترام تام', val: 5 }, { label: 'سلوك غير مناسب', val: 2 }, { label: 'إساءة', val: 0 }] },
];
