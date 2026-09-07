import { MediaList, ReadingItemDetails } from "../types"
import { Author } from "./Author"
import { Book } from "./Book"
import { Series } from "./Series"

export function getComponent<T extends ReadingItemDetails>(
  item: T,
  list: MediaList,
) {
  switch (item.type) {
    case "book":
      return <Book book={item} list={list} />
    case "author":
      return <Author author={item} />
    case "series":
      return <Series series={item} list={list} />
  }
}
