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
  seriesIn: (list: MediaList) => ListParent[]

  addToList: <T extends MediaItem>(list: MediaList, item: Omit<T, "id">) => void
  updateInList: <T extends { id: string }>(list: MediaList, item: T) => void
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

const rootKey = (root: MediaRoot) => (root === "books" ? BOOKS_KEY : GAMES_KEY)

const parentsOf = ({ author, series }: MediaList) => {
  const parents: { type: ParentType; parent: ListParent }[] = []
  if (author) parents.push({ type: "author", parent: author })
  if (series) parents.push({ type: "series", parent: series })
  return parents
}

const childrenOf = (item?: MediaItem) =>
  item?.type === "author" || item?.type === "series"
    ? (item.items as Record<string, MediaItem> | undefined)
    : undefined

const hasChildrenBesides = (
  children: Record<string, MediaItem> | undefined,
  leavingId: string,
) => Object.keys(children ?? {}).some((id) => id !== leavingId)

const isParentOf = (list: MediaList | undefined, { id }: ListParent) =>
  list?.author?.id === id || list?.series?.id === id

export function MediaStorageProvider({ children }: { children: ReactNode }) {
  const { addItem, updateItem, deleteItem, moveItemBetweenLists, useValue } =
    useStorageContext()

  const { value: books, loading: booksLoading } =
    useValue<Record<string, ReadingItemDetails>>(BOOKS_KEY)
  const { value: games, loading: gamesLoading } =
    useValue<Record<string, PlayingItemDetails>>(GAMES_KEY)

  const itemsIn = (list: MediaList) => {
    let items = (list.root === "books" ? books : games) as
      Record<string, MediaItem> | undefined

    for (const { parent } of parentsOf(list)) {
      items = childrenOf(items?.[parent.id])
    }

    return items
  }

  const parentsIn = (list: MediaList, type: ParentType): ListParent[] =>
    Object.values(itemsIn(list) ?? {})
      .filter((item): item is ParentItem => item.type === type)
      .map(({ id, name }) => ({ id, name }))

  const pathTo = (list: MediaList) =>
    parentsOf(list).reduce(
      (path, { parent }) => `${path}/${parent.id}/items`,
      rootKey(list.root),
    )

  const upsertPathTo = (list: MediaList) =>
    parentsOf(list).reduce((path, { type, parent }) => {
      const id = parent.id || addItem(path, { type, name: parent.name })
      return `${path}/${id}/items`
    }, rootKey(list.root))

  const parentChain = (list: MediaList) => {
    const chain: {
      parent: ListParent
      list: MediaList
      children?: Record<string, MediaItem>
    }[] = []
    let containing: MediaList = { root: list.root }

    for (const { type, parent } of parentsOf(list)) {
      chain.push({
        parent,
        list: containing,
        children: childrenOf(itemsIn(containing)?.[parent.id]),
      })
      containing = { ...containing, [type]: parent }
    }

    return chain
  }

  const parentEmptiedBy = (from: MediaList, itemId: string, to?: MediaList) => {
    const chain = parentChain(from)
    let emptied: { list: MediaList; parent: ListParent } | undefined

    for (let index = chain.length - 1; index >= 0; index -= 1) {
      const { parent, list, children } = chain[index]
      const leavingId =
        index === chain.length - 1 ? itemId : chain[index + 1].parent.id

      if (isParentOf(to, parent) || hasChildrenBesides(children, leavingId)) {
        break
      }
      emptied = { list, parent }
    }

    return emptied
  }

  const removeEmptied = (from: MediaList, itemId: string, to?: MediaList) => {
    const emptied = parentEmptiedBy(from, itemId, to)
    if (emptied) deleteItem(pathTo(emptied.list), emptied.parent)
    return !!emptied
  }

  const value: MediaStorageContextType = {
    books,
    games,
    isLoading: booksLoading || gamesLoading,

    authors: parentsIn({ root: "books" }, "author"),
    seriesIn: (list) => parentsIn(list, "series"),

    addToList: (list, item) => {
      addItem(upsertPathTo(list), item)
    },
    updateInList: (list, item) => {
      updateItem(pathTo(list), item)
    },
    removeFromList: (list, item) => {
      if (!removeEmptied(list, item.id)) deleteItem(pathTo(list), item)
    },
    moveToList: (item, from, to) => {
      const targetPath = upsertPathTo(to)
      const sourcePath = pathTo(from)

      if (targetPath === sourcePath) {
        updateItem(sourcePath, item)
        return
      }

      moveItemBetweenLists({
        movedItem: item,
        sourceListId: sourcePath,
        targetListId: targetPath,
      })
      removeEmptied(from, item.id, to)
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
