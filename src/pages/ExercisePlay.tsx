import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Maximize,
  Pause,
  Play,
  RotateCcw,
  StopCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  PoseDetector,
  AccuracyMeter,
  VideoSkeleton,
  getExerciseById,
  getAccuracyGrade,
  getFrameAtTime,
} from '@/components/exercise';
import type {
  ExerciseResult,
  PoseData,
  PoseFrame,
} from '@/components/exercise';

export default function ExercisePlay() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const exercise = getExerciseById(id || '');

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);

  // JSON 포즈 데이터
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [currentFrame, setCurrentFrame] = useState<PoseFrame | null>(null);
  const [isLoadingPose, setIsLoadingPose] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 });

  // 피드백 기록 (어떤 피드백이 몇 번 발생했는지)
  const [feedbackHistory, setFeedbackHistory] = useState<
    Record<string, number>
  >({});

  // TTS 관련
  const lastSpokenRef = useRef<string>('');
  const lastSpokenTimeRef = useRef<number>(0);

  // 운동이 없으면 목록으로 이동
  useEffect(() => {
    if (!exercise) {
      navigate('/exercise');
    }
  }, [exercise, navigate]);

  // JSON 포즈 데이터 로드
  useEffect(() => {
    if (!exercise) return;

    const loadPoseData = async () => {
      try {
        setIsLoadingPose(true);
        // 영상 파일명에서 JSON 경로 생성
        const videoFileName = exercise.videoUrl
          .split('/')
          .pop()
          ?.replace('.mp4', '');
        const jsonUrl = `/videos/json/${videoFileName}.json`;

        const response = await fetch(jsonUrl);
        if (response.ok) {
          const data = await response.json();
          setPoseData(data);
          console.log(`포즈 데이터 로드 완료: ${data.frames.length} 프레임`);
        } else {
          console.warn('포즈 데이터를 찾을 수 없습니다:', jsonUrl);
        }
      } catch (error) {
        console.error('포즈 데이터 로드 실패:', error);
      } finally {
        setIsLoadingPose(false);
      }
    };

    loadPoseData();
  }, [exercise]);

  // 현재 시간에 맞는 프레임 업데이트
  useEffect(() => {
    if (poseData && isStarted) {
      const frame = getFrameAtTime(poseData, currentTime);
      setCurrentFrame(frame);
    }
  }, [poseData, currentTime, isStarted]);

  // TTS 음성 피드백 함수
  const speakFeedback = useCallback((text: string) => {
    const now = Date.now();
    // 같은 메시지는 5초 내에 반복하지 않음
    if (
      text === lastSpokenRef.current &&
      now - lastSpokenTimeRef.current < 5000
    ) {
      return;
    }

    // 브라우저 TTS 지원 확인
    if ('speechSynthesis' in window) {
      // 이전 음성 중단
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.1; // 약간 빠르게
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      window.speechSynthesis.speak(utterance);
      lastSpokenRef.current = text;
      lastSpokenTimeRef.current = now;
    }
  }, []);

  // 정확도 변경 핸들러
  const handleAccuracyChange = useCallback(
    (newAccuracy: number, newFeedback: string[]) => {
      setAccuracy(newAccuracy);
      setFeedback(newFeedback);
      if (isStarted && isPlaying) {
        setScores((prev) => [...prev, newAccuracy]);

        // 피드백 기록 업데이트
        newFeedback.forEach((fb) => {
          if (fb.includes('자세를 확인') || fb.includes('천천히 따라')) {
            setFeedbackHistory((prev) => ({
              ...prev,
              [fb]: (prev[fb] || 0) + 1,
            }));
          }
        });

        // [수정] 50% 이하일 때만 음성 피드백 (값을 조정하여 음성 빈도 변경)
        if (newAccuracy < 50 && newFeedback.length > 0) {
          const feedbackText = newFeedback[0];
          // 긍정적 피드백은 제외
          if (
            !feedbackText.includes('완벽') &&
            !feedbackText.includes('좋아요')
          ) {
            speakFeedback(feedbackText);
          }
        }
      }
    },
    [isStarted, isPlaying, speakFeedback]
  );

  // 카운트다운 시작
  const startCountdown = () => {
    setShowCountdown(true);
    setCountdown(3);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowCountdown(false);
          setIsStarted(true);
          setIsPlaying(true);
          videoRef.current?.play();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 재생/일시정지 토글
  const togglePlayPause = () => {
    if (!isStarted) {
      startCountdown();
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 다시 시작
  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
    setIsStarted(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setScores([]);
    setAccuracy(0);
    setFeedback([]);
    setCurrentFrame(null);
  };

  // 운동 종료
  const handleFinish = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }

    // TTS 중단
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const avgAccuracy =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const result: ExerciseResult = {
      exerciseId: exercise?.id || '',
      exerciseName: exercise?.name || '',
      averageAccuracy: avgAccuracy,
      duration: Math.floor(currentTime),
      completedAt: new Date(),
      scores,
      feedbackHistory,
    };

    // 결과 페이지로 이동
    navigate('/exercise/result', { state: { result } });
  };

  // 비디오 시간 업데이트
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 비디오 메타데이터 로드 시 크기 설정
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoSize({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  // 비디오 종료
  const handleVideoEnded = () => {
    handleFinish();
  };

  // 풀스크린 토글
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        (videoRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any).webkitEnterFullscreen) {
        // iOS Safari
        (videoRef.current as any).webkitEnterFullscreen();
      }
    }
  };

  if (!exercise) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/exercise')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로
          </Button>
          <h1 className="text-xl font-bold">{exercise.name}</h1>
          <Button variant="destructive" size="sm" onClick={handleFinish}>
            <StopCircle className="h-4 w-4 mr-2" />
            측정 종료
          </Button>
        </div>
      </div>
      {/* 추가 안내 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <p className="flex items-center gap-2 text-blue-700">
              <span className="text-lg">💡</span>
              <span>
                더 정확한 자세 분석을 위해{' '}
                <strong>전신이 카메라에 잘 보이도록</strong> 해주세요.
              </span>
            </p>
            <p className="flex items-center gap-2 text-indigo-700">
              <span className="text-lg">⏸️</span>
              <span>
                영상을 <strong>일시정지</strong>하고 자세를 맞춰가며 운동하세요!
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* 메인 뷰: 영상 + 웹캠 */}
        <div className="grid gap-4 lg:grid-cols-2 mb-4">
          {/* 가이드 영상 */}
          <Card className="overflow-hidden">
            <div
              ref={videoContainerRef}
              className="relative bg-black"
              style={{ height: 'calc(50vh - 80px)', minHeight: '300px' }}
            >
              <video
                ref={videoRef}
                src={exercise.videoUrl}
                className="w-full h-full object-contain"
                muted={isMuted}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onEnded={handleVideoEnded}
                playsInline
              />
              {/* JSON 스켈레톤 오버레이 */}
              {showSkeleton && currentFrame && (
                <VideoSkeleton
                  frame={currentFrame}
                  width={videoSize.width}
                  height={videoSize.height}
                />
              )}
              {/* 영상 없을 때 플레이스홀더 */}
              {!exercise.videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <p>가이드 영상 준비 중</p>
                </div>
              )}
              {/* 시간 표시 */}
              <div className="absolute bottom-3 left-3 bg-black/70 text-white text-sm px-2 py-1 rounded">
                {formatTime(currentTime)} / {formatTime(exercise.duration)}
              </div>
              {/* 컨트롤 버튼들 */}
              <div className="absolute bottom-2 right-2 flex gap-1">
                {/* 스켈레톤 토글 버튼 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${
                    showSkeleton
                      ? 'bg-green-500/70 hover:bg-green-500/90'
                      : 'bg-black/50 hover:bg-black/70'
                  } text-white`}
                  onClick={() => setShowSkeleton(!showSkeleton)}
                  title={showSkeleton ? '스켈레톤 숨기기' : '스켈레톤 표시'}
                >
                  {showSkeleton ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
                {/* 음소거 버튼 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                {/* 풀스크린 버튼 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white h-8 w-8"
                  onClick={handleFullscreen}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* 웹캠 + 자세 분석 */}
          <Card className="overflow-hidden">
            <div
              className="relative bg-muted"
              style={{ height: 'calc(50vh - 80px)', minHeight: '300px' }}
            >
              <PoseDetector
                targetFrame={currentFrame}
                onAccuracyChange={handleAccuracyChange}
                isActive={true}
              />
              {/* 포즈 데이터 로딩 상태 */}
              {isLoadingPose && (
                <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  포즈 데이터 로딩 중...
                </div>
              )}
              {!isLoadingPose && !poseData && (
                <div className="absolute top-3 left-3 bg-yellow-500/70 text-white text-xs px-2 py-1 rounded">
                  포즈 데이터 없음
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* 정확도 미터 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">실시간 자세 정확도</span>
              <span
                className="text-2xl font-bold"
                style={{
                  color:
                    accuracy >= 80
                      ? '#22c55e'
                      : accuracy >= 60
                      ? '#eab308'
                      : '#ef4444',
                }}
              >
                {accuracy}%
                <span className="text-sm ml-2">
                  ({getAccuracyGrade(accuracy)})
                </span>
              </span>
            </div>
            <AccuracyMeter accuracy={accuracy} size="lg" />
          </CardContent>
        </Card>

        {/* 피드백 */}
        {feedback.length > 0 && (
          <Card className="mb-4 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div className="space-y-1">
                  {feedback.map((msg, idx) => (
                    <p key={idx} className="text-sm">
                      {msg}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 컨트롤 버튼 */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={handleRestart}>
            <RotateCcw className="h-5 w-5 mr-2" />
            다시 시작
          </Button>
          <Button size="lg" onClick={togglePlayPause} className="min-w-[140px]">
            {!isStarted ? (
              <>
                <Play className="h-5 w-5 mr-2" />
                시작
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                일시정지
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                재개
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 카운트다운 오버레이 */}
      {showCountdown && (
        <div className="fixed inset-0 z-100 bg-black/80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl font-bold text-primary animate-pulse">
              {countdown}
            </div>
            <p className="text-white text-xl mt-4">준비하세요!</p>
          </div>
        </div>
      )}
    </div>
  );
}
