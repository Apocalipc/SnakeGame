/*
 * script.js
 * O Cérebro do Jogo - Contém toda a lógica, estado e Game Loop.
 * Nomes de variáveis em inglês (padrão de código), comentários em português.
 */

// --- 1. Variáveis de Estado (State Management) ---

// Define o tamanho do nosso tabuleiro (grid de 20x20)
const GRID_SIZE = 20;

// Referência ao elemento DOM do tabuleiro
const gameBoard = document.getElementById('gameBoard');

// Estado inicial da cobra: um array de coordenadas {x, y}
let snake = [
    { x: 10, y: 11 }, // Cabeça da cobra
    { x: 10, y: 12 }  // Corpo
];

// Estado inicial da comida: uma coordenada {x, y}
let food = { x: 5, y: 5 };

// Vetor de direção: {x: 0 (parado em X), y: -1 (movendo para cima)}
let direction = { x: 0, y: -1 }; 

// Armazena a direção que será aplicada no próximo "tick" do jogo
let nextDirection = { x: 0, y: -1 }; 

// ID do loop de jogo para poder pausar/parar (usamos setInterval para ser didático)
let gameLoopId = null; 

// Velocidade inicial do jogo em milissegundos (200ms = 5 "ticks" por segundo)
const GAME_SPEED = 200; 

// Pontuação atual do jogador
let score = 0;

// Flag para saber se o jogo está em andamento
let isGameOver = false;

// Estado que indica se o jogo já está ativo/em andamento
let gameStarted = false;


// --- 2. Funções de Inicialização e Controle ---

/**
 * Inicializa o estado do jogo (só prepara, não inicia o loop).
 */
function initGame() {
    // Resetar estado
    snake = [ { x: 10, y: 11 }, { x: 10, y: 12 } ];
    // A direção inicial deve ser nula/parada
    direction = { x: 0, y: 0 }; 
    nextDirection = { x: 0, y: 0 };
    score = 0;
    isGameOver = false;
    // O jogo ainda não começou
    gameStarted = false; 

    document.getElementById('score').textContent = score;
    document.getElementById('gameOverScreen').classList.remove('active');
    
    placeFood(); 
    
    // O Listener de tecla é adicionado aqui, mas o loop só começa no primeiro movimento
    document.addEventListener('keydown', handleKeyInput);
    
    // Renderiza o estado inicial (cobra parada e comida), mas sem o loop
    renderGame(); 
    
    // Prepara o loop se necessário
    if (gameLoopId) clearInterval(gameLoopId); 
}

/**
 * Inicia o Game Loop. Chamado apenas no primeiro movimento válido.
 */
function startGame(initialDirection) {
    if (gameStarted) return; // Evita iniciar duas vezes
    
    gameStarted = true;
    // Define a direção inicial de acordo com a primeira tecla apertada
    direction = initialDirection; 
    nextDirection = initialDirection;

    // Inicia o Game Loop
    gameLoopId = setInterval(gameLoop, GAME_SPEED);
}

/**
 * Inicia o Game Loop. Chamado apenas no primeiro movimento válido.
 */
function startGame(initialDirection) {
    if (gameStarted) return; // Evita iniciar duas vezes
    
    gameStarted = true;
    // Define a direção inicial de acordo com a primeira tecla apertada
    direction = initialDirection; 
    nextDirection = initialDirection;

    // Inicia o Game Loop
    gameLoopId = setInterval(gameLoop, GAME_SPEED);
}



/**
 * Game Over: exibe a tela, pontuação final e congela o loop.
 */
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoopId);
    document.removeEventListener('keydown', handleKeyInput);

    // Obtém o nome digitado pelo jogador ou usa "Anônimo"
    const playerName = document.getElementById('playerName').value || 'Anônimo';
    
    // Exibe a tela de Fim de Jogo
    document.getElementById('finalScore').textContent = score;
    // Exibe o nome do jogador na tela de Game Over
    document.getElementById('finalPlayerName').textContent = playerName;

    document.getElementById('gameOverScreen').classList.add('active');
    
    // Adiciona o listener para o botão de Reiniciar
    document.getElementById('restartButton').onclick = initGame;
}

// --- 3. O Ciclo do Jogo (Game Loop) ---

/**
 * Função principal que é chamada em cada "tick" (a cada 200ms).
 */
function gameLoop() {
    // Atualiza a direção real com a direção capturada
    direction = nextDirection;
    
    // 1. Lógica do Movimento
    moveSnake(); 
    
    // 2. Lógica de Colisão e Crescimento
    if (checkCollision()) {
        gameOver();
        return; // Sai do loop se houver colisão
    }
    
    // Verifica se comeu a comida
    checkFoodEaten();
    
    // 3. Renderização (Desenha o novo estado no DOM)
    renderGame(); 
}

// --- 4. Lógica de Movimento (State Management) ---

/**
 * Atualiza o array 'snake' para simular o movimento.
 */
