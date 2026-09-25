import { YarnBall, YarnType, YarnTypeId } from './types';
import { GRAMS_PER_BALL } from './utils';

export class YarnStash {
  balls: YarnBall[] = [];
  private usedBalls: YarnBall[] = [];
  private lastAppliedMonths: Partial<
    Record<YarnTypeId, Temporal.PlainYearMonth>
  > = {};

  getBalance(yarnType: YarnTypeId) {
    return this.getUnusedBalls(yarnType).reduce(
      (total, ball) => total + ball.grams,
      0,
    );
  }

  getTotalBalance() {
    return this.getUnusedBalls().reduce((total, ball) => total + ball.grams, 0);
  }

  private addYarn(yarnType: YarnTypeId, grams: number) {
    let remaining = grams;

    const partialBall = this.getUnusedBalls(yarnType).find(
      (ball) => ball.grams < GRAMS_PER_BALL,
    );
    if (partialBall) {
      const topUp = Math.min(remaining, GRAMS_PER_BALL - partialBall.grams);
      partialBall.grams += topUp;
      remaining -= topUp;
    }

    while (remaining > 0) {
      const ball = this.usedBalls.pop() ?? this.createBall(yarnType);
      ball.yarnType = yarnType;
      ball.grams = Math.min(remaining, GRAMS_PER_BALL);
      delete ball.usedIn;
      remaining -= ball.grams;
    }
  }

  private removeYarn(
    yarnType: YarnTypeId,
    grams: number,
    month: Temporal.PlainYearMonth,
  ) {
    let remaining = grams;

    while (remaining > 0) {
      const ball = this.findSmallestUnusedBall(yarnType);
      if (!ball) return;

      if (remaining < ball.grams) {
        ball.grams -= remaining;
        return;
      }

      remaining -= ball.grams;
      ball.usedIn = month;
      this.usedBalls.push(ball);
    }
  }

  applyBalances(yarnByType: YarnType[]) {
    this.getUnappliedChanges(yarnByType).forEach(
      ({ yarnType, month, difference }) => {
        if (difference > 0) {
          this.addYarn(yarnType, difference);
        } else {
          this.removeYarn(yarnType, -difference, month);
        }
        this.lastAppliedMonths[yarnType] = month;
      },
    );
  }

  private getUnappliedChanges(yarnByType: YarnType[]) {
    const allChanges = yarnByType.flatMap(({ id, balances }) => {
      const lastAppliedMonth = this.lastAppliedMonths[id];
      const unappliedBalances = balances.filter(
        ({ month }) =>
          !lastAppliedMonth ||
          Temporal.PlainYearMonth.compare(month, lastAppliedMonth) >= 0,
      );

      return unappliedBalances.map(({ month, grams }, index) => ({
        yarnType: id,
        month,
        difference:
          grams - (unappliedBalances[index - 1]?.grams ?? this.getBalance(id)),
      }));
    });

    return allChanges
      .filter(({ difference }) => difference !== 0)
      .sort(
        (a, b) =>
          Temporal.PlainYearMonth.compare(a.month, b.month) ||
          Math.sign(a.difference) - Math.sign(b.difference),
      );
  }

  private getUnusedBalls(yarnType?: YarnTypeId) {
    return this.balls.filter(
      (ball) => !ball.usedIn && (!yarnType || ball.yarnType === yarnType),
    );
  }

  private findSmallestUnusedBall(yarnType: YarnTypeId) {
    return this.getUnusedBalls(yarnType).reduce<YarnBall | undefined>(
      (smallest, ball) =>
        !smallest || ball.grams < smallest.grams ? ball : smallest,
      undefined,
    );
  }

  private createBall(yarnType: YarnTypeId): YarnBall {
    const ball = { yarnType, grams: 0 };
    this.balls.push(ball);
    return ball;
  }
}
