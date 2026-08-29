import { normalizeDailyData, normalizeDayId } from "./utils"

describe("normalizeDayId", () => {
  it("leaves a canonical yyyy-mm-dd id unchanged", () => {
    expect(normalizeDayId("2026-08-29")).toEqual("2026-08-29")
  })

  it("assumes 2026 for a legacy day+month id", () => {
    expect(normalizeDayId("29Aug")).toEqual("2026-08-29")
    expect(normalizeDayId("5Jan")).toEqual("2026-01-05")
  })

  it("leaves an unrecognised id unchanged", () => {
    expect(normalizeDayId("not-a-day")).toEqual("not-a-day")
  })
})

describe("normalizeDailyData", () => {
  it("returns an empty object for undefined data", () => {
    expect(normalizeDailyData(undefined)).toEqual({})
  })

  it("rekeys legacy entries onto their 2026 canonical id", () => {
    const data = { "29Aug": { id: "29Aug", consumed: 1800, expended: 2200 } }

    expect(normalizeDailyData(data)).toEqual({
      "2026-08-29": { id: "2026-08-29", consumed: 1800, expended: 2200 },
    })
  })

  it("leaves already-canonical entries as they are", () => {
    const data = {
      "2026-08-29": { id: "2026-08-29", consumed: 1800, expended: 2200 },
    }

    expect(normalizeDailyData(data)).toEqual(data)
  })

  it("prefers the canonical entry's fields when both exist for the same day", () => {
    const data = {
      "29Aug": { id: "29Aug", consumed: 1800, expended: 2200 },
      "2026-08-29": { id: "2026-08-29", consumed: 1900 },
    }

    expect(normalizeDailyData(data)).toEqual({
      "2026-08-29": { id: "2026-08-29", consumed: 1900, expended: 2200 },
    })
  })
})
