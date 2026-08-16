import { getHistoryByMonth } from "./utils"

describe("getHistoryByMonth", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns returns the total of each yarn type per month", () => {
    jest.setSystemTime(new Date("2026-03-11"))

    const yarnState = {
      sockYarn: {
        id: "sockYarn",
        history: {
          "26-01": 123,
          "26-02": 544,
          "26-03": 487,
        },
      },
      wool: {
        id: "wool",
        history: {
          "26-01": 222,
          "26-02": 566,
          "26-03": 444,
        },
      },
    }

    expect(getHistoryByMonth(yarnState)).toEqual({
      "26-01": {
        month: "26-01",
        total: 345,
        subTotals: { sockYarn: 123, wool: 222 },
      },
      "26-02": {
        month: "26-02",
        total: 1110,
        subTotals: { sockYarn: 544, wool: 566 },
      },
      "26-03": {
        month: "26-03",
        total: 931,
        subTotals: { sockYarn: 487, wool: 444 },
      },
    })
  })

  describe("when there is no data for a specific month", () => {
    it("returns the data for the previous month", () => {
      jest.setSystemTime(new Date("2026-09-04"))
      const yarnState = {
        sockYarn: {
          id: "sockYarn",
          history: {
            "26-01": 123,
            "26-02": 544,
            "26-08": 487,
          },
        },
        wool: {
          id: "wool",
          history: {
            "26-01": 222,
            "26-02": 566,
            "26-07": 444,
          },
        },
      }

      expect(getHistoryByMonth(yarnState)).toEqual({
        "26-01": {
          month: "26-01",
          total: 345,
          subTotals: { sockYarn: 123, wool: 222 },
        },
        "26-02": {
          month: "26-02",
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        "26-03": {
          month: "26-03",
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        "26-04": {
          month: "26-04",
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        "26-05": {
          month: "26-05",
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        "26-06": {
          month: "26-06",
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        "26-07": {
          month: "26-07",
          total: 988,
          subTotals: { sockYarn: 544, wool: 444 },
        },
        "26-08": {
          month: "26-08",
          total: 931,
          subTotals: { sockYarn: 487, wool: 444 },
        },
        "26-09": {
          month: "26-09",
          total: 931,
          subTotals: { sockYarn: 487, wool: 444 },
        },
      })
    })
  })
})
