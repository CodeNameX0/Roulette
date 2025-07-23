const $c = document.querySelector("canvas");
const ctx = $c.getContext(`2d`);

// 기본 항목들과 색상들
let product = [
  "(1)",
  "(2)",
  "(3)",
  "(4)",
  "(5)",
  "(6)",
];

const colors = [
  "#ff6b6b",
  "#ffb56b", 
  "#ffff66",
  "#66ff66",
  "#6BB5ff",
  "#a66bff",
  "#ff6bb5",
  "#b56bff",
  "#6bffb5",
  "#ffb566",
  "#66b5ff",
  "#b5ff6b"
];

// DOM 요소들
const itemInput = document.getElementById('itemInput');
const addButton = document.getElementById('addButton');
const itemsList = document.getElementById('itemsList');
const clearAllButton = document.getElementById('clearAll');
const resetDefaultButton = document.getElementById('resetDefault');
const spinButton = document.getElementById('spinButton');
const resultModal = document.getElementById('resultModal');
const modalResult = document.getElementById('modalResult');
const closeModalBtn = document.getElementById('closeModal');
const spinAgainBtn = document.getElementById('spinAgain');
const removeWinnerBtn = document.getElementById('removeWinner');
const closeBtn = document.querySelector('.close');

// 현재 당첨된 항목을 저장할 변수
let currentWinner = null;

// 룰렛 그리기 함수
const newMake = () => {
  // 캔버스 초기화
  ctx.clearRect(0, 0, $c.width, $c.height);
  
  if (product.length === 0) {
    // 항목이 없을 때 빈 원만 그리기
    const [cw, ch] = [$c.width / 2, $c.height / 2];
    ctx.beginPath();
    ctx.fillStyle = "#f0f0f0";
    ctx.arc(cw, ch, cw - 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    
    // 중앙 원
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(cw, ch, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    return;
  }

  const [cw, ch] = [$c.width / 2, $c.height / 2];
  const arc = (2 * Math.PI) / product.length;

  // 각 섹션 그리기
  for (let i = 0; i < product.length; i++) {
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(cw, ch);
    ctx.arc(cw, ch, cw - 2, arc * i - Math.PI / 2, arc * (i + 1) - Math.PI / 2);
    ctx.fill();
    ctx.closePath();
  }

  // 테두리
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cw, ch, cw - 2, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();

  // 텍스트 그리기
  ctx.fillStyle = "#000";
  ctx.font = "16px Pretendard";
  ctx.textAlign = "center";

  for (let i = 0; i < product.length; i++) {
    const angle = arc * i + arc / 2 - Math.PI / 2;

    ctx.save();

    ctx.translate(
      cw + Math.cos(angle) * (cw - 50),
      ch + Math.sin(angle) * (ch - 50)
    );

    ctx.rotate(angle + Math.PI / 2);

    // 긴 텍스트 처리
    const text = product[i];
    if (text.length > 8) {
      const words = text.split(' ');
      if (words.length > 1) {
        words.forEach((word, j) => {
          ctx.fillText(word, 0, 20 * j - (words.length - 1) * 10);
        });
      } else {
        ctx.fillText(text.substring(0, 8), 0, -5);
        ctx.fillText(text.substring(8), 0, 15);
      }
    } else {
      ctx.fillText(text, 0, 5);
    }

    ctx.restore();
  }

  // 중앙 원
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cw, ch, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
};

// 항목 목록 업데이트
const updateItemsList = () => {
  itemsList.innerHTML = '';
  
  product.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'item-entry';
    li.style.borderLeftColor = colors[index % colors.length];
    
    li.innerHTML = `
      <span class="item-text">${item}</span>
      <div class="item-controls">
        <button class="move-btn" onclick="moveItem(${index}, -1)" ${index === 0 ? 'disabled' : ''}>↑</button>
        <button class="move-btn" onclick="moveItem(${index}, 1)" ${index === product.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="delete-btn" onclick="deleteItem(${index})">×</button>
      </div>
    `;
    
    itemsList.appendChild(li);
  });
};

