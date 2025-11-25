// 描画担当。カメラ処理と HUD をまとめて管理する。
import { config } from '../core/config.js';

const playerImg = new Image();
playerImg.src = './Player.png';

const enemyImg = new Image();
enemyImg.src = './Enemy1.png';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.zoom = config.camera.zoom;
  }

  clear() {
    this.ctx.fillStyle = '#0c0c0f';
    this.ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);
  }

  beginCamera(focus) {
    const halfViewW = config.canvas.width / (2 * this.zoom);
    const halfViewH = config.canvas.height / (2 * this.zoom);
    const maxX = config.level.width - halfViewW;
    const maxY = config.level.height - halfViewH;
    const centerX = clamp(focus.x, halfViewW, maxX);
    const centerY = clamp(focus.y, halfViewH, maxY);

    this.ctx.save();
    this.ctx.translate(config.canvas.width / 2, config.canvas.height / 2);
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(-centerX, -centerY);

    this.drawFloorGrid(centerX, centerY, halfViewW, halfViewH);
  }

  endCamera() {
    this.ctx.restore();
  }

  drawFloorGrid(centerX, centerY, halfViewW, halfViewH) {
    const ctx = this.ctx;
    const startX = Math.floor((centerX - halfViewW) / 40) * 40;
    const endX = Math.ceil((centerX + halfViewW) / 40) * 40;
    const startY = Math.floor((centerY - halfViewH) / 40) * 40;
    const endY = Math.ceil((centerY + halfViewH) / 40) * 40;

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += 40) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += 40) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();
  }

  drawWalls(walls) {
    this.ctx.fillStyle = '#2f323a';
    this.ctx.strokeStyle = '#575b65';
    walls.forEach((wall) => {
      this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
      this.ctx.strokeRect(wall.x + 1, wall.y + 1, wall.width - 2, wall.height - 2);
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
    this.ctx.fillStyle = bullet.owner === 'player' ? '#f5d76e' : '#ff7b7b';
    this.ctx.beginPath();
    this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawHud(status) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#f5f5f5';
    ctx.font = '18px "Noto Sans JP", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Wave ${status.wave} / 3`, 16, 28);
    ctx.fillText(`敵残数: ${status.remaining}`, 16, 52);
    ctx.fillText(`発射間隔: ${status.cooldown.toFixed(1)}s`, 16, 76);
    ctx.restore();
  }

  drawMessage(lines) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, config.canvas.width, config.canvas.height);
    ctx.fillStyle = '#fefefe';
    ctx.font = '30px "Noto Sans JP", sans-serif';
    ctx.textAlign = 'center';
    lines.forEach((text, index) => {
      ctx.fillText(text, config.canvas.width / 2, config.canvas.height / 2 + index * 36);
    });
    ctx.restore();
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
