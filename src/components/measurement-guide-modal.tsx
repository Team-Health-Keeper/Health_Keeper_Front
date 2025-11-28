"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Guide = {
  title: string
  materials?: string
  steps: string[]
  note?: string
  images: { src: string; alt?: string }[]
}

const base = "https://nfa.kspo.or.kr"

const guides: Record<string, Guide> = {
  waist: {
    title: "허리둘레 측정법(공통)",
    materials: "줄자",
    steps: [
      "배꼽 위치를 파악한다.",
      "바른자세로 편안하게 호흡하면서 허리둘레를 줄자로 실측한다.",
    ],
    note: "자가로 실측을 할 때는 맨몸으로 실시하는 것을 권장한다.",
    images: [
      { src: `${base}/common/images/sub/self_measure_ctgy01-1.jpg`, alt: "배꼽 위치 파악" },
      { src: `${base}/common/images/sub/self_measure_ctgy01-2.jpg`, alt: "허리둘레 줄자로 실측" },
    ],
  },
  "chair-stand": {
    title: "근지구력(30초 의자 앉았다 일어서기) - 어르신",
    materials: "팔걸이 없는 의자",
    steps: [
      "의자에 앉아서 양팔을 십자모양으로 교차하여 가슴 앞에 모으고, 두손은 어깨 위에 올린다",
      "30초 동안 의자에서 앉았다 일어설 때 무릎, 허리, 등을 곧게 펴고 완전히 일어섰다 앉는다",
      "30초간 실시한 횟수를 기록한다",
    ],
    images: [
      { src: `${base}/common/images/sub/self_measure_ctgy04-1.jpg`, alt: "시작 자세" },
      { src: `${base}/common/images/sub/self_measure_ctgy04-2.jpg`, alt: "일어서기 자세" },
    ],
  },
  "situps-cross": {
    title: "근지구력(교차윗몸일으키기) - 성인",
    materials: "요가매트",
    steps: [
      "무릎을 굽혀서 등을 대고 눕는다",
      "보조자는 발목을 잡는다(보조자가 없을 경우, 발걸이를 이용한다)",
      "양팔은 십자모양으로 교차하여 가슴 앞에 모으고, 두 손은 어깨 위에 올린다",
      "시작 신호에 따라 상체를 일으켜 양 팔꿈치가 허벅지(넓적다리)에 닿도록 하고, 다음으로 양쪽 등과 어깨를 바닥에 닿도록 눕는다",
      "양쪽 팔꿈치가 허벅지(넓적다리)에 닿았을 때 1회로 인정하며, 1분 동안 실시하여 성공한 횟수를 기록한다",
    ],
    images: [
      { src: `${base}/common/images/sub/self_measure_ctgy02-1.jpg`, alt: "준비 자세" },
      { src: `${base}/common/images/sub/self_measure_ctgy02-2.jpg`, alt: "상체 일으키기" },
      { src: `${base}/common/images/sub/self_measure_ctgy02-3.jpg`, alt: "기구 발걸이 활용" },
    ],
  },
  curlups: {
    title: "근지구력(윗몸말아올리기) - 성인",
    materials: "요가매트",
    steps: [
      "무릎을 굽혀서 등을 대고 눕는다",
      "준비자세는 팔은 곧게 뻗고 손바닥을 허벅지(넓적다리)위에 올려둔다",
      "신호음에 맞춰 손이 허벅지 위로 타고 올라가 상체를 말아 올리고 다음 신호음에 맞춰 머리가 바닥에 닿게 내려온다(3초 간격)",
      "머리가 바닥에 닿았을 때 1회로 인정되며 발바닥이 땅에서 떨어지거나 신호음을 지키지 못하면 측정은 종료되고 그전까지 실시한 총 횟수를 기록한다",
      "익숙하지 않은 동작이기 때문에 측정 전 누운 자세와 말아 올린자세에 대한 연습을 하고 실시한다",
    ],
    note: "상체를 위로 올릴 때 숨을 내쉰다",
    images: [
      { src: `${base}/common/images/sub/self_measure_ctgy03-1.jpg`, alt: "준비 자세" },
      { src: `${base}/common/images/sub/self_measure_ctgy03-2.jpg`, alt: "말아올리기" },
    ],
  },
  ymca: {
    title: "심폐지구력(YMCA 스텝검사) - 성인",
    materials: "간편한 복장, 심박계, 30cm 높이의 스텝박스",
    steps: [
      "가벼운 스트레칭 후, 호흡이 거칠어지지 않은 상태에서 실시한다",
      "3분간 96bpm속도에 맞춰서 계단을 밟고 올라갔다가 내려오기를 반복한다",
      "3분간 측정을 하고 1분간 휴식 후 손목(요골동맥)을 짚어 10초간 심박수를 센다",
      "심박수 횟수에 6을 곱한 값을 기록한다(6을 곱한 값은 1분간 심박수 기록을 말함)",
    ],
    note: "스텝박스 대신 규격(30cm)에 비슷한 계단, 난간, 기구 등 활용 가능",
    images: [
      { src: `${base}/common/images/sub/self_measure_ctgy05-1.jpg`, alt: "스텝박스 올라가기" },
      { src: `${base}/common/images/sub/self_measure_ctgy05-2.jpg`, alt: "스텝박스 위 자세" },
    ],
  },
  "sit-and-reach": {
    title: "유연성(앉아윗몸앞으로굽히기) - 공통",
    materials: "줄자 또는 막대자",
    steps: [
      "무릎을 펴고 앉는다",
      "발뒤꿈치 부위에 줄자의 30cm 시작점이 되도록 하여, 줄자를 양발 사이에 놓는다",
      "무릎을 굽히지 말고, 허리를 굽혀서 양손을 앞으로 뻗는다",
      "양손이 줄자에 닿은 지점을 기록한다",
      "기준선(30cm지점)을 넘으면 양수, 기준선을 넘지 못하면 음수로 하여 기록한다 (예: 33cm → +3cm / 28cm → -2cm)",
    ],
    images: [
      { src: `${base}/common/images/sub/self_measure_ctgy07-1.jpg`, alt: "준비 자세" },
      { src: `${base}/common/images/sub/self_measure_ctgy07-2.jpg`, alt: "앞으로 굽히기" },
      { src: `${base}/common/images/sub/self_measure_ctgy07-3.jpg`, alt: "상단에서 본 자세" },
    ],
  },
}

