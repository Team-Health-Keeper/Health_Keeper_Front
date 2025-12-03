import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  Dumbbell,
  Play,
  Sparkles,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import { exercises } from '@/components/exercise';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { HeroSection } from '@/components/common/HeroSection';

export default function Exercise() {
  const navigate = useNavigate();
  const [isCheckingCamera, setIsCheckingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급':
        return 'bg-green-600 text-white border-green-700';
      case '중급':
        return 'bg-yellow-500 text-white border-yellow-600';
      case '고급':
        return 'bg-red-600 text-white border-red-700';
      default:
        return 'bg-gray-600 text-white border-gray-700';
    }
  };

  // 카메라 확인 및 운동 시작
  const handleStartExercise = async (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setIsCheckingCamera(true);
    setCameraError(null);

    try {
      // 카메라 기기 존재 확인
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput'
      );

      if (videoDevices.length === 0) {
        setCameraError('카메라 기기를 찾을 수 없습니다. 웹캠을 연결해주세요.');
        setShowCameraDialog(true);
        setIsCheckingCamera(false);
        return;
      }

      // 카메라 권한 확인
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      // 스트림 정리
      stream.getTracks().forEach((track) => track.stop());

      // 카메라 확인 완료 - 페이지 이동
      navigate(`/exercise/${exerciseId}`);
    } catch (error: any) {
      console.error('카메라 확인 실패:', error);

      if (
        error.name === 'NotFoundError' ||
        error.name === 'DevicesNotFoundError'
      ) {
        setCameraError('카메라 기기를 찾을 수 없습니다. 웹캠을 연결해주세요.');
      } else if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        setCameraError(
          '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.'
        );
      } else if (
        error.name === 'NotReadableError' ||
        error.name === 'TrackStartError'
      ) {
        setCameraError(
          '카메라가 다른 프로그램에서 사용 중입니다. 다른 프로그램을 종료하고 다시 시도해주세요.'
        );
      } else {
        setCameraError(
          '카메라를 시작할 수 없습니다. 카메라 연결 상태를 확인해주세요.'
        );
      }

      setShowCameraDialog(true);
    } finally {
      setIsCheckingCamera(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <HeroSection
        badgeIcon={Sparkles}
        badgeText="AI 트레이너"
        title="AI가 실시간으로"
        highlight="자세를 분석해드립니다"
        description="영상을 보며 운동을 따라하면 AI가 자세 정확도를 실시간으로 분석해드립니다"
        centered={false}
        className="py-16"
      />

      <div className="container mx-auto max-w-6xl px-6 py-8">
        {/* 출처 표시 */}
        <p className="text-s text-gray-500 text-right -mt-6 mb-4">
          출처: 한국스포츠과학원,{' '}
          <a
            href="https://www.kogl.or.kr/index.do"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            공공누리
          </a>
        </p>

        {/* 운동 목록 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Card
              key={exercise.id}
              className="group overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg rounded-xl !py-0 !gap-0"
            >
              {/* 썸네일 영역 */}
              <div className="relative aspect-video bg-muted overflow-hidden rounded-t-xl">
                {exercise.thumbnailUrl ? (
                  <img
                    src={exercise.thumbnailUrl}
                    alt={exercise.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-accent/20">
                    <Dumbbell className="h-12 w-12 text-primary/50" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className={getDifficultyColor(exercise.difficulty)}>
                    {exercise.difficulty}
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  <Clock className="h-3 w-3" />
                  {exercise.duration}초
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {exercise.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {exercise.description}
                </p>

                {/* 타겟 근육 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {exercise.targetMuscles.slice(0, 3).map((muscle) => (
                    <span
                      key={muscle}
                      className="text-xs bg-muted px-2 py-0.5 rounded"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleStartExercise(exercise.id)}
                  disabled={
                    isCheckingCamera && selectedExerciseId === exercise.id
                  }
                >
                  {isCheckingCamera && selectedExerciseId === exercise.id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      카메라 확인 중...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      시작하기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 추가 안내 */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            💡 더 정확한 자세 분석을 위해 전신이 카메라에 잘 보이도록 해주세요.
          </p>
        </div>
      </div>

      {/* 카메라 에러 다이얼로그 */}
      <Dialog open={showCameraDialog} onOpenChange={setShowCameraDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              카메라 연결 필요
            </DialogTitle>
            <DialogDescription className="pt-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg mb-4">
                <Camera className="h-6 w-6 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">{cameraError}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                AI 자세 분석 기능을 사용하려면 웹캠이 필요합니다. 카메라를
                연결하거나 권한을 허용한 후 다시 시도해주세요.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCameraDialog(false)}
            >
              닫기
            </Button>
            <Button
              onClick={() => {
                setShowCameraDialog(false);
                if (selectedExerciseId) {
                  handleStartExercise(selectedExerciseId);
                }
              }}
            >
              다시 시도
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SiteFooter />
    </div>
  );
}
