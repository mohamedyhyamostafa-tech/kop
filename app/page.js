"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);

  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState("RIGHT");
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);

  const box = 20;
  const canvasSize = 20;
  const [buttonScale, setButtonScale] = useState(1.2);

  // الأصوات
  const eatSound = useRef(null);
  const gameOverSound = useRef(null);
  const levelUpSound = useRef(null);

  // إعداد الأصوات فقط على المتصفح
  useEffect(() => {
    eatSound.current = new Audio(
      "https://actions.google.com/sounds/v1/foley/metal_hit.ogg"
    );
    gameOverSound.current = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg"
    );
    levelUpSound.current = new Audio(
      "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
    );
  }, []);

  // الحركة بالكيبورد
  useEffect(() => {
    const handleKey = (e) => {
      if (!running) return;
      const key = e.key;
      if ((key === "ArrowUp" || key === "w") && direction !== "DOWN")
        setDirection("UP");
      if ((key === "ArrowDown" || key === "s") && direction !== "UP")
        setDirection("DOWN");
      if ((key === "ArrowLeft" || key === "a") && direction !== "RIGHT")
        setDirection("LEFT");
      if ((key === "ArrowRight" || key === "d") && direction !== "LEFT")
        setDirection("RIGHT");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction, running]);

  useEffect(() => {
    if (!running || gameOver) return;
    const ctx = canvasRef.current.getContext("2d");

    const interval = setInterval(() => {
      // رسم الخلفية
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, box * canvasSize, box * canvasSize);

      // رسم الطعام
      ctx.fillStyle = "red";
      ctx.fillRect(food.x * box, food.y * box, box, box);

      // رسم الثعبان
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "lime" : "green";
        ctx.fillRect(s.x * box, s.y * box, box, box);
      });

      let newSnake = [...snake];
      let head = { ...newSnake[0] };

      if (direction === "LEFT") head.x -= 1;
      if (direction === "RIGHT") head.x += 1;
      if (direction === "UP") head.y -= 1;
      if (direction === "DOWN") head.y += 1;

      // جدار
      if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvasSize ||
        head.y >= canvasSize
      ) {
        setGameOver(true);
        setRunning(false);
        if (gameOverSound.current) gameOverSound.current.play();
        return;
      }

      // الاصطدام بالثعبان
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setGameOver(true);
          setRunning(false);
          if (gameOverSound.current) gameOverSound.current.play();
          return;
        }
      }

      newSnake.unshift(head);

      // أكل الطعام
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 100);
        if (eatSound.current) eatSound.current.play();
        setFood({
          x: Math.floor(Math.random() * canvasSize),
          y: Math.floor(Math.random() * canvasSize),
        });
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);

      // تغيير المستوى
      if (score >= level * 500) {
        setLevel((l) => l + 1);
        if (levelUpSound.current) levelUpSound.current.play();
      }
    }, Math.max(80 - level * 10, 30)); // سرعة حسب المستوى

    return () => clearInterval(interval);
  }, [running, snake, direction, food, gameOver, score, level]);

  const handleStartPause = () => {
    if (gameOver) {
      setSnake([{ x: 10, y: 10 }]);
      setFood({ x: 15, y: 15 });
      setScore(0);
      setDirection("RIGHT");
      setGameOver(false);
      setLevel(1);
    }
    setRunning(!running);
  };

  const changeDirection = (dir) => {
    if (!running) return;
    if (dir === "LEFT" && direction !== "RIGHT") setDirection("LEFT");
    if (dir === "RIGHT" && direction !== "LEFT") setDirection("RIGHT");
    if (dir === "UP" && direction !== "DOWN") setDirection("UP");
    if (dir === "DOWN" && direction !== "UP") setDirection("DOWN");
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
      <h1>🐍 Snake Game - Level {level}</h1>
      <p>Score: {score}</p>
      <canvas
        ref={canvasRef}
        width={box * canvasSize}
        height={box * canvasSize}
        style={{
          border: "2px solid white",
          backgroundColor: "#000",
        }}
      />
      <div style={{ marginTop: 20, transform: `scale(${buttonScale})` }}>
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
      <div style={{ marginTop: 10 }}>
        <label>🔍 تكبير/تصغير الأسهم: </label>
        <input
          type="range"
          min="0.8"
          max="2"
          step="0.1"
          value={buttonScale}
          onChange={(e) => setButtonScale(e.target.value)}
        />
      </div>

      {gameOver && !running && <h2>💀 Game Over!</h2>}
    </div>
  );
}
