import { useEffect, useRef } from 'react';
import type { PoseFrame } from './types';

// 스켈레톤 연결선 정의
const POSE_CONNECTIONS: [number, number][] = [
  // 얼굴
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7], // 왼쪽 눈
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8], // 오른쪽 눈
  [9, 10], // 입
  // 상체
  [11, 12], // 어깨
  [11, 13],
  [13, 15], // 왼팔
  [12, 14],
  [14, 16], // 오른팔
  [11, 23],
  [12, 24], // 몸통
  [23, 24], // 엉덩이
  // 하체
  [23, 25],
  [25, 27],
  [27, 29],
  [29, 31], // 왼다리
  [24, 26],
  [26, 28],
  [28, 30],
  [30, 32], // 오른다리
];

// 주요 관절만 표시 (상체 + 하체)
const KEY_LANDMARKS = [
  11,
  12, // 어깨
  13,
  14, // 팔꿈치
  15,
  16, // 손목
  23,
  24, // 엉덩이
  25,
  26, // 무릎
  27,
  28, // 발목
];

interface VideoSkeletonProps {
  frame: PoseFrame | null;
  width: number;
  height: number;
}

export function VideoSkeleton({ frame, width, height }: VideoSkeletonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !frame?.landmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);

    const landmarks = frame.landmarks;

    // 연결선 그리기
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (const [i, j] of POSE_CONNECTIONS) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];

      if (!p1 || !p2) continue;
      if ((p1.visibility ?? 0) < 0.5 || (p2.visibility ?? 0) < 0.5) continue;

      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }

    // 주요 관절점 그리기
    for (const idx of KEY_LANDMARKS) {
      const lm = landmarks[idx];
      if (!lm || (lm.visibility ?? 0) < 0.5) continue;

      const x = lm.x * width;
      const y = lm.y * height;

      // 외곽선
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff00';
      ctx.fill();

      // 내부 원
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }, [frame, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
