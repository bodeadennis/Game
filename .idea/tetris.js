const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

//Sunete
myAudio = new Audio('song.mp3');
myAudio.loop = true;
myAudio.play();
cade = new Audio('cade.wav');
reset = new Audio('reset.wav');
scor = new Audio('scor.wav');

//Mareste tot de 20 de ori
context.scale(20, 20);
//Cand se formeaza linie orizontala sa dispara
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {

                continue outer;

            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
        scor.play();
    }
}


function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
//Functie care creeaza piese
function createPiece(type) {
    if (type === 'T') {
        return [
            [0,0,0],
            [1,1,1],
            [0,1,0],
        ];
    }else if (type === 'O') {
        return [
            [2,2],
            [2,2],
        ];
    }else if (type === 'L') {
        return [
            [0,3,0],
            [0,3,0],
            [0,3,3],
        ];
    }else if (type === 'J') {
        return[
            [0,4,0],
            [0,4,0],
            [4,4,0],
        ];
    }else if (type === 'I') {
        return[
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
        ];
    }else if (type === 'Z') {
        return[
            [6,6,0],
            [0,6,6],
            [0,0,0],
        ];
    }else if (type === 'S') {
        return[
            [0,7,7],
            [7,7,0],
            [0,0,0],
        ];
    }
}
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
        if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x,
            y + offset.y,
            1, 1);
    }
});
});
}
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

//Cand piesa ajunge jos sau atinge alta sa se opreasca
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
        if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
    }
});
});
}
//transpunere + inversare = rotatie
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}
//Functie pentru caredea piesei cand apasi sageata de jos
//Apoi dupa ce piesa cade jos, o ia de la inceput alta piesa aleasa random
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
        cade.play();
    }
    dropCounter = 0;
}





function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}
//Functie care alege piesele random
function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
//Daca piesa atinge tavanul arenei sterge tot din arena
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
        reset.play();
    }
}
//Piesa evita coliziunea de la marginile ecranului
//(va zbura spre interiorul ecranului la rotatie)
function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
//Forma o sa cada la fiecare o secunda
let dropCounter = 0;
let dropInterval = 500;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}
//Sa se miste stanga daca apasam segeata de stanga
//else daca apasam dreapta sa se miste la dreapta
//Sa se intoarca piesa la stanga sau la dreapta
document.addEventListener('keydown', event => {
    if (event.keyCode === 37 || event.keyCode === 65 ) {
    playerMove(-1);
} else if (event.keyCode === 39 || event.keyCode === 68 ) {
    playerMove(1);
} else if (event.keyCode === 40 || event.keyCode === 83 ) {
    playerDrop();
} else if (event.keyCode === 32) {
    playerRotate(1)
}
});
//Culorile Pieselor 
const colors = [
    null,
    '#17a500',
    '#0038ca',
    '#ba0002',
    '#d06d00',
    '#b8c03c',
    '#a90096',
    '#00c2bc',
];


const arena = createMatrix(12, 20);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

playerReset();
updateScore();
update();