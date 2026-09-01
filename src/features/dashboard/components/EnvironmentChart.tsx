import { Card, Typography } from 'antd'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface EnvironmentDataPoint {
  time: string
  temperature: number
  humidity: number
}

const ENVIRONMENT_DATA: EnvironmentDataPoint[] = [
  { time: '00:00', temperature: 23.8, humidity: 90 },
  { time: '02:00', temperature: 23.3, humidity: 92 },
  { time: '04:00', temperature: 22.9, humidity: 93 },
  { time: '06:00', temperature: 23.5, humidity: 91 },
  { time: '08:00', temperature: 24.6, humidity: 88 },
  { time: '10:00', temperature: 25.4, humidity: 85 },
  { time: '12:00', temperature: 26.2, humidity: 82 },
  { time: '14:00', temperature: 26.8, humidity: 80 },
  { time: '16:00', temperature: 26.1, humidity: 83 },
  { time: '18:00', temperature: 25.2, humidity: 86 },
  { time: '20:00', temperature: 24.7, humidity: 88 },
  { time: '22:00', temperature: 24.2, humidity: 89 },
  { time: 'Hiện tại', temperature: 25.6, humidity: 87 },
]

interface EnvironmentChartProps {
  data?: EnvironmentDataPoint[]
}

export function EnvironmentChart({ data = ENVIRONMENT_DATA }: EnvironmentChartProps) {
  return (
    <Card
      title="Biến động môi trường"
      extra={<Typography.Text type="secondary">24 giờ qua</Typography.Text>}
    >
      <ResponsiveContainer width="100%" height={360}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis
            yAxisId="temperature"
            domain={[20, 30]}
            unit="°C"
            width={52}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            yAxisId="humidity"
            orientation="right"
            domain={[70, 100]}
            unit="%"
            width={48}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="temperature"
            type="monotone"
            dataKey="temperature"
            name="Nhiệt độ (°C)"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="humidity"
            type="monotone"
            dataKey="humidity"
            name="Độ ẩm (%)"
            stroke="#0f766e"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