const idToGuideKey: Record<string, string> = {
  // Basic info
  "4": "waist",
  // Measurements
  "23": "chair-stand",
  "19": "situps-cross",
  "9": "situps-cross", // 일반 윗몸과 교차윗몸 가이드가 유사하므로 교차 가이드로 연결
  "12": "sit-and-reach",
  "36": "ymca",
  "37": "ymca",
}

export function guideKeyForMeasurement(id: string): string | null {
  return idToGuideKey[id] ?? null
}

export function hasGuideForMeasurement(id: string): boolean {
  return !!guideKeyForMeasurement(id)
}

export function MeasurementGuideModal({
  isOpen,
  onClose,
  guideKey,
}: {
  isOpen: boolean
  onClose: () => void
  guideKey: string | null
}) {
  if (!guideKey) return null
  const guide = guides[guideKey]
  if (!guide) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl gap-4">
        <DialogHeader>
          <DialogTitle className="text-xl">{guide.title}</DialogTitle>
        </DialogHeader>
        {guide.materials && (
          <div className="rounded-md bg-gray-50 px-4 py-2 text-sm text-gray-700">준비물: {guide.materials}</div>
        )}
        <div className="grid gap-3">
          {guide.steps && guide.steps.length > 0 && (
            <ol className="ml-4 list-decimal space-y-2 text-sm text-gray-800">
              {guide.steps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>
          )}
          {guide.note && <div className="text-xs text-gray-500">* {guide.note}</div>}
        </div>
        {guide.images && guide.images.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {guide.images.map((img, i) => (
              <div key={i} className="overflow-hidden rounded-lg border">
                <img src={img.src} alt={img.alt ?? guide.title} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
