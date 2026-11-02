// Skill Swap - API service
// All communication with the backend (Express + Sequelize) goes through
// this file, so script.js never has to know about URLs or fetch options.

const API_BASE_URL = 'http://localhost:3000/api';

// GET /api/skills - returns every skill stored in the database
async function fetchSkills() {
  try {
    const response = await fetch(`${API_BASE_URL}/skills`);
    if (!response.ok) {
      throw new Error('Failed to fetch skills');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching skills:', error);
    throw error;
  }
}

// POST /api/skills - saves a new skill and returns the created record
async function createSkill(skillData) {
  try {
    const response = await fetch(`${API_BASE_URL}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillData),
    });
    if (!response.ok) {
      throw new Error('Failed to create skill');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating skill:', error);
    throw error;
  }
}

// Make functions available globally for browser use
window.apiService = { fetchSkills, createSkill };
