document.addEventListener('DOMContentLoaded', () => {
    // --- Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Simple Game Logic ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('startButton');

    let score = 0;
    let gameLoopInterval = null;
    let isGameOver = false;

    const playerWidth = 50;
    const playerHeight = 45;
    let playerX = canvas.width / 2 - playerWidth / 2;
    const playerY = canvas.height - playerHeight - 10;
    const playerSpeed = 8;

    let treats = [];
    let debris = [];
    // Use treatSize primarily for width now, height will be proportional in drawBone
    const treatSize = 25; // Increased size slightly for better visibility
    const debrisSize = 25;
    const treatSpeed = 2.5; // Slightly faster treats
    const debrisSpeed = 3;
    const spawnRate = 950; // Spawn slightly more often
    let lastSpawnTime = 0;

    let leftPressed = false;
    let rightPressed = false;

    // --- Player Drawing (Cuter Dog Head) ---
    function drawPlayer() {
        const headX = playerX + playerWidth / 2;
        const headY = playerY + playerHeight / 2;
        const headRadius = playerWidth / 2.5;

        // Orelhas
        ctx.fillStyle = '#2b201a';
        ctx.beginPath();
        ctx.ellipse(headX - headRadius * 0.8, headY - headRadius * 0.5, headRadius * 0.5, headRadius * 0.7, Math.PI * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(headX + headRadius * 0.8, headY - headRadius * 0.5, headRadius * 0.5, headRadius * 0.7, -Math.PI * 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça Principal
        ctx.fillStyle = '#2b201a';
        ctx.beginPath();
        ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
        ctx.fill();

         // Focinho
         ctx.fillStyle = '#ffffff';
         ctx.beginPath();
         ctx.ellipse(headX, headY + headRadius * 0.5, headRadius * 0.9, headRadius * 0.6, 0, 0, Math.PI);
         ctx.lineTo(headX - headRadius * 0.5, headY - headRadius * 0.3);
         ctx.arc(headX, headY - headRadius*0.3, headRadius*0.5, Math.PI, Math.PI*2);
         ctx.lineTo(headX + headRadius * 0.9, headY + headRadius * 0.5);
         ctx.closePath();
         ctx.fill();

         // Detalhes Marrons (Sobrancelhas)
         ctx.fillStyle = '#8D5524';
         const browRadius = headRadius * 0.15;
         ctx.beginPath();
         ctx.arc(headX - headRadius * 0.4, headY - headRadius * 0.6, browRadius, 0, Math.PI * 2);
         ctx.fill();
         ctx.beginPath();
         ctx.arc(headX + headRadius * 0.4, headY - headRadius * 0.6, browRadius, 0, Math.PI * 2);
         ctx.fill();

        // Nariz
        ctx.fillStyle = '#1a110a';
        ctx.beginPath();
        const noseY = headY + headRadius * 0.3;
        const noseW = headRadius * 0.3;
        const noseH = headRadius * 0.25;
        ctx.moveTo(headX - noseW/2, noseY);
        ctx.lineTo(headX + noseW/2, noseY);
        ctx.lineTo(headX, noseY + noseH);
        ctx.closePath();
        ctx.fill();

        // Boca (Slightly curved smile)
        ctx.strokeStyle = '#1a110a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const mouthY = noseY + noseH * 1.3;
        const mouthW = noseW * 0.9;
        ctx.moveTo(headX - mouthW, mouthY);
        // Quadratic curve for a smile: control point is below the center
        ctx.quadraticCurveTo(headX, mouthY + noseH * 0.5, headX + mouthW, mouthY);
        ctx.stroke();

        // Olhos (Larger and with highlights)
        const eyeRadius = headRadius * 0.18; // Made eyes bigger
        const eyeY = headY - headRadius * 0.2;
        const eyeXOffset = headRadius * 0.4;
        // Left Eye
        ctx.fillStyle = '#1a110a';
        ctx.beginPath();
        ctx.arc(headX - eyeXOffset, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        // Right Eye
        ctx.beginPath();
        ctx.arc(headX + eyeXOffset, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eye Highlights (small white dots)
        const highlightRadius = eyeRadius * 0.25;
        const highlightXOffset = eyeRadius * 0.3;
        const highlightYOffset = eyeRadius * 0.3;
         ctx.fillStyle = '#ffffff';
         // Left eye highlight
         ctx.beginPath();
         ctx.arc(headX - eyeXOffset + highlightXOffset, eyeY - highlightYOffset, highlightRadius, 0, Math.PI * 2);
         ctx.fill();
          // Right eye highlight
         ctx.beginPath();
         ctx.arc(headX + eyeXOffset + highlightXOffset, eyeY - highlightYOffset, highlightRadius, 0, Math.PI * 2);
         ctx.fill();
    }


    // --- Treat Drawing (Bone Shape) ---
    function drawBone(x, y, width, height) {
        const boneEndRadius = height / 2; // Radius of the bone ends
        const boneMidWidth = width - (boneEndRadius * 2); // Width of the middle section
        const boneMidHeight = height * 0.6; // Height of the middle section (thinner)
        const boneMidY = y + (height - boneMidHeight) / 2; // Y position of the middle rectangle

        ctx.fillStyle = '#f3eade'; // Bone color
        ctx.strokeStyle = '#d1c1a1'; // Bone outline color
        ctx.lineWidth = 1;

        ctx.beginPath();

        // Draw left end (two arcs)
        ctx.arc(x + boneEndRadius, y + boneEndRadius, boneEndRadius, Math.PI * 0.5, Math.PI * 1.5); // Left half-circle
        ctx.arc(x + boneEndRadius, y + boneEndRadius, boneEndRadius * 0.7, Math.PI * 1.5, Math.PI * 0.5); // Inner curve (optional) - creating the notch

        // Connect to right end
        ctx.lineTo(x + boneEndRadius + boneMidWidth, y); // Top line (approx) - adjusted below
        ctx.lineTo(x + boneEndRadius + boneMidWidth, y + boneEndRadius); // Connect point

        // Draw right end (two arcs)
         ctx.arc(x + width - boneEndRadius, y + boneEndRadius, boneEndRadius, Math.PI * 1.5, Math.PI * 0.5); // Right half-circle
         ctx.arc(x + width - boneEndRadius, y + boneEndRadius, boneEndRadius * 0.7, Math.PI * 0.5, Math.PI * 1.5); // Inner curve

        // Connect back to left end
        ctx.lineTo(x + boneEndRadius, y + height); // Bottom line (approx) - adjusted below
        ctx.lineTo(x + boneEndRadius, y + boneEndRadius); // Connect point

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        /* Alternative Simpler Bone: Rectangle + 2 Circles
        ctx.fillRect(x + boneEndRadius, boneMidY, boneMidWidth, boneMidHeight); // Middle rect
        ctx.beginPath();
        ctx.arc(x + boneEndRadius, y + height / 2, boneEndRadius, 0, Math.PI * 2); // Left circle
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + width - boneEndRadius, y + height / 2, boneEndRadius, 0, Math.PI * 2); // Right circle
        ctx.fill();
        ctx.stroke();
        */
    }

    function drawTreats() {
        treats.forEach(treat => {
            // Calculate bone height based on width (e.g., height is half the width)
            const boneHeight = treatSize * 0.5;
            drawBone(treat.x, treat.y, treatSize, boneHeight); // Draw a bone
        });
    }


    // --- Debris Drawing (Unchanged) ---
    function drawDebris() {
        ctx.fillStyle = '#f87171';
        debris.forEach(item => {
            ctx.beginPath();
            ctx.moveTo(item.x + debrisSize * 0.1, item.y);
            ctx.lineTo(item.x + debrisSize * 0.9, item.y + debrisSize * 0.2);
            ctx.lineTo(item.x + debrisSize * 0.7, item.y + debrisSize * 0.9);
            ctx.lineTo(item.x + debrisSize * 0.3, item.y + debrisSize * 0.8);
            ctx.lineTo(item.x, item.y + debrisSize * 0.3);
            ctx.closePath(); ctx.fill();
        });
    }

    // --- Movement & Spawning (Unchanged, except maybe speed/rate tweaks) ---
    function moveItems() {
        treats = treats.map(treat => ({ ...treat, y: treat.y + treatSpeed })).filter(treat => treat.y < canvas.height);
        debris = debris.map(item => ({ ...item, y: item.y + debrisSpeed })).filter(item => item.y < canvas.height);

        const now = Date.now();
        if (now - lastSpawnTime > spawnRate) {
            lastSpawnTime = now;
            const spawnX = Math.random() * (canvas.width - Math.max(treatSize, debrisSize));
            if (Math.random() < 0.7) {
                treats.push({ x: spawnX, y: -treatSize * 0.5 }); // Start bone off-screen based on its height
            } else {
                debris.push({ x: spawnX, y: -debrisSize });
            }
        }
    }

    // --- Collision Detection (Adjusting for bone height potentially) ---
    function checkCollisions() {
        const boneHeight = treatSize * 0.5; // Need height for accurate collision check
        // Jogador vs Guloseimas (Bones)
        treats.forEach((treat, index) => {
             // Check rectangle overlap
            if (
                playerX < treat.x + treatSize &&          // Player right edge > Bone left edge
                playerX + playerWidth > treat.x &&        // Player left edge < Bone right edge
                playerY < treat.y + boneHeight &&       // Player bottom edge > Bone top edge
                playerY + playerHeight > treat.y          // Player top edge < Bone bottom edge
            ) {
                treats.splice(index, 1);
                score++;
                updateScore();
            }
        });

        // Jogador vs Detritos (Unchanged)
        debris.forEach((item, index) => {
            if (
                playerX < item.x + debrisSize &&
                playerX + playerWidth > item.x &&
                playerY < item.y + debrisSize &&
                playerY + playerHeight > item.y
            ) {
                 gameOver();
            }
        });
    }

     // --- Update Score Display (Unchanged) ---
    function updateScore() {
       if (scoreDisplay) scoreDisplay.textContent = `Pontos: ${score}`;
    }

     // --- Game Over (Unchanged Text) ---
     function gameOver() {
        isGameOver = true;
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FIM DE JOGO!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px Roboto, sans-serif';
        ctx.fillText(`Pontuação Final: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Clique em Começar para Jogar Novamente', canvas.width / 2, canvas.height / 2 + 60);
        if(startButton) startButton.disabled = false;
    }


    // --- Game Loop (Unchanged) ---
    function gameLoop() {
        if (isGameOver) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (leftPressed && playerX > 0) playerX -= playerSpeed;
        if (rightPressed && playerX < canvas.width - playerWidth) playerX += playerSpeed;
        moveItems();
        drawPlayer(); // Draws the cuter dog
        drawTreats(); // Draws bones
        drawDebris();
        checkCollisions();
    }

     // --- Start Game Function (Unchanged) ---
     function startGame() {
        if (gameLoopInterval) return;
        score = 0;
        treats = [];
        debris = [];
        playerX = canvas.width / 2 - playerWidth / 2;
        isGameOver = false;
        updateScore();
        lastSpawnTime = Date.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gameLoopInterval = setInterval(gameLoop, 1000 / 60);
        if(startButton) startButton.disabled = true;
        canvas.focus();
    }

    // --- Event Listeners (Unchanged) ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
        else if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
        else if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
    });
    if (startButton) startButton.addEventListener('click', startGame);

    // Initial Draw Message (Unchanged)
     ctx.fillStyle = '#e5e7eb';
     ctx.font = '20px Orbitron, sans-serif';
     ctx.textAlign = 'center';
     ctx.fillText('Clique em Começar para Jogar!', canvas.width / 2, canvas.height / 2);

}); // End DOMContentLoaded