'use client'

import ReactECharts from 'echarts-for-react'
import 'echarts-wordcloud'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const WordCloudChart = () => {
  const option = {
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '70%',
      height: '80%',
      right: null,
      bottom: null,
      sizeRange: [10, 45],
      rotationRange: [0, 0],
      rotationStep: 0,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function () {
          const hue = Math.random() * 60 + 180  
          const saturation = Math.round(40 + Math.random() * 30)  
          const lightness = Math.round(40 + Math.random() * 30)   
          return `hsl(${hue}, ${saturation}%, ${lightness}%)`
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: [
        { name: '时尚', value: 100 },
        { name: '潮流', value: 95 },
        { name: '休闲', value: 90 },
        { name: '简约', value: 85 },
        { name: '舒适', value: 80 },
        { name: '百搭', value: 75 },
        { name: '高级感', value: 70 },
        { name: '复古', value: 60 },
        { name: '优雅', value: 50 },
        { name: '运动', value: 45 },
        { name: '商务', value: 65 },
        { name: '个性', value: 55 },
      ]
    }]
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Keyword distribution</CardTitle>
        <CardDescription>User feedback keywords</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="h-[300px] w-full">
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
          />
        </div>
      </CardContent>
    </Card>
  )
}