// 항목 추가
const addItem = () => {
  const newItem = itemInput.value.trim();
  if (newItem && !product.includes(newItem)) {
    product.push(newItem);
    itemInput.value = '';
    updateItemsList();
    newMake();
  }
};

// 항목 삭제
const deleteItem = (index) => {
  product.splice(index, 1);
  updateItemsList();
  newMake();
};

// 항목 위치 이동
const moveItem = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < product.length) {
    [product[index], product[newIndex]] = [product[newIndex], product[index]];
    updateItemsList();
    newMake();
  }
};

// 모든 항목 삭제
const clearAll = () => {
  if (confirm('모든 항목을 삭제하시겠습니까?')) {
    product = [];
    updateItemsList();
    newMake();
  }
};

// 기본값 복원
const resetDefault = () => {
  product = ["(1)", "(2)", "(3)", "(4)", "(5)", "(6)"];
  updateItemsList();
  newMake();
};

// 모달 열기
const showResultModal = (result) => {
  modalResult.textContent = result;
  currentWinner = result;
  
  // "당첨 항목 삭제" 버튼 표시/숨김
  if (result === '먼저 항목을 추가해주세요!') {
    removeWinnerBtn.style.display = 'none';
  } else {
    removeWinnerBtn.style.display = 'inline-block';
  }
  
  resultModal.style.display = 'block';
  
  // 컨페티 애니메이션 다시 시작
  const confetti = document.querySelector('.confetti');
  confetti.style.animation = 'none';
  confetti.offsetHeight; // 리플로우 강제 실행
  confetti.style.animation = null;
};

// 모달 닫기
const closeModal = () => {
  resultModal.style.display = 'none';
  currentWinner = null;
};

// 당첨 항목 삭제
const removeWinnerItem = () => {
  if (currentWinner && product.includes(currentWinner)) {
    const index = product.indexOf(currentWinner);
    product.splice(index, 1);
    updateItemsList();
    newMake();
    closeModal();
    
    // 남은 항목이 없으면 알림
    if (product.length === 0) {
      setTimeout(() => {
        showResultModal('모든 항목이 삭제되었습니다!');
      }, 300);
    }
  }
};

// 룰렛 회전
const rotate = () => {
  if (product.length === 0) {
    showResultModal('먼저 항목을 추가해주세요!');
    return;
  }

  $c.style.transform = `initial`;
  $c.style.transition = `initial`;

  setTimeout(() => {
    const ran = Math.floor(Math.random() * product.length);
    const arc = 360 / product.length;
    const rotate = (360 - arc * (ran + 1) + 3600) + (arc / 2);

    $c.style.transform = `rotate(${rotate}deg)`;
    $c.style.transition = `2s`;

    setTimeout(() => {
      const resultDiv = document.querySelector("#result");
      resultDiv.textContent = `결과: ${product[ran]}`;
      showResultModal(product[ran]);
    }, 2000);
  }, 1);
};

// 이벤트 리스너들
addButton.addEventListener('click', addItem);
itemInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addItem();
  }
});
clearAllButton.addEventListener('click', clearAll);
resetDefaultButton.addEventListener('click', resetDefault);
spinButton.addEventListener('click', rotate);

// 모달 이벤트 리스너들
closeModalBtn.addEventListener('click', closeModal);
closeBtn.addEventListener('click', closeModal);
spinAgainBtn.addEventListener('click', () => {
  closeModal();
  rotate();
});
removeWinnerBtn.addEventListener('click', removeWinnerItem);

// 모달 외부 클릭시 닫기
window.addEventListener('click', (e) => {
  if (e.target === resultModal) {
    closeModal();
  }
});

// 전역에 함수 등록
window.moveItem = moveItem;
window.deleteItem = deleteItem;

// 초기화
updateItemsList();
newMake();
