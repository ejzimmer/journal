import { ChangeEvent } from "react"
import { Category, COLOURS, TodoItem } from "./types"
import { isToday } from "date-fns"
import { SlArrowDown } from "react-icons/sl"
import { MoveToMenuItem } from "./MoveToMenuItem"

import { Menu } from "../../../shared/controls/Menu"

interface Props {
  item: TodoItem
  currentList?: string
  otherLists?: string[]
  onChange: (item: TodoItem) => void
  onDelete: (item: TodoItem) => void
  onMoveToTop: () => void
}

export function Item({
  item,
  otherLists = [],
  currentList,
  onChange,
  onDelete,
  onMoveToTop,
}: Props) {
  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      item.done = new Date().getTime()
    } else {
      delete item.done
    }

    onChange(item)
  }

  if (item.done && item.frequency === "毎日" && !isToday(new Date(item.done))) {
    delete item.done
    onChange(item)
  }

  const isDone = !!item.done

  return (
    <Wrapper checked={isDone} type={item.type as keyof typeof COLOURS}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1em",
          flexGrow: "1",
          paddingLeft: "1em",
          cursor: "pointer",
        }}
      >
        <input type="checkbox" checked={isDone} onChange={handleCheck} />
        {item.type} {item.description}
      </label>
      {!isDone && (
        <Menu
          trigger={(props) => (
            <button {...props} aria-label="actions">
              <SlArrowDown />
            </button>
          )}
        >
          {() => (
            <>
              <Menu.Action onClick={onMoveToTop}>⏫ Move to top</Menu.Action>
              {currentList &&
                otherLists.map((list) => (
                  <MoveToMenuItem
                    key={list}
                    source={currentList}
                    target={list}
                    item={item}
                  />
                ))}
            </>
          )}
        </Menu>
      )}
    </Wrapper>
  )
}

interface WrapperProps {
  checked?: boolean
  type: Category
  children: React.ReactNode
}

function Wrapper({ checked, type, children }: WrapperProps) {
  return checked ? (
    <div
      style={{ color: "grey", opacity: 0.5, textDecoration: "line-through" }}
    >
      {children}
    </div>
  ) : (
    <div style={{ backgroundColor: COLOURS[type] }}>{children}</div>
  )
}
