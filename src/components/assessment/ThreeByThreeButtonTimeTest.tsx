import React, { useRef, useState } from "react"
import "./ThreeByThreeButtonTimeTest.css"

type Status = "idle" | "running" | "finished"

const GRID_SIZE = 3 // 3 x 3
const TARGET_HITS = 30 // 총 30번 파란 불 터치

const ThreeByThreeButtonTimeTest: React.FC = () => {
  const [status, setStatus] = useState<Status>("idle")
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hitCount, setHitCount] = useState(0)
  const [failCount, setFailCount] = useState(0) // 참고용 표시
  const [elapsedTimeSec, setElapsedTimeSec] = useState<number | null>(null)

  const startTimeRef = useRef<number | null>(null)

  const spawnNextLight = (prevIndex: number | null) => {
    const totalCells = GRID_SIZE * GRID_SIZE
    let nextIndex = Math.floor(Math.random() * totalCells)

    // 같은 칸 연속 방지(옵션)
    if (prevIndex !== null && totalCells > 1 && nextIndex === prevIndex) {
      nextIndex = (nextIndex + 1) % totalCells
    }

    setActiveIndex(nextIndex)
  }

  const handleStart = () => {
    setStatus("running")
    setHitCount(0)
    setFailCount(0)
    setElapsedTimeSec(null)
    startTimeRef.current = performance.now()
    spawnNextLight(null)
  }

  const handleReset = () => {
    setStatus("idle")
    setActiveIndex(null)
    setHitCount(0)
    setFailCount(0)
    setElapsedTimeSec(null)
    startTimeRef.current = null
  }

  const finishTest = () => {
    if (!startTimeRef.current) return
    const end = performance.now()
    const elapsedSec = (end - startTimeRef.current) / 1000
    setElapsedTimeSec(parseFloat(elapsedSec.toFixed(3)))
    setStatus("finished")
    setActiveIndex(null)
  }

  const handleCellClick = (index: number) => {
    if (status !== "running") return
    if (activeIndex === null) return

    if (index === activeIndex) {
      const newHit = hitCount + 1
      setHitCount(newHit)

      if (newHit >= TARGET_HITS) {
        finishTest()
      } else {
        spawnNextLight(activeIndex)
      }
    } else {
      setFailCount((prev) => prev + 1)
    }
  }

  const renderGrid = () => {
    const cells = [] as React.ReactNode[]
    const totalCells = GRID_SIZE * GRID_SIZE

    for (let i = 0; i < totalCells; i++) {
      const isActive = status === "running" && i === activeIndex
      cells.push(
        <button
          key={i}
          className={`three-cell ${isActive ? "three-cell--active" : ""}`}
          onClick={() => handleCellClick(i)}
        />
      )
    }

    return <div className="three-grid">{cells}</div>
  }

  return (
    <div className="three-wrapper">
      <h2 className="three-title">3×3 버튼누르기 (초)</h2>

      <section className="three-guide">
        <h3>검사 개요</h3>
        <ul>
          <li>3×3 버튼판(총 9개) 위에 파란 불빛이 무작위로 켜집니다.</li>
          <li>파란 불빛이 켜질 때마다 빠르게 버튼을 눌러 불을 끕니다.</li>
          <li>
            총 <strong>{TARGET_HITS}번</strong>의 파란 불을 끄는 데 걸린 시간을 기록합니다.
          </li>
        </ul>
      </section>

      <section className="three-panel">
        <div className="three-stat">
          <span className="three-label">상태</span>
          <span className="three-value">
            {status === "idle" && "대기 중"}
            {status === "running" && "검사 진행 중"}
            {status === "finished" && "검사 종료"}
          </span>
        </div>
        <div className="three-stat">
          <span className="three-label">성공 횟수</span>
          <span className="three-value">
            {hitCount} / {TARGET_HITS}
          </span>
        </div>
        <div className="three-stat">
          <span className="three-label">실패(잘못 누른 횟수)</span>
          <span className="three-value">{failCount} 회</span>
        </div>
        <div className="three-stat">
          <span className="three-label">경과 시간</span>
          <span className="three-value">
            {status === "running" && startTimeRef.current
              ? `${(((performance.now() - startTimeRef.current) / 1000)).toFixed(2)} 초`
              : elapsedTimeSec !== null
              ? `${elapsedTimeSec.toFixed(3)} 초`
              : "-"}
          </span>
        </div>
      </section>

      <div className="three-controls">
        {status !== "running" && (
          <button className="three-btn three-btn--primary" onClick={handleStart}>
            {status === "finished" ? "다시 검사하기" : "검사 시작"}
          </button>
        )}
        {status === "running" && (
          <button className="three-btn three-btn--secondary" onClick={handleReset}>
            중단 / 초기화
          </button>
        )}
      </div>

      {renderGrid()}

      {status === "finished" && (
        <section className="three-result">
          <h3>검사 결과</h3>
          <p>
            총 <strong>{TARGET_HITS}회</strong> 터치 시간: {" "}
            <strong>{elapsedTimeSec !== null ? `${elapsedTimeSec.toFixed(3)} 초` : "-"}</strong>
          </p>
          <p>
            실패(잘못 누른 횟수): <strong>{failCount} 회</strong>
          </p>
          <p className="three-note">
            실제 국민체력 100 측정에서는 0.1초 단위로 기록하지만, 웹에서는 좀 더 정확히 측정한 뒤 표시 자리수를 조절할 수 있습니다.
          </p>
        </section>
      )}
    </div>
  )
}

export default ThreeByThreeButtonTimeTest
