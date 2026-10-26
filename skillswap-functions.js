/**
 * Skill Swap – testable functions.
 * Pure functions (no DOM access) so they can be unit tested with Jest
 * and reused by script.js in the browser.
 */

/**
 * Returns the skills that belong to the given category.
 * "All" (or no category) returns every skill.
 * @param {Array<{title: string, category: string, price: number}>} skills
 * @param {string} category
 * @returns {Array} a new array; the original is never modified
 */
function filterSkillsByCategory(skills, category) {
  if (!Array.isArray(skills)) return [];
  if (!category || category === 'All') return [...skills];
  return skills.filter((skill) => skill.category === category);
}

/**
 * Total cost of a session: hourly rate × hours, rounded to cents.
 * Free sessions (rate 0) and zero hours both cost 0.
 * Invalid or negative input returns 0 instead of NaN.
 * @param {number} hourlyRate
 * @param {number} hours
 * @returns {number}
 */
function calculateTotalCost(hourlyRate, hours) {
  const rate = Number(hourlyRate);
  const time = Number(hours);
  if (!Number.isFinite(rate) || !Number.isFinite(time) || rate < 0 || time < 0) {
    return 0;
  }
  return Math.round(rate * time * 100) / 100;
}

// Export for Jest (Node). The check keeps browsers from throwing
// "module is not defined" when this file is loaded with a <script> tag.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterSkillsByCategory, calculateTotalCost };
}
