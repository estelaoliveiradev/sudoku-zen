
import { Difficulty, Cell } from '../types';

export const generateBoard = (difficulty: Difficulty): { puzzle: Cell[][], solution: number[][] } => {
  const solution = createFullGrid();
  const puzzleValues = removeNumbers([...solution.map(row => [...row])], difficulty);
  
  const puzzle: Cell[][] = puzzleValues.map((row, r) => 
    row.map((val, c) => ({
      value: val === 0 ? null : val,
      fixed: val !== 0,
      row: r,
      col: c,
      subgrid: Math.floor(r / 3) * 3 + Math.floor(c / 3)
    }))
  );

  return { puzzle, solution };
};

const createFullGrid = (): number[][] => {
  const grid = Array(9).fill(null).map(() => Array(9).fill(0));
  fillGrid(grid);
  return grid;
};

const fillGrid = (grid: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

export const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

const removeNumbers = (grid: number[][], difficulty: Difficulty): number[][] => {
  let attempts = difficulty === 'Fácil' ? 30 : difficulty === 'Médio' ? 45 : 55;
  while (attempts > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (grid[row][col] !== 0) {
      grid[row][col] = 0;
      attempts--;
    }
  }
  return grid;
};
