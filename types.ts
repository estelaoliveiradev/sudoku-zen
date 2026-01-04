
export type Difficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface Cell {
  value: number | null;
  fixed: boolean;
  row: number;
  col: number;
  subgrid: number;
}

export interface GameState {
  board: Cell[][];
  difficulty: Difficulty;
  selectedCell: [number, number] | null;
  mistakes: number;
  maxMistakes: number;
  timer: number;
  isPaused: boolean;
  isGameOver: boolean;
  isGameWon: boolean;
}

export interface HintResponse {
  row: number;
  col: number;
  value: number;
  explanation: string;
}
