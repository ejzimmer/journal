import { BOOKS_KEY, ReadingItemDetails } from "../types"
import { Author } from "./Author"
import { Book } from "./Book"
import { Series } from "./Series"

export function getComponent<T extends ReadingItemDetails>(
  item: T,
  path: string = BOOKS_KEY
) {
  switch (item.type) {
    case "book":
      return <Book book={item} path={path} />
    case "author":
      return <Author author={item} />
    case "series":
      return <Series series={item} path={path} />
  }
}
