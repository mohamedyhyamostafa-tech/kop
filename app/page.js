"use client";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(100); // أقل رقم = أسرع حركة
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const box = 20;
    let snake = [{ x: 9 * box, y: 10 * box }];
    let food = {
      x: Math.floor(Math.random() * 19 + 1) * box,
      y: Math.floor(Math.random() * 19 + 1) * box,
    };
    let d;
    let game;

    document.addEventListener("keydown", direction);

    function direction(event) {
      if (event.key === "ArrowLeft" && d !== "RIGHT") d = "LEFT";
      else if (event.key === "ArrowUp" && d !== "DOWN") d = "UP";
      else if (event.key === "ArrowRight" && d !== "LEFT") d = "RIGHT";
      else if (event.key === "ArrowDown" && d !== "UP") d = "DOWN";
    }

    function collision(head, array) {
      return array.some(
        (segment) => head.x === segment.x && head.y === segment.y
      );
    }

    function draw() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, 400, 400);

      for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "lime" : "white";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = "#111";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
      }

      ctx.fillStyle = "red";
      ctx.fillRect(food.x, food.y, box, box);

      let snakeX = snake[0].x;
      let snakeY = snake[0].y;

      if (d === "LEFT") snakeX -= box;
      if (d === "UP") snakeY -= box;
      if (d === "RIGHT") snakeX += box;
      if (d === "DOWN") snakeY += box;

      if (snakeX === food.x && snakeY === food.y) {
        setScore((prev) => prev + 10);
        food = {
          x: Math.floor(Math.random() * 19 + 1) * box,
          y: Math.floor(Math.random() * 19 + 1) * box,
        };
      } else {
        snake.pop();
      }

      const newHead = { x: snakeX, y: snakeY };

      if (
        snakeX < 0 ||
        snakeY < 0 ||
        snakeX >= 400 ||
        snakeY >= 400 ||
        collision(newHead, snake)
      ) {
        clearInterval(game);
        alert("Game Over! Your score: " + score);
      }

      snake.unshift(newHead);
    }

    game = setInterval(draw, speed);
    return () => clearInterval(game);
  }, [speed]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{
          background: "#000",
          border: "2px solid lime",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      ></canvas>
      <h3>Score: {score}</h3>

      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => setSpeed((s) => Math.max(50, s - 20))}
          style={{
            padding: "10px 20px",
            margin: "5px",
            borderRadius: "6px",
            background: "lime",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ⚡ Faster
        </button>
        <button
          onClick={() => setSpeed((s) => s + 20)}
          style={{
            padding: "10px 20px",
            margin: "5px",
            borderRadius: "6px",
            background: "orange",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🐢 Slower
        </button>
      </div>
    </div>
  );
}
