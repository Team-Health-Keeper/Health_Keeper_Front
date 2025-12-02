// MediaPipe Pose 랜드마크 인덱스 참조
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // 초 단위
  difficulty: '초급' | '중급' | '고급';
  targetMuscles: string[];
}

export interface ExerciseResult {
  exerciseId: string;
  exerciseName: string;
  averageAccuracy: number;
  duration: number;
  completedAt: Date;
  scores: number[]; // 시간별 정확도 기록
  feedbackHistory: Record<string, number>; // 피드백별 발생 횟수
}

// JSON 포즈 데이터 타입
export interface PoseFrame {
  time: number;
  frameIndex: number;
  landmarks: Landmark[];
}

export interface PoseData {
  fps: number;
  interval: number;
  totalFrames: number;
  analyzedFrames: number;
  validFrames: number;
  duration: number;
  frames: PoseFrame[];
}

// MediaPipe Pose 랜드마크 인덱스 상수
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;
