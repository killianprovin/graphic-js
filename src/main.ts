import { Camera, createCamera } from './camera.js';
import { Cube, Face } from './cube.js';
import { ChunkManager } from './chunkManager.js';
import { calculateDistance, Chunk } from './world.js';
import { Canvas } from './canvas.js';
import { project, isFaceVisible, isFaceExposed } from './utils.js';

const canvasManager = new Canvas('canvas');
const ctx = canvasManager.ctx;

const camera: Camera = createCamera();
const speed: number = 0.2;
let keys: { [key: string]: boolean } = {};
let isMouseDown: boolean = false;

const chunkSize = 8;
const renderDistance = 64 ;
const chunkManager = new ChunkManager(chunkSize, renderDistance);

function drawFace(face: Face, cube: Cube): void {
  ctx.beginPath();

  const projectedPoints = face
    .map(index => project(cube.points[index], camera, canvasManager.screenWidth, canvasManager.screenHeight))
    .filter((p): p is { x: number; y: number } => p !== null);

  if (projectedPoints.length === face.length) {
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

function drawCube(cube: Cube, chunk: Chunk): void {
  cube.faces.forEach((face) => {
    if (isFaceVisible(face, cube, camera.position)) {
      drawFace(face, cube);
    }
  });
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

  chunks.forEach(chunk => {

    const cubesToRender: { cube: Cube; distanceSquared: number }[] = [];

    chunk.cubes.forEach(cube => {
      const distanceSquared = calculateDistance(cube, camera.position);
      cubesToRender.push({ cube, distanceSquared });
    });

    cubesToRender.sort((a, b) => b.distanceSquared - a.distanceSquared);
    cubesToRender.forEach(({ cube }) => {
      drawCube(cube, chunk);
    });
  });

  chunkManager.removeDistantChunks(camera);
}

function render(): void {
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
