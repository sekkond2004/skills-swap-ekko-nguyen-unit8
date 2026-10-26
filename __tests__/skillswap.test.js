const skillswap = require('../skillswap-functions');
const { filterSkillsByCategory } = skillswap;

describe('test setup', () => {
  test('skillswap-functions module loads', () => {
    expect(typeof skillswap).toBe('object');
  });
});

describe('filterSkillsByCategory', () => {
  const skills = [
    { title: 'Python Tutoring', category: 'Programming', price: 20 },
    { title: 'Guitar Lessons', category: 'Music', price: 15 },
    { title: 'Resume Review', category: 'Career', price: 0 },
    { title: 'Web Development', category: 'Programming', price: 25 },
  ];

  test('filters skills by category', () => {
    expect(filterSkillsByCategory(skills, 'Programming')).toEqual([
      { title: 'Python Tutoring', category: 'Programming', price: 20 },
      { title: 'Web Development', category: 'Programming', price: 25 },
    ]);
  });

  test('returns a single match for a category with one skill', () => {
    expect(filterSkillsByCategory(skills, 'Music')).toEqual([
      { title: 'Guitar Lessons', category: 'Music', price: 15 },
    ]);
  });

  test('keeps free (price 0) skills when filtering', () => {
    expect(filterSkillsByCategory(skills, 'Career')).toEqual([
      { title: 'Resume Review', category: 'Career', price: 0 },
    ]);
  });

  test('returns every skill for the "All" category', () => {
    const result = filterSkillsByCategory(skills, 'All');
    expect(result).toEqual(skills);
    expect(result).toHaveLength(4);
  });

  test('returns an empty array when no skills match', () => {
    expect(filterSkillsByCategory(skills, 'Cooking')).toEqual([]);
  });

  test('returns an empty array for an empty skills list', () => {
    expect(filterSkillsByCategory([], 'Programming')).toEqual([]);
  });

  test('does not modify the original array', () => {
    const copy = [...skills];
    filterSkillsByCategory(skills, 'Music');
    expect(skills).toEqual(copy);
  });
});
