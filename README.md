# 3D Chess

A 3D chess game built in the browser. Play against an AI opponent powered by Stockfish.

## What it does

- Fully playable chess in 3D (you pick a side, opponent is AI)
- Stockfish handles move calculation
- Pawn promotion with a 3D piece selector
- Check/checkmate highlights on the board

## Roadmap

- Opponent selection screen with named characters and difficulty tiers (powered by Stockfish depth)
- LLM-generated reactions after each AI move based on position eval — (produces reactions ex.gtaunts when you blunder, gets nervous when you're winning)
- Add routes for game history, track progress, chess elo, player profile.

## Stack

- Next.js 16 (App Router)
- React Three Fiber + Three.js for the 3D scene
- Drei for helpers (orbit controls, environment, etc.)
- chess.js for move validation and game state
- Stockfish (WASM) for the AI engine
- SASS for styles
- TypeScript

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
