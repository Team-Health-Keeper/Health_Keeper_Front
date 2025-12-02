import type { Exercise } from './types';

export const exercises: Exercise[] = [
  {
    id: 'squat1',
    name: '스쿼트 기본',
    description:
      '하체 근력 강화를 위한 기본 운동입니다. 무릎이 발끝을 넘지 않도록 주의하세요.',
    videoUrl: '/videos/exercises/스쿼트1.mp4',
    thumbnailUrl: '/videos/thumbnails/스쿼트1.png',
    duration: 48,
    difficulty: '초급',
    targetMuscles: ['대퇴사두근', '둔근', '햄스트링'],
  },
  {
    id: 'squat2',
    name: '스쿼트 심화',
    description:
      '기본 스쿼트를 마스터한 후 도전하세요. 더 깊이 앉아 근육을 자극합니다.',
    videoUrl: '/videos/exercises/스쿼트2.mp4',
    thumbnailUrl: '/videos/thumbnails/스쿼트2.png',
    duration: 38,
    difficulty: '중급',
    targetMuscles: ['대퇴사두근', '둔근', '햄스트링'],
  },
  {
    id: 'wide-squat',
    name: '와이드 스쿼트',
    description:
      '발을 넓게 벌리고 수행하는 스쿼트입니다. 내전근과 둔근을 집중 자극합니다.',
    videoUrl: '/videos/exercises/와이드-스쿼트.mp4',
    thumbnailUrl: '/videos/thumbnails/와이드-스쿼트.png',
    duration: 48,
    difficulty: '초급',
    targetMuscles: ['내전근', '둔근', '대퇴사두근'],
  },
  {
    id: 'lunge',
    name: '런지',
    description:
      '하체 균형과 근력을 동시에 기르는 운동입니다. 앞무릎이 90도가 되도록 해주세요.',
    videoUrl: '/videos/exercises/런지.mp4',
    thumbnailUrl: '/videos/thumbnails/런지.png',
    duration: 54,
    difficulty: '초급',
    targetMuscles: ['대퇴사두근', '둔근', '햄스트링'],
  },
  {
    id: 'side-lunge',
    name: '사이드 런지',
    description:
      '옆으로 이동하며 수행하는 런지입니다. 내전근과 둔근을 강화합니다.',
    videoUrl: '/videos/exercises/사이드-런지.mp4',
    thumbnailUrl: '/videos/thumbnails/사이드-런지.png',
    duration: 50,
    difficulty: '중급',
    targetMuscles: ['내전근', '둔근', '대퇴사두근'],
  },
  {
    id: 'jumping-jack',
    name: '팔 벌려 높이 뛰기',
    description: '전신 유산소 운동입니다. 팔과 다리를 동시에 벌렸다 모으세요.',
    videoUrl: '/videos/exercises/팔-벌려-높이-뛰기.mp4',
    thumbnailUrl: '/videos/thumbnails/팔-벌려-높이-뛰기.png',
    duration: 38,
    difficulty: '초급',
    targetMuscles: ['전신', '심폐'],
  },
  {
    id: 'side-leg-raise',
    name: '옆으로 다리 들기',
    description: '옆으로 다리를 들어 올려 둔근과 외전근을 강화하는 운동입니다.',
    videoUrl: '/videos/exercises/옆으로-다리-들기.mp4',
    thumbnailUrl: '/videos/thumbnails/옆으로-다리-들기.png',
    duration: 49,
    difficulty: '초급',
    targetMuscles: ['중둔근', '외전근'],
  },
  {
    id: 'side-bend',
    name: '옆구리 운동',
    description:
      '옆구리 근육을 스트레칭하고 강화하는 운동입니다. 복사근을 자극합니다.',
    videoUrl: '/videos/exercises/옆구리-운동.mp4',
    thumbnailUrl: '/videos/thumbnails/옆구리-운동.png',
    duration: 51,
    difficulty: '초급',
    targetMuscles: ['복사근', '코어'],
  },
  {
    id: 'full-body',
    name: '온몸 운동',
    description:
      '전신을 사용하는 복합 운동입니다. 여러 근육군을 동시에 자극합니다.',
    videoUrl: '/videos/exercises/온몸-운동.mp4',
    thumbnailUrl: '/videos/thumbnails/온몸-운동.png',
    duration: 60,
    difficulty: '중급',
    targetMuscles: ['전신'],
  },
  {
    id: 'rhythm-training',
    name: '리듬 트레이닝',
    description:
      '리듬에 맞춰 움직이는 유산소 운동입니다. 재미있게 운동할 수 있어요!',
    videoUrl: '/videos/exercises/리듬-트레이닝.mp4',
    thumbnailUrl: '/videos/thumbnails/리듬-트레이닝.png',
    duration: 25,
    difficulty: '초급',
    targetMuscles: ['전신', '심폐'],
  },
  {
    id: 'shoulder-press',
    name: '숄더 프레스',
    description:
      '어깨 근육을 강화하는 운동입니다. 팔을 머리 위로 들어올리세요.',
    videoUrl: '/videos/exercises/숄더-프레스.mp4',
    thumbnailUrl: '/videos/thumbnails/숄더-프레스.png',
    duration: 58,
    difficulty: '초급',
    targetMuscles: ['삼각근', '승모근', '삼두근'],
  },
  {
    id: 'side-lateral-raise',
    name: '사이드 레터럴 레이즈',
    description:
      '어깨 측면 근육을 강화하는 운동입니다. 팔을 옆으로 들어올리세요.',
    videoUrl: '/videos/exercises/사이드-레터럴-레이즈.mp4',
    thumbnailUrl: '/videos/thumbnails/사이드_레터럴_레이즈.png',
    duration: 56,
    difficulty: '초급',
    targetMuscles: ['삼각근 측면', '승모근'],
  },
  {
    id: 'one-arm-overhead-squat',
    name: '원암 오버헤드 스쿼트',
    description:
      '한 팔을 머리 위로 올린 상태에서 스쿼트를 수행합니다. 균형과 코어 강화에 좋습니다.',
    videoUrl: '/videos/exercises/원암-오버헤드-스쿼트.mp4',
    thumbnailUrl: '/videos/thumbnails/원암-오버헤드-스쿼트.png',
    duration: 83,
    difficulty: '고급',
    targetMuscles: ['대퇴사두근', '둔근', '코어', '어깨'],
  },
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find((exercise) => exercise.id === id);
};
