import { createContext, ReactNode, useContext } from "react"
import { useStorageContext } from "../../shared/FirebaseContext"
import {
  BOOKS_KEY,
  GAMES_KEY,
  ListParent,
  MediaList,
  MediaRoot,
  PlayingItemDetails,
  ReadingItemDetails,
} from "./types"

type MediaItem = ReadingItemDetails | PlayingItemDetails
type ParentType = "author" | "series"
type ParentItem = Extract<MediaItem, { type: ParentType }>

export type MediaStorageContextType = {
  books?: Record<string, ReadingItemDetails>
  games?: Record<string, PlayingItemDetails>
  isLoading: boolean

  authors: ListParent[]
  getSeriesInList: (list: MediaList) => ListParent[]

  addToList: <T extends MediaItem>(list: MediaList, item: Omit<T, "id">) => void
  updateItem: <T extends { id: string }>(list: MediaList, item: T) => void
  removeFromList: <T extends { id: string }>(list: MediaList, item: T) => void
  moveToList: <T extends { id: string }>(
    item: T,
    from: MediaList,
    to: MediaList,
  ) => void
}

export const MediaStorageContext = createContext<
  MediaStorageContextType | undefined
>(undefined)

const getRootKey = (root: MediaRoot) =>
  root === "books" ? BOOKS_KEY : GAMES_KEY

const getListParents = ({ author, series }: MediaList) => {
  const parents: { type: ParentType; parent: ListParent }[] = []
  if (author) parents.push({ type: "author", parent: author })
  if (series) parents.push({ type: "series", parent: series })
  return parents
}

const getChildren = (item?: MediaItem) =>
  item?.type === "author" || item?.type === "series"
    ? (item.items as Record<string, MediaItem> | undefined)
    : undefined

const hasChildrenBesides = (
  children: Record<string, MediaItem> | undefined,
  leavingId: string,
) => Object.keys(children ?? {}).some((id) => id !== leavingId)

const hasParent = (list: MediaList | undefined, { id }: ListParent) =>
  list?.author?.id === id || list?.series?.id === id

export function MediaStorageProvider({ children }: { children: ReactNode }) {
  const {
    addItem: addAtPath,
    updateItem: updateAtPath,
    deleteItem: deleteAtPath,
    moveItemBetweenLists,
    useValue,
  } = useStorageContext()

  const { value: books, loading: booksLoading } =
    useValue<Record<string, ReadingItemDetails>>(BOOKS_KEY)
  const { value: games, loading: gamesLoading } =
    useValue<Record<string, PlayingItemDetails>>(GAMES_KEY)

  const getItems = (list: MediaList) => {
    let items = (list.root === "books" ? books : games) as
      Record<string, MediaItem> | undefined

    for (const { parent } of getListParents(list)) {
      items = getChildren(items?.[parent.id])
    }

    return items
  }

  const getParentsInList = (list: MediaList, type: ParentType): ListParent[] =>
    Object.values(getItems(list) ?? {})
      .filter((item): item is ParentItem => item.type === type)
      .map(({ id, name }) => ({ id, name }))

  const getPath = (list: MediaList) =>
    getListParents(list).reduce(
      (path, { parent }) => `${path}/${parent.id}/items`,
      getRootKey(list.root),
    )

  const upsertPath = (list: MediaList) =>
    getListParents(list).reduce((path, { type, parent }) => {
      const id = parent.id || addAtPath(path, { type, name: parent.name })
      return `${path}/${id}/items`
    }, getRootKey(list.root))

  const getParentChain = (list: MediaList) => {
    const chain: {
      parent: ListParent
      list: MediaList
      children?: Record<string, MediaItem>
    }[] = []
    let containing: MediaList = { root: list.root }

    for (const { type, parent } of getListParents(list)) {
      chain.push({
        parent,
        list: containing,
        children: getChildren(getItems(containing)?.[parent.id]),
      })
      containing = { ...containing, [type]: parent }
    }

    return chain
  }

  const getEmptiedParent = (
    from: MediaList,
    itemId: string,
    to?: MediaList,
  ) => {
    const chain = getParentChain(from)
    let emptied: { list: MediaList; parent: ListParent } | undefined

    for (let index = chain.length - 1; index >= 0; index -= 1) {
      const { parent, list, children } = chain[index]
      const leavingId =
        index === chain.length - 1 ? itemId : chain[index + 1].parent.id

      if (hasParent(to, parent) || hasChildrenBesides(children, leavingId)) {
        break
      }
      emptied = { list, parent }
    }

    return emptied
  }

  const removeEmptiedParent = (
    from: MediaList,
    itemId: string,
    to?: MediaList,
  ) => {
    const emptied = getEmptiedParent(from, itemId, to)
    if (emptied) deleteAtPath(getPath(emptied.list), emptied.parent)
    return !!emptied
  }

  const value: MediaStorageContextType = {
    books,
    games,
    isLoading: booksLoading || gamesLoading,

    authors: getParentsInList({ root: "books" }, "author"),
    getSeriesInList: (list) => getParentsInList(list, "series"),

    addToList: (list, item) => {
      addAtPath(upsertPath(list), item)
    },
    updateItem: (list, item) => {
      updateAtPath(getPath(list), item)
    },
    removeFromList: (list, item) => {
      if (!removeEmptiedParent(list, item.id)) deleteAtPath(getPath(list), item)
    },
    moveToList: (item, from, to) => {
      const targetPath = upsertPath(to)
      const sourcePath = getPath(from)

      if (targetPath === sourcePath) {
        updateAtPath(sourcePath, item)
        return
      }

      moveItemBetweenLists({
        movedItem: item,
        sourceListId: sourcePath,
        targetListId: targetPath,
      })
      removeEmptiedParent(from, item.id, to)
    },
  }

  return (
    <MediaStorageContext.Provider value={value}>
      {children}
    </MediaStorageContext.Provider>
  )
}

export function useMediaStorage(): MediaStorageContextType {
  const context = useContext(MediaStorageContext)
  if (!context) {
    throw new Error("missing MediaStorageContext provider")
  }
  return context
}
