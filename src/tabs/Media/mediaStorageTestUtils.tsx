import { ReactElement } from "react"
import { render } from "@testing-library/react"
import {
  MediaStorageContext,
  MediaStorageContextType,
} from "./MediaStorageContext"

export function createMediaStorageContext(
  overrides: Partial<MediaStorageContextType> = {},
): MediaStorageContextType {
  return {
    books: [],
    games: [],
    bookSeries: [],
    gameSeries: [],
    authors: [],
    isLoading: false,
    addMedia: jest.fn(),
    addMediaSeries: jest.fn(),
    updateMedia: jest.fn(),
    updateMediaSeries: jest.fn(),
    deleteMedia: jest.fn(),
    moveMedia: jest.fn(),
    ...overrides,
  }
}

export function renderWithMediaStorage(
  ui: ReactElement,
  overrides: Partial<MediaStorageContextType> = {},
) {
  const storageContext = createMediaStorageContext(overrides)
  const result = render(
    <MediaStorageContext.Provider value={storageContext}>
      {ui}
    </MediaStorageContext.Provider>,
  )
  return { ...result, storageContext }
}
