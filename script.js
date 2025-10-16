// ===== 설정 영역 =====
// Google Apps Script 웹 앱 URL (배포 시 받은 URL로 변경)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhoZeYdiXAaeay0Y8aTDgn6kUi0BMk12UpDVQAITe1u7-DsRprVMexIbC6utTcWwTh6w/exec';

// 오픈카톡방 링크 설정
const KAKAO_CHAT_LINK = 'https://open.kakao.com/o/gpIlDpXh';

// DOM 요소
const form = document.getElementById('registrationForm');
const successMessage = document.getElementById('successMessage');
const chatLink = document.getElementById('chatLink');
const countdownText = document.getElementById('countdownText');

// 폼 제출 이벤트
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 폼 유효성 검사
    if (!validateForm()) {
        return;
    }

    // 제출 버튼 비활성화
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '제출 중...';

    // 폼 데이터 수집
    const formData = {
        name: document.getElementById('name').value,
        organization: document.getElementById('organization').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        position: document.getElementById('position').value,
        workArea: document.getElementById('workArea').value,
        committee: document.getElementById('committee').value,
        purpose: document.getElementById('purpose').value,
        timestamp: new Date().toISOString()
    };

    try {
        // Google Sheets에 데이터 전송
        await sendToGoogleSheets(formData);

        // 로컬 스토리지에도 백업 저장
        saveToLocalStorage(formData);

        // 폼 숨기고 성공 메시지 표시
        form.style.display = 'none';
        document.querySelector('.header').style.display = 'none';
        successMessage.style.display = 'block';

        // 오픈채팅 링크 설정
        chatLink.href = KAKAO_CHAT_LINK;

        // 카운트다운 시작
        startCountdown();

    } catch (error) {
        console.error('제출 오류:', error);
        alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.\n\n오류: ' + error.message);

        // 버튼 다시 활성화
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
});

// 폼 유효성 검사
function validateForm() {
    let isValid = true;

    // 이름 검증
    const name = document.getElementById('name').value.trim();
    if (name.length < 2) {
        showError('name', '이름을 정확히 입력해주세요');
        isValid = false;
    } else {
        clearError('name');
    }

    // 소속 검증
    const organization = document.getElementById('organization').value.trim();
    if (organization.length < 2) {
        showError('organization', '소속 의회를 입력해주세요');
        isValid = false;
    } else {
        clearError('organization');
    }

    // 전화번호 검증
    const phone = document.getElementById('phone').value.trim();
    const phonePattern = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phonePattern.test(phone.replace(/-/g, ''))) {
        showError('phone', '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)');
        isValid = false;
    } else {
        clearError('phone');
    }

    // 이메일 검증
    const email = document.getElementById('email').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showError('email', '올바른 이메일 형식이 아닙니다');
        isValid = false;
    } else {
        clearError('email');
    }

    // 개인정보 동의 검증
    const privacy = document.getElementById('privacy').checked;
    if (!privacy) {
        alert('개인정보 수집·이용에 동의해주세요');
        isValid = false;
    }

    return isValid;
}

// 에러 메시지 표시
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);

    errorElement.textContent = message;
    errorElement.style.display = 'block';
    inputElement.classList.add('error');
}

// 에러 메시지 제거
function clearError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);

    errorElement.textContent = '';
    errorElement.style.display = 'none';
    inputElement.classList.remove('error');
}

// 실시간 입력 검증
document.getElementById('phone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, '');

    if (value.length > 3 && value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3);
    } else if (value.length > 7) {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }

    e.target.value = value;
});

// Google Sheets에 데이터 전송
async function sendToGoogleSheets(data) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 간주
        console.log('Google Sheets에 데이터 전송 완료');
        return true;

    } catch (error) {
        console.error('Google Sheets 전송 실패:', error);
        throw new Error('데이터 전송에 실패했습니다.');
    }
}

// 로컬 스토리지에 백업 저장
function saveToLocalStorage(data) {
    try {
        let submissions = JSON.parse(localStorage.getItem('policyOfficerSubmissions') || '[]');
        submissions.push(data);
        localStorage.setItem('policyOfficerSubmissions', JSON.stringify(submissions));

        // 중복 제출 방지
        sessionStorage.setItem('formSubmitted', 'true');
    } catch (error) {
        console.error('로컬 스토리지 저장 실패:', error);
    }
}

// 카운트다운 및 자동 리다이렉션
function startCountdown() {
    let seconds = 3;

    const interval = setInterval(() => {
        seconds--;

        if (seconds > 0) {
            countdownText.textContent = `${seconds}초 후 오픈채팅방으로 이동합니다...`;
        } else {
            clearInterval(interval);
            window.location.href = KAKAO_CHAT_LINK;
        }
    }, 1000);
}

// 페이지 로드 시 중복 제출 확인
window.addEventListener('load', function() {
    if (sessionStorage.getItem('formSubmitted') === 'true') {
        if (confirm('이미 제출하셨습니다. 오픈채팅방으로 바로 이동하시겠습니까?')) {
            window.location.href = KAKAO_CHAT_LINK;
        }
    }
});

// 바로 이동하기 버튼 클릭 이벤트
chatLink.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = KAKAO_CHAT_LINK;
});
