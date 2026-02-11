import { CSSProperties } from "react"
import { EditableText } from "../../../shared/controls/EditableText"
import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"

export type GameGoalData = {
  id?: string
  name: string
  goals: Record<string, any>
}

export function GameGoal({
  goal,
  onChange,
}: {
  goal: GameGoalData
  onChange: (goal: GameGoalData) => void
}) {
  const { goals, ...data } = goal
  const {
    arrowCapacity,
    blueChuJellies,
    bigOctos,
    bluePotion,
    bombCapacity,
    bottles,
    charts,
    cureGrandma,
    greenPotion,
    hearts,
    membersCards,
    seaChartQuandrants,
    songOfPassing,
    spinAttack,
    walletCapacity,
    zunariShopDecorations,
    herosCharm,
    joyPendants,
    magicArmour,
    ...rest
  } = goals

  const updateGoal = (key: string, value: any) => {
    onChange({
      ...data,
      goals: {
        ...goals,
        [key]: value,
      },
    })
  }

  return (
    <div className="windwaker">
      <img
        width="200px"
        src="./wind-waker-title.png"
        alt="Wind Waker checklist"
      />
      <ul>
        <CountGoal
          icon="./heart.png"
          label="Hearts"
          value={hearts.collected}
          total={hearts.total}
          onChange={(value: number) =>
            updateGoal("hearts", {
              ...hearts,
              collected: value,
            })
          }
        />
        <CountGoal
          icon="./bottle.png"
          label="Bottles"
          value={bottles.collected}
          total={bottles.total}
          onChange={(value: number) =>
            updateGoal("bottles", {
              ...bottles,
              collected: value,
            })
          }
        />

        <BooleanGoal
          emoji="./blue-potion.png"
          label={bluePotion.label}
          isChecked={bluePotion.unlocked}
          onChange={(isChecked) => {
            updateGoal("bluePotion", { ...bluePotion, unlocked: isChecked })
          }}
        />
        <BooleanGoal
          emoji="./green-potion.png"
          label={greenPotion.label}
          isChecked={greenPotion.unlocked}
          onChange={(isChecked) => {
            updateGoal("greenPotion", { ...greenPotion, unlocked: isChecked })
          }}
        />
        <BooleanGoal
          emoji="🎶"
          label={songOfPassing.label}
          isChecked={songOfPassing.learnt}
          onChange={(isChecked) => {
            updateGoal("songOfPassing", { ...songOfPassing, learnt: isChecked })
          }}
        />
        <BooleanGoal
          emoji="⚔️"
          label={spinAttack.label}
          isChecked={spinAttack.learnt}
          onChange={(isChecked) => {
            updateGoal("spinAttack", { ...spinAttack, learnt: isChecked })
          }}
        />
        <BooleanGoal
          emoji="./heros-charm.png"
          label={herosCharm.label}
          isChecked={herosCharm.collected}
          onChange={(isChecked) => {
            updateGoal("herosCharm", { ...herosCharm, collected: isChecked })
          }}
        />
        <BooleanGoal
          emoji="./magic-armour.png"
          label={magicArmour.label}
          isChecked={magicArmour.collected}
          onChange={(isChecked) => {
            updateGoal("magicArmour", { ...magicArmour, collected: isChecked })
          }}
        />

        <BooleanGoal
          emoji="👵"
          label={cureGrandma.label}
          isChecked={cureGrandma.cured}
          onChange={(isChecked) => {
            updateGoal("cureGrandma", { ...cureGrandma, cured: isChecked })
          }}
        />
        <CountGoal
          icon="🗺️"
          label="World map"
          value={seaChartQuandrants.revealed}
          total={seaChartQuandrants.total}
          onChange={(value: number) =>
            updateGoal("seaChartQuandrants", {
              ...seaChartQuandrants,
              revealed: value,
            })
          }
        />
        <CountGoal
          icon="📍"
          label="Charts"
          value={charts.chartCollected}
          total={charts.total}
          onChange={(value: number) =>
            updateGoal("charts", {
              ...charts,
              chartCollected: value,
            })
          }
        />
        <CountGoal
          icon="🪙"
          label="Treasure"
          value={charts.treasureCollected}
          total={charts.total}
          onChange={(value: number) =>
            updateGoal("charts", {
              ...charts,
              treasureCollected: value,
            })
          }
        />
        <CountGoal
          icon="🏹"
          label="Arrow capacity"
          value={arrowCapacity.current}
          total={arrowCapacity.total}
          onChange={(value: number) =>
            updateGoal("arrowCapacity", {
              ...arrowCapacity,
              current: value,
            })
          }
        />
        <CountGoal
          icon="💣"
          label={bombCapacity.label}
          value={bombCapacity.current}
          total={bombCapacity.total}
          onChange={(value: number) =>
            updateGoal("bombCapacity", {
              ...bombCapacity,
              current: value,
            })
          }
        />
        <CountGoal
          icon="👛"
          label="Wallet capacity"
          value={walletCapacity.current}
          total={walletCapacity.total}
          onChange={(value: number) =>
            updateGoal("walletCapacity", {
              ...walletCapacity,
              current: value,
            })
          }
        />
        <CountGoal
          icon="./joy-pendant.png"
          label={joyPendants.label}
          value={joyPendants.given}
          total={joyPendants.total}
          onChange={(value: number) =>
            updateGoal("joyPendants", {
              ...joyPendants,
              given: value,
            })
          }
        />

        <CountGoal
          icon="🔵"
          label={blueChuJellies.label}
          value={blueChuJellies.collected}
          total={blueChuJellies.total}
          onChange={(value: number) =>
            updateGoal("blueChuJellies", {
              ...blueChuJellies,
              collected: value,
            })
          }
        />
        <CountGoal
          icon="🐙"
          label={bigOctos.label}
          value={bigOctos.defeated}
          total={bigOctos.total}
          onChange={(value: number) =>
            updateGoal("bigOctos", {
              ...bigOctos,
              defeated: value,
            })
          }
        />
        <CountGoal
          icon="🪪"
          label={membersCards.label}
          value={membersCards.collected}
          total={membersCards.total}
          onChange={(value: number) =>
            updateGoal("membersCards", {
              ...membersCards,
              collected: value,
            })
          }
        />
        <CountGoal
          icon="🎋"
          label={zunariShopDecorations.label}
          value={zunariShopDecorations.collected}
          total={zunariShopDecorations.total}
          onChange={(value: number) =>
            updateGoal("zunariShopDecorations", {
              ...zunariShopDecorations,
              collected: value,
            })
          }
        />
      </ul>
      {JSON.stringify(rest)}
    </div>
  )
}

