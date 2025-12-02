import type { Landmark, PoseData, PoseFrame } from './types';
import { POSE_LANDMARKS } from './types';

/**
 * 세 점 사이의 각도 계산
 * @param a 첫 번째 점
 * @param b 중심점 (각도의 꼭짓점)
 * @param c 세 번째 점
 * @returns 각도 (0-180도)
 */
export function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180.0 / Math.PI));
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * 랜드마크 정규화 (상체 높이 기준으로 스케일 조정)
 * 영상 속 인물 크기와 사용자 크기가 달라도 비율로 비교 가능
 */
function normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
  const leftHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
  const rightHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return landmarks;
  }

  // 몸통 중심점 계산
  const centerX =
    (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
  const centerY =
    (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4;

  // 상체 높이로 스케일 계산 (어깨 중심 ~ 엉덩이 중심)
  // 어깨 너비보다 상체 높이가 더 안정적 (영상 속 인물이 작아도 비율 유지)
  const shoulderCenter = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };
  const hipCenter = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2,
  };

  const torsoHeight = Math.sqrt(
    Math.pow(hipCenter.x - shoulderCenter.x, 2) +
      Math.pow(hipCenter.y - shoulderCenter.y, 2)
  );

  if (torsoHeight < 0.01) return landmarks;

  // 정규화된 랜드마크 반환
  return landmarks.map((lm) => ({
    x: (lm.x - centerX) / torsoHeight,
    y: (lm.y - centerY) / torsoHeight,
    z: lm.z / torsoHeight,
    visibility: lm.visibility,
  }));
}

/**
 * 현재 시간에 해당하는 프레임 찾기
 */
export function getFrameAtTime(
  poseData: PoseData,
  currentTime: number
): PoseFrame | null {
  if (!poseData || !poseData.frames || poseData.frames.length === 0) {
    return null;
  }

  // 가장 가까운 프레임 찾기
  let closestFrame = poseData.frames[0];
  let minDiff = Math.abs(currentTime - closestFrame.time);

  for (const frame of poseData.frames) {
    const diff = Math.abs(currentTime - frame.time);
    if (diff < minDiff) {
      minDiff = diff;
      closestFrame = frame;
    }
    // 이미 지나간 프레임이면 중단
    if (frame.time > currentTime + 0.2) break;
  }

  return closestFrame;
}

/**
 * 주요 관절 각도 정의 (비교에 사용할 각도들)
 *
 * [수정 가이드]
 * - tolerance: 허용 오차 각도 (도 단위). 값이 클수록 관대해짐
 *   예: tolerance: 30 → 목표 각도에서 ±30도까지는 높은 점수
 * - 현재 팔 관절: 35도, 다리 관절: 30도 허용
 */
const KEY_ANGLES_CONFIG = [
  // 왼팔
  {
    name: '왼쪽 팔꿈치',
    joints: [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.LEFT_WRIST,
    ],
    tolerance: 35, // [수정] 팔꿈치 허용 오차 (기본값: 35도)
  },
  {
    name: '왼쪽 어깨',
    joints: [
      POSE_LANDMARKS.LEFT_ELBOW,
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_HIP,
    ],
    tolerance: 35, // [수정] 어깨 허용 오차 (기본값: 35도)
  },
  // 오른팔
  {
    name: '오른쪽 팔꿈치',
    joints: [
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.RIGHT_WRIST,
    ],
    tolerance: 35, // [수정] 팔꿈치 허용 오차 (기본값: 35도)
  },
  {
    name: '오른쪽 어깨',
    joints: [
      POSE_LANDMARKS.RIGHT_ELBOW,
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_HIP,
    ],
    tolerance: 35, // [수정] 어깨 허용 오차 (기본값: 35도)
  },
  // 왼다리
  {
    name: '왼쪽 엉덩이',
    joints: [
      POSE_LANDMARKS.LEFT_SHOULDER,
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
    ],
    tolerance: 30, // [수정] 엉덩이 허용 오차 (기본값: 30도)
  },
  {
    name: '왼쪽 무릎',
    joints: [
      POSE_LANDMARKS.LEFT_HIP,
      POSE_LANDMARKS.LEFT_KNEE,
      POSE_LANDMARKS.LEFT_ANKLE,
    ],
    tolerance: 30, // [수정] 무릎 허용 오차 (기본값: 30도)
  },
  // 오른다리
  {
    name: '오른쪽 엉덩이',
    joints: [
      POSE_LANDMARKS.RIGHT_SHOULDER,
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_KNEE,
    ],
    tolerance: 30, // [수정] 엉덩이 허용 오차 (기본값: 30도)
  },
  {
    name: '오른쪽 무릎',
    joints: [
      POSE_LANDMARKS.RIGHT_HIP,
      POSE_LANDMARKS.RIGHT_KNEE,
      POSE_LANDMARKS.RIGHT_ANKLE,
    ],
    tolerance: 30, // [수정] 무릎 허용 오차 (기본값: 30도)
  },
];

