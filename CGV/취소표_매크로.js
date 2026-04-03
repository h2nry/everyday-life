const PEOPLE = {
   "NORMAL": 2,
   "STUDENT": 0
};
const SELECTED_DATES = [
   "26",
   "27"
] // 현재 미사용
const SELECTED_MOVIE_TIMES = [
   "6:30-21:00",
   // "13:00-16:00"
]; // 시작 시간 기준.
const SELECTED_SEATS = [
   "H:11-34",
   "I:11-34",
   "J:11-36",
   "K:11-36",
   "L:11-36",
]

/**
* Define functions and variables
*/
let isContinue = true;
const targetSeats = new Set();
let peopleCount = 0;

function sleep(ms) {
 return new Promise((r) => setTimeout(r, ms));
}
function timeToMinutes(timeStr) {
   const [h, m] = timeStr.split(":").map(Number);
   return h * 60 + m;
}
function prepareSelectedSeats() {
   for (const _seat of SELECTED_SEATS) {
       if (!_seat.includes(":")) {
           targetSeats.add(`${_seat}`)
           continue;
       }
       const [row, range] = _seat.split(":");
       if (!range) continue;
       const [start, end] = range.split("-").map(n => parseInt(n, 10));
       if (!start || !end) continue;
       for (let number = start; number <= end; number++) {
           targetSeats.add(`${row}${number}`)
       }
   }
}
async function beep() {
   const snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
   snd.play();
}

/**
* STEP 1. 날짜 선택
*/
async function selectDate() {
   for (const _dateButton of document.querySelectorAll('button[class*="dayScroll_scrollItem"]')) {
       if (!isContinue) break;
       const textElement = _dateButton.querySelector('span[class*="dayScroll_number"]');
       if (!textElement) continue;
       const date = textElement.textContent.trim();
       const cleanedDate = date.includes('.')
           ? date.split('.')[1].padStart(2, '0')
           : date.padStart(2, '0');
       if (SELECTED_DATES.includes(cleanedDate) && !_dateButton.disabled) {
           _dateButton.click();
           await selectMovieTime();
       }
   }
}

/**
* STEP 2. 시간 선택
*/
async function selectMovieTime() {
   if (!isContinue) return;
   for (const _timeButton of document.querySelectorAll('button[class*="cinemaSchedule_scrollItemBtn"]')) {
       if (!isContinue) break;
       const timeElement = _timeButton.querySelector('span[class*="cinemaSchedule_startTime"]');
       if (!timeElement) continue;
       const startTime = timeElement.textContent.trim();
       const startMinutes = timeToMinutes(startTime);
       for (const range of SELECTED_MOVIE_TIMES) {
           const [startRange, endRange] = range.split("-");
           if (startMinutes >= timeToMinutes(startRange) && startMinutes <= timeToMinutes(endRange)) {
               timeElement.click();
               await selectPeopleCount();
               await nextStep();
               await selectSeat();
               await sleep(100);
           }
       }
   }
}

/**
* STEP 3. 사람수 선택
*/
async function selectPeopleCount() {
   async function waitLoading() {
       const MAX_COUNT = 10;
       let count = 0
       // 로딩창 대기
       while (!document.querySelector('div[class^="loading_"]') && count < MAX_COUNT) {
           await sleep(200);
           count++;
       }
       if (count >= MAX_COUNT) return false;
       // 로딩 끝나기 대기
       count = 0;
       while (document.querySelector('div[class^="loading_"]') && count < MAX_COUNT) {
           await sleep(200);
           count++;
       }
       if (count >= MAX_COUNT) return false;
       return true;
   }
   if (!isContinue) return;
   if (!(await waitLoading())) return;
   await sleep(500);
   const section = document.querySelector('section[class^="cnms01520_personnel"]');
   if (!section) return;
   peopleCount = 0;
   for (const _categoryElement of section.querySelectorAll('[class^="numberChoice_NumberWrap"]')) {
       if (!isContinue) break;
       const countElement = _categoryElement.querySelector('[class^="numberChoice_label"]');
       if (!countElement) continue;
       const label = countElement.textContent.trim();
       let targetCount = 0;
       if (label === "일반" && PEOPLE.NORMAL) {
           targetCount = PEOPLE.NORMAL;
       }
       if (label === "청소년" && PEOPLE.STUDENT) {
           targetCount = PEOPLE.STUDENT;
       }
       if (targetCount <= 0) continue;
       for (const _button of _categoryElement.querySelectorAll('button.btn-num')) {
           if (_button.textContent.trim() === String(targetCount)) {
               peopleCount += targetCount;
               _button.click();
               await sleep(300);
           }
       }
   }
}