type CountGoalProps = {
  icon: string
  label: string
  value: number
  total: number
  onChange: (value: number) => void
}

function CountGoal({ icon, label, value, total, onChange }: CountGoalProps) {
  return (
    <li>
      <div className="tooltip-container">
        <span className="icon">
          {icon.startsWith(".") ? (
            <img
              src={icon}
              alt=""
              style={{
                verticalAlign: "bottom",
                maxHeight: "24px",
                maxWidth: "24px",
              }}
            />
          ) : (
            <span>{icon}</span>
          )}
        </span>
        <EditableText
          label={label}
          size={2}
          onChange={(value) => {
            const capacity = Number.parseInt(value)
            if (!isNaN(capacity)) {
              onChange(capacity)
            }
          }}
        >
          {value.toString()}
        </EditableText>
        <span className="tooltip-anchor">/{total}</span>
        <div className="tooltip">{label}</div>
      </div>
    </li>
  )
}

function BooleanGoal({
  emoji,
  isChecked,
  label,
  onChange,
  style,
}: {
  emoji: string
  isChecked: boolean
  label: string
  onChange: (isChecked: boolean) => void
  style?: CSSProperties
}) {
  return (
    <li>
      <div className="tooltip-container">
        <div className="tooltip-anchor" style={style}>
          <EmojiCheckbox
            emoji={emoji}
            isChecked={isChecked}
            label={label}
            onChange={() => {
              onChange(!isChecked)
            }}
          />
        </div>
        <div className="tooltip">{label}</div>
      </div>
    </li>
  )
}
