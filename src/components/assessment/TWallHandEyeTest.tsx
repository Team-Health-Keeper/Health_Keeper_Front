import React, { useState, useRef } from "react"
import "./TWallHandEyeTest.css"

type Status = "idle" | "running" | "finished"
type CellColor = "blue" | "green" | null

const GRID_SIZE = 4 // 4 x 4
const TOTAL_HITS = 100 // 성공 목표 횟수
const PENALTY_PER_FAIL = 0.046 // (실패 횟수) × 0.046초 페널티

const GREEN_LIGHT_LIFETIME = 2000 // 초록색 불빛 유지 시간: 2초 (2000ms)
const GREEN_SPAWN_TICK = 350 // 초록색 불빛 스폰 체크 간격(ms)
const MAX_CONCURRENT_GREENS = 2 // 동시에 보일 수 있는 최대 초록 불빛 수


const TWallHandEyeTest: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle")
  const statusRef = useRef<Status>("idle")
  const [activeBlueIndex, setActiveBlueIndex] = useState<number | null>(null)
  const blueIndexRef = useRef<number | null>(null)
  const [activeGreenIndices, setActiveGreenIndices] = useState<Set<number>>(new Set())
  const greenSetRef = useRef<Set<number>>(new Set())

  const [successCount, setSuccessCount] = useState(0)
  const [failCount, setFailCount] = useState(0)

  const [rawTimeSec, setRawTimeSec] = useState<number | null>(null)
  const [finalTimeSec, setFinalTimeSec] = useState<number | null>(null)

  const startTimeRef = useRef<number | null>(null)
    // 최신 상태를 refs에 동기화
    React.useEffect(() => { statusRef.current = status }, [status])
    React.useEffect(() => { blueIndexRef.current = activeBlueIndex }, [activeBlueIndex])
    React.useEffect(() => { greenSetRef.current = activeGreenIndices }, [activeGreenIndices])

  
  // 💡 초록 불빛 타이머/스폰 관리
  const greenTimersRef = useRef<Map<number, number>>(new Map()) // index -> timeoutId
  const greenSpawnerIntervalRef = useRef<number | null>(null)

  // 1. Blue Light 생성 (성공 시 호출)
  const spawnNextBlueLight = (prevBlue: number | null) => {
    const total = GRID_SIZE * GRID_SIZE
    let blue
    
    // 이전 Blue 인덱스와 중복 방지
    do {
      blue = Math.floor(Math.random() * total)
      // 현재 켜진 Green Light 위치와 겹치지 않도록 처리
    } while (total > 1 && (blue === prevBlue || greenSetRef.current.has(blue)))

    setActiveBlueIndex(blue)
  }

  // 2. Green Light 생성(여러 개) 및 소멸 타이머 설정
  const spawnOneGreen = (): boolean => {
    if (statusRef.current !== "running") return false
    if (greenSetRef.current.size >= MAX_CONCURRENT_GREENS) return false

    const total = GRID_SIZE * GRID_SIZE
    let idx = Math.floor(Math.random() * total)
    // 블루/현재 그린과 겹치면 다른 칸으로 이동
    let guard = 0
    while ((idx === blueIndexRef.current || greenSetRef.current.has(idx)) && guard < total) {
      idx = (idx + 1) % total
      guard++
    }
    if (idx === blueIndexRef.current || greenSetRef.current.has(idx)) return false

    // 즉시 ref에 반영하여 동일 틱에서 한도를 넘지 않도록 '선점'
    const claimed = new Set(greenSetRef.current)
    claimed.add(idx)
    greenSetRef.current = claimed
    setActiveGreenIndices(claimed)

    // 3초 후 자동 소멸 타이머 등록
    const tId = window.setTimeout(() => {
      // 타임아웃 시 해당 인덱스 제거
      const next = new Set(greenSetRef.current)
      next.delete(idx)
      greenSetRef.current = next
      setActiveGreenIndices(next)
      const map = greenTimersRef.current
      const saved = map.get(idx)
      if (saved) {
        map.delete(idx)
      }
    }, GREEN_LIGHT_LIFETIME)

    greenTimersRef.current.set(idx, tId)
    return true
  }
  
  // 3. Green Light 랜덤 생성 루프 시작
  const startGreenLightCycle = () => {
    // 매 틱마다 0~3개 스폰, 확률적으로 버스트 발생
    if (greenSpawnerIntervalRef.current) {
      clearInterval(greenSpawnerIntervalRef.current)
      greenSpawnerIntervalRef.current = null
    }
    const intervalId = window.setInterval(() => {
      if (statusRef.current !== "running") return
      // 현재 비어있는 슬롯 수 계산하여 한도 내에서만 스폰
      const available = Math.max(0, MAX_CONCURRENT_GREENS - greenSetRef.current.size)
      if (available <= 0) return
      // 확률 분포: 0개(60%), 1개(30%), 2개(8%), 3개(2%)
      const r = Math.random()
      const desired = r < 0.6 ? 0 : r < 0.9 ? 1 : r < 0.98 ? 2 : 3
      const toSpawn = Math.min(desired, available)
      for (let i = 0; i < toSpawn; i++) {
        const ok = spawnOneGreen()
        if (!ok) break
      }
    }, GREEN_SPAWN_TICK)
    greenSpawnerIntervalRef.current = intervalId
  }

  // 4. 모든 Green Light 관련 타이머 중지 및 클리어
  const stopGreenLightCycle = () => {
    // 개별 그린 타이머 정리
    greenTimersRef.current.forEach((tId) => clearTimeout(tId))
    greenTimersRef.current.clear()
    // 스폰 인터벌 정리
    if (greenSpawnerIntervalRef.current) {
      clearInterval(greenSpawnerIntervalRef.current)
      greenSpawnerIntervalRef.current = null
    }
  }


  const finishTest = (finalFailCount: number) => {
    if (!startTimeRef.current) return
    stopGreenLightCycle() // 게임 종료 시 모든 타이머 중지

    const end = performance.now()
    const elapsedSec = (end - startTimeRef.current) / 1000
    const roundedRaw = parseFloat(elapsedSec.toFixed(3))
    const penalized = roundedRaw + finalFailCount * PENALTY_PER_FAIL
    const roundedFinal = parseFloat(penalized.toFixed(3))

    setRawTimeSec(roundedRaw)
    setFinalTimeSec(roundedFinal)
    setStatus("finished")
    setActiveBlueIndex(null)
    setActiveGreenIndices(new Set())
    greenSetRef.current = new Set()
  }

  const handleStart = () => {
    setStatus("running")
    setSuccessCount(0)
    setFailCount(0)
    setRawTimeSec(null)
    setFinalTimeSec(null)
    startTimeRef.current = performance.now()
    
    spawnNextBlueLight(null) // 초기 Blue Light 생성
    startGreenLightCycle() // Green Light 랜덤 생성 루프 시작
  }

  const handleReset = () => {
    setStatus("idle")
    stopGreenLightCycle() // 타이머 중지
    setActiveBlueIndex(null)
    setActiveGreenIndices(new Set())
    greenSetRef.current = new Set()
    setSuccessCount(0)
    setFailCount(0)
    setRawTimeSec(null)
    setFinalTimeSec(null)
    startTimeRef.current = null
  }

  // 5. Cell 클릭 로직 수정
  const handleCellClick = (index: number) => {
    if (status !== "running") return
    
    const isCorrectHit = blueIndexRef.current !== null && index === blueIndexRef.current
    const isFailHit = greenSetRef.current.has(index)

    // Case 1: 초록색 불빛을 눌렀을 때 (실패)
    if (isFailHit) {
      setFailCount(prev => prev + 1)
      // 해당 인덱스만 제거 및 타이머 해제
      const tId = greenTimersRef.current.get(index)
      if (tId) {
        clearTimeout(tId)
        greenTimersRef.current.delete(index)
      }
      setActiveGreenIndices(prev => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
      return
    }

    // Case 2: 파란색 불빛을 눌렀을 때 (성공)
    if (isCorrectHit) {
      const newSuccessCount = successCount + 1
      
      setSuccessCount(newSuccessCount)
      
      if (newSuccessCount >= TOTAL_HITS) {
        finishTest(failCount) // 누적된 failCount로 최종 결과 계산
      } else {
        spawnNextBlueLight(activeBlueIndex) // 다음 파란 불빛 생성
      }
      return
    }

    // Case 3: 켜지지 않은 셀을 눌렀을 때 (무시)
  }

  const renderGrid = () => {
    const totalCells = GRID_SIZE * GRID_SIZE
    
    return (
      <div className="twall-grid">
        {Array.from({ length: totalCells }, (_, i) => {
          const isBlue = status === "running" && i === activeBlueIndex
          const isGreen = status === "running" && activeGreenIndices.has(i)
          const colorClass = isBlue ? "twall-cell--blue" : (isGreen ? "twall-cell--green" : "")

          return (
            <button
              key={i}
              className={`twall-cell ${colorClass}`}
              onClick={() => handleCellClick(i)}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="twall-wrapper">
      <h2 className="twall-title">눈-손 협응력 검사 (T-wall, 초)</h2>

      <section className="twall-guide">
        <h3>검사 절차 요약</h3>
        <h4>1️⃣ 준비</h4>
        <p>피검자는 4×4 T-wall 앞에 서서 손바닥으로 터치하기 좋은 위치에 섭니다.</p>

        <h4>2️⃣ 검사 실행 (수정된 로직)</h4>
        <ul>
          <li>4행 4열 셀에서 파란색·초록색 불이 독립적으로, 랜덤하게 켜집니다.</li>
          <li>
            파란색 불빛만 터치해야 성공 횟수가 증가하며 다음 파란 불빛이 켜집니다.
          </li>
          <li>
            초록색 불빛을 터치하면 실패 횟수만 증가하며, 초록 불빛은 3초 후 자동 소멸하거나 터치 즉시 사라집니다.
          </li>
          <li>
            성공 횟수가 {TOTAL_HITS}회 가 될 때까지 진행됩니다.
          </li>
        </ul>

        <h4>3️⃣ 기록 / 최종 결과</h4>
        <ul>
          <li>총 소요 시간을 0.001초 단위까지 측정합니다.</li>
          <li>실패 횟수를 함께 기록합니다.</li>
          <li>
            최종 결과 시간은 <code>(실패 횟수 × 0.046) + 눈-손 협응력 시간</code> 으로 계산합니다.
          </li>
        </ul>
      </section>

      <section className="twall-panel">
        <div className="twall-stat">
          <span className="twall-label">상태</span>
          <span className="twall-value">
            {status === "idle" && "대기 중"}
            {status === "running" && "검사 진행 중"}
            {status === "finished" && "검사 종료"}
          </span>
        </div>
        <div className="twall-stat">
          <span className="twall-label">목표 성공 횟수</span>
          <span className="twall-value">
            {successCount} / {TOTAL_HITS}
          </span>
        </div>
        <div className="twall-stat">
          <span className="twall-label">성공(파란 불)</span>
          <span className="twall-value">{successCount} 회</span>
        </div>
        <div className="twall-stat">
          <span className="twall-label">실패(초록 불)</span>
          <span className="twall-value">{failCount} 회</span>
        </div>
      </section>

      <div className="twall-controls">
        {status !== "running" && (
          <button className="twall-btn twall-btn--primary" onClick={handleStart}>
            {status === "finished" ? "다시 검사하기" : "검사 시작"}
          </button>
        )}
        {status === "running" && (
          <button className="twall-btn twall-btn--secondary" onClick={handleReset}>
            중단 / 초기화
          </button>
        )}
      </div>

      {renderGrid()}

      {status === "finished" && (
        <section className="twall-result">
          <h3>검사 결과</h3>
          <p>
            순수 측정 시간: <strong>{rawTimeSec !== null ? `${rawTimeSec.toFixed(3)} 초` : "-"}</strong>
          </p>
          <p>
            실패 횟수: <strong>{failCount} 회</strong>
          </p>
          <p>
            최종 결과 시간(패널티 포함): <strong>{finalTimeSec !== null ? `${finalTimeSec.toFixed(3)} 초` : "-"}</strong>
          </p>
          <p className="twall-note">계산식: <code>(실패 횟수 × 0.046) + 눈-손 협응력 시간</code></p>
        </section>
      )}
    </div>
  )
}

export default TWallHandEyeTest