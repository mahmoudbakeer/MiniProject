// Elements
const elements = {
    quoteText: document.getElementById('quoteText'),
    quoteAuthor: document.getElementById('quoteAuthor'),
    newQuoteBtn: document.getElementById('newQuoteBtn'),
    saveQuoteBtn: document.getElementById('saveQuoteBtn'),
    customQuoteForm: document.getElementById('customQuoteForm'),
    customQuoteText: document.getElementById('customQuoteText'),
    customQuoteAuthor: document.getElementById('customQuoteAuthor'),
    favoritesList: document.getElementById('favoritesList'),
    themeToggle: document.getElementById('themeToggle'),
    searchInput: document.getElementById('searchInput'),
    toast: document.getElementById('toast')
};

// State
const state = {
    currentQuote: {
        text: 'Click below for a motivational quote!',
        author: ''
    },
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    theme: localStorage.getItem('theme') || 'light'
};

// Initialize
function init() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();
    renderFavorites();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    elements.newQuoteBtn.addEventListener('click', getRandomQuote);
    elements.saveQuoteBtn.addEventListener('click', saveQuote);
    elements.customQuoteForm.addEventListener('submit', addCustomQuote);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.searchInput.addEventListener('input', searchFavorites);
}

// Quote Functions
async function getRandomQuote() {
    try {
        const response = await fetch('https://stoic-quotes.com/api/quote');
        const quote = await response.json();
        state.currentQuote = { text: quote.text, author: quote.author };
        updateQuoteDisplay();
    } catch {
        showToast("Couldn't fetch quote. Try again later.");
    }
}

function updateQuoteDisplay() {
    elements.quoteText.textContent = state.currentQuote.text;
    elements.quoteAuthor.textContent = state.currentQuote.author ? `— ${state.currentQuote.author}` : '';
    elements.saveQuoteBtn.innerHTML = isQuoteSaved() ? 
        '<i class="fas fa-heart"></i> Saved' : 
        '<i class="far fa-heart"></i> Save';
}

// Favorites Functions
function saveQuote() {
    if (isQuoteSaved()) {
        showToast('Already saved!');
        return;
    }

    const description = prompt('Add a note (optional):');
    const favorite = {
        ...state.currentQuote,
        id: Date.now(),
        description: description || '',
        date: new Date().toISOString()
    };

    state.favorites.push(favorite);
    saveFavorites();
    renderFavorites();
    updateQuoteDisplay();
    showToast('Quote saved!');
}

function isQuoteSaved() {
    return state.favorites.some(fav => 
        fav.text === state.currentQuote.text && 
        fav.author === state.currentQuote.author
    );
}

function renderFavorites() {
    if (state.favorites.length === 0) {
        elements.favoritesList.innerHTML = '<p>No favorites yet</p>';
        return;
    }

    elements.favoritesList.innerHTML = state.favorites.map(fav => `
        <div class="favorite-item">
            <p class="quote-text">${fav.text}</p>
            <p class="author">— ${fav.author}</p>
            ${fav.description ? `<p>${fav.description}</p>` : ''}
            <button onclick="deleteFavorite(${fav.id})"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');
}

function deleteFavorite(id) {
    if (confirm('Delete this quote?')) {
        state.favorites = state.favorites.filter(fav => fav.id !== id);
        saveFavorites();
        renderFavorites();
        showToast('Quote deleted');
    }
}

function searchFavorites() {
    const term = elements.searchInput.value.toLowerCase();
    const filtered = state.favorites.filter(fav => 
        fav.author.toLowerCase().includes(term)
    );
    
    if (filtered.length === 0) {
        elements.favoritesList.innerHTML = '<p>No matches found</p>';
    } else {
        elements.favoritesList.innerHTML = filtered.map(fav => `
            <div class="favorite-item">
                <p class="quote-text">${fav.text}</p>
                <p class="author">— ${fav.author}</p>
            </div>
        `).join('');
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
}

// Custom Quotes
function addCustomQuote(e) {
    e.preventDefault();
    const text = elements.customQuoteText.value.trim();
    const author = elements.customQuoteAuthor.value.trim() || 'Anonymous';
    
    if (!text) {
        showToast('Please enter a quote');
        return;
    }

    state.currentQuote = { text, author };
    updateQuoteDisplay();
    elements.customQuoteForm.reset();
    showToast('Custom quote added!');
}

// Theme Functions
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    elements.themeToggle.innerHTML = state.theme === 'light' ? 
        '<i class="fas fa-moon"></i>' : 
        '<i class="fas fa-sun"></i>';
}

// Utility
function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    setTimeout(() => elements.toast.classList.remove('show'), 3000);
}

// Initialize app
window.deleteFavorite = deleteFavorite;
init();