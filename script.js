// Skill Swap - main script

// AI-generated (Claude): expand/collapse logic for skill cards.
// Clicking a card (or pressing Enter/Space when it is focused) toggles
// the extra provider details: background, teaching style, availability.
const skillCards = document.querySelectorAll(".skill-card");

function toggleCard(card) {
    const isExpanded = card.classList.toggle("expanded");
    // Keep the aria attribute in sync so screen readers know the state
    card.setAttribute("aria-expanded", isExpanded);
}

skillCards.forEach(function (card) {
    card.addEventListener("click", function () {
        toggleCard(card);
    });

    // AI-generated (Claude): keyboard support so the cards are accessible
    card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault(); // stop Space from scrolling the page
            toggleCard(card);
        }
    });
});
