// Game Constants
const TILE_SIZE = 32;
const PLAYER_SPEED = 180;
const JUMP_FORCE = 420;
const GRAVITY = 1200;
const ATTACK_COOLDOWN = 0.5;

// Game State
const game = {
    canvas: null,
    ctx: null,
    lastTime: 0,
    deltaTime: 0,
    assets: {
        images: {},
        sounds: {}
    },
    state: {
        current: 'menu', // menu, playing, paused, gameover
        player: {
            x: 100,
            y: 100,
            width: 32,
            height: 48,
            velocityX: 0,
            velocityY: 0,
            isJumping: false,
            health: 100,
            maxHealth: 100,
            score: 0,
            inventory: [],
            facing: 'right',
            isAttacking: false,
            attackCooldown: 0,
            invincible: false,
            invincibleTimer: 0
        },
        camera: {
            x: 0,
            y: 0
        },
        keys: {},
        map: generateLevel(),
        items: [
            { id: 1, x: 300, y: 400, width: 16, height: 16, type: 'coin', value: 10 },
            { id: 2, x: 500, y: 400, width: 16, height: 16, type: 'coin', value: 10 },
            { id: 3, x: 700, y: 300, width: 32, height: 32, type: 'chest', contents: 'sword' },
            { id: 4, x: 900, y: 200, width: 32, height: 32, type: 'health', value: 25 }
        ],
        enemies: [
            { id: 1, x: 600, y: 400, width: 32, height: 32, health: 30, damage: 10, speed: 50 },
            { id: 2, x: 850, y: 400, width: 32, height: 32, health: 30, damage: 10, speed: 50 }
        ],
        projectiles: [],
        particles: [],
        messages: []
    }
};

// Initialize Game
function init() {
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    
    // Load assets
    loadAssets();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Asset Loading
function loadAssets() {
    // In a real game, you would load actual images and sounds here
    console.log("Assets would be loaded here in a real game");
    
    // For now we'll use placeholder objects
    game.assets.images.player = { width: 32, height: 48 };
    game.assets.images.tiles = { width: 32, height: 32 };
    game.assets.images.coin = { width: 16, height: 16 };
    game.assets.images.chest = { width: 32, height: 32 };
    game.assets.images.enemy = { width: 32, height: 32 };
}

// Event Listeners
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        game.state.keys[e.key.toLowerCase()] = true;
        
        // Pause game
        if (e.key === 'p' && game.state.current === 'playing') {
            pauseGame();
        }
    });
    
    window.addEventListener('keyup', (e) => {
        game.state.keys[e.key.toLowerCase()] = false;
    });
    
    // Start button
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('resume-button').addEventListener('click', resumeGame);
}

// Game Loop
function gameLoop(timestamp) {
    game.deltaTime = (timestamp - game.lastTime) / 1000;
    game.lastTime = timestamp;
    
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update Game State
function update() {
    if (game.state.current !== 'playing') return;
    
    const { player, keys } = game.state;
    
    // Player movement
    player.velocityX = 0;
    if (keys['arrowleft'] || keys['a']) {
        player.velocityX = -PLAYER_SPEED;
        player.facing = 'left';
    }
    if (keys['arrowright'] || keys['d']) {
        player.velocityX = PLAYER_SPEED;
        player.facing = 'right';
    }
    
    // Jumping
    if ((keys['arrowup'] || keys['w'] || keys[' ']) && !player.isJumping) {
        player.velocityY = -JUMP_FORCE;
        player.isJumping = true;
        // playSound('jump');
    }
    
    // Attacking
    if (keys['f'] && player.attackCooldown <= 0) {
        player.isAttacking = true;
        player.attackCooldown = ATTACK_COOLDOWN;
        // playSound('attack');
    }
    
    // Update attack cooldown
    if (player.attackCooldown > 0) {
        player.attackCooldown -= game.deltaTime;
    } else {
        player.isAttacking = false;
    }
    
    // Update invincibility timer
    if (player.invincible) {
        player.invincibleTimer -= game.deltaTime;
        if (player.invincibleTimer <= 0) {
            player.invincible = false;
        }
    }
    
    // Apply gravity
    player.velocityY += GRAVITY * game.deltaTime;
    
    // Update position with collision detection
    updatePlayerPosition();
    
    // Update enemies
    updateEnemies();
    
    // Update camera
    updateCamera();
    
    // Check for item collisions
    checkItemCollisions();
    
    // Check for enemy collisions
    checkEnemyCollisions();
    
    // Update particles
    updateParticles();
    
    // Update messages
    updateMessages();
    
    // Game over check
    if (player.health <= 0) {
        gameOver();
    }
}

// Render Game
function render() {
    const { ctx, canvas, state } = game;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save context for camera translation
    ctx.save();
    ctx.translate(-state.camera.x, -state.camera.y);
    
    // Draw map
    drawMap();
    
    // Draw items
    drawItems();
    
    // Draw enemies
    drawEnemies();
    
    // Draw player
    drawPlayer();
    
    // Draw particles
    drawParticles();
    
    // Restore context
    ctx.restore();
    
    // Draw UI
    drawUI();
    
    // Draw message box
    drawMessageBox();
}

// Drawing Functions
function drawPlayer() {
    const { ctx } = game;
    const { player } = game.state;
    
    // Draw player (placeholder)
    ctx.fillStyle = player.invincible ? 'rgba(0, 0, 255, 0.5)' : '#0000FF';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw attack effect if attacking
    if (player.isAttacking) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        const attackWidth = 50;
        const attackX = player.facing === 'right' ? player.x + player.width : player.x - attackWidth;
        ctx.fillRect(attackX, player.y, attackWidth, player.height);
    }
}