function moveSnake() {
    // Cria a nova cabeça com base na direção atual
    const head = snake[0];
    const newHead = { 
        x: head.x + direction.x, 
        y: head.y + direction.y 
    };

    // Adiciona a nova cabeça no início do array
    snake.unshift(newHead);

    // Remove o último segmento (simula o movimento, a menos que tenha comido)
    if (!snake.grow) {
        snake.pop(); 
    } else {
        // Se a flag grow estiver true (comeu), não remove o último segmento, fazendo a cobra crescer
        snake.grow = false; 
    }
}

/**
 * Captura a tecla pressionada e define a próxima direção.
 * Regra Essencial: Impede a inversão imediata de direção.
 */
function handleKeyInput(event) {
    if (isGameOver) return; 

    const key = event.key;
    let newDirection = nextDirection;
    let initialMove = false; // Flag para o primeiro movimento

    switch (key) {
        case 'ArrowUp':
            if (direction.y !== 1) newDirection = { x: 0, y: -1 };
            initialMove = true;
            break;
        case 'ArrowDown':
            if (direction.y !== -1) newDirection = { x: 0, y: 1 };
            initialMove = true;
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) newDirection = { x: -1, y: 0 };
            initialMove = true;
            break;
        case 'ArrowRight':
            if (direction.x !== -1) newDirection = { x: 1, y: 0 };
            initialMove = true;
            break;
    }
    
    // Se esta for a primeira tecla de direção válida, inicia o jogo
    if (!gameStarted && initialMove) {
        startGame(newDirection); 
    }
    
    // Atualiza a direção que será usada no próximo tick (apenas se o jogo já começou)
    if (gameStarted) {
        nextDirection = newDirection;
    }
}

// --- 5. Crescimento e Pontuação ---

/**
 * Verifica se a cabeça colidiu com a comida.
 */
function checkFoodEaten() {
    const head = snake[0];
    
    // Verifica se a coordenada da cabeça é a mesma da comida
    if (head.x === food.x && head.y === food.y) {
        // 1. Incrementa a pontuação
        score += 10;
        document.getElementById('score').textContent = score;
        
        // 2. Sinaliza para o Game Loop que a cobra deve crescer (na função moveSnake)
        snake.grow = true; 
        
        // 3. Coloca a comida em uma nova posição
        placeFood();
    }
}

/**
 * Gera novas coordenadas aleatórias para a comida que não estejam ocupadas pela cobra.
 */
function placeFood() {
    let newFoodPosition;
    do {
        // Gera x e y aleatórios dentro dos limites do grid
        newFoodPosition = {
            x: Math.floor(Math.random() * GRID_SIZE) + 1, // +1 porque as coordenadas vão de 1 a GRID_SIZE
            y: Math.floor(Math.random() * GRID_SIZE) + 1
        };
    } while (isPositionOnSnake(newFoodPosition)); // Repete se a posição for na cobra

    food = newFoodPosition;
}

/**
 * Função auxiliar para verificar se uma posição {x, y} está ocupada pela cobra.
 */
    // O .some() verifica se algum elemento no array 'snake' satisfaz a condição

function isPositionOnSnake(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}


// --- 6. Lógica de Colisão (Game Over) ---

/**
 * Verifica se a cobra colidiu com a parede ou com o próprio corpo.
 * @returns {boolean} true se houver colisão.
 */

// Colisão com a Parede

// Colisão com o Próprio Corpo
// Percorre o corpo (a partir do índice 1) e verifica se a cabeça (índice 0) está na mesma posição

function checkCollision() {
    const head = snake[0];
    
    const hitWall = head.x < 1 || head.x > GRID_SIZE || head.y < 1 || head.y > GRID_SIZE;
    if (hitWall) {
        return true;
    }
    
    const hitSelf = snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    if (hitSelf) {
        return true;
    }

    return false;
}


// --- 7. Renderização (Manipulação do DOM) ---

/**
 * Limpa o tabuleiro e redesenha a cobra e a comida com base nas coordenadas atuais.
 */
    // Limpa completamente o tabuleiro a cada "tick"
    // Desenha a Comida
    // Desenha a Cobra


function renderGame() {
    gameBoard.innerHTML = ''; 

    const foodElement = createGameElement(food.x, food.y, 'food');
    gameBoard.appendChild(foodElement);

    snake.forEach((segment, index) => {
        // Define a classe: 'snake-head' para a primeira, 'snake-segment' para o resto
        const className = index === 0 ? 'snake-head' : 'snake-segment';
        const snakeElement = createGameElement(segment.x, segment.y, className);
        gameBoard.appendChild(snakeElement);
    });
}

/**
 * Função auxiliar para criar e posicionar um novo elemento DIV no tabuleiro.
 */
// O CSS Grid usa a propriedade grid-area (ou grid-row/grid-column) para posicionamento
    // 'y / x' -> linha y, coluna x
function createGameElement(x, y, className) {
    const element = document.createElement('div');
    element.classList.add('game-element', className);

    element.style.gridArea = `${y} / ${x}`; 
    return element;
}


// --- Inicialização Automática ---
// Chamamos a função de inicialização quando o script é carregado
initGame();
