"use client";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const canvasSize = 20;
  const baseBox = 20;

  const [box, setBox] = useState(baseBox);
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [nextDirection, setNextDirection] = useState("RIGHT");
  const [currentDirection, setCurrentDirection] = useState("RIGHT");
  const [foodFlash, setFoodFlash] = useState(0);

  // ========== أصوات من الإنترنت ==========
  const eatSound = useRef(new Audio("https://actions.google.com/sounds/v1/foley/metal_hit.ogg"));
  const moveSound = useRef(new Audio("https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg"));
  const gameOverSound = useRef(new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"));
  const levelUpSound = useRef(new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"));

  // سرعة حسب المستوى
  const getSpeed = () => level === 1 ? 120 : level === 2 ? 90 : 60;

  // ========= تغيير الاتجاه =========
  const changeDirection = (dir) => {
    const opposites = { LEFT: "RIGHT", RIGHT: "LEFT", UP: "DOWN", DOWN: "UP" };
    if (dir !== opposites[currentDirection]) setNextDirection(dir);
  };

  // ========= لوحة المفاتيح =========
  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "ArrowUp": case "w": case "W": changeDirection("UP"); playMove(); break;
        case "ArrowDown": case "s": case "S": changeDirection("DOWN"); playMove(); break;
        case "ArrowLeft": case "a": case "A": changeDirection("LEFT"); playMove(); break;
        case "ArrowRight": case "d": case "D": changeDirection("RIGHT"); playMove(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentDirection]);

  // ========= اللمس (Swipe + Pinch) =========
  useEffect(() => {
    let touchStartX = 0, touchStartY = 0, initialDistance = 0;
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0]; touchStartX = t.clientX; touchStartY = t.clientY;
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.sqrt(dx*dx + dy*dy);
      }
    };
    const handleTouchMove = (e) => {
      if (!running) return;
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if (Math.abs(dx) > Math.abs(dy)) dx > 0 ? changeDirection("RIGHT") : changeDirection("LEFT");
        else dy > 0 ? changeDirection("DOWN") : changeDirection("UP");
        touchStartX = t.clientX; touchStartY = t.clientY;
        playMove();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx*dx + dy*dy);
        const ratio = distance / initialDistance;
        setBox(Math.max(10, Math.min(50, baseBox * ratio)));
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [running, currentDirection]);

  // ========= تكبير وتصغير تلقائي =========
  useEffect(() => {
    const resizeCanvas = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight - 140;
      const minSize = Math.min(width, height);
      setBox(Math.floor(minSize / canvasSize));
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // ========= الأصوات =========
  const playEat = () => { eatSound.current.currentTime = 0; eatSound.current.play(); };
  const playMove = () => { moveSound.current.currentTime = 0; moveSound.current.play(); };
  const playGameOver = () => { gameOverSound.current.currentTime = 0; gameOverSound.current.play(); };
  const playLevelUp = () => { levelUpSound.current.currentTime = 0; levelUpSound.current.play(); };

  // ========= اللعبة =========
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
          setGameOver(true); setRunning(false); playGameOver(); return;
        }
      }

      newSnake.unshift(head);

      // أكل الطعام
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 100);
        setFood({ x: Math.floor(Math.random() * canvasSize), y: Math.floor(Math.random() * canvasSize) });
        setFoodFlash(5); 
        playEat();
        // ترقية المستوى عند النقاط
        if (score + 100 >= 500 && level === 1) { setLevel(2); playLevelUp(); }
        else if (score + 100 >= 1000 && level === 2) { setLevel(3); playLevelUp(); }
      } else { newSnake.pop(); }

      setSnake(newSnake);

      // خلفية ديناميكية
      const gradient = ctx.createLinearGradient(0,0,box*canvasSize,box*canvasSize);
      gradient.addColorStop(0,"#111"); gradient.addColorStop(1,"#001f3f");
      ctx.fillStyle = gradient; ctx.fillRect(0,0,box*canvasSize,box*canvasSize);

      // رسم الطعام
      ctx.fillStyle = `rgba(255,0,0,${foodFlash%2===0 ? 1:0.5})`;
      ctx.fillRect(food.x*box,food.y*box,box,box);
      if (foodFlash>0) setFoodFlash(foodFlash-1);

      // رسم الثعبان
      newSnake.forEach((seg,i)=>{
        const greenIntensity = Math.floor(100 + (155*(i/newSnake.length)));
        ctx.fillStyle = i===0 ? "lime" : `rgb(0,${greenIntensity},0)`;
        ctx.fillRect(seg.x*box,seg.y*box,box,box);
      });
    }, getSpeed());

    return () => clearInterval(gameLoop);
  }, [running, snake, nextDirection, food, gameOver, box, foodFlash, level, score]);

  const handleStartPause = () => {
    if (gameOver) {
      setSnake([{ x:10,y:10 }]);
      setFood({ x:15,y:15 });
      setScore(0);
      setLevel(1);
      setGameOver(false);
      setNextDirection("RIGHT"); setCurrentDirection("RIGHT");
    }
    setRunning(!running);
  };

  const shareScore = () => {
    const text = `I scored ${score} points in Snake Game! Level: ${level} 🐍🎮`;
    if (navigator.share) navigator.share({ text }); else alert(text);
  };

  return (
    <div ref={containerRef} style={{textAlign:"center",backgroundColor:"#111",color:"#fff",height:"100vh",padding:"10px",userSelect:"none",touchAction:"none",display:"flex",flexDirection:"column",justifyContent:"center"}}>
      <h1>🐍 Snake Game</h1>
      <p>Score: {score} | Level: {level}</p>
      <canvas ref={canvasRef} width={box*canvasSize} height={box*canvasSize} style={{border:"2px solid white",backgroundColor:"#000"}}/>
      <div style={{marginTop:20,fontSize:`${box/1.5}px`}}>
        <button onClick={()=>changeDirection("UP")}>⬆️</button>
        <div>
          <button onClick={()=>changeDirection("LEFT")}>⬅️</button>
          <button onClick={handleStartPause}>{running ? "⏸ Pause" : "▶️ Start"}</button>
          <button onClick={()=>changeDirection("RIGHT")}>➡️</button>
        </div>
        <button onClick={()=>changeDirection("DOWN")}>⬇️</button>
      </div>
      <div style={{marginTop:20}}><button onClick={shareScore}>📤 Share Score</button></div>
      {gameOver && !running && <h2>💀 Game Over!</h2>}
    </div>
  );
}
