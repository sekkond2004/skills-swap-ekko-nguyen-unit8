const skillswap = require('../skillswap-functions');
const { filterSkillsByCategory, calculateTotalCost, matchSkillsToUser } = skillswap;

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

describe('calculateTotalCost', () => {
  test('multiplies the hourly rate by the number of hours', () => {
    expect(calculateTotalCost(20, 2)).toBe(40);
    expect(calculateTotalCost(15, 3)).toBe(45);
    expect(calculateTotalCost(50, 1)).toBe(50);
  });

  test('returns 0 for a free session (rate of 0)', () => {
    expect(calculateTotalCost(0, 3)).toBe(0);
  });

  test('returns 0 when zero hours are requested', () => {
    expect(calculateTotalCost(20, 0)).toBe(0);
  });

  test('handles decimal hours', () => {
    expect(calculateTotalCost(25, 1.5)).toBe(37.5);
    expect(calculateTotalCost(18, 0.25)).toBe(4.5);
  });

  test('rounds to the nearest cent', () => {
    expect(calculateTotalCost(19.99, 3)).toBe(59.97);
  });
});

describe('matchSkillsToUser', () => {
  const skills = [
    { title: 'Python Tutoring', category: 'Programming', price: 20 },
    { title: 'JavaScript Help', category: 'Programming', price: 25 },
    { title: 'Guitar Lessons', category: 'Music', price: 15 },
    { title: 'Resume Review', category: 'Career', price: 0 },
  ];

  test('matches skills by category and price', () => {
    const needs = { category: 'Programming', maxPrice: 30 };
    expect(matchSkillsToUser(needs, skills)).toEqual([
      { title: 'Python Tutoring', category: 'Programming', price: 20 },
      { title: 'JavaScript Help', category: 'Programming', price: 25 },
    ]);
  });

  test('filters out skills above the max price (price equal to max is kept)', () => {
    const needs = { category: 'Programming', maxPrice: 20 };
    expect(matchSkillsToUser(needs, skills)).toEqual([
      { title: 'Python Tutoring', category: 'Programming', price: 20 },
    ]);
  });

  test('returns an empty array when no category matches', () => {
    const needs = { category: 'Cooking', maxPrice: 100 };
    expect(matchSkillsToUser(needs, skills)).toEqual([]);
  });

  test('returns an empty array when everything is over budget', () => {
    const needs = { category: 'Music', maxPrice: 10 };
    expect(matchSkillsToUser(needs, skills)).toEqual([]);
  });

  test('includes free skills when the max price is 0', () => {
    const needs = { category: 'Career', maxPrice: 0 };
    expect(matchSkillsToUser(needs, skills)).toEqual([
      { title: 'Resume Review', category: 'Career', price: 0 },
    ]);
  });

  test('includes free skills alongside paid ones within budget', () => {
    const needs = { category: 'Career', maxPrice: 50 };
    expect(matchSkillsToUser(needs, skills)).toEqual([
      { title: 'Resume Review', category: 'Career', price: 0 },
    ]);
  });
});
