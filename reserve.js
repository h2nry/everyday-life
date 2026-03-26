const PEOPLE = {
  "NORMAL": 2,
  "STUDENT": 1
};
const SELECTED_DATES = [
    "26",
    "27"
]
const SELECTED_MOVIE_TIMES = [
    "10:30-12:00",
    "13:00-16:00"
]; // 시작 시간 기준.
let isContinue = true;


/**
 * Define functions and variables
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
}

async function waitLoading() {
    let count = 0
    // 로딩창 대기
    while (!document.querySelector('div[class^="loading_"]') && count < 5) {
        await sleep(100);
        count++;
    }

    // 로딩 끝나기 대기
    count = 0;
    while (document.querySelector('div[class^="loading_"]') && count < 5) {
        await sleep(100);
        count++;
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
                await waitLoading();
                await selectPeopleCount();
                await nextStep();
            }
        }
    }
}

/**
 * STEP 3. 사람수 선택
 */
async function selectPeopleCount() {
    if (!isContinue) return;

    const section = document.querySelector('section[class^="cnms01520_personnel"]');
    if (!section) return;

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
                _button.click();
                await sleep(100);
            }
        }
    }
}

/**
 * STEP 4. 좌선 선택 화면으로 넘어가기
 */
async function nextStep() {
    const btn = document.querySelector('button[class^="cnms01520_btnBgAnimation"]');
    if (btn) btn.click();

    await selectSeat();
}

/**
 * STEP 5. 좌석 선택
 */
async function selectSeat() {
    const BUTTON_QUERY = 'button[class*="seatMap_seatNumber"][class*="seatMap_seatNormal"]'
    const SEAT_REGEX = /^(?<seat>[A-Za-z]+)(?<seatNumber>\d+)$/;
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

    let _targets = document.querySelectorAll(`${BUTTON_QUERY}:not([class*="seatMap_seatDisabled"], [class*="seatMap_active"])`)
    let selectedSeats = []
    for (const _target of _targets) {
        if (!isContinue) break;

        if (_target.closest(".rzpp-mini-map")) continue;

        const targetRegex = _target.innerText.match(SEAT_REGEX);
        console.log(targetRegex);
        const { seat, seatNumber } = targetRegex.groups

        if (selectedSeats.length > 0) {
            const lastSeat = selectedSeats[selectedSeats.length - 1]
            if (lastSeat.seat != seat || lastSeat.number + 1 != seatNumber) {
                selectedSeats = []
            }
        }
        selectedSeats.push({ seat: seat, number: parseInt(seatNumber, 10) });
        
        if (selectedSeats.length >= count) break;
    }

    if (selectedSeats.length >= count) {
        for (let i = 0; isContinue && i < selectedSeats.length; i += 2) {
            let { seat, number } = selectedSeats[i];

            const element = [...document.querySelectorAll(`${BUTTON_QUERY} > span`)]
                .find(span => span.textContent.trim() === `${seat}${number}`);
            element.click();
            await sleep(100);
        }
    }

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
        recurse = 0;
        element.click();
    }
}
