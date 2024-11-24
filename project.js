"use strict";
import chalk from 'chalk';
import { createRequire } from "module";
import crypto from "crypto";
const require = createRequire(import.meta.url);

const prompt = require('prompt-sync')();

const ROWS = 3;
const COLS = 3;

const SYMBOLS_COUNT = {
    "♥": 3,
    "✤": 5,
    "✪": 7,
    "❀": 9,
}

const SYMBOL_VALUES = {
    "♥": 5,
    "✤": 4,
    "✪": 3,
    "❀": 2,
}

const randomHex = () =>  {
    return '#' + crypto.randomBytes(6).toString("hex");
}

const deposit = () => {
    while (true) {
        const depositAmountPrompt = 'Enter a deposit amount | ';
        const depositAmount = prompt(depositAmountPrompt);
        const numberDepositAmount = parseFloat(depositAmount);

        if (isNaN(numberDepositAmount) || numberDepositAmount <= 0) {
            console.log("Invalid deposit amount, try again");
        } else {
            return numberDepositAmount;
        }
    }
}

const getNumberOfLines = () => {
    while (true) {
        const linesPrompt = 'Enter a number of lines to bet on (1-3) | ';
        const lines = prompt(linesPrompt);
        const numberOfLines = parseFloat(lines);

        if (isNaN(numberOfLines) || numberOfLines <= 0 || numberOfLines > 3) {
            console.log("Invalid number of lines, try again");
        } else {
            return numberOfLines;
        }
    }
}

const getBet = (balance, numberOfLines) => {
    while (true) {
        const betPrompt = 'Enter the bet on each line | ';
        const bet = prompt(betPrompt);
        const numberBet = parseFloat(bet);

        if (isNaN(numberBet) || numberBet <= 0 || numberBet > balance / numberOfLines) {
            console.log("Invalid bet, try again");
        } else {
            return numberBet;
        }
    }   
}

const spin = () => {
    const symbols = [];
    for (const [symbol, count] of Object.entries(SYMBOLS_COUNT)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }
    
    const reels = [];
    for (let i = 0; i < COLS; i++) {
        reels.push([]);
        const reelSymbols = [...symbols];
        for (let j = 0; j < ROWS; j++) {
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            const selectedSymbol = reelSymbols[randomIndex];
            reels[i].push(selectedSymbol);
            reelSymbols.splice(randomIndex, 1);
        }
    }
    return reels;
};

const transpose = (reels) => {
    const rows = [];

    for (let i = 0; i < ROWS; i++) {
        rows.push([]);
        for (let j = 0; j < COLS; j++) {
            rows[i].push(reels[j][i]);
        }
    }
    return rows;
}

const printRows = (rows) => {
    for (const row of rows) {
        let rowString = '';
        for (const [i, symbol] of row.entries()) {
            rowString += chalk.hex(randomHex())(symbol);
            if (i != rows.length - 1) {
                rowString += ' | ';
            }
        } 
        console.log(rowString);
    }
};

const getWinnings = (rows, bet, lines) => {
    let winnings = 0;
    
    for (let row = 0; row < lines; row++) {
        const symbols = rows[row];
        let allSame = true;
        
        for (const symbol of symbols) {
            if (symbol != symbols[0]) {
                allSame = false;
                break;
            }
        }

        if (allSame) {
            winnings += bet * SYMBOL_VALUES[symbols[0]];
        }
    }
    return winnings;
}

const game = () => {
    console.log('');
    let balance = deposit();
    while (true) {
        const numberOfLines = getNumberOfLines();
        const bet = getBet(balance, numberOfLines);

        balance -= bet * numberOfLines;

        const reels = spin();
        const rows = transpose(reels);
        printRows(rows);

        const winnings = getWinnings(rows, bet, numberOfLines);
        balance += winnings;

        console.log(chalk.hex('#BC8F8F')('You won ') + chalk.hex('#DAA520')(`$${winnings}`));
        console.log(chalk.hex('#BC8F8F')(`Your balance is `) + `${chalk.hex('#DAA520')('$' + balance)}`);
        if (balance <= 0) {
            console.log("You loose");
            break;
        }
        const answer = prompt(`Continue? (${chalk.hex('#00ff00')('y')} / ${chalk.hex('#C71585')('n')}) | `);
        if (answer != 'y') break;
    }
}

game();