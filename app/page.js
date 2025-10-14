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
  const [speed, setSpeed] = useState(120);
  const [buttonScale, setButtonScale] = useState(1.2);

  const box = 20;
  const canvasSize = 20;

  // أصوات مضمنة
  const eatSound = useRef(null);
  const gameOverSound = useRef(null);
  const levelUpSound = useRef(null);

  useEffect(() => {
    // أصوات مضمنة باستخدام Audio Context
    const ctx = new AudioContext();
    const beep = (freq, duration = 0.1) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = freq;
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    };
    eatSound.current = () => beep(600);
    gameOverSound.current = () => beep(200, 0.5);
    levelUpSound.current = () => beep(1000, 0.2);
  }, []);

  // تحكم بالكيبورد
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
      // خلفية ديناميكية (شبكة متدرجة)
      for (let i = 0; i < canvasSize; i++) {
        for (let j = 0; j < canvasSize; j++) {
          ctx.fillStyle = (i + j) % 2 === 0 ? "#111" : "#1a1a1a";
          ctx.fillRect(i * box, j * box, box, box);
        }
      }

      // رسم الطعام
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(
        food.x * box + box / 2,
        food.y * box + box / 2,
        box / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // رسم الثعبان بشكل جذاب
      snake.forEach((s, i) => {
        const grad = ctx.createRadialGradient(
          s.x * box + box / 2,
          s.y * box + box / 2,
          2,
          s.x * box + box / 2,
          s.y * box + box / 2,
          box / 2
        );
        grad.addColorStop(0, i === 0 ? "#00ff00" : "#0a7f00");
        grad.addColorStop(1, "#004400");
        ctx.fillStyle = grad;
        ctx.fillRect(s.x * box + 2, s.y * box + 2, box - 4, box - 4);
      });

      let newSnake = [...snake];
      let head = { ...newSnake[0] };

      if (direction === "LEFT") head.x -= 1;
      if (direction === "RIGHT") head.x += 1;
      if (direction === "UP") head.y -= 1;
      if (direction === "DOWN") head.y += 1;

      // التفاف حول الشاشة
      if (head.x < 0) head.x = canvasSize - 1;
      if (head.x >= canvasSize) head.x = 0;
      if (head.y < 0) head.y = canvasSize - 1;
      if (head.y >= canvasSize) head.y = 0;

      newSnake.unshift(head);

      // أكل الطعام
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 100);
        if (eatSound.current) eatSound.current();
        setFood({
          x: Math.floor(Math.random() * canvasSize),
          y: Math.floor(Math.random() * canvasSize),
        });
      } else {
        newSnake.pop();
      }

      // الاصطدام بالذيل فقط
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setGameOver(true);
          setRunning(false);
          if (gameOverSound.current) gameOverSound.current();
          break;
        }
      }

      setSnake(newSnake);

      // تغيير المستوى
      if (score >= level * 500) {
        setLevel((l) => l + 1);
        if (levelUpSound.current) levelUpSound.current();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [running, snake, direction, food, gameOver, score, level, speed]);

  const handleStartPause = () => {
    if (gameOver) {
      setSnake([{ x: 10, y: 10 }]);
      setFood({ x: 15, y: 15 });
      setScore(0);
      setDirection("RIGHT");
      setGameOver(false);
      setLevel(1);
      setSpeed(120);
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

  const increaseSpeed = () => setSpeed((s) => Math.max(s - 20, 20));
  const decreaseSpeed = () => setSpeed((s) => s + 20);

  return (
    <div
      style={{
        textAlign: "center",
        backgroundColor: "#111",
        color: "#fff",
        height: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
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
          marginBottom: "20px",
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

      <div style={{ marginTop: 10 }}>
        <button onClick={increaseSpeed}>⚡ زيادة السرعة</button>
        <button onClick={decreaseSpeed}>🐢 تقليل السرعة</button>
        <p>Current Speed: {speed} ms per move</p>
      </div>

      {gameOver && !running && <h2>💀 Game Over!</h2>}
    </div>
  );
}
