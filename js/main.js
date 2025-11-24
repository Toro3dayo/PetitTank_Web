import { Input } from './core/input.js';
import { startGameLoop } from './core/gameLoop.js';
import { GameController } from './controller/gameController.js';
import { config } from './core/config.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = config.canvas.width;
canvas.height = config.canvas.height;
const ctx = canvas.getContext('2d');

const input = new Input();
const controller = new GameController(ctx, input);

startGameLoop(
  (dt) => controller.update(dt),
  () => controller.render()
);
