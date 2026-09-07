import { RefObject, useEffect, useState } from "react"
import { ProjectSubtask } from "../../shared/types"

type OpenHeightParams = {
  listRef: RefObject<HTMLOListElement | null>
  formRef: RefObject<HTMLDivElement | null>
  subtasks: ProjectSubtask[]
  isProjectLoaded: boolean
}

export function useOpenHeight({
  listRef,
  formRef,
  subtasks,
  isProjectLoaded,
}: OpenHeightParams) {
  const [openHeight, setOpenHeight] = useState(0)

  useEffect(() => {
    if (!listRef.current || !formRef.current) return

    setOpenHeight(listRef.current.clientHeight + formRef.current.clientHeight)
  }, [listRef, formRef, subtasks, isProjectLoaded])

  return openHeight
}
