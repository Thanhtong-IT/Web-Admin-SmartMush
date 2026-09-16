/**
 * Hồ sơ ngưỡng vi khí hậu theo từng giống nấm.
 * Mỗi tầng nuôi trồng ở chế độ AUTO sẽ đồng bộ theo profile của giống nấm
 * đang được gán trên khay.
 */
export interface MushroomThresholdProfile {
  id: string
  /** Tên loại nấm (vd: "Nấm Bào Ngư Xám") */
  mushroomType: string
  /** Tên gợi nhớ của profile */
  name: string
  /** Chu kỳ gói (tuần) — dùng để hiển thị và đồng bộ với Pricing Model */
  cycleWeeks: number
  /** Dải nhiệt độ (°C) */
  tempMin: number
  tempMax: number
  /** Dải độ ẩm không khí (%RH) */
  humidityMin: number
  humidityMax: number
  /** Ngưỡng CO₂ an toàn (ppm) */
  co2Max: number
  /** Dải độ ẩm cơ chất / giá thể (%) */
  soilMoistureMin: number
  soilMoistureMax: number
  isDefault: boolean
  updatedAt: string
}

export type ThresholdProfileInput = Omit<
  MushroomThresholdProfile,
  'id' | 'isDefault' | 'updatedAt'
>
