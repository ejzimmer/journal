import { getInitialBalances, getMonthlyBalances } from "./utils"

const yarnState = {
  acrylic: {
    history: [{ balance: 189, date: new Date("2026-01-01").getTime() }],
    id: "acrylic",
  },
  cotton: {
    history: [{ balance: 850, date: new Date("2026-01-01").getTime() }],
    id: "cotton",
  },
  "sock yarn": {
    history: [
      { balance: 2519, date: new Date("2026-01-01").getTime() },
      { balance: 2471, date: new Date("2026-01-21").getTime() },
      { balance: 1121, date: new Date("2026-02-01").getTime() },
      { balance: 957, date: new Date("2026-02-16").getTime() },
    ],
    id: "sock yarn",
  },
  wool: {
    history: [
      { balance: 3347, date: new Date("2026-01-01").getTime() },
      { balance: 3547, date: new Date("2026-03-07").getTime() },
    ],
    id: "wool",
  },
}

describe("getInitialBalances", () => {
  it("gets initial balances", () => {
    expect(getInitialBalances(yarnState)).toEqual({
      total: 6905,
      perYarnType: {
        acrylic: 189,
        cotton: 850,
        "sock yarn": 2519,
        wool: 3347,
      },
    })
  })
})

describe("getMonthlyBalances", () => {
  it("returns the balances per month", () => {
    expect(getMonthlyBalances(yarnState)).toEqual([
      {
        perYarnType: {
          acrylic: 189,
          cotton: 850,
          "sock yarn": 2471,
          wool: 3347,
        },
        total: 6857,
      },
      {
        perYarnType: {
          acrylic: 189,
          cotton: 850,
          "sock yarn": 957,
          wool: 3347,
        },
        total: 5343,
      },
      {
        perYarnType: {
          acrylic: 189,
          cotton: 850,
          "sock yarn": 957,
          wool: 3547,
        },
        total: 5543,
      },
    ])
  })
})
