"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen } from "lucide-react"

export interface BasicInfoFormProps {
  age: string
  ageMonths?: string
  gender: string
  height: string
  weight: string
  waist: string
  bmi: string
  ageGroup: string
  ageWarning: string | null
  showAgeMonths?: boolean
  onChange: (field: "age"|"ageMonths"|"gender"|"height"|"weight"|"waist", value: string) => void
  onOpenWaistGuide: () => void
}

export function BasicInfoForm({
  age, ageMonths, gender, height, weight, waist, bmi,
  ageGroup, ageWarning, showAgeMonths,
  onChange, onOpenWaistGuide,
}: BasicInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
        <CardDescription>체력 분석에 필요한 기본 정보를 입력해주세요 (모든 항목 필수)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Row 1: default 1:1 (age:gender), infant 1:1:2 (age:months:gender) */}
        <div className={`grid gap-6 ${showAgeMonths ? 'md:grid-cols-4' : 'md:grid-cols-2'}`}>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="age">만 나이</Label>
            <Input id="age" type="number" placeholder="예: 30" value={age} onChange={(e) => onChange("age", e.target.value)} />
          </div>
          {showAgeMonths && (
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="ageMonths">개월 수</Label>
              <Input
                id="ageMonths"
                type="number"
                placeholder="0–90"
                min={0}
                max={90}
                value={ageMonths || ""}
                onChange={(e) => onChange("ageMonths", e.target.value)}
              />
            </div>
          )}
          <div className={`space-y-2 ${showAgeMonths ? 'md:col-span-2' : 'md:col-span-1'}`}>
            <Label htmlFor="gender">성별</Label>
            <select
              id="gender"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={gender}
              onChange={(e) => onChange("gender", e.target.value)}
            >
              <option value="">선택하세요</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
          </div>
          {showAgeMonths && (
            <div className="md:col-span-4 -mt-4">
              <p className="text-xs text-muted-foreground">유아기(만 4–6세)는 개월 수(0–90)를 함께 입력해주세요.</p>
            </div>
          )}
        </div>

        {/* Row 2+: Other fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="height">신장 (cm)</Label>
            <Input id="height" type="number" step="0.1" placeholder="예: 170.5" value={height} onChange={(e) => onChange("height", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">체중 (kg)</Label>
            <Input id="weight" type="number" step="0.1" placeholder="예: 65.5" value={weight} onChange={(e) => onChange("weight", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist">허리둘레 (cm)</Label>
            <div className="flex items-center gap-2">
              <Input id="waist" type="number" step="0.1" placeholder="예: 80.0" value={waist} onChange={(e) => onChange("waist", e.target.value)} />
              <Button type="button" variant="outline" size="icon" className="h-9 w-9 bg-transparent" onClick={onOpenWaistGuide} title="허리둘레 측정 가이드">
                <BookOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bmi">BMI (kg/㎡)</Label>
            <Input id="bmi" type="text" value={bmi} readOnly placeholder="신장/체중으로 자동 계산" />
          </div>
        </div>
        {ageWarning && (
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">{ageWarning}</p>
          </div>
        )}
        {ageGroup && (
          <div className="rounded-md bg-primary/10 p-4">
            <p className="text-sm font-medium text-primary">연령대: {ageGroup} (만 {age}세)</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
