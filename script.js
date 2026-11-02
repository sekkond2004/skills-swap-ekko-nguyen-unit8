// Skill Swap - main script
// The testable logic (filter, cost, match) lives in skillswap-functions.js
// and is covered by Jest tests in __tests__/skillswap.test.js.
// Talking to the backend lives in api-service.js (window.apiService).
// This file connects those pieces to the page.

// Skills now come from the database through the API (see loadSkills below).
// This starts empty and is filled in once the fetch finishes.
let skills = [];
let currentCategory = "All";

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

// The database can send price as a string (e.g. "15.00") and some fields
// may be missing, so every skill is cleaned up before the page uses it.
function normalizeSkill(raw) {
    const price = Number(raw.price);
    return {
        ...raw,
        title: raw.title || "Untitled skill",
        category: raw.category || "Other",
        price: Number.isFinite(price) && price >= 0 ? price : 0,
        description: raw.description || ""
    };
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
    provider.textContent = skill.provider || "";
    const price = document.createElement("span");
    price.className = skill.price === 0 ? "price price-free" : "price";
    price.textContent = formatPrice(skill.price);
    meta.append(provider, price);

    card.append(tag, title, desc, meta);

    // Only show the extra details the database actually has for this skill
    const detailRows = [
        ["Background", skill.background],
        ["Teaching style", skill.style],
        ["Availability", skill.availability]
    ].filter(function (row) {
        return row[1];
    });

    if (detailRows.length > 0) {
        const details = document.createElement("div");
        details.className = "card-details";
        details.append(...detailRows.map(function (row) {
            return createDetail(row[0], row[1]);
        }));
        card.append(details);
    }

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
// AI-generated (Claude): filter buttons call filterSkillsByCategory().
// The buttons are built from the categories in the database, so a new
// category added through the form gets its own button automatically.
const filterBar = document.getElementById("filter-bar");
const resultCount = document.getElementById("result-count");
const matchCategorySelect = document.getElementById("match-category");
const categoryList = document.getElementById("category-list");

function getCategories(list) {
    const unique = new Set(list.map(function (skill) {
        return skill.category;
    }));
    return Array.from(unique).sort();
}

function createFilterButton(category) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-btn";
    button.dataset.category = category;
    button.textContent = category;
    button.setAttribute("aria-pressed", "false");
    return button;
}

function buildCategoryControls() {
    const categories = getCategories(skills);

    // Filter bar: "All" first, then one button per category
    filterBar.replaceChildren(
        createFilterButton("All"),
        ...categories.map(createFilterButton)
    );

    // Find My Match dropdown: keep what the user had picked if it still exists
    const previous = matchCategorySelect.value;
    const options = categories.map(function (category) {
        return new Option(category, category);
    });
    options.push(new Option("Any category", "All"));
    matchCategorySelect.replaceChildren(...options);
    if (previous && (previous === "All" || categories.includes(previous))) {
        matchCategorySelect.value = previous;
    }

    // Suggestions for the category field in the "Offer a Skill" form
    categoryList.replaceChildren(...categories.map(function (category) {
        return new Option(category);
    }));
}

function showCategory(category) {
    currentCategory = category;
    const filtered = filterSkillsByCategory(skills, category);
    renderSkills(filtered, skillGrid);

    const label = category === "All" ? "skills" : category + " skills";
    resultCount.textContent = "Showing " + filtered.length + " " + label;
    resultCount.classList.remove("error");

    filterBar.querySelectorAll(".filter-btn").forEach(function (button) {
        const isActive = button.dataset.category === category;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

// One listener on the bar handles every button, including ones added later
filterBar.addEventListener("click", function (event) {
    const button = event.target.closest(".filter-btn");
    if (button) {
        showCategory(button.dataset.category);
    }
});

// ---------- Load skills from the API ----------
// Calls fetchSkills() and waits for the Promise to resolve, then stores the
// data and redraws the page. Returns the skills so other code can await it.
const reloadButton = document.getElementById("reload-skills");

async function loadSkills() {
    showMessage(resultCount, "Loading skills...");
    skillGrid.setAttribute("aria-busy", "true");
    reloadButton.hidden = true;

    try {
        const data = await window.apiService.fetchSkills();
        // Accept either a plain array or an object like { skills: [...] }
        const list = Array.isArray(data) ? data : (data.skills || data.data || []);
        skills = list.map(normalizeSkill);

        buildCategoryControls();
        const stillExists = currentCategory === "All" ||
            skills.some(function (skill) { return skill.category === currentCategory; });
        showCategory(stillExists ? currentCategory : "All");
        return skills;
    } catch (error) {
        skills = [];
        skillGrid.replaceChildren();
        showMessage(
            resultCount,
            "Couldn't load skills. Make sure the backend server is running at http://localhost:3000, then try again.",
            true
        );
        reloadButton.hidden = false;
        return skills;
    } finally {
        skillGrid.removeAttribute("aria-busy");
    }
}

reloadButton.addEventListener("click", loadSkills);

loadSkills();

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

// ---------- Offer a Skill (create) ----------
// On submit, send the new skill to the API with createSkill(). Once the
// database has saved it, reload every skill with loadSkills() so the new
// card shows up and stays there after a page refresh.
const skillForm = document.getElementById("skill-form");
const skillTitleInput = document.getElementById("skill-title");
const skillCategoryInput = document.getElementById("skill-category");
const skillPriceInput = document.getElementById("skill-price");
const skillDescriptionInput = document.getElementById("skill-description");
const skillFormResult = document.getElementById("skill-form-result");
const skillSubmitButton = document.getElementById("skill-submit");

skillForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = skillTitleInput.value.trim();
    const category = skillCategoryInput.value.trim();
    const priceText = skillPriceInput.value.trim();
    const description = skillDescriptionInput.value.trim();

    if (!title || !category || priceText === "" || !description) {
        showMessage(skillFormResult, "Fill in the title, category, price, and description.", true);
        return;
    }

    const price = Number(priceText);
    if (!Number.isFinite(price) || price < 0) {
        showMessage(skillFormResult, "Price must be 0 (free) or more.", true);
        return;
    }

    // Stop double submits while the request is in flight
    skillSubmitButton.disabled = true;
    showMessage(skillFormResult, "Saving your skill...");

    try {
        const created = await window.apiService.createSkill({
            title: title,
            category: category,
            price: price,
            description: description
        });

        skillForm.reset();
        await loadSkills();
        showMessage(skillFormResult, "\"" + (created.title || title) + "\" was added to Skill Swap.");
    } catch (error) {
        showMessage(
            skillFormResult,
            "Couldn't save your skill. Make sure the backend server is running, then try again.",
            true
        );
    } finally {
        skillSubmitButton.disabled = false;
    }
});
