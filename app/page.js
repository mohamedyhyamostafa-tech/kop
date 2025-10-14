"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [nextDirection, setNextDirection] = useState("RIGHT");
  const [currentDirection, setCurrentDirection] = useState("RIGHT");

  const box = 20;
  const canvasSize = 20;
  const speed = 100;

  // ==========================================
  // تغيير الاتجاه مع منع الرجوع للخلف
  const changeDirection = (dir) => {
    const opposites = { LEFT: "RIGHT", RIGHT: "LEFT", UP: "DOWN", DOWN: "UP" };
    if (dir !== opposites[currentDirection]) setNextDirection(dir);
  };

  // ==========================================
  // لوحة المفاتيح (Arrow + WASD)
  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          changeDirection("UP");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          changeDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          changeDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          changeDirection("RIGHT");
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentDirection]);

  // ==========================================
  // التحكم باللمس (Swipe)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    };

    const handleTouchMove = (e) => {
      if (!running) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) changeDirection("RIGHT");
        else changeDirection("LEFT");
      } else {
        if (dy > 0) changeDirection("DOWN");
        else changeDirection("UP");
      }

      touchStartX = t.clientX;
      touchStartY = t.clientY;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [currentDirection, running]);

  // ==========================================
  // اللعبة
  useEffect(() => {
    if (!running || gameOver) return;
    const ctx = canvasRef.current.getContext("2d");

    const gameLoop = setInterval(() => {
      setCurrentDirection(nextDirection);

      let newSnake = [...snake];
      let head = { ...newSnake[0] };

      if (nextDirection === "LEFT") head.x -= 1;
      if (nextDirection === "RIGHT") head.x += 1;
      if (nextDirection === "UP") head.y -= 1;
      if (nextDirection === "DOWN") head.y += 1;

      // التفاف الحائط
      if (head.x < 0) head.x = canvasSize - 1;
      if (head.x >= canvasSize) head.x = 0;
      if (head.y < 0) head.y = canvasSize - 1;
      if (head.y >= canvasSize) head.y = 0;

      // الاصطدام بالنفس
      for (let i = 0; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setGameOver(true);
          setRunning(false);
          return;
        }
      }

      newSnake.unshift(head);

      // أكل الطعام
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 100);
        setFood({
          x: Math.floor(Math.random() * canvasSize),
          y: Math.floor(Math.random() * canvasSize),
        });
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);

      // رسم الكانفس
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, box * canvasSize, box * canvasSize);

      ctx.fillStyle = "red";
      ctx.fillRect(food.x * box, food.y * box, box, box);

      newSnake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? "lime" : "green";
        ctx.fillRect(segment.x * box, segment.y * box, box, box);
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [running, snake, nextDirection, food, gameOver]);

  // ==========================================
  const handleStartPause = () => {
    if (gameOver) {
      setSnake([{ x: 10, y: 10 }]);
      setFood({ x: 15, y: 15 });
      setScore(0);
      setGameOver(false);
      setNextDirection("RIGHT");
      setCurrentDirection("RIGHT");
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
        userSelect: "none",
        touchAction: "none",
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

      {gameOver && !running && <h2>💀 Game Over!</h2>}
    </div>
  );
}
