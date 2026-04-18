export function createStockfishWorker(): Worker {
  return new Worker("/stockfish/stockfish-18-lite-single.js");
}

export function getEval(
  worker: Worker,
  fen: string,
  depth: number = 8,
): Promise<number> {
  return new Promise((resolve) => {
    let lastScore = 0;
    const onMessage = (e: MessageEvent) => {
      const line: string =
        typeof e.data === "string" ? e.data : (e.data?.toString?.() ?? "");
      const match = line.match(/score cp (-?\d+)/);
      if (match) lastScore = parseInt(match[1]) / 100;
      if (line.startsWith("bestmove")) {
        worker.removeEventListener("message", onMessage);
        resolve(lastScore);
      }
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage("position fen " + fen);
    worker.postMessage("go depth " + depth);
  });
}

export function getBestMove(
  worker: Worker,
  fen: string,
  depth: number = 12,
  onScore?: (score: number) => void,
  skillLevel: number = 20,
): Promise<string> {
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent) => {
      const line: string =
        typeof e.data === "string" ? e.data : (e.data?.toString?.() ?? "");
      if (line.includes("score cp")) {
        const match = line.match(/score cp (-?\d+)/);
        if (match) {
          const score = parseInt(match[1]) / 100;
          onScore?.(score);
        }
      }
      if (line.startsWith("bestmove")) {
        const move = line.split(" ")[1];
        worker.removeEventListener("message", onMessage);
        resolve(move);
      }
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
    worker.postMessage("position fen " + fen);
    worker.postMessage("go depth " + depth);
  });
}
