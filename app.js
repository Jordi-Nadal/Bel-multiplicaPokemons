// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentScreen: 'config',
    selectedTables: [],
    currentQuestion: null,
    totalScore: 0,
    streak: 0,
    correctCount: 0,
    pokemonCollection: [],
    questionStartTime: null,
    timerInterval: null,
    pointsToNextReward: 100,
    pointsToNextEvolution: 300
};

// ============================================
// DIFFICULTY MULTIPLIERS
// ============================================
const difficultyMultipliers = {
    1: 10, 2: 10, 10: 10,      // Easy
    3: 15, 4: 15, 5: 15,       // Easy-Medium
    6: 20, 11: 20,             // Medium
    7: 30, 8: 30, 9: 30,       // Hard
    12: 25                      // Medium-Hard
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    // Screens
    configScreen: document.getElementById('config-screen'),
    gameScreen: document.getElementById('game-screen'),
    pokedexScreen: document.getElementById('pokedex-screen'),

    // Config screen
    startGameBtn: document.getElementById('start-game-btn'),
    errorMessage: document.getElementById('error-message'),

    // Game screen
    question: document.getElementById('question'),
    answerInput: document.getElementById('answer-input'),
    submitAnswerBtn: document.getElementById('submit-answer-btn'),
    feedback: document.getElementById('feedback'),
    timer: document.getElementById('timer'),
    speedBonus: document.getElementById('speed-bonus'),
    totalScore: document.getElementById('total-score'),
    streak: document.getElementById('streak'),
    correctCount: document.getElementById('correct-count'),
    pokemonCount: document.getElementById('pokemon-count'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    viewPokedexBtn: document.getElementById('view-pokedex-btn'),

    // Pokédex screen
    backToGameBtn: document.getElementById('back-to-game-btn'),
    pokemonGrid: document.getElementById('pokemon-grid'),
    pokedexTotal: document.getElementById('pokedex-total'),
    pokedexScore: document.getElementById('pokedex-score'),

    // Modal
    catchModal: document.getElementById('catch-modal'),
    caughtPokemon: document.getElementById('caught-pokemon'),
    closeModalBtn: document.getElementById('close-modal-btn')
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    loadProgress();
    attachEventListeners();
    updateUI();
}

// ============================================
// EVENT LISTENERS
// ============================================
function attachEventListeners() {
    // Config screen
    elements.startGameBtn.addEventListener('click', startGame);

    // Game screen
    elements.submitAnswerBtn.addEventListener('click', submitAnswer);
    elements.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitAnswer();
    });
    elements.viewPokedexBtn.addEventListener('click', () => switchScreen('pokedex'));

    // Pokédex screen
    elements.backToGameBtn.addEventListener('click', () => switchScreen('game'));

    // Modal
    elements.closeModalBtn.addEventListener('click', closeModal);
}

// ============================================
// SCREEN MANAGEMENT
// ============================================
function switchScreen(screen) {
    // Remove active class from all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Add active class to target screen
    switch (screen) {
        case 'config':
            elements.configScreen.classList.add('active');
            state.currentScreen = 'config';
            break;
        case 'game':
            elements.gameScreen.classList.add('active');
            state.currentScreen = 'game';
            updateUI();
            break;
        case 'pokedex':
            elements.pokedexScreen.classList.add('active');
            state.currentScreen = 'pokedex';
            renderPokedex();
            break;
    }
}

// ============================================
// GAME LOGIC
// ============================================
function startGame() {
    // Get selected tables
    const checkboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked');
    state.selectedTables = Array.from(checkboxes).map(cb => parseInt(cb.value));

    // Validate selection
    if (state.selectedTables.length === 0) {
        elements.errorMessage.textContent = '⚠️ Por favor, selecciona al menos una tabla';
        return;
    }

    elements.errorMessage.textContent = '';

    // Save preference
    saveProgress();

    // Switch to game screen and generate first question
    switchScreen('game');
    generateQuestion();
}

function generateQuestion() {
    // Clear previous feedback
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
    elements.answerInput.className = 'answer-input';
    elements.answerInput.value = '';
    elements.answerInput.focus();
    elements.speedBonus.classList.remove('show');

    // Select random table from selected tables
    const table = state.selectedTables[Math.floor(Math.random() * state.selectedTables.length)];
    const multiplier = Math.floor(Math.random() * 11); // 0-10

    state.currentQuestion = {
        table: table,
        multiplier: multiplier,
        answer: table * multiplier
    };

    elements.question.textContent = `¿Cuánto es ${table} × ${multiplier}?`;

    // Start timer
    state.questionStartTime = Date.now();
    startTimer();
}

function startTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }

    state.timerInterval = setInterval(() => {
        const elapsed = (Date.now() - state.questionStartTime) / 1000;
        elements.timer.textContent = `${elapsed.toFixed(1)}s`;
    }, 100);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function submitAnswer() {
    const userAnswer = parseInt(elements.answerInput.value);

    if (isNaN(userAnswer)) {
        elements.feedback.textContent = '⚠️ Por favor, introduce un número';
        elements.feedback.className = 'feedback incorrect';
        return;
    }

    stopTimer();
    const timeElapsed = (Date.now() - state.questionStartTime) / 1000;
    const isCorrect = userAnswer === state.currentQuestion.answer;

    if (isCorrect) {
        handleCorrectAnswer(timeElapsed);
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer(timeElapsed) {
    // Visual feedback
    elements.feedback.textContent = '✓ ¡Correcto! 🎉';
    elements.feedback.className = 'feedback correct';
    elements.answerInput.className = 'answer-input correct';

    // Calculate points
    const basePoints = difficultyMultipliers[state.currentQuestion.table];
    const speedMultiplier = timeElapsed < 5 ? 2 : 1;
    const points = basePoints * speedMultiplier;

    // Show speed bonus
    if (speedMultiplier > 1) {
        elements.speedBonus.classList.add('show');
        setTimeout(() => elements.speedBonus.classList.remove('show'), 2000);
    }

    // Update state
    state.totalScore += points;
    state.streak++;
    state.correctCount++;

    // Check for Pokémon rewards
    checkPokemonRewards(points);

    // Update UI
    updateUI();
    saveProgress();

    // Generate next question after delay
    setTimeout(() => {
        generateQuestion();
    }, 2000);
}

function handleIncorrectAnswer() {
    // Visual feedback
    elements.feedback.textContent = `✗ Incorrecto. La respuesta es ${state.currentQuestion.answer}`;
    elements.feedback.className = 'feedback incorrect';
    elements.answerInput.className = 'answer-input incorrect';

    // Reset streak
    state.streak = 0;

    // Update UI
    updateUI();

    // Generate next question after delay
    setTimeout(() => {
        generateQuestion();
    }, 3000);
}

// ============================================
// POKÉMON INTEGRATION
// ============================================
async function checkPokemonRewards(pointsEarned) {
    const previousScore = state.totalScore - pointsEarned;

    // Check for catch (every 100 points)
    const previousCatchMilestone = Math.floor(previousScore / 100);
    const currentCatchMilestone = Math.floor(state.totalScore / 100);

    if (currentCatchMilestone > previousCatchMilestone) {
        await catchRandomPokemon();
    }

    // Check for evolution (every 300 points)
    const previousEvolutionMilestone = Math.floor(previousScore / 300);
    const currentEvolutionMilestone = Math.floor(state.totalScore / 300);

    if (currentEvolutionMilestone > previousEvolutionMilestone) {
        await evolvePokemon();
    }
}

async function catchRandomPokemon() {
    try {
        // Generate random Pokémon ID from Gen 1-3 (1-386)
        let pokemonId;
        let attempts = 0;
        const maxAttempts = 20;

        // Try to avoid duplicates
        do {
            pokemonId = Math.floor(Math.random() * 386) + 1;
            attempts++;
        } while (
            state.pokemonCollection.some(p => p.id === pokemonId) &&
            attempts < maxAttempts
        );

        const pokemon = await fetchPokemon(pokemonId);

        // Add to collection
        state.pokemonCollection.push({
            id: pokemon.id,
            name: pokemon.name,
            sprite: pokemon.sprites.other['official-artwork'].front_default,
            caughtDate: new Date().toLocaleDateString('es-ES')
        });

        saveProgress();
        showCatchModal(pokemon);

    } catch (error) {
        console.error('Error catching Pokémon:', error);
    }
}

async function evolvePokemon() {
    if (state.pokemonCollection.length === 0) return;

    try {
        // Find a Pokémon that can evolve
        let evolved = false;
        const shuffledCollection = [...state.pokemonCollection].sort(() => Math.random() - 0.5);

        for (const pokemon of shuffledCollection) {
            const species = await fetchPokemonSpecies(pokemon.id);
            const evolutionChain = await fetchEvolutionChain(species.evolution_chain.url);

            // Check if this Pokémon can evolve
            const evolution = findNextEvolution(evolutionChain.chain, pokemon.name);

            if (evolution) {
                const evolvedPokemon = await fetchPokemonByName(evolution);

                // Replace in collection
                const index = state.pokemonCollection.findIndex(p => p.id === pokemon.id);
                state.pokemonCollection[index] = {
                    id: evolvedPokemon.id,
                    name: evolvedPokemon.name,
                    sprite: evolvedPokemon.sprites.other['official-artwork'].front_default,
                    caughtDate: pokemon.caughtDate
                };

                saveProgress();
                showCatchModal(evolvedPokemon, true);
                evolved = true;
                break;
            }
        }

        // If no Pokémon could evolve, catch a new one instead
        if (!evolved) {
            await catchRandomPokemon();
        }

    } catch (error) {
        console.error('Error evolving Pokémon:', error);
        // Fallback: catch a new Pokémon
        await catchRandomPokemon();
    }
}

function findNextEvolution(chain, currentName) {
    if (chain.species.name === currentName && chain.evolves_to.length > 0) {
        return chain.evolves_to[0].species.name;
    }

    for (const evolution of chain.evolves_to) {
        const result = findNextEvolution(evolution, currentName);
        if (result) return result;
    }

    return null;
}

// ============================================
// POKÉAPI INTEGRATION
// ============================================
async function fetchPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) throw new Error('Failed to fetch Pokémon');
    return await response.json();
}