function drawMap() {
    const { ctx } = game;
    const { map } = game.state;
    
    ctx.fillStyle = '#8B4513';
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 1) {
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawItems() {
    const { ctx } = game;
    const { items } = game.state;
    
    items.forEach(item => {
        if (item.type === 'coin') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(item.x + item.width/2, item.y + item.height/2, item.width/2, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.type === 'chest') {
            ctx.fillStyle = '#CD853F';
            ctx.fillRect(item.x, item.y, item.width, item.height);
        } else if (item.type === 'health') {
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(item.x + item.width/2, item.y);
            ctx.lineTo(item.x + item.width, item.y + item.height);
            ctx.lineTo(item.x, item.y + item.height);
            ctx.closePath();
            ctx.fill();
        }
    });
}

function drawEnemies() {
    const { ctx } = game;
    const { enemies } = game.state;
    
    ctx.fillStyle = '#FF0000';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function drawUI() {
    const { player } = game.state;
    
    // Update UI elements
    document.getElementById('health').textContent = player.health;
    document.getElementById('score').textContent = player.score;
    document.getElementById('inventory').textContent = player.inventory.length > 0 ? 
        player.inventory.join(', ') : 'Empty';
    
    // Health bar color
    const healthElement = document.querySelector('#health');
    if (player.health < 30) {
        healthElement.style.color = '#FF0000';
    } else if (player.health < 60) {
        healthElement.style.color = '#FFA500';
    } else {
        healthElement.style.color = '#00FF00';
    }
}

// Game State Functions
function startGame() {
    game.state.current = 'playing';
    document.getElementById('start-screen').classList.add('hidden');
    resetGame();
}

function pauseGame() {
    game.state.current = 'paused';
    document.getElementById('pause-screen').classList.remove('hidden');
}

function resumeGame() {
    game.state.current = 'playing';
    document.getElementById('pause-screen').classList.add('hidden');
}

function gameOver() {
    game.state.current = 'gameover';
    showMessage("Game Over! Press Start to play again.");
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('start-button').textContent = 'Play Again';
}

function resetGame() {
    game.state.player = {
        x: 100,
        y: 100,
        width: 32,
        height: 48,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        health: 100,
        maxHealth: 100,
        score: 0,
        inventory: [],
        facing: 'right',
        isAttacking: false,
        attackCooldown: 0,
        invincible: false,
        invincibleTimer: 0
    };
    
    game.state.camera = { x: 0, y: 0 };
    game.state.items = [
        { id: 1, x: 300, y: 400, width: 16, height: 16, type: 'coin', value: 10 },
        { id: 2, x: 500, y: 400, width: 16, height: 16, type: 'coin', value: 10 },
        { id: 3, x: 700, y: 300, width: 32, height: 32, type: 'chest', contents: 'sword' },
        { id: 4, x: 900, y: 200, width: 32, height: 32, type: 'health', value: 25 }
    ];
    
    game.state.enemies = [
        { id: 1, x: 600, y: 400, width: 32, height: 32, health: 30, damage: 10, speed: 50 },
        { id: 2, x: 850, y: 400, width: 32, height: 32, health: 30, damage: 10, speed: 50 }
    ];
    
    game.state.projectiles = [];
    game.state.particles = [];
    game.state.messages = [];
}

// Helper Functions
function generateLevel() {
    // Generate a simple level with platforms
    const map = Array(15).fill().map(() => Array(25).fill(0));
    
    // Ground
    for (let x = 0; x < 25; x++) {
        map[13][x] = 1;
        map[14][x] = 1;
    }
    
    // Platforms
    map[9][5] = 1; map[9][6] = 1; map[9][7] = 1;
    map[7][10] = 1; map[7][11] = 1; map[7][12] = 1;
    map[5][15] = 1; map[5][16] = 1; map[5][17] = 1;
    
    return map;
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function showMessage(text, duration = 3) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = text;
    messageBox.style.opacity = 1;
    
    setTimeout(() => {
        messageBox.style.opacity = 0;
    }, duration * 1000);
}

// Initialize the game when the page loads
window.addEventListener('load', init);
