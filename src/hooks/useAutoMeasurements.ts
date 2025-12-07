import { useEffect } from "react"

export interface AutoMeasurementParams {
  height: string
  weight: string
  age: string
  measurementValues: Record<string, string>
  setMeasurementValues: (fn: (prev: Record<string, string>) => Record<string, string>) => void
}

export function useAutoMeasurements({ height, weight, age, measurementValues, setMeasurementValues }: AutoMeasurementParams) {
  // WHtR 자동 계산
  useEffect(() => {
    const h = Number.parseFloat(height)
    const wa = Number.parseFloat(measurementValues["4"] || "")
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (h > 0 && wa > 0) {
        next["42"] = (wa / h).toFixed(3)
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "42")) {
          delete next["42"]
        }
      }
      return next
    })
  }, [height, measurementValues["4"]])

  // BMI 자동 계산
  useEffect(() => {
    const h = Number.parseFloat(height)
    const w = Number.parseFloat(weight)
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (h > 0 && w > 0) {
        const bmi = (w / Math.pow(h / 100, 2))
        const formatted = Number.isFinite(bmi) ? bmi.toFixed(1) : ""
        if (next["18"] !== formatted) next["18"] = formatted
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "18")) delete next["18"]
      }
      return next
    })
  }, [height, weight])

  // 절대악력 자동 계산
  useEffect(() => {
    const left = Number.parseFloat(measurementValues["7"] || "")
    const right = Number.parseFloat(measurementValues["8"] || "")
    const hasLeft = !Number.isNaN(left) && left > 0;
    const hasRight = !Number.isNaN(right) && right > 0;
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (hasLeft || hasRight) {
        const absGrip = Math.max(hasLeft ? left : 0, hasRight ? right : 0)
        const formatted = absGrip.toFixed(1)
        if (next["52"] !== formatted) next["52"] = formatted
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "52")) {
          delete next["52"]
        }
      }
      return next
    })
  }, [measurementValues["7"], measurementValues["8"]])

  // 상대악력 자동 계산
  useEffect(() => {
    const absGrip = Number.parseFloat(measurementValues["52"] || "")
    const w = Number.parseFloat(weight)
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (absGrip > 0 && w > 0) {
        next["28"] = ((absGrip / w) * 100).toFixed(1)
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "28")) {
          delete next["28"]
        }
      }
      return next
    })
  }, [measurementValues["52"], weight])

  // VO₂max 자동 계산
  const shuttleCountToSpeed = (count: number) => {
    if (!Number.isFinite(count) || count <= 0) return 0
    let remaining = count
    let level = 1
    const firstLevelShuttles = 7
    if (remaining <= firstLevelShuttles) {
      const pos = remaining
      const frac = (pos - 1) / firstLevelShuttles
      return 8.0 + frac * 0.5
    }
    remaining -= firstLevelShuttles
    level = 2
    const perLevel = 8
    while (remaining > perLevel) {
      remaining -= perLevel
      level += 1
      if (level > 50) break
    }
    const posInLevel = Math.max(1, remaining)
    const baseSpeed = 8.0 + (level - 1) * 0.5
    const frac = (posInLevel - 1) / perLevel
    return baseSpeed + frac * 0.5
  }

  useEffect(() => {
    const count = Number.parseInt(measurementValues["20"] || "")
    const v = shuttleCountToSpeed(Number.isNaN(count) ? 0 : count)
    setMeasurementValues((prev) => {
      const next = { ...prev }
      if (v > 0) {
        const vo2 = 5.857 * v - 19.458
        next["30"] = Number.isFinite(vo2) ? vo2.toFixed(1) : ""
      } else {
        if (Object.prototype.hasOwnProperty.call(next, "30")) delete next["30"]
      }
      return next
    })
  }, [measurementValues["20"], age])
}
