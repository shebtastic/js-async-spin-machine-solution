import { shuffleArray } from "../../utils/shuffle.js";
import { baseSymbols } from "../../utils/symbols.js";

export function Wheel() {
  const wheelElement = document.createElement("div");
  wheelElement.classList.add("wheel");

  const symbolElement = document.createElement("div");
  symbolElement.classList.add("symbol");
  wheelElement.append(symbolElement);

  const symbols = shuffleArray(baseSymbols);
  let symbolIndex = Math.floor(Math.random() * symbols.length);
  let turns = 0;

  symbolElement.textContent = symbols[symbolIndex];

  function maybeChoke() {
    console.log("choking?");
    if (Math.random() <= 0.1) {
      symbolElement.textContent = "💥";
      document.body.dataset.choked = "true";
      throw new Error("Choked");
    }
    if (document.body.dataset.choked === "true") {
      throw new Error("also stopping cause of choke");
    }
  }

  function turnToNextSymbol() {
    return new Promise((resolve) => {
      setTimeout(() => {
        symbolIndex = (symbolIndex + 1) % symbols.length;
        turns++;
        resolve();
      }, Math.min(50 + turns ** 1.5, 500));
    });
  }

  async function spin(num) {
    document.body.dataset.choked = "false";

    return await new Promise(async (resolveSpin, reject) => {
      const initialVelocity = Math.floor(Math.random() * 45) + 30;
      const initialSpinFrames = Math.floor(Math.random() * 30) + 20;

      await new Promise((resolve) => {
        function initialSpin(frames) {
          if (document.body.dataset.choked === "true") {
            resolveSpin();
            resolve();
            return;
          }

          if (frames <= 0) {
            resolve();
            return;
          }

          if (frames % 3 === 0) {
            symbolIndex = (symbolIndex + 1) % symbols.length;
            symbolElement.textContent = symbols[symbolIndex];
          }

          requestAnimationFrame(() => initialSpin(frames - 1));
          return;
        }

        initialSpin(initialSpinFrames * 3);
      });

      function render(velocity, turn, framesUntilTurn) {
        console.log(`running ${num} at v: ${velocity}; t: ${turn}; f: ${framesUntilTurn}`);
        if (document.body.dataset.choked === "true" || velocity <= 0) {
          console.log(num, velocity, framesUntilTurn, document.body.dataset.choked);
          resolveSpin(symbols[symbolIndex]);
          return;
        }

        if (framesUntilTurn > 0) {
          requestAnimationFrame(() => render(velocity, turn, framesUntilTurn - 1));
          return;
        }

        if (framesUntilTurn <= 0) {
          try {
            const drag = Math.floor(turn ** 1.2 + 3);
            symbolIndex = (symbolIndex + 1) % symbols.length;
            symbolElement.textContent = symbols[symbolIndex];
            maybeChoke();
            requestAnimationFrame(() => render(velocity - drag, turn + 1, Math.max(60 - (velocity - drag), 0)));
            return;
          } catch {
            console.error(num);
            reject(new Error("bombe?"));
            return;
          }
        }
      }

      requestAnimationFrame(() => render(initialVelocity, 0, 75 - initialVelocity));
    });
  }

  wheelElement.spin = spin;
  return wheelElement;
}
