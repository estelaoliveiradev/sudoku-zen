
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, GameState, Cell, HintResponse } from './types';
import { generateBoard } from './services/sudokuEngine';
import { getSmartHint } from './services/geminiService';
import SudokuCell from './components/SudokuCell';
import Numpad from './components/Numpad';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    difficulty: 'Fácil',
    selectedCell: null,
    mistakes: 0,
    maxMistakes: 3,
    timer: 0,
    isPaused: false,
    isGameOver: false,
    isGameWon: false
  });

  const [solution, setSolution] = useState<number[][]>([]);
  const [hintInfo, setHintInfo] = useState<HintResponse | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('SUDOKU_ZEN_API_KEY') || '');
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startNewGame = useCallback((diff: Difficulty = gameState.difficulty) => {
    const { puzzle, solution: sol } = generateBoard(diff);
    setGameState(prev => ({
      ...prev,
      board: puzzle,
      difficulty: diff,
      selectedCell: null,
      mistakes: 0,
      timer: 0,
      isPaused: false,
      isGameOver: false,
      isGameWon: false
    }));
    setSolution(sol);
    setHintInfo(null);
  }, [gameState.difficulty]);

  useEffect(() => {
    startNewGame('Fácil');
  }, []);

  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver && !gameState.isGameWon) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isPaused, gameState.isGameOver, gameState.isGameWon]);

  const handleCellClick = (r: number, c: number) => {
    if (gameState.isGameOver || gameState.isGameWon) return;
    setGameState(prev => ({ ...prev, selectedCell: [r, c] }));
  };

  const handleNumberInput = (num: number) => {
    if (!gameState.selectedCell || gameState.isGameOver || gameState.isGameWon) return;
    const [r, c] = gameState.selectedCell;
    const cell = gameState.board[r][c];

    if (cell.fixed || cell.value === num) return;

    const correctValue = solution[r][c];
    if (num === correctValue) {
      const newBoard = [...gameState.board.map(row => row.map(cell => ({ ...cell })))];
      newBoard[r][c].value = num;
      
      const isWon = newBoard.every(row => row.every(c => c.value !== null));
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        isGameWon: isWon
      }));
      setHintInfo(null);
    } else {
      const newMistakes = gameState.mistakes + 1;
      setGameState(prev => ({
        ...prev,
        mistakes: newMistakes,
        isGameOver: newMistakes >= gameState.maxMistakes
      }));
    }
  };

  const handleErase = () => {
    if (!gameState.selectedCell || gameState.isGameOver || gameState.isGameWon) return;
    const [r, c] = gameState.selectedCell;
    const cell = gameState.board[r][c];
    if (cell.fixed) return;

    const newBoard = [...gameState.board.map(row => row.map(cell => ({ ...cell })))];
    newBoard[r][c].value = null;
    setGameState(prev => ({ ...prev, board: newBoard }));
  };

  const handleAIHint = async () => {
    if (gameState.isGameOver || gameState.isGameWon || isHintLoading) return;
    
    if (!apiKey && !process.env.API_KEY) {
      setShowKeyModal(true);
      return;
    }

    setIsHintLoading(true);
    const hint = await getSmartHint(gameState.board, solution, apiKey);
    if (hint) {
      setHintInfo(hint);
      setGameState(prev => ({ ...prev, selectedCell: [hint.row, hint.col] }));
    } else if (!apiKey && !process.env.API_KEY) {
      setShowKeyModal(true);
    }
    setIsHintLoading(false);
  };

  const saveApiKey = (key: string) => {
    localStorage.setItem('SUDOKU_ZEN_API_KEY', key);
    setApiKey(key);
    setShowKeyModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSelectedValue = gameState.selectedCell 
    ? gameState.board[gameState.selectedCell[0]][gameState.selectedCell[1]].value 
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 safe-area-inset-bottom">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sudoku Zen</h1>
          <p className="text-sm text-slate-500 font-medium">{gameState.difficulty}</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setShowKeyModal(true)}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-indigo-600 transition-colors"
          >
            <i className="fa-solid fa-gear"></i>
          </button>
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Tempo</span>
            <span className="text-lg font-mono font-bold text-slate-700">{formatTime(gameState.timer)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Erros</span>
            <span className={`text-lg font-bold ${gameState.mistakes > 0 ? 'text-red-500' : 'text-slate-700'}`}>
              {gameState.mistakes}/{gameState.maxMistakes}
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="w-full max-w-md aspect-square bg-slate-800 p-1 rounded-xl shadow-2xl overflow-hidden mb-8">
        <div className="grid grid-cols-9 h-full w-full bg-slate-800">
          {gameState.board.map((row, r) => 
            row.map((cell, c) => (
              <SudokuCell
                key={`${r}-${c}`}
                cell={cell}
                isSelected={gameState.selectedCell?.[0] === r && gameState.selectedCell?.[1] === c}
                isSameGroup={
                  gameState.selectedCell 
                  ? (gameState.selectedCell[0] === r || gameState.selectedCell[1] === c || gameState.board[gameState.selectedCell[0]][gameState.selectedCell[1]].subgrid === cell.subgrid)
                  : false
                }
                isSameNumber={currentSelectedValue !== null && cell.value === currentSelectedValue}
                onClick={() => handleCellClick(r, c)}
              />
            ))
          )}
        </div>
      </div>

      {/* AI Explanation Tooltip */}
      {hintInfo && (
        <div className="w-full max-w-md bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <i className="fa-solid fa-robot"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-indigo-900 mb-1">Dica do Mestre Zen:</p>
              <p className="text-sm text-indigo-700 leading-relaxed">{hintInfo.explanation}</p>
            </div>
            <button onClick={() => setHintInfo(null)} className="text-indigo-300 hover:text-indigo-600">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <Numpad 
        onNumberClick={handleNumberInput} 
        onErase={handleErase}
        onHint={handleAIHint}
        isHintLoading={isHintLoading}
        disabled={gameState.isGameOver || gameState.isGameWon}
      />

      {/* Difficulty Selector */}
      <div className="mt-8 flex gap-2">
        {(['Fácil', 'Médio', 'Difícil'] as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => startNewGame(diff)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              gameState.difficulty === diff 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-key text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-slate-800">Configuração de IA</h2>
              <p className="text-sm text-slate-500 mt-2">
                Para usar dicas inteligentes, insira sua chave do Google Gemini. A chave fica salva apenas no seu navegador.
              </p>
            </div>
            <input 
              type="password" 
              placeholder="Cole sua API Key aqui..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => saveApiKey(apiKey)}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
              >
                Salvar Chave
              </button>
              <button
                onClick={() => setShowKeyModal(false)}
                className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
            </div>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-center text-xs text-indigo-500 mt-4 hover:underline"
            >
              Onde consigo minha chave grátis?
            </a>
          </div>
        </div>
      )}

      {/* Win/Loss Modals */}
      {(gameState.isGameOver || gameState.isGameWon) && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              gameState.isGameWon ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              <i className={`text-4xl fa-solid ${gameState.isGameWon ? 'fa-trophy' : 'fa-skull'}`}></i>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {gameState.isGameWon ? 'Parabéns!' : 'Game Over'}
            </h2>
            <p className="text-slate-500 mb-8">
              {gameState.isGameWon 
                ? `Você resolveu o Sudoku ${gameState.difficulty} em ${formatTime(gameState.timer)}!`
                : 'Você atingiu o limite máximo de erros. Não desista!'
              }
            </p>
            <button
              onClick={() => startNewGame()}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
