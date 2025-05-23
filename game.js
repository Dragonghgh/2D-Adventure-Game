// Game constants
const TILE_SIZE = 32;
const PLAYER_SPEED = 5;
const GRAVITY = 0.5;
const JUMP_FORCE = 12;

// Game state
const gameState = {
    player: {
        x: 100,
        y: 100,
        width: 32,
        height: 48,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        health: 100,
        score: 0,
        inventory: [],
        facing: 'right'
    },
    keys: {},
    map: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    items: [
        { x: 300, y: 400, width: 16, height: 16, type: 'coin', value: 10 },
        { x: 500, y: 400, width: 16, height: 16, type: 'coin', value: 10 },
        { x: 700, y: 300, width: 32, height: 32, type: 'chest', contents: 'sword' }
    ],
    enemies: [
        { x: 600, y: 400, width: 32, height: 32, health: 30, damage: 10 }
    ]
};

// Initialize game
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const healthDisplay = document.getElementById('health');
const scoreDisplay = document.getElementById('score');
const inventoryDisplay = document.getElementById('inventory');

// Event listeners
window.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    const { player, keys } = gameState;
    
    // Horizontal movement
    player.velocityX = 0;
    if (keys['ArrowLeft'] || keys['a']) {
        player.velocityX = -PLAYER_SPEED;
        player.facing = 'left';
    }
    if (keys['ArrowRight'] || keys['d']) {
        player.velocityX = PLAYER_SPEED;
        player.facing = 'right';
    }
    
    // Jumping
    if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && !player.isJumping) {
        player.velocityY = -JUMP_FORCE;
        player.isJumping = true;
    }
    
    // Apply gravity
    player.velocityY += GRAVITY;
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Collision detection with ground (simple for demo)
    const groundLevel = canvas.height - (2 * TILE_SIZE);
    if (player.y + player.height > groundLevel) {
        player.y = groundLevel - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
    
    // Collision with items
    gameState.items = gameState.items.filter(item => {
        if (isColliding(player, item)) {
            if (item.type === 'coin') {
                player.score += item.value;
                scoreDisplay.textContent = `Score: ${player.score}`;
                return false;
            } else if (item.type === 'chest') {
                player.inventory.push(item.contents);
                inventoryDisplay.textContent = `Inventory: ${player.inventory.join(', ')}`;
                return false;
            }
        }
        return true;
    });
    
    // Collision with enemies (simple for demo)
    gameState.enemies.forEach(enemy => {
        if (isColliding(player, enemy)) {
            player.health -= enemy.damage;
            healthDisplay.textContent = `Health: ${player.health}%`;
        }
    });
    
    // Game over check
    if (player.health <= 0) {
        alert('Game Over!');
        resetGame();
    }
}

// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw map
    ctx.fillStyle = '#8B4513'; // Brown
    for (let y = 0; y < gameState.map.length; y++) {
        for (let x = 0; x < gameState.map[y].length; x++) {
            if (gameState.map[y][x] === 1) {
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    
    // Draw items
    ctx.fillStyle = '#FFD700'; // Gold
    gameState.items.forEach(item => {
        if (item.type === 'coin') {
            ctx.beginPath();
            ctx.arc(item.x + item.width/2, item.y + item.height/2, item.width/2, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.type === 'chest') {
            ctx.fillStyle = '#CD853F'; // Peru
            ctx.fillRect(item.x, item.y, item.width, item.height);
        }
    });
    
    // Draw enemies
    ctx.fillStyle = '#FF0000'; // Red
    gameState.enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
    
    // Draw player
    ctx.fillStyle = '#0000FF'; // Blue
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw player facing indicator
    ctx.fillStyle = '#FFFFFF';
    if (player.facing === 'right') {
        ctx.fillRect(player.x + player.width - 5, player.y + 10, 5, 5);
    } else {
        ctx.fillRect(player.x, player.y + 10, 5, 5);
    }
}

// Helper function for collision detection
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Reset game
function resetGame() {
    gameState.player = {
        x: 100,
        y: 100,
        width: 32,
        height: 48,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        health: 100,
        score: 0,
        inventory: [],
        facing: 'right'
    };
    
    gameState.items = [
        { x: 300, y: 400, width: 16, height: 16, type: 'coin', value: 10 },
        { x: 500, y: 400, width: 16, height: 16, type: 'coin', value: 10 },
        { x: 700, y: 300, width: 32, height: 32, type: 'chest', contents: 'sword' }
    ];
    
    gameState.enemies = [
        { x: 600, y: 400, width: 32, height: 32, health: 30, damage: 10 }
    ];
    
    healthDisplay.textContent = `Health: 100%`;
    scoreDisplay.textContent = `Score: 0`;
    inventoryDisplay.textContent = `Inventory: None`;
}

// Start game
resetGame();
gameLoop();
