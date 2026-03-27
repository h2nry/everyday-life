const PEOPLE = {
    "NORMAL": 2,
    "STUDENT": 0
};
const SELECTED_DATES = [
    "26",
    "27"
]
const SELECTED_MOVIE_TIMES = [
    "10:30-12:00",
    "13:00-16:00"
]; // 시작 시간 기준.
const SELECTED_SEATS = [
    "H:13-32",
    "I:13-32",
    "J:11-34",
    "K:11-34",
    "L:11-34",
]
let isContinue = true;


/**
 * Define functions and variables
 */
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

        cursor++;
        if (cursor == BUTTON_CLICK_STEPS.length) {
            isContinue = false;
            await sleep(600);
        } else {
            await sleep(300);
        }

        recurse = 0;
        element.click();
    }
}


prepareSelectedSeats();
while (isContinue) {
    await selectMovieTime();
    await sleep(200)
}
