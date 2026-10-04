import { BooleanGoal } from './BooleanGoal';
import {
  ARROW_CAPACITIES,
  BOMB_CAPACITIES,
  WALLET_CAPACITIES,
  findCapacityLevel,
  findLevelCapacity,
} from './capacityLevel';
import { CountGoal } from './CountGoal';
import { PipGoal } from './PipGoal';

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
        <PipGoal
          icon="./bottle.png"
          label="Bottles"
          level={bottles.collected}
          levels={bottles.total}
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
        <PipGoal
          icon="./quiver.png"
          label="Arrow capacity"
          level={findCapacityLevel(ARROW_CAPACITIES, arrowCapacity.current)}
          levels={ARROW_CAPACITIES.length}
          onChange={(level: number) =>
            updateGoal('arrowCapacity', {
              ...arrowCapacity,
              current: findLevelCapacity(ARROW_CAPACITIES, level),
            })
          }
        />
        <PipGoal
          icon="./bomb-bag.png"
          label={bombCapacity.label}
          level={findCapacityLevel(BOMB_CAPACITIES, bombCapacity.current)}
          levels={BOMB_CAPACITIES.length}
          onChange={(level: number) =>
            updateGoal('bombCapacity', {
              ...bombCapacity,
              current: findLevelCapacity(BOMB_CAPACITIES, level),
            })
          }
        />
        <PipGoal
          icon="./wallet.png"
          label="Wallet capacity"
          level={findCapacityLevel(WALLET_CAPACITIES, walletCapacity.current)}
          levels={WALLET_CAPACITIES.length}
          onChange={(level: number) =>
            updateGoal('walletCapacity', {
              ...walletCapacity,
              current: findLevelCapacity(WALLET_CAPACITIES, level),
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
