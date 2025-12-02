import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, RotateCcw, Trophy, AlertCircle } from 'lucide-react';
import { getAccuracyGrade, getAccuracyColor } from '@/components/exercise';
import type { ExerciseResult } from '@/components/exercise';

export default function ExerciseResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as ExerciseResult | undefined;

  // 결과가 없으면 운동 목록으로 이동
  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              결과 데이터가 없습니다.
            </p>
            <Button asChild>
              <Link to="/exercise">운동 목록으로</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grade = getAccuracyGrade(result.averageAccuracy);
  const gradeColor = getAccuracyColor(result.averageAccuracy);

  // 피드백 분석
  const topFeedbacks = Object.entries(result.feedbackHistory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const getGradeMessage = (grade: string) => {
    switch (grade) {
      case 'S':
        return '완벽해요! 최고의 자세입니다! 🎉';
      case 'A':
        return '훌륭해요! 거의 완벽한 자세예요! 👏';
      case 'B':
        return '좋아요! 조금만 더 연습하면 완벽해질 거예요! 💪';
      case 'C':
        return '괜찮아요! 꾸준히 연습해보세요! 🙂';
      case 'D':
        return '조금 더 노력이 필요해요. 가이드 영상을 잘 따라해보세요! 📺';
      default:
        return '포기하지 마세요! 다시 도전해보세요! 🔥';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}분 ${secs}초`;
    }
    return `${secs}초`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/exercise')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            운동 목록으로
          </Button>
        </div>

        {/* 결과 카드 */}
        <Card className="max-w-2xl mx-auto overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 pt-12 pb-8">
            {/* 트로피 영역 */}
            <div className="relative mb-6">
              {/* 빛나는 배경 효과 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300/30 to-amber-400/20 blur-xl animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/40 to-orange-400/30 blur-md" />
              </div>
              {/* 트로피 컨테이너 */}
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Trophy className="h-12 w-12 text-white drop-shadow-md" />
                </div>
              </div>
              {/* 반짝이는 별 장식 */}
              <div
                className="absolute -top-1 left-1/2 -translate-x-8 text-yellow-400 animate-bounce"
                style={{ animationDelay: '0.1s' }}
              >
                ✦
              </div>
              <div
                className="absolute top-2 left-1/2 translate-x-10 text-amber-400 animate-bounce"
                style={{ animationDelay: '0.3s' }}
              >
                ✧
              </div>
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-12 text-orange-400 animate-bounce"
                style={{ animationDelay: '0.5s' }}
              >
                ✦
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">🎉 운동 완료!</CardTitle>
            <p className="text-muted-foreground">{result.exerciseName}</p>
          </CardHeader>

          <CardContent className="p-8">
            {/* 등급 */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-32 h-32 rounded-full text-6xl font-bold text-white mb-4"
                style={{ backgroundColor: gradeColor }}
              >
                {grade}
              </div>
              <p className="text-lg font-medium">{getGradeMessage(grade)}</p>
            </div>

            {/* 상세 통계 */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {result.averageAccuracy}%
                  </p>
                  <p className="text-sm text-muted-foreground">평균 정확도</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">
                    {formatDuration(result.duration)}
                  </p>
                  <p className="text-sm text-muted-foreground">운동 시간</p>
                </CardContent>
              </Card>
            </div>

            {/* 정확도 그래프 (간단한 바 형태) */}
            {result.scores.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-3">정확도 변화</h3>
                <div className="h-24 flex items-end gap-0.5">
                  {result.scores
                    .filter(
                      (_, i) => i % Math.ceil(result.scores.length / 50) === 0
                    )
                    .map((score, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-t transition-all"
                        style={{
                          height: `${score}%`,
                          backgroundColor: getAccuracyColor(score),
                          minWidth: '2px',
                        }}
                      />
                    ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>시작</span>
                  <span>종료</span>
                </div>
              </div>
            )}

            {/* 개선 포인트 피드백 */}
            {topFeedbacks.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  다음에 신경 쓸 부분
                </h3>
                <div className="space-y-2">
                  {topFeedbacks.map(([feedback, count], idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <span className="text-sm">{feedback}</span>
                      <span className="text-xs text-muted-foreground">
                        {count}회 감지
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 위 부분을 집중해서 연습하면 더 높은 점수를 받을 수 있어요!
                </p>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/exercise/${result.exerciseId}`)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                다시 하기
              </Button>
              <Button className="flex-1" asChild>
                <Link to="/exercise">
                  <Home className="h-4 w-4 mr-2" />
                  다른 운동 하기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 완료 시간 */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {result.completedAt.toLocaleString('ko-KR')} 완료
        </p>
      </div>
    </div>
  );
}
