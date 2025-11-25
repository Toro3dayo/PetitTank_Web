import { Input } from './core/input.js';
import { startGameLoop } from './core/gameLoop.js';
import { GameController } from './controller/gameController.js';
import { config } from './core/config.js';
import { TouchControls } from './ui/touchControls.js';
import { GamePopupPresenter } from './ui/gamePopupPresenter.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = config.canvas.width;
canvas.height = config.canvas.height;
const ctx = canvas.getContext('2d');

const input = new Input();
new TouchControls(input);
const controller = new GameController(ctx, input);
new GamePopupPresenter(controller);

startGameLoop(
  (dt) => controller.update(dt),
  () => controller.render()
);
