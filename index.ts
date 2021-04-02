#!/usr/bin/env ts-node-script
'use strict';
import promptSync from 'prompt-sync';
import PonySaver from './src/PonySaver';
import { colors } from './src/utils';

const makePrompt = promptSync({ sigint: true });
const { GreenFg, Dim, MagentaFg_Bright, RedFg } = colors;

export const savePonies = async () => {
  let mazeWidth: number | undefined = undefined;
  let mazeHeight: number | undefined = undefined;
  let difficulty: number | undefined = undefined;
  let autoAdvance: boolean | null = null;
  while (true) {
    const answer = makePrompt(
      'Please provide a maze height (floats will be rounded down): '
    );
    mazeHeight = Math.floor(Number.parseInt(answer));
    if (Number.isNaN(mazeHeight)) {
      console.log('Please type only integer numbers.');
    } else {
      break;
    }
  }
  while (!mazeWidth) {
    try {
      const answer = Math.floor(
        Number(
          makePrompt(
            'Please provide a maze width (floats will be rounded down): '
          )
        )
      );
      mazeWidth = answer;
      break;
    } catch (err) {
      console.log('Please type only integer numbers.');
    }
  }
  while (!difficulty) {
    try {
      const answer = Math.floor(
        Number(
          makePrompt(
            'Please provide a maze difficulty (floats will be rounded down): '
          )
        )
      );
      difficulty = answer;
      break;
    } catch (err) {
      console.log('Please type only integer numbers.');
    }
  }
  while (true) {
    const answer = makePrompt(
      'Would you like to enable "Auto Advance"? If not, you will be prompted before each step. (y/n): '
    );

    if (answer.toLowerCase() === 'y') {
      autoAdvance = true;
      break;
    } else if (answer.toLowerCase() === 'n') {
      autoAdvance = false;
      break;
    } else {
      console.log('Please type "y" or "n".');
    }
  }

  console.log('Creating a maze with the following:');
  console.log('Maze Height', mazeHeight);
  console.log('Maze Width', mazeWidth);
  console.log('Maze Difficulty', difficulty);

  const mazeRunner = new PonySaver(
    'Morning Glory',
    mazeHeight!,
    mazeWidth!,
    difficulty!
  );

  await mazeRunner.createMaze();
  const mazeData = await mazeRunner.getMazeData();
  mazeRunner.setMazeData(mazeData);
  let shouldContinue = true;
  while (shouldContinue) {
    await mazeRunner.print();
    while (true) {
      let answer = autoAdvance
        ? 'y'
        : makePrompt('Continue? (y/n, "auto" to enable Auto Advance): ');

      if (answer.toLowerCase() === 'y') {
        await mazeRunner.makeMove();
        if (mazeRunner.gameState === 'won') {
          console.log(
            GreenFg(
              `You won the game and saved poor ${MagentaFg_Bright(
                'Morning Glory'
              )}!`
            )
          );
          shouldContinue = false;
        } else if (mazeRunner.gameState === 'over') {
          console.log(
            Dim(
              `You lost the game and  poor ${MagentaFg_Bright(
                'Morning Glory'
              )} was eaten by ${RedFg('Domokun')}.`
            )
          );
          shouldContinue = false;
        }
        break;
      } else if (answer.toLowerCase() === 'n') {
        console.log(
          `You abandon poor ${MagentaFg_Bright('Morning Glory')} to their fate`
        );
        shouldContinue = false;
        break;
      } else if (answer.toLowerCase() === 'auto') {
        autoAdvance = true;
        break;
      } else {
        console.log('Please type "y" or "n".');
      }
    }
  }
  mazeRunner.findPath();
};

const main = async () => {
  let playAgain = true;
  while (playAgain) {
    await savePonies();
    while (true) {
      const answer = makePrompt('Play Again? (y/n): ');

      if (answer.toLowerCase() === 'y') {
        break;
      } else if (answer.toLowerCase() === 'n') {
        playAgain = false;
        break;
      } else {
        console.log('Please type "y" or "n".');
      }
    }
  }
  console.log('Goodbye!');
};

if (!process.argv[1].endsWith('mocha')) {
  main();
}