/**
 * 두 랜드마크 세트 간의 유사도 계산 (각도 기반 비교)
 * 위치가 아닌 관절 각도를 비교하여 자세의 형태를 비교
 */
export function comparePoses(
  userLandmarks: Landmark[],
  targetLandmarks: Landmark[]
): { accuracy: number; feedback: string[] } {
  if (
    !userLandmarks ||
    userLandmarks.length === 0 ||
    !targetLandmarks ||
    targetLandmarks.length === 0
  ) {
    return { accuracy: 0, feedback: ['자세를 감지할 수 없습니다.'] };
  }

  let totalScore = 0;
  let validCount = 0;
  const feedback: string[] = [];
  const badAngles: string[] = [];

  for (const config of KEY_ANGLES_CONFIG) {
    const [i, j, k] = config.joints;

    // 사용자와 타겟 모두 해당 관절이 있는지 확인
    if (!userLandmarks[i] || !userLandmarks[j] || !userLandmarks[k]) continue;
    if (!targetLandmarks[i] || !targetLandmarks[j] || !targetLandmarks[k])
      continue;

    // 가시성 체크 (사용자 측)
    const userVisibility = Math.min(
      userLandmarks[i].visibility ?? 0,
      userLandmarks[j].visibility ?? 0,
      userLandmarks[k].visibility ?? 0
    );
    if (userVisibility < 0.4) continue;

    // 타겟 가시성 체크
    const targetVisibility = Math.min(
      targetLandmarks[i].visibility ?? 0,
      targetLandmarks[j].visibility ?? 0,
      targetLandmarks[k].visibility ?? 0
    );
    if (targetVisibility < 0.4) continue;

    validCount++;

    // 각도 계산
    const userAngle = calculateAngle(
      userLandmarks[i],
      userLandmarks[j],
      userLandmarks[k]
    );
    const targetAngle = calculateAngle(
      targetLandmarks[i],
      targetLandmarks[j],
      targetLandmarks[k]
    );

    // 각도 차이
    const angleDiff = Math.abs(userAngle - targetAngle);

    // [수정] 점수 계산 공식 - 값을 조정하여 관대함 정도 변경 가능
    // - tolerance 내: 85~100점 (기존 80~100)
    // - tolerance 초과: 감소 속도 1.0 (기존 1.5, 값이 작을수록 관대)
    let score: number;
    if (angleDiff <= config.tolerance) {
      // tolerance 내: 85~100점
      score = 100 - (angleDiff / config.tolerance) * 15; // [수정] 15로 변경 (기본값: 15, 작을수록 관대)
    } else {
      // tolerance 초과: 점점 감소
      score = Math.max(0, 85 - (angleDiff - config.tolerance) * 1.0); // [수정] 85에서 시작, 1.0씩 감소 (작을수록 관대)
    }
    totalScore += score;

    // 피드백용 (많이 틀린 부분 기록)
    if (angleDiff > config.tolerance * 1.5) {
      badAngles.push(config.name);
    }
  }

  const accuracy = validCount > 0 ? Math.round(totalScore / validCount) : 0;

  // 피드백 생성
  if (validCount === 0) {
    feedback.push('전신이 카메라에 보이도록 해주세요.');
  } else if (accuracy >= 85) {
    feedback.push('완벽합니다! 👏');
  } else if (accuracy >= 70) {
    feedback.push('좋아요! 잘 따라하고 있어요.');
  } else if (accuracy >= 55) {
    if (badAngles.length > 0) {
      feedback.push(`${badAngles.slice(0, 2).join(', ')} 자세를 확인해보세요.`);
    } else {
      feedback.push('조금만 더 자세를 맞춰보세요.');
    }
  } else {
    feedback.push('영상 속 자세를 천천히 따라해보세요.');
  }

  return { accuracy, feedback };
}

/**
 * 정확도에 따른 색상 반환
 */
export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return '#22c55e'; // green
  if (accuracy >= 60) return '#eab308'; // yellow
  if (accuracy >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

/**
 * 정확도에 따른 등급 반환
 */
export function getAccuracyGrade(accuracy: number): string {
  if (accuracy >= 90) return 'S';
  if (accuracy >= 80) return 'A';
  if (accuracy >= 70) return 'B';
  if (accuracy >= 60) return 'C';
  if (accuracy >= 50) return 'D';
  return 'F';
}
