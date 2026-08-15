import { useCallback, useEffect, useRef } from "react"
import { Routes, Route, NavLink } from "react-router-dom"
import { Todo } from "./tabs/Todo"
import { Projects } from "./tabs/Projects"
import { Work } from "./tabs/Work"
import { Media } from "./tabs/Media"
import { ThisYear } from "./tabs/ThisYear"

const TABS = [
  { path: "todo", Element: Todo },
  { path: "2026", Element: ThisYear },
  { path: "projects", Element: Projects },
  { path: "media", Element: Media },
  { path: "work", Element: Work },
]

export function AppShell() {
  const navListRef = useRef<HTMLUListElement>(null)

  const hideHighlight = useCallback(() => {
    if (!navListRef.current) return
    navListRef.current.style = `--hover-width: 0px`
  }, [])

  useEffect(() => {
    if (!navListRef.current) return

    const tabElements = navListRef.current.children
    const listElement = navListRef.current

    const onMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX
      const hoveredTab = Array.from(tabElements).find((tab) => {
        const { x, width } = tab.getBoundingClientRect()
        return x < mouseX && x + width >= mouseX
      })

      moveHighlight(hoveredTab)
    }

    navListRef.current.addEventListener("mousemove", onMouseMove)
    navListRef.current.addEventListener("mouseleave", hideHighlight)

    return () => {
      listElement.removeEventListener("mousemove", onMouseMove)
      listElement.removeEventListener("mouseleave", hideHighlight)
    }
  }, [hideHighlight])

  const moveHighlight = (hoveredTab?: Element | null) => {
    if (!hoveredTab || !navListRef.current) return

    const { x, width } = hoveredTab.getBoundingClientRect()
    navListRef.current.style = `--hover-left: ${x}px; --hover-width: ${width}px`
  }

  return (
    <>
      <nav className="tabs">
        <ul ref={navListRef} onBlur={hideHighlight}>
          {TABS.map(({ path }) => (
            <NavItem
              key={path}
              to={path}
              onFocus={(event) => moveHighlight(event.target.parentElement)}
            >
              {path}
            </NavItem>
          ))}
        </ul>
      </nav>

      <div className="main-content">
        <Routes>
          {TABS.map(({ path, Element }) => (
            <Route key={path} path={path} element={<Element />} />
          ))}
          <Route path="/" element={<Todo />} />
        </Routes>
      </div>
    </>
  )
}

function NavItem({
  to,
  onFocus,
  children,
}: {
  to: string
  onFocus: React.FocusEventHandler<HTMLAnchorElement> | undefined
  children: React.ReactNode
}) {
  return (
    <li>
      <NavLink to={to} onFocus={onFocus}>
        {children}
      </NavLink>
    </li>
  )
}
