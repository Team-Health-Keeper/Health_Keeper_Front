import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Home,
  RotateCcw,
  Trophy,
  AlertCircle,
  Medal,
  Upload,
  Crown,
  User,
} from 'lucide-react';
import { getAccuracyGrade, getAccuracyColor } from '@/components/exercise';
import { apiFetch } from '@/lib/utils';
import type { ExerciseResult } from '@/components/exercise';

interface RankingItem {
  id: number;
  user_id: number;
  user_name: string;
  title: string;
  average_accuracy: number;
  exercise_duration: number;
  created_at: string;
  rank_position: number;
}

interface MyRecord {
  id: number;
  title: string;
  average_accuracy: number;
  exercise_duration: number;
  created_at: string;
  myRank: number;
  totalParticipants: number;
}

export default function ExerciseResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as ExerciseResult | undefined;

  // 랭킹 관련 상태
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [myRecord, setMyRecord] = useState<MyRecord | null>(null);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);

  // 랭킹 데이터 로드
  useEffect(() => {
    if (result?.exerciseName) {
      loadRankingData();
    }
  }, [result?.exerciseName]);

  const loadRankingData = async () => {
    if (!result?.exerciseName) return;

    setIsLoadingRanking(true);
    try {
      // 랭킹 조회 (공개 API) - title로 조회
      const encodedTitle = encodeURIComponent(result.exerciseName);
      const rankingRes = await apiFetch<{
        success: boolean;
        data: RankingItem[];
      }>(`/api/exercise/ranking/${encodedTitle}?limit=10`);
      if (rankingRes.success) {
        setRankings(rankingRes.data);
      }

      // 내 기록 조회 (인증 필요)
      const token = sessionStorage.getItem('authToken');
      if (token) {
        try {
          const myRecordRes = await apiFetch<{
            success: boolean;
            data: MyRecord | null;
          }>(`/api/exercise/my-record/${encodedTitle}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (myRecordRes.success && myRecordRes.data) {
            setMyRecord(myRecordRes.data);
          }
        } catch (e) {
          // 인증 실패 또는 기록 없음
          console.log('내 기록 없음 또는 인증 필요');
        }
      }
    } catch (error) {
      console.error('랭킹 조회 실패:', error);
    } finally {
      setIsLoadingRanking(false);
    }
  };

  const handleRegisterRecord = async () => {
    if (!result) return;

    const token = sessionStorage.getItem('authToken');
    if (!token) {
      setRegisterMessage('로그인이 필요합니다.');
      return;
    }

    setIsRegistering(true);
    setRegisterMessage(null);

    try {
      const response = await apiFetch<{
        success: boolean;
        message: string;
        data: { isUpdate: boolean };
      }>('/api/exercise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: result.exerciseName,
          averageAccuracy: result.averageAccuracy,
          exerciseDuration: result.duration,
        }),
      });

      if (response.success) {
        setRegisterMessage(
          response.data.isUpdate
            ? '기록이 업데이트되었습니다! 🔄'
            : '기록이 등록되었습니다! 🎉'
        );
        // 랭킹 새로고침
        await loadRankingData();
      }
    } catch (error: any) {
      setRegisterMessage(error?.body?.message || '기록 등록에 실패했습니다.');
    } finally {
      setIsRegistering(false);
      setShowConfirmDialog(false);
    }
  };

  // 기록 등록 가능 여부 확인
  const canRegister =
    result && result.averageAccuracy > 0 && result.duration > 0;

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-sm font-bold text-muted-foreground">
            {rank}
          </span>
        );
    }
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

            {/* 랭킹 섹션 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />이 운동 랭킹 TOP
                  10
                </h3>
                {canRegister && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isRegistering}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {myRecord ? '기록 갱신' : '기록 등록'}
                  </Button>
                )}
              </div>

              {/* 내 현재 기록 */}
              {myRecord && (
                <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">내 등록 기록</p>
                        <p className="text-xs text-muted-foreground">
                          {myRecord.totalParticipants}명 중 {myRecord.myRank}위
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {myRecord.average_accuracy}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(myRecord.exercise_duration)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 등록 메시지 */}
              {registerMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    registerMessage.includes('실패') ||
                    registerMessage.includes('필요')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  {registerMessage}
                </div>
              )}

              {/* 랭킹 리스트 */}
              {isLoadingRanking ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  랭킹 불러오는 중...
                </div>
              ) : rankings.length > 0 ? (
                <div className="space-y-2">
                  {rankings.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        item.rank_position <= 3
                          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                          {getRankIcon(item.rank_position)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {item.user_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(item.exercise_duration)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold"
                          style={{
                            color: getAccuracyColor(item.average_accuracy),
                          }}
                        >
                          {item.average_accuracy}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getAccuracyGrade(item.average_accuracy)}등급
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">아직 등록된 기록이 없습니다</p>
                  <p className="text-xs mt-1">첫 번째로 기록을 등록해보세요!</p>
                </div>
              )}
            </div>

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

      {/* 기록 등록 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              기록 등록
            </DialogTitle>
            <DialogDescription>
              {myRecord ? (
                <>
                  이전에 등록한 기록이 있습니다. 새 기록으로
                  업데이트하시겠습니까?
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">이전 기록:</span>
                      <span className="font-medium">
                        {myRecord.average_accuracy}% /{' '}
                        {formatDuration(myRecord.exercise_duration)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">새 기록:</span>
                      <span className="font-medium text-primary">
                        {result.averageAccuracy}% /{' '}
                        {formatDuration(result.duration)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-amber-600 text-sm">
                    ⚠️ 이전 기록은 삭제되고 새 기록만 남습니다.
                  </p>
                </>
              ) : (
                <>
                  이 기록을 랭킹에 등록하시겠습니까?
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">운동:</span>
                      <span className="font-medium">{result.exerciseName}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">정확도:</span>
                      <span className="font-medium text-primary">
                        {result.averageAccuracy}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">운동 시간:</span>
                      <span className="font-medium">
                        {formatDuration(result.duration)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              취소
            </Button>
            <Button onClick={handleRegisterRecord} disabled={isRegistering}>
              {isRegistering ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  등록 중...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {myRecord ? '기록 갱신' : '기록 등록'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
