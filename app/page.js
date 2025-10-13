"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const [direction, setDirection] = useState("RIGHT");
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);

  const box = 20;
  const canvasSize = 20;

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    let gameInterval;

    if (running && !gameOver) {
      gameInterval = setInterval(draw, 120);
    }

    function draw() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, box * canvasSize, box * canvasSize);

      // Draw food
      ctx.fillStyle = "red";
      ctx.fillRect(food.x * box, food.y * box, box, box);

      // Draw snake
      for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "lime" : "green";
        ctx.fillRect(snake[i].x * box, snake[i].y * box, box, box);
      }

      let newSnake = [...snake];
      let head = { ...newSnake[0] };

      if (direction === "LEFT") head.x -= 1;
      if (direction === "UP") head.y -= 1;
      if (direction === "RIGHT") head.x += 1;
      if (direction === "DOWN") head.y += 1;

      // Check walls
      if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvasSize ||
        head.y >= canvasSize
      ) {
        setGameOver(true);
        setRunning(false);
        return;
      }

      // Check collision with self
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setGameOver(true);
          setRunning(false);
          return;
        }
      }

      newSnake.unshift(head);

      // Eat food
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 100);
        setFood({
          x: Math.floor(Math.random() * canvasSize),
          y: Math.floor(Math.random() * canvasSize),
        });
      } else {
        newSnake.pop();
      }

      // Win condition
      if (score >= 1000) {
        setRunning(false);
        setGameOver(true);
        alert("🎉 Congratulations! You Win!");
      }

      setSnake(newSnake);
    }

    return () => clearInterval(gameInterval);
  }, [running, snake, direction, food, gameOver, score]);

  const changeDirection = (dir) => {
    if (!running) return;
    if (dir === "LEFT" && direction !== "RIGHT") setDirection("LEFT");
    if (dir === "UP" && direction !== "DOWN") setDirection("UP");
    if (dir === "RIGHT" && direction !== "LEFT") setDirection("RIGHT");
    if (dir === "DOWN" && direction !== "UP") setDirection("DOWN");
  };

  const handleStartPause = () => {
    if (gameOver) {
      setSnake([{ x: 10, y: 10 }]);
      setFood({ x: 15, y: 15 });
      setScore(0);
      setGameOver(false);
    }
    setRunning(!running);
  };

  const shareScore = () => {
    const text = `I scored ${score} points in Snake Game! 🐍🎮`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      alert(text);
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        backgroundColor: "#111",
        color: "#fff",
        height: "100vh",
        padding: "20px",
      }}
    >
      <h1>🐍 Snake Game</h1>
      <p>Score: {score}</p>
      <canvas
        ref={canvasRef}
        width={box * canvasSize}
        height={box * canvasSize}
        style={{ border: "2px solid white", backgroundColor: "#000" }}
      />
      <div style={{ marginTop: 20 }}>
        <button onClick={() => changeDirection("UP")}>⬆️</button>
        <div>
          <button onClick={() => changeDirection("LEFT")}>⬅️</button>
          <button onClick={handleStartPause}>
            {running ? "⏸ Pause" : "▶️ Start"}
          </button>
          <button onClick={() => changeDirection("RIGHT")}>➡️</button>
        </div>
        <button onClick={() => changeDirection("DOWN")}>⬇️</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={shareScore}>📤 Share Score</button>
      </div>

      {gameOver && !running && score < 1000 && <h2>💀 Game Over!</h2>}
    </div>
  );
}
