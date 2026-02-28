import { useState } from "react"

import "./ButtonWithConfirmation.css"

type ButtonWithConfirmationProps = {
  onClick: () => boolean
  children: React.ReactNode
  confirmationMessage?: string
  className?: string
}

export function ButtonWithConfirmation({
  onClick,
  children,
  confirmationMessage = "Success!",
  className,
}: ButtonWithConfirmationProps) {
  const [confirmationVisible, setConfirmationVisible] = useState(false)

  const handleClick = () => {
    if (onClick()) {
      setConfirmationVisible(true)
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <button className={className} onClick={handleClick}>
        {children}
      </button>
      {confirmationVisible && (
        <div
          className="confirmation"
          onAnimationEnd={() => {
            setConfirmationVisible(false)
          }}
        >
          {confirmationMessage}
        </div>
      )}
    </div>
  )
}