async function fetchPokemonByName(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) throw new Error('Failed to fetch Pokémon');
    return await response.json();
}

async function fetchPokemonSpecies(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    if (!response.ok) throw new Error('Failed to fetch Pokémon species');
    return await response.json();
}

async function fetchEvolutionChain(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch evolution chain');
    return await response.json();
}

// ============================================
// MODAL MANAGEMENT
// ============================================
function showCatchModal(pokemon, isEvolution = false) {
    const title = isEvolution ? '🌟 ¡Evolución!' : '🎉 ¡Felicidades!';
    const subtitle = isEvolution
        ? '¡Tu Pokémon ha evolucionado!'
        : '¡Has capturado un nuevo Pokémon!';

    elements.catchModal.querySelector('.modal-title').textContent = title;
    elements.catchModal.querySelector('.modal-subtitle').textContent = subtitle;

    elements.caughtPokemon.innerHTML = `
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
        <div class="caught-pokemon-name">${pokemon.name}</div>
    `;

    elements.catchModal.classList.add('active');
}

function closeModal() {
    elements.catchModal.classList.remove('active');
}

// ============================================
// UI UPDATES
// ============================================
function updateUI() {
    // Update scores and stats
    elements.totalScore.textContent = state.totalScore;
    elements.streak.textContent = state.streak;
    elements.correctCount.textContent = state.correctCount;
    elements.pokemonCount.textContent = state.pokemonCollection.length;

    // Update progress bar
    const pointsInCurrentCycle = state.totalScore % 100;
    const progressPercentage = (pointsInCurrentCycle / 100) * 100;
    elements.progressFill.style.width = `${progressPercentage}%`;
    elements.progressText.textContent = `${pointsInCurrentCycle} / 100`;

    // Update Pokédex stats
    elements.pokedexTotal.textContent = state.pokemonCollection.length;
    elements.pokedexScore.textContent = state.totalScore;
}

function renderPokedex() {
    if (state.pokemonCollection.length === 0) {
        elements.pokemonGrid.innerHTML = `
            <div class="empty-pokedex">
                <p>🎯 ¡Aún no has capturado ningún Pokémon!</p>
                <p>Responde preguntas correctamente para empezar tu colección.</p>
            </div>
        `;
        return;
    }

    // Sort by ID
    const sortedPokemon = [...state.pokemonCollection].sort((a, b) => a.id - b.id);

    elements.pokemonGrid.innerHTML = sortedPokemon.map(pokemon => `
        <div class="pokemon-card">
            <img src="${pokemon.sprite}" alt="${pokemon.name}" class="pokemon-image">
            <div class="pokemon-name">${pokemon.name}</div>
            <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
            <div class="pokemon-date">Capturado: ${pokemon.caughtDate}</div>
        </div>
    `).join('');
}

// ============================================
// PERSISTENCE (localStorage)
// ============================================
function saveProgress() {
    const saveData = {
        totalScore: state.totalScore,
        correctCount: state.correctCount,
        pokemonCollection: state.pokemonCollection,
        selectedTables: state.selectedTables
    };

    localStorage.setItem('multiplicationGameProgress', JSON.stringify(saveData));
}

function loadProgress() {
    const savedData = localStorage.getItem('multiplicationGameProgress');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            state.totalScore = data.totalScore || 0;
            state.correctCount = data.correctCount || 0;
            state.pokemonCollection = data.pokemonCollection || [];

            // Restore selected tables checkboxes
            if (data.selectedTables && data.selectedTables.length > 0) {
                data.selectedTables.forEach(tableNum => {
                    const checkbox = document.getElementById(`table-${tableNum}`);
                    if (checkbox) checkbox.checked = true;
                });
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }
}

// ============================================
// START APPLICATION
// ============================================
init();
