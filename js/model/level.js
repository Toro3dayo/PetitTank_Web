// ステージ定義
import { Wall } from './wall.js';

export function createLevel() {
  const walls = [];

  // 外周
  walls.push(new Wall(0, 0, 960, 20));
  walls.push(new Wall(0, 620, 960, 20));
  walls.push(new Wall(0, 0, 20, 640));
  walls.push(new Wall(940, 0, 20, 640));

  // 迷路っぽい壁
  walls.push(new Wall(150, 120, 20, 200));
  walls.push(new Wall(150, 120, 240, 20));
  walls.push(new Wall(370, 120, 20, 200));
  walls.push(new Wall(240, 300, 20, 220));
  walls.push(new Wall(500, 60, 20, 220));
  walls.push(new Wall(500, 280, 220, 20));
  walls.push(new Wall(700, 120, 20, 220));
  walls.push(new Wall(580, 420, 20, 160));
  walls.push(new Wall(360, 440, 180, 20));
  walls.push(new Wall(100, 480, 200, 20));
  walls.push(new Wall(760, 320, 20, 200));
  walls.push(new Wall(640, 520, 160, 20));

  return walls;
}
