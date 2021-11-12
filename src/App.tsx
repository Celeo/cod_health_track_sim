import React, { useState } from "react";
import "./App.css";

enum DamageType {
  Empty,
  Bashing,
  Lethal,
  Aggravated,
}

export const App = () => {
  const trackSize = parseInt(
    new URL(window.location.toString()).searchParams.get("size") || "6"
  );
  const [boxes, setBoxes] = useState(Array(trackSize).fill(DamageType.Empty));

  const add = (type: DamageType) => {
    const newBoxes = [...boxes];
    // search for empty box
    for (let i = 0; i < newBoxes.length; i++) {
      const value = newBoxes[i];
      if (value === DamageType.Empty) {
        newBoxes[i] = type;
        setBoxes(newBoxes.sort().reverse());
        return;
      }
    }
    // no empty boxes, need to upgrade existing damage
    if (type === DamageType.Aggravated) {
      // insert at start and push everything else over
      newBoxes.unshift(DamageType.Aggravated);
      setBoxes(newBoxes.slice(0, trackSize).sort().reverse());
      return;
    } else {
      const indexOfBashing = newBoxes.findIndex(
        (value) => value === DamageType.Bashing
      );
      if (indexOfBashing !== -1) {
        // upgrade a bashing to lethal
        newBoxes[indexOfBashing] = DamageType.Lethal;
        setBoxes(newBoxes.sort().reverse());
        return;
      } else {
        // no bashing to upgrade, find a lethal to upgrade
        newBoxes[newBoxes.findIndex((value) => value === DamageType.Lethal)] =
          DamageType.Aggravated;
        setBoxes(newBoxes.sort().reverse());
        return;
      }
    }
  };

  const reset = () => {
    setBoxes(Array(trackSize).fill(DamageType.Empty));
  };

  const isDead = (): boolean =>
    boxes.every((value) => value === DamageType.Aggravated);

  const isFullHealth = (): boolean =>
    boxes.every((value) => value === DamageType.Empty);

  const effects = (): Array<string> => {
    if (isFullHealth()) {
      return [];
    }
    if (isDead()) {
      return ["You're dead"];
    }
    const messages = [];
    if (boxes.every((value) => value >= DamageType.Lethal)) {
      messages.push(
        "Take another point of damage each minute until receiving medical attention"
      );
    }
    if (boxes.every((value) => value >= DamageType.Bashing)) {
      messages.push(
        "Make a reflexive Stamina roll each turn to remain conscious"
      );
    }
    let dicePenalty = 0;
    if (boxes[boxes.length - 1] !== DamageType.Empty) {
      dicePenalty = -3;
    } else if (boxes[boxes.length - 2] !== DamageType.Empty) {
      dicePenalty = -2;
    } else if (boxes[boxes.length - 3] !== DamageType.Empty) {
      dicePenalty = -1;
    }
    if (dicePenalty < 0) {
      messages.push(
        `Take a ${dicePenalty} penalty to all actions except rolling to stay conscious`
      );
    }
    return messages;
  };

  return (
    <div className="App container mx-auto py-5">
      <h1 className="text-3xl">
        Chronicles of Darkness health track simulator
      </h1>
      <div className="flex flex-row justify-around space-x-5 pt-10">
        {boxes.map((code, index) => (
          <div
            key={`box-${index}`}
            className="shadow-sm h-32 w-32 bg-white text-blue-900 font-bold rounded-lg flex items-center justify-center"
          >
            {code === DamageType.Empty ? "" : DamageType[code]}
          </div>
        ))}
      </div>
      <div className="flex flex-row justify-between space-x-5 pt-10">
        <button
          className={
            "h-20 w-1/3 bg-red-600 font-medium rounded-md flex items-center justify-center" +
            (isDead() ? " bg-red-900 cursor-not-allowed" : "")
          }
          onClick={() => add(DamageType.Bashing)}
          disabled={isDead()}
        >
          Add Bashing
        </button>
        <button
          className={
            "h-20 w-1/3 bg-red-600 font-medium rounded-md flex items-center justify-center" +
            (isDead() ? " bg-red-900 cursor-not-allowed" : "")
          }
          onClick={() => add(DamageType.Lethal)}
          disabled={isDead()}
        >
          Add Lethal
        </button>
        <button
          className={
            "h-20 w-1/3 bg-red-600 font-medium rounded-md flex items-center justify-center" +
            (isDead() ? " bg-red-900 cursor-not-allowed" : "")
          }
          onClick={() => add(DamageType.Aggravated)}
          disabled={isDead()}
        >
          Add Aggravated
        </button>
      </div>
      <div className="flex flex-row justify-between space-x-5 pt-10">
        <button
          className={
            "h-20 w-full bg-green-600 font-medium rounded-md flex items-center justify-center" +
            (isFullHealth() ? " bg-green-900 cursor-not-allowed" : "")
          }
          onClick={reset}
        >
          Reset
        </button>
      </div>
      <div className="pt-10">
        <h2 className="text-2xl pb-5">Effects</h2>
        {effects().map((effect, index) => (
          <p key={`effect-${index}`} className="text-lg pl-3">
            - {effect}
          </p>
        ))}
      </div>
    </div>
  );
};
