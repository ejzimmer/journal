import { StatusOption } from "../StatusField"
import { BookDetails } from "../types"

export type BookStatus = "unread" | "reading" | "listening" | "read"

export const BOOK_STATUS_OPTIONS: StatusOption<BookStatus>[] = [
  { value: "unread", emoji: "📕", label: "Not started" },
  { value: "reading", emoji: "📖", label: "Reading" },
  { value: "listening", emoji: "🎧", label: "Listening" },
  { value: "read", emoji: "✔️", label: "Read" },
]

export const getBookStatus = ({ isDone, medium }: BookDetails): BookStatus => {
  if (isDone) return "read"
  if (medium === "📖") return "reading"
  if (medium === "🎧") return "listening"
  return "unread"
}

export const convertFromBookStatus = (
  status: BookStatus,
): Pick<BookDetails, "medium" | "isDone"> => ({
  medium: status === "reading" ? "📖" : status === "listening" ? "🎧" : null,
  isDone: status === "read",
})
