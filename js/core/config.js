// ゲーム全体の定数を管理
export const config = {
  canvas: {
    width: 960,
    height: 640,
  },
  player: {
    speed: 2.5,
    rotateSpeed: 0.05,
    size: 40,
    maxBullets: 4,
    fireCooldown: 450,
  },
  enemy: {
    speed: 1.5,
    rotateSpeed: 0.03,
    size: 40,
    fireDistance: 360,
    fireCooldown: 1200,
  },
  bullet: {
    speed: 6,
    size: 6,
    bounceLimit: 2,
  },
  wall: {
    color: '#6b6b6b',
  },
  camera: {
    // プレイヤーを中心にフィールドを拡大して描画する倍率
    zoom: 1.3,
  },
};
