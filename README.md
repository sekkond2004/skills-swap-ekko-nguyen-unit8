# Skill Swap

## Description
Skill Swap is a peer-to-peer marketplace where college students can offer the skills they're good at (tutoring, coding help, design, music lessons, and more) and find classmates who can help them learn something new. Providers build a credentialed profile and set an hourly rate per skill, and learners search and filter to find the right person.

## Features
- **Data from a real database**: skills load from the Skill Swap backend (Express + Sequelize) through `GET /api/skills`, so nothing resets on refresh
- **Offer a Skill form**: title, category, price, and description are saved with `POST /api/skills`, then the list reloads
- Loading and error messages (with a Try again button) when the backend is slow or not running
- Skill cards that expand to show the provider's background, teaching style, and availability
- **Category filter**: one button per category in the database (plus All), using `filterSkillsByCategory(skills, category)`
- **Session cost calculator**: hourly rate × hours using `calculateTotalCost(hourlyRate, hours)`, including free sessions, zero hours, and decimal hours
- **Find My Match**: choose a category and max price; `matchSkillsToUser(userNeeds, skills)` returns skills in that category at or under the budget, including free ones

## Technologies Used
- HTML5 (semantic elements)
- CSS3 (Flexbox and Grid)
- JavaScript (vanilla, DOM manipulation)
- Jest (unit testing, test-driven development)
- Git and GitHub (feature branches, pull requests, self-review)

## Architecture (three tiers)
| Layer | Where | Job |
| --- | --- | --- |
| Frontend | this repo (`index.html`, `script.js`, `styles.css`) | Shows the data and handles user input |
| API service | `api-service.js` | `fetchSkills()` and `createSkill()`; the only file that knows the API URL |
| Backend API + database | Skill Swap backend repo (Express + Sequelize + SQLite) | Stores skills and serves them at `http://localhost:3000/api` |

## Running the App
1. Start the backend in its own terminal (from the backend repo):
   ```bash
   # .env
   DB_STORAGE=./database.sqlite
   PORT=3000
   ```
   ```bash
   npm install
   npm run setup
   npm start
   ```
   Check http://localhost:3000/api/skills shows JSON.
2. Open this frontend with a local server (for example the VS Code Live Server extension) and go to `index.html`.

## Running the Tests
```bash
npm install
npm test
```

The functions in `skillswap-functions.js` are pure (no DOM), so Jest can test them directly. `index.html` loads the same file with a `<script>` tag, and `script.js` uses the functions to update the page.

## TDD Workflow
Each feature was built on its own branch and merged with a pull request:

1. **Red**: write tests in `__tests__/skillswap.test.js` that describe the behavior; they fail.
2. **Green**: write just enough code in `skillswap-functions.js` to pass.
3. **Integrate**: connect the function to the page in `script.js`.

| Branch | Function |
| --- | --- |
| `feature/filter-skills` | `filterSkillsByCategory` |
| `feature/calculate-cost` | `calculateTotalCost` |
| `feature/match-skills` | `matchSkillsToUser` |
| `feature/api-integration` | `api-service.js`, loading skills from the API, Offer a Skill form |

## Author
Ekko Nguyen
