// Skill Swap - main script
// The testable logic (filter, cost, match) lives in skillswap-functions.js
// and is covered by Jest tests in __tests__/skillswap.test.js.
// This file connects those functions to the page.

// AI-generated (Claude): skill data moved out of the HTML into an array
// so the filter and matcher functions can work with it.
const skills = [
    {
        title: "Intro to Python", category: "Programming", price: 15, provider: "Maya Chen",
        description: "Get unstuck on loops, functions, and your first projects.",
        background: "CS major, TA for CS 101", style: "Patient with beginners", availability: "Weeknights"
    },
    {
        title: "Web Development Basics", category: "Programming", price: 20, provider: "Leo Martinez",
        description: "Build and publish your first site with HTML, CSS, and JavaScript.",
        background: "Info Sci major, freelance web developer", style: "Build-along projects", availability: "Weekends"
    },
    {
        title: "Guitar for Beginners", category: "Music", price: 12, provider: "Jordan Ruiz",
        description: "Learn chords, strumming patterns, and your first full song.",
        background: "Music minor, 8 years playing", style: "Song-based, hands-on", availability: "Weekends"
    },
    {
        title: "Music Theory Study Group", category: "Music", price: 0, provider: "Ava Thompson",
        description: "A free weekly group session on scales, chords, and ear training.",
        background: "Music major, choir section leader", style: "Group practice", availability: "Fridays"
    },
    {
        title: "Resume Review", category: "Career", price: 0, provider: "Marcus Johnson",
        description: "Free line-by-line feedback before you apply for internships.",
        background: "Career center peer advisor", style: "Quick, actionable notes", availability: "Drop-in, Mon - Fri"
    },
    {
        title: "Mock Interviews", category: "Career", price: 25, provider: "Aisha Bello",
        description: "Practice behavioral and technical interviews and get feedback.",
        background: "Interned at two tech companies", style: "Realistic practice, honest feedback", availability: "Sunday afternoons"
    },
    {
        title: "Resume & Portfolio Design", category: "Design", price: 20, provider: "Priya Patel",
        description: "Make your resume and portfolio stand out to recruiters.",
        background: "Graphic design major, Figma certified", style: "Detailed feedback, side-by-side edits", availability: "Mon / Wed afternoons"
    },
    {
        title: "Calculus I Tutoring", category: "Math", price: 18, provider: "Sam Okafor",
        description: "Limits, derivatives, and exam prep made understandable.",
        background: "Math major, 3.9 GPA in calc sequence", style: "Practice problems first", availability: "Tue / Thu evenings"
    }
];

const skillGrid = document.getElementById("skill-grid");

// ---------- Helpers ----------
function formatMoney(amount) {
    return Number.isInteger(amount) ? "$" + amount : "$" + amount.toFixed(2);
}

function formatPrice(price) {
    return price === 0 ? "Free" : formatMoney(price) + "/hr";
}

function showMessage(element, text, isError) {
    element.textContent = text;
    element.classList.toggle("error", Boolean(isError));
}

// ---------- Skill cards ----------
// AI-generated (Claude): builds the same card markup as the Unit 7 HTML
function createDetail(label, value) {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = label + ":";
    p.append(strong, " " + value);
    return p;
}

function createSkillCard(skill) {
    const card = document.createElement("article");
    card.className = "skill-card";
    card.tabIndex = 0;
    card.setAttribute("aria-expanded", "false");

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = skill.category;

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = skill.title;

    const desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = skill.description;

    const meta = document.createElement("div");
    meta.className = "card-meta";
    const provider = document.createElement("span");
    provider.className = "provider";
    provider.textContent = skill.provider;
    const price = document.createElement("span");
    price.className = skill.price === 0 ? "price price-free" : "price";
    price.textContent = formatPrice(skill.price);
    meta.append(provider, price);

    const details = document.createElement("div");
    details.className = "card-details";
    details.append(
        createDetail("Background", skill.background),
        createDetail("Teaching style", skill.style),
        createDetail("Availability", skill.availability)
    );

    card.append(tag, title, desc, meta, details);
    return card;
}

