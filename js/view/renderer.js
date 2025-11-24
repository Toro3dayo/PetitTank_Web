// 描画担当
import { config } from '../core/config.js';

const playerImg = new Image();
playerImg.src = './Player.png';

const enemyImg = new Image();
enemyImg.src = './Enemy1.png';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear() {
    this.ctx.fillStyle = '#0f0f0f';
    this.ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);
  }

  drawWalls(walls) {
    this.ctx.fillStyle = '#444';
    walls.forEach((wall) => {
      this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
  }

  drawTank(tank) {
    if (!tank.alive) return;
    const ctx = this.ctx;
    const img = tank.isPlayer ? playerImg : enemyImg;
    ctx.save();
    ctx.translate(tank.x, tank.y);
    ctx.rotate(tank.angle);
    ctx.drawImage(img, -tank.size / 2, -tank.size / 2, tank.size, tank.size);
    ctx.restore();
  }

  drawBullet(bullet) {
    if (!bullet.alive) return;
    this.ctx.fillStyle = bullet.owner === 'player' ? '#ffce54' : '#ff6b6b';
    this.ctx.beginPath();
    this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawMessage(text) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);
    ctx.fillStyle = '#fefefe';
    ctx.font = '32px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, config.canvas.width / 2, config.canvas.height / 2);
    ctx.restore();
  }
}
