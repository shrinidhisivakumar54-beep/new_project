export function validateBrief(brief) {
  if (!brief || typeof brief !== 'object') return 'Please provide a project brief.';
  for (const key of ['title', 'goal', 'deliverable', 'done']) {
    if (typeof brief[key] !== 'string' || !brief[key].trim()) return 'Add a title, goal, deliverable, and definition of done.';
  }
  if (Object.values(brief).some(v => typeof v !== 'string' || v.length > 6000)) return 'Keep each field under 6,000 characters.';
  return null;
}
export function demoPlan(b) {
  return [
    { title: `Shape the plan for ${b.title}`, category: 'Strategy', effort: '30–45 min', description: `Translate this goal into a short approach: ${b.goal}`, deliverable: 'A one-page approach and open questions.', done: 'The project owner has reviewed the approach.', constraints: b.constraints || 'Confirm access and scope with the project owner.' },
    { title: `Create ${b.deliverable}`, category: 'Creative', effort: 'Confirm effort', description: `Contribute a first draft toward ${b.goal}`, deliverable: b.deliverable, done: b.done, constraints: b.constraints || 'Use only materials you have permission to access.' },
    { title: `Give ${b.title} a second pair of eyes`, category: 'Review', effort: '20–30 min', description: 'Review the draft against the agreed acceptance criteria and flag gaps.', deliverable: 'An annotated review with actionable suggestions.', done: b.done, constraints: b.constraints || 'Review only; the original owner approves final changes.' }
  ];
}
