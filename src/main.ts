import { Camera, createCamera } from './camera.js';
import { Cube, Face } from './cube.js';
import { ChunkManager } from './chunkManager.js';
import { calculateDistance, Chunk } from './world.js';
import { Canvas } from './canvas.js';
import { project, isFaceVisible } from './utils.js';
import { BlockType } from './block.js';

const canvasManager = new Canvas('canvas');
const ctx = canvasManager.ctx;

const camera: Camera = createCamera();
const speed: number = 0.3;
let keys: { [key: string]: boolean } = {};
let isMouseDown: boolean = false;

const chunkSize = 8;
const renderDistance = 96;
const chunkManager = new ChunkManager(chunkSize, renderDistance);

function drawFace(face: Face, cube: Cube): void {
  ctx.beginPath();

  const projectedPoints = face.points
    .map(index => project(cube.points[index], camera, canvasManager.screenWidth, canvasManager.screenHeight))
    .filter((p): p is { x: number; y: number } => p !== null);

  if (projectedPoints.length === face.points.length) {
    ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y);
    for (let i = 1; i < projectedPoints.length; i++) {
      ctx.lineTo(projectedPoints[i].x, projectedPoints[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(${cube.color[0]}, ${cube.color[1]}, ${cube.color[2]}, ${cube.color[3]})`;
    ctx.fill();
    ctx.stroke();
  }
}

function handleMouseMove(event: MouseEvent): void {
  if (!isMouseDown) return;

  const sensitivity = 0.002;
  camera.yaw += event.movementX * sensitivity;
  camera.pitch -= event.movementY * sensitivity;

  camera.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.pitch));
}

function handleKeys(): void {
  const forward = {
    x: Math.sin(camera.yaw),
    y: Math.cos(camera.yaw),
    z: 0
  };
  const right = {
    x: Math.cos(camera.yaw),
    y: -Math.sin(camera.yaw),
    z: 0
  };

  if (keys['z']) {
    camera.position.x += forward.x * speed;
    camera.position.y += forward.y * speed;
  }
  if (keys['s']) {
    camera.position.x -= forward.x * speed;
    camera.position.y -= forward.y * speed;
  }
  if (keys['q']) {
    camera.position.x -= right.x * speed;
    camera.position.y -= right.y * speed;
  }
  if (keys['d']) {
    camera.position.x += right.x * speed;
    camera.position.y += right.y * speed;
  }
  if (keys['Shift']) {
    camera.position.z -= speed;
  }
  if (keys[' ']) {
    camera.position.z += speed;
  }
}

// main.ts

function renderWorld(): void {
  const chunks = chunkManager.getChunksAroundCamera(camera, canvasManager);

  const cubesToRender: Map<string, Cube> = new Map();
  const cubesKeys: {cube: Cube, distanceSquared: number }[] = [];
  
  chunks.forEach(chunk => {
    chunk.cubes.forEach(cube => {
      const distanceSquared = calculateDistance(cube, camera.position);
      const positionKey = `${cube.position.x},${cube.position.y},${cube.position.z}`;
      cubesToRender.set(positionKey, cube);
      cubesKeys.push({cube, distanceSquared });
    });
  });  

  cubesKeys.sort((a, b) => b.distanceSquared - a.distanceSquared);

  cubesKeys.forEach(({ cube }) => {
    const { x, y, z } = cube.position;
    const neighbors = {
      sup: cubesToRender.get(`${x},${y},${z+1}`),
      inf: cubesToRender.get(`${x},${y},${z-1}`),
      left: cubesToRender.get(`${x-1},${y},${z}`),
      right: cubesToRender.get(`${x+1},${y},${z}`),
      front: cubesToRender.get(`${x},${y+1},${z}`),
      back: cubesToRender.get(`${x},${y-1},${z}`)
    };

    const faces = [
      { neighbor: neighbors.front, face: cube.faces[0] },
      { neighbor: neighbors.left, face: cube.faces[1] },
      { neighbor: neighbors.back, face: cube.faces[2] },
      { neighbor: neighbors.right, face: cube.faces[3] },
      { neighbor: neighbors.sup, face: cube.faces[4] },
      { neighbor: neighbors.inf, face: cube.faces[5] }
    ];

    faces.forEach(({ neighbor, face }) => {
      if (!face.exposed) return; // Ignore les faces déjà marquées comme non exposées
      
      const isHiddenByNeighbor = neighbor && (neighbor.blockType == cube.blockType || neighbor.color[3] == 1);
    
      if (isHiddenByNeighbor) {
        face.exposed = false; // Marque la face comme non exposée pour cette session
        return; // Saute cette face
      }
    
      if (isFaceVisible(face, cube, camera.position)) {
        drawFace(face, cube);
      }
    });
  });
  

  /*

        if (
        (face.exposed) && (neighbor == undefined || (neighbor.blockType != cube.blockType && neighbor.color[3] < 1)) &&
        isFaceVisible(face, cube, camera.position)
      ) {
        drawFace(face, cube);
      }

  */

  chunkManager.removeDistantChunks(camera);
}

function render(): void {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  canvasManager.clear();
  handleKeys();
  renderWorld();
  requestAnimationFrame(render);
}


// Gestion des événements
window.addEventListener('mousemove', handleMouseMove);
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

canvasManager.canvas.addEventListener('mousedown', () => {
  isMouseDown = true;
});

canvasManager.canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});

canvasManager.canvas.addEventListener('mouseleave', () => {
  isMouseDown = false;
});

// Initialisation
render();
