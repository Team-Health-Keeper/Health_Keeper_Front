import { useEffect, useRef, useState, useCallback } from 'react';
import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import type { Landmark, PoseFrame } from './types';
import { comparePoses, getAccuracyColor } from './poseAnalyzer';

// MediaPipe Pose 연결선 정의
const POSE_CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

interface PoseDetectorProps {
  targetFrame?: PoseFrame | null; // JSON에서 가져온 현재 프레임
  onAccuracyChange?: (accuracy: number, feedback: string[]) => void;
  onLandmarksDetected?: (landmarks: Landmark[]) => void;
  isActive?: boolean;
}

export function PoseDetector({
  targetFrame,
  onAccuracyChange,
  onLandmarksDetected,
  isActive = true,
}: PoseDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAccuracy, setCurrentAccuracy] = useState(0);
  const targetFrameRef = useRef<PoseFrame | null>(null);

  // targetFrame을 ref로 관리하여 콜백에서 최신값 사용
  useEffect(() => {
    targetFrameRef.current = targetFrame || null;
  }, [targetFrame]);

  const onResults = useCallback(
    (results: Results) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (!canvas || !ctx) return;

      // 캔버스 초기화
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 비디오 프레임 그리기 (좌우 반전)
      ctx.scale(-1, 1);
      ctx.drawImage(
        results.image,
        -canvas.width,
        0,
        canvas.width,
        canvas.height
      );
      ctx.restore();

      if (results.poseLandmarks) {
        const landmarks: Landmark[] = results.poseLandmarks.map((lm) => ({
          x: 1 - lm.x, // 좌우 반전
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility,
        }));

        // 랜드마크 콜백
        onLandmarksDetected?.(landmarks);

        // JSON 프레임과 비교하여 정확도 계산
        let accuracy = 0;
        let feedback: string[] = [];

        if (targetFrameRef.current && targetFrameRef.current.landmarks) {
          const result = comparePoses(
            landmarks,
            targetFrameRef.current.landmarks
          );
          accuracy = result.accuracy;
          feedback = result.feedback;
        } else {
          feedback = ['영상을 시작하면 자세를 비교합니다.'];
        }

        setCurrentAccuracy(accuracy);
        onAccuracyChange?.(accuracy, feedback);

        // 스켈레톤 그리기 (좌우 반전된 좌표 사용)
        const flippedLandmarks = results.poseLandmarks.map((lm) => ({
          ...lm,
          x: 1 - lm.x,
        }));

        const color = getAccuracyColor(accuracy);

        // 연결선 그리기
        drawConnectors(ctx, flippedLandmarks, POSE_CONNECTIONS, {
          color: color,
          lineWidth: 3,
        });

        // 랜드마크 그리기
        drawLandmarks(ctx, flippedLandmarks, {
          color: '#ffffff',
          lineWidth: 1,
          radius: 4,
          fillColor: color,
        });
      }
    },
    [onAccuracyChange, onLandmarksDetected]
  );

  // onResults를 ref로 관리하여 재초기화 방지
  const onResultsRef = useRef(onResults);
  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  useEffect(() => {
    if (!isActive) return;

    // 이미 초기화된 경우 재초기화 방지
    if (poseRef.current && cameraRef.current) return;

    const initializePose = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // MediaPipe Pose 초기화
        const pose = new Pose({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        // ref를 통해 최신 콜백 호출
        pose.onResults((results) => {
          onResultsRef.current(results);
        });
        poseRef.current = pose;

        // 웹캠 초기화
        if (videoRef.current) {
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });

          cameraRef.current = camera;
          await camera.start();
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Pose 초기화 오류:', err);
        setError('카메라를 시작할 수 없습니다. 카메라 권한을 확인해주세요.');
        setIsLoading(false);
      }
    };

    initializePose();

    return () => {
      cameraRef.current?.stop();
      cameraRef.current = null;
      poseRef.current?.close();
      poseRef.current = null;
    };
  }, [isActive]);

  // 캔버스 크기 조정
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-muted rounded-lg p-8">
        <div className="text-center">
          <p className="text-destructive mb-2">⚠️ {error}</p>
          <p className="text-sm text-muted-foreground">
            브라우저 설정에서 카메라 권한을 허용해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* 숨겨진 비디오 (MediaPipe용) */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* 캔버스 (스켈레톤 오버레이) */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover rounded-lg"
      />

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">카메라 준비 중...</p>
          </div>
        </div>
      )}

      {/* 정확도 배지 */}
      {!isLoading && (
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-white font-bold text-sm"
          style={{ backgroundColor: getAccuracyColor(currentAccuracy) }}
        >
          {currentAccuracy}%
        </div>
      )}
    </div>
  );
}
