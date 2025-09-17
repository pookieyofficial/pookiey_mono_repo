export const RootAPIResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>🕵️ You Found Me!</title>
      <style>
        body {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
          background-size: 400% 400%;
          animation: gradient 8s ease infinite;
          font-family: 'Courier New', monospace;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          overflow: hidden;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .easter-egg {
          text-align: center;
          background: rgba(0,0,0,0.8);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          animation: float 3s ease-in-out infinite;
          border: 3px solid #fff;
          position: relative;
          overflow: hidden;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .glitch {
          color: #fff;
          font-size: 2.5em;
          font-weight: bold;
          text-transform: uppercase;
          position: relative;
          animation: glitch 2s infinite;
          margin-bottom: 20px;
        }
        
        @keyframes glitch {
          0%, 90%, 100% { transform: translate(0); }
          10% { transform: translate(-2px, -1px); }
          20% { transform: translate(2px, 1px); }
          30% { transform: translate(-1px, 2px); }
          40% { transform: translate(1px, -1px); }
          50% { transform: translate(-1px, 1px); }
          60% { transform: translate(2px, -2px); }
          70% { transform: translate(-2px, 2px); }
          80% { transform: translate(1px, -2px); }
        }
        
        .subtitle {
          color: #4ecdc4;
          font-size: 1.2em;
          margin: 20px 0;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .matrix {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.1;
          font-family: monospace;
          font-size: 10px;
          color: #00ff00;
          overflow: hidden;
        }
        
        .secret-msg {
          color: #ff6b6b;
          font-size: 0.9em;
          margin-top: 20px;
          animation: typewriter 3s steps(40) infinite;
          border-right: 2px solid #ff6b6b;
          white-space: nowrap;
          overflow: hidden;
          width: 0;
        }
        
        @keyframes typewriter {
          0% { width: 0; }
          50% { width: 100%; }
          100% { width: 0; }
        }
        
        .emoji-rain {
          position: absolute;
          animation: fall 3s linear infinite;
          font-size: 20px;
        }
        
        @keyframes fall {
          0% { transform: translateY(-100vh) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="easter-egg">
        <div class="matrix" id="matrix"></div>
        <h1 class="glitch">🕵️ DETECTED! 🕵️</h1>
        <p class="subtitle">~ You found the secret backdoor ~ 😏</p>
        <p style="color: #96ceb4; font-size: 1.1em;">
          🎯 Welcome to the Dating App API 💕<br>
          <span style="font-size: 0.8em; color: #feca57;">
            Status: <span style="color: #4ecdc4;">ONLINE & READY FOR LOVE</span> ✨
          </span>
        </p>
        <div class="secret-msg">
          > Cupid.exe is running... 💘
        </div>
      </div>
      
      <script>
        // Matrix rain effect
        const matrix = document.getElementById('matrix');
        const chars = '01♥💕💖💘🎯👀🔍';
        
        function createMatrixRain() {
          const span = document.createElement('span');
          span.textContent = chars[Math.floor(Math.random() * chars.length)];
          span.style.position = 'absolute';
          span.style.left = Math.random() * 100 + '%';
          span.style.animationDuration = (Math.random() * 3 + 2) + 's';
          span.className = 'emoji-rain';
          matrix.appendChild(span);
          
          setTimeout(() => {
            span.remove();
          }, 5000);
        }
        
        setInterval(createMatrixRain, 300);
        
        // Konami code easter egg
        let sequence = [];
        const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
        
        document.addEventListener('keydown', (e) => {
          sequence.push(e.keyCode);
          if (sequence.length > konamiCode.length) {
            sequence.shift();
          }
          
          if (sequence.join(',') === konamiCode.join(',')) {
            alert('🎉 KONAMI CODE ACTIVATED! You are now a Dating App Master! 🎉');
            document.body.style.filter = 'hue-rotate(180deg)';
          }
        });
      </script>
    </body>
    </html>
  `