function renderSkills(list, container) {
    container.replaceChildren(...list.map(createSkillCard));
}

// ---------- Expand / collapse (from Unit 7) ----------
// Clicking a card (or pressing Enter/Space when it is focused) toggles
// the extra provider details. Cards are now created by JavaScript, so the
// listeners are on the document (event delegation) instead of on each card.
function toggleCard(card) {
    const isExpanded = card.classList.toggle("expanded");
    // Keep the aria attribute in sync so screen readers know the state
    card.setAttribute("aria-expanded", isExpanded);
}

document.addEventListener("click", function (event) {
    const card = event.target.closest(".skill-card");
    if (card) {
        toggleCard(card);
    }
});

document.addEventListener("keydown", function (event) {
    const card = event.target.closest(".skill-card");
    if (card && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault(); // stop Space from scrolling the page
        toggleCard(card);
    }
});

// ---------- Category filter ----------
// AI-generated (Claude): filter buttons call filterSkillsByCategory()
const filterButtons = document.querySelectorAll(".filter-btn");
const resultCount = document.getElementById("result-count");

function showCategory(category) {
    const filtered = filterSkillsByCategory(skills, category);
    renderSkills(filtered, skillGrid);

    const label = category === "All" ? "skills" : category + " skills";
    resultCount.textContent = "Showing " + filtered.length + " " + label;

    filterButtons.forEach(function (button) {
        const isActive = button.dataset.category === category;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        showCategory(button.dataset.category);
    });
});

showCategory("All");

// ---------- Cost calculator ----------
// AI-generated (Claude): form calls calculateTotalCost()
const costForm = document.getElementById("cost-form");
const rateInput = document.getElementById("rate-input");
const hoursInput = document.getElementById("hours-input");
const costResult = document.getElementById("cost-result");

costForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (rateInput.value.trim() === "" || hoursInput.value.trim() === "") {
        showMessage(costResult, "Enter both an hourly rate and a number of hours.", true);
        return;
    }

    const rate = Number(rateInput.value);
    const hours = Number(hoursInput.value);

    if (rate < 0 || hours < 0) {
        showMessage(costResult, "Rate and hours can't be negative.", true);
        return;
    }

    const total = calculateTotalCost(rate, hours);
    const hourLabel = hours === 1 ? "hour" : "hours";

    if (rate === 0) {
        showMessage(costResult, "Free session: " + hours + " " + hourLabel + " costs $0.00");
    } else {
        showMessage(costResult, hours + " " + hourLabel + " at " + formatPrice(rate) + " = $" + total.toFixed(2));
    }
});

// ---------- Find my match ----------
// AI-generated (Claude): form calls matchSkillsToUser()
const matchForm = document.getElementById("match-form");
const matchCategory = document.getElementById("match-category");
const maxPriceInput = document.getElementById("max-price-input");
const matchSummary = document.getElementById("match-summary");
const matchResults = document.getElementById("match-results");

matchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (maxPriceInput.value.trim() === "") {
        showMessage(matchSummary, "Enter the most you want to pay per hour (0 for free skills only).", true);
        matchResults.replaceChildren();
        return;
    }

    const maxPrice = Number(maxPriceInput.value);
    if (maxPrice < 0) {
        showMessage(matchSummary, "Max price can't be negative.", true);
        matchResults.replaceChildren();
        return;
    }

    const category = matchCategory.value;
    const matches = matchSkillsToUser({ category: category, maxPrice: maxPrice }, skills);
    renderSkills(matches, matchResults);

    const where = category === "All" ? "in any category" : "in " + category;
    const free = maxPrice === 0 ? "free " : "";
    const budget = maxPrice === 0 ? "" : " at or under " + formatMoney(maxPrice) + "/hr";

    if (matches.length === 0) {
        showMessage(matchSummary, "No " + free + "skills " + where + budget + " yet. Try a higher budget or another category.");
    } else {
        const noun = matches.length === 1 ? "match" : "matches";
        showMessage(matchSummary, matches.length + " " + free + noun + " " + where + budget + ".");
    }
});
