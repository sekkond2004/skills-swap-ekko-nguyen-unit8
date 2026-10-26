# Skill Swap

## Description
Skill Swap is a peer-to-peer marketplace where college students can offer the skills they're good at (tutoring, coding help, design, music lessons, and more) and find classmates who can help them learn something new. Providers build a credentialed profile and set an hourly rate per skill, and learners search and filter to find the right person.

## Features
- Skill cards that expand to show the provider's background, teaching style, and availability
- **Category filter**: All / Programming / Music / Career buttons use `filterSkillsByCategory(skills, category)`
- **Session cost calculator**: hourly rate × hours using `calculateTotalCost(hourlyRate, hours)`, including free sessions, zero hours, and decimal hours

## Technologies Used
- HTML5 (semantic elements)
- CSS3 (Flexbox and Grid)
- JavaScript (vanilla, DOM manipulation)
- Jest (unit testing, test-driven development)
- Git and GitHub (feature branches, pull requests, self-review)

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

## Author
Ekko Nguyen