/**
* STEP 4. 좌선 선택 화면으로 넘어가기
*/
async function nextStep() {
   if (!isContinue) return;
   const btn = document.querySelector('button[class^="cnms01520_btnBgAnimation"]');
   if (btn) btn.click();
}

/**
* STEP 5. 좌석 선택
*/
async function selectSeat() {
   async function waitLoading() {
       // 로딩 끝나기 대기
       let modal;
       while (modal = document.querySelector('.cgv-modal.cgv-bot-modal')) {
           if (modal.classList.contains('active')) break;
           await sleep(100);
       }
       await sleep(300);
       return true;
   }
   if (!isContinue) return;
   if (!(await waitLoading())) return;
   const BUTTON_QUERY = 'button[class*="seatMap_seatNumber"][class*="seatMap_seatNormal"]'
   const SEAT_REGEX = /^(?<seat>[A-Za-z]+)(?<seatNumber>\d+)$/;
   let selectedSeats = []
   for (const _target of document.querySelectorAll(`${BUTTON_QUERY}:not([class*="seatMap_seatDisabled"], [class*="seatMap_active"])`)) {
       if (!isContinue) break;
       if (_target.closest(".rzpp-mini-map")) continue;
       if (!_target.innerText) continue;
       const targetRegex = _target.innerText.match(SEAT_REGEX);
       const { seat, seatNumber } = targetRegex.groups
       if (!targetSeats.has(`${seat}${seatNumber}`)) continue;
       if (selectedSeats.length > 0) {
           const lastSeat = selectedSeats[selectedSeats.length - 1]
           if (lastSeat.seat != seat || lastSeat.number + 1 != seatNumber) {
               selectedSeats = []
           }
       }
       selectedSeats.push({ seat: seat, number: parseInt(seatNumber, 10) });
       if (selectedSeats.length >= peopleCount) break;
   }
   if (selectedSeats.length >= peopleCount) {
       for (let i = 0; isContinue && i < selectedSeats.length; i += 2) {
           let { seat, number } = selectedSeats[i];
           const element = [...document.querySelectorAll(`${BUTTON_QUERY} > span`)]
               .find(span => span.textContent.trim() === `${seat}${number}`);
           element.click();
           await sleep(100);
       }
       await pay();
   } else {
       document.querySelector('.btn-close').click()
       await sleep(100);
   }
}

/**
* STEP 6. 결제하기
*/
async function pay() {
   if (!isContinue) return;
   const BUTTON_CLICK_STEPS = [
       {
           "type": "EQUAL",
           "value": "선택완료"
       },
       {
           "type": "TRIM+ENDSWITH",
           "value": "원결제하기"
       },
       {
           "type": "EQUAL",
           "value": "결제하기"
       },
   ]
   let cursor = 0;
   let recurse = 0;
   let time = 0;
   while (isContinue && cursor < BUTTON_CLICK_STEPS.length && recurse < 5) {
       const step = BUTTON_CLICK_STEPS[cursor];
       const element = [...document.querySelectorAll(`button.btn.btn-100.fill-main:not(:disabled)`)]
           .find(_el => {
               if (step.type == "EQUAL") return _el.innerText.trim() == step.value
               else if (step.type == "TRIM+ENDSWITH") return _el.innerText.replace(/\s+/g, '').endsWith(step.value)
               return false;
           })
       if (!element) {
           recurse++;
           await sleep(100);
           continue;
       }

       if (cursor == 0) {
           await beep();
       }
       cursor++;
       if (cursor == BUTTON_CLICK_STEPS.length) {
           isContinue = false;
       }
       await sleep(time);
       time += 600;
       recurse = 0;
       element.click();
   }
}

prepareSelectedSeats();
while (isContinue) {
   await selectMovieTime();
   await sleep(100)
}
