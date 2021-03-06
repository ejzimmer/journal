export interface TodoItem {
  id: string
  description: string
  type: Category
  done?: number | false
  position: number
  frequency?: string
}

export const COLOURS = {
  "๐งน": "hsl(180 20% 90%)",
  "โ๏ธ": "hsl(340 90% 90%)",
  "๐ดโโ๏ธ": "hsl(120 70% 85%)",
  "๐ฐ": "hsl(100 50% 85%)",
  "๐ชก": "hsl(250 50% 90%)",
  "๐งถ": "hsl(80 50% 90%)",
  "๐๏ธ": "hsl(30 50% 90%)",
  "๐": "hsl(60 50% 90%)",
  "๐พ": "hsl(300 50% 90%)",
  "๐๏ธ": "hsl(50 50% 90%)",
  "๐ฉโ๐ป": "hsl(160 50% 90%)",
}
export type Category = keyof typeof COLOURS
