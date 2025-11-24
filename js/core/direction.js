// 向き・ベクトルの共通ヘルパー（基準は「上向き = 0 ラジアン」）
export const DIRECTION = {
  UP: 0,
  RIGHT: Math.PI / 2,
  DOWN: Math.PI,
  LEFT: (3 * Math.PI) / 2,
};

const TAU = Math.PI * 2;

// 角度を 0..2π に正規化
export function normalizeAngle(angle) {
  return ((angle % TAU) + TAU) % TAU;
}

// 上向きを 0 とし、時計回りに増える角度から正規化した角度を返す
export function angleFromVector(dx, dy) {
  if (dx === 0 && dy === 0) return 0;
  return normalizeAngle(Math.atan2(dx, -dy));
}

// 現在角度から目標角度への最短差分（-π..π）
export function shortestAngleDelta(current, target) {
  let diff = normalizeAngle(target) - normalizeAngle(current);
  if (diff > Math.PI) diff -= TAU;
  if (diff < -Math.PI) diff += TAU;
  return diff;
}

// 角度（上基準）から単位ベクトルを算出
export function getDirectionVector(angle) {
  const rad = normalizeAngle(angle);
  return {
    x: Math.sin(rad),
    y: -Math.cos(rad),
  };
}
