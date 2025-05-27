function renderInitialUI(gameData) {
  const container = document.querySelector(".container");
  container.innerHTML = `
    <h2>예매 예약 설정</h2>
    <label for="team">홈팀 선택</label>
    <select id="team">
      <option value="">-- 홈팀을 선택하세요 --</option>
      <option value="lg">엘지트윈스</option>
      <option value="hanwha">한화이글스</option>
    </select>
    <label for="game">경기 선택</label>
    <select id="game">
      <option value="">-- 경기 정보를 선택하세요 --</option>
    </select>
    <label for="hour">접속 시간 (hh:mm:ss)</label>
    <div class="time-fields">
      <input type="number" id="hour" placeholder="hh" min="0" max="23" />
      <input type="number" id="minute" placeholder="mm" min="0" max="59" />
      <input type="number" id="second" placeholder="ss" min="0" max="59" />
    </div>
    <button id="start">입력정보로 예약적용</button>
  `;

  document.getElementById("team").addEventListener("change", function () {
    const team = this.value;
    const gameSelect = document.getElementById("game");
    gameSelect.innerHTML = '<option value="">-- 경기 정보를 선택하세요 --</option>';
    if (gameData[team]) {
      gameData[team].forEach(game => {
        const option = document.createElement("option");
        option.value = game.url;
        option.textContent = game.name;
        gameSelect.appendChild(option);
      });
    }
  });

  document.getElementById("start").addEventListener("click", () => {
    const url = document.getElementById("game").value;
    const name = document.getElementById("game").selectedOptions[0]?.textContent || "";
    const team = document.getElementById("team").selectedOptions[0]?.textContent || "";
    const h = document.getElementById("hour").value.padStart(2, '0');
    const m = document.getElementById("minute").value.padStart(2, '0');
    const s = document.getElementById("second").value.padStart(2, '0');
    const timeStr = `${h}:${m}:${s}`;

    if (!url || !name || !team || !h || !m || !s) {
      alert("모든 입력 값을 채워주세요.");
      return;
    }

    const [hour, minute, second] = [parseInt(h), parseInt(m), parseInt(s)];
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, second);
    const delay = target.getTime() - now.getTime();

    if (delay <= 0) {
      alert("입력한 시간이 현재 시간보다 과거입니다.");
      return;
    }

    chrome.storage.local.set({
      reservedURL: url,
      reservedTeam: team,
      reservedName: name,
      reservedTime: timeStr
    });

    chrome.alarms.create("openTab", { when: Date.now() + delay });

    renderCompletedUI(team, name, timeStr);
  });
}

function renderCompletedUI(team, name, time) {
  const container = document.querySelector(".container");
  container.innerHTML = `
    <h2 style="color: #00B894; text-align: center;">✅ 티켓팅 예약완료</h2>
    <div style="text-align: center; font-size: 16px; color: #f1f1f1;">
      <p style="margin-bottom: 6px;">[${team}]</p>
      <p style="margin-bottom: 6px;"><strong>${name}</strong></p>
      <p style="margin-bottom: 6px;">예약 시간: ${time}</p>
      <p id="countdown" style="color: #00B894; font-weight: bold; font-size: 18px;">남은 시간 계산 중...</p>
    </div>
    <div style="margin-top: 12px; font-size: 13px; color: #ccc; text-align: center;">
      예약 시간 전 <strong>5~3분전</strong> 반드시 로그인해주세요.<br />
      LG: <strong>공식 홈페이지</strong> / 한화: <strong>티켓링크</strong>
    </div>
    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <button id="cancelBtn" style="background-color: #e17055; color: white; flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer;">예약 취소</button>
      <button id="closeBtn" style="background-color: #00B894; color: white; flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer;">화면 닫기</button>
    </div>
  `;

  document.getElementById("closeBtn").addEventListener("click", () => window.close());
  document.getElementById("cancelBtn").addEventListener("click", () => {
    chrome.alarms.clear("openTab", () => {
      chrome.storage.local.clear(() => location.reload());
    });
  });

  const [hh, mm, ss] = time.split(":").map(Number);
  const target = new Date();
  target.setHours(hh, mm, ss, 0);
  updateCountdown(target);
}

function updateCountdown(targetTime) {
  const countdownEl = document.getElementById("countdown");
  const interval = setInterval(() => {
    const now = new Date();
    const diff = targetTime - now;
    if (diff <= 0) {
      countdownEl.textContent = "남은 시간: 00:00:00";
      clearInterval(interval);
      return;
    }
    const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
    const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
    countdownEl.textContent = `남은 시간: ${h}:${m}:${s}`;
  }, 1000);
}

// 외부 JSON에서 경기 정보를 불러옵니다
fetch("https://cdn.jsdelivr.net/gh/NillYoo/ticket_supporter/games.json?nocache=" + Date.now())
  .then(res => res.json())
  .then(gameData => {
    chrome.storage.local.get(["reservedURL", "reservedTeam", "reservedName", "reservedTime"], data => {
      if (data.reservedURL && data.reservedTeam && data.reservedName && data.reservedTime) {
        renderCompletedUI(data.reservedTeam, data.reservedName, data.reservedTime);
      } else {
        renderInitialUI(gameData);
      }
    });
  })
  .catch(err => {
    console.error("게임 정보를 불러올 수 없습니다.", err);
    alert("게임 정보를 불러오는 데 실패했습니다.");
  });

