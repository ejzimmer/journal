import { EditableText } from '../../../shared/controls/EditableText';
import { BooleanGoal } from './BooleanGoal';

import './WindWakerGoals.css';

export function WindWakerGoals({
  goals,
  updateGoal,
}: {
  goals: Record<string, any>;
  updateGoal: (key: string, value: any) => void;
}) {
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
    magicMeterDouble,
  } = goals;

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
            updateGoal('hearts', {
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
            updateGoal('bottles', {
              ...bottles,
              collected: value,
            })
          }
        />
        <BooleanGoal
          icon={<div className="double-magic-meter" />}
          label={magicMeterDouble.label}
          isChecked={magicMeterDouble.completed}
          onChange={(isChecked) => {
            updateGoal('magicMeterDouble', {
              ...magicMeterDouble,
              completed: isChecked,
            });
          }}
        />
        <BooleanGoal
          icon="./blue-potion.png"
          label={bluePotion.label}
          isChecked={bluePotion.unlocked}
          onChange={(isChecked) => {
            updateGoal('bluePotion', { ...bluePotion, unlocked: isChecked });
          }}
        />
        <BooleanGoal
          icon="./green-potion.png"
          label={greenPotion.label}
          isChecked={greenPotion.unlocked}
          onChange={(isChecked) => {
            updateGoal('greenPotion', { ...greenPotion, unlocked: isChecked });
          }}
        />
        <BooleanGoal
          icon="./song-of-passing.png"
          label={songOfPassing.label}
          isChecked={songOfPassing.learnt}
          onChange={(isChecked) => {
            updateGoal('songOfPassing', {
              ...songOfPassing,
              learnt: isChecked,
            });
          }}
        />
        <BooleanGoal
          icon="./spin-attack.png"
          label={spinAttack.label}
          isChecked={spinAttack.learnt}
          onChange={(isChecked) => {
            updateGoal('spinAttack', { ...spinAttack, learnt: isChecked });
          }}
        />
        <BooleanGoal
          icon="./heros-charm.png"
          label={herosCharm.label}
          isChecked={herosCharm.collected}
          onChange={(isChecked) => {
            updateGoal('herosCharm', { ...herosCharm, collected: isChecked });
          }}
        />
        <BooleanGoal
          icon="./magic-armour.png"
          label={magicArmour.label}
          isChecked={magicArmour.collected}
          onChange={(isChecked) => {
            updateGoal('magicArmour', { ...magicArmour, collected: isChecked });
          }}
        />

        <BooleanGoal
          icon="./grandma.png"
          label={cureGrandma.label}
          isChecked={cureGrandma.cured}
          onChange={(isChecked) => {
            updateGoal('cureGrandma', { ...cureGrandma, cured: isChecked });
          }}
        />
        <CountGoal
          icon="🗺️"
          label="World map"
          value={seaChartQuandrants.revealed}
          total={seaChartQuandrants.total}
          onChange={(value: number) =>
            updateGoal('seaChartQuandrants', {
              ...seaChartQuandrants,
              revealed: value,
            })
          }
        />
        <CountGoal
          icon="./chart.png"
          label="Charts"
          value={charts.chartCollected}
          total={charts.total}
          onChange={(value: number) =>
            updateGoal('charts', {
              ...charts,
              chartCollected: value,
            })
          }
        />
        <CountGoal
          icon="./treasure.webp"
          label="Treasure"
          value={charts.treasureCollected}
          total={charts.total}
          onChange={(value: number) =>
            updateGoal('charts', {
              ...charts,
              treasureCollected: value,
            })
          }
        />
        <CountGoal
          icon="./quiver.png"
          label="Arrow capacity"
          value={arrowCapacity.current}
          total={arrowCapacity.total}
          onChange={(value: number) =>
            updateGoal('arrowCapacity', {
              ...arrowCapacity,
              current: value,
            })
          }
        />
        <CountGoal
          icon="./bomb-bag.png"
          label={bombCapacity.label}
          value={bombCapacity.current}
          total={bombCapacity.total}
          onChange={(value: number) =>
            updateGoal('bombCapacity', {
              ...bombCapacity,
              current: value,
            })
          }
        />
        <CountGoal
          icon="./wallet.png"
          label="Wallet capacity"
          value={walletCapacity.current}
          total={walletCapacity.total}
          onChange={(value: number) =>
            updateGoal('walletCapacity', {
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
            updateGoal('joyPendants', {
              ...joyPendants,
              given: value,
            })
          }
        />

        <CountGoal
          icon="./blue-chu.png"
          label={blueChuJellies.label}
          value={blueChuJellies.collected}
          total={blueChuJellies.total}
          onChange={(value: number) =>
            updateGoal('blueChuJellies', {
              ...blueChuJellies,
              collected: value,
            })
          }
        />
        <CountGoal
          icon="./big-octo.png"
          label={bigOctos.label}
          value={bigOctos.defeated}
          total={bigOctos.total}
          onChange={(value: number) =>
            updateGoal('bigOctos', {
              ...bigOctos,
              defeated: value,
            })
          }
        />
        <CountGoal
          icon="./members-card.png"
          label={membersCards.label}
          value={membersCards.collected}
          total={membersCards.total}
          onChange={(value: number) =>
            updateGoal('membersCards', {
              ...membersCards,
              collected: value,
            })
          }
        />
        <CountGoal
          icon="./decoration.png"
          label={zunariShopDecorations.label}
          value={zunariShopDecorations.collected}
          total={zunariShopDecorations.total}
          onChange={(value: number) =>
            updateGoal('zunariShopDecorations', {
              ...zunariShopDecorations,
              collected: value,
            })
          }
        />
      </ul>
    </div>
  );
}

type CountGoalProps = {
  icon: string;
  label: string;
  value: number;
  total: number;
  onChange: (value: number) => void;
};

function CountGoal({ icon, label, value, total, onChange }: CountGoalProps) {
  return (
    <li>
      <div className="tooltip-container">
        <span
          className="icon"
          style={{ opacity: 0.2 + (value ? value / total : 0) }}
        >
          {icon.startsWith('.') ? (
            <img
              src={icon}
              alt=""
              style={{
                verticalAlign: 'bottom',
                maxHeight: '24px',
                maxWidth: '24px',
              }}
            />
          ) : (
            <span>{icon}</span>
          )}
        </span>
        <EditableText
          label={label}
          value={value.toString()}
          onChange={(value) => {
            const capacity = Number.parseInt(value);
            if (!isNaN(capacity)) {
              onChange(capacity);
            }
          }}
        />
        <span className="tooltip-anchor">/{total}</span>
        <div className="tooltip">{label}</div>
      </div>
    </li>
  );
}
