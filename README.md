# 정책지원관 오픈채팅방 자동 초대 시스템

정책지원관들이 정보를 입력하면 자동으로 카카오톡 오픈채팅방으로 초대되는 웹 폼입니다.

## 주요 기능

- ✅ 반응형 웹 디자인 (모바일/PC 최적화)
- ✅ 실시간 입력 검증 (이메일, 전화번호 형식 체크)
- ✅ 제출 완료 후 자동 리다이렉션 (3초 카운트다운)
- ✅ 중복 제출 방지
- ✅ 로컬 스토리지 데이터 저장
- ✅ 개인정보 수집·이용 동의 절차 포함

## 수집 정보 항목

### 필수 항목
- 이름
- 소속 기관/부서
- 연락처 (휴대폰번호)
- 이메일

### 선택 항목
- 직급/직책
- 담당 업무 분야
- 참여 목적

## 설치 및 사용 방법

### 1. 오픈카톡방 링크 설정

`script.js` 파일의 첫 번째 줄에서 오픈카톡방 링크를 설정하세요:

```javascript
// script.js 1번째 줄
const KAKAO_CHAT_LINK = 'https://open.kakao.com/o/YOUR_CHAT_ID';
```

**오픈카톡방 링크 얻는 방법:**
1. 카카오톡에서 오픈채팅방 생성
2. 채팅방 설정 → "채팅방 링크" 선택
3. 생성된 링크를 복사하여 위 코드에 붙여넣기

### 2. 웹 서버에 업로드

다음 파일들을 웹 서버에 업로드하세요:
- `index.html`
- `styles.css`
- `script.js`

### 3. 파일 실행 방법

#### 방법 A: 로컬에서 테스트 (간단)
브라우저에서 `index.html` 파일을 직접 열기

#### 방법 B: 로컬 웹 서버 (권장)
```bash
# Python이 설치되어 있는 경우
python -m http.server 8000

# 또는 Python 3
python3 -m http.server 8000

# Node.js http-server 사용
npx http-server
```

그 후 브라우저에서 `http://localhost:8000` 접속

#### 방법 C: 웹 호스팅 서비스
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- 기타 정적 웹 호스팅 서비스

## 제출 데이터 확인 방법

제출된 데이터는 브라우저의 로컬 스토리지에 저장됩니다.

### 브라우저 개발자 도구에서 확인:
1. 브라우저에서 `F12` 또는 `우클릭 → 검사` 클릭
2. `Application` (또는 `저장소`) 탭 선택
3. `Local Storage` → 해당 도메인 선택
4. `policyOfficerSubmissions` 항목 확인

### JavaScript 콘솔에서 확인:
```javascript
// 브라우저 콘솔(F12)에서 실행
const submissions = JSON.parse(localStorage.getItem('policyOfficerSubmissions'));
console.table(submissions);
```

### 데이터 내보내기 (CSV):
```javascript
// 브라우저 콘솔에서 실행
const submissions = JSON.parse(localStorage.getItem('policyOfficerSubmissions'));
const csv = submissions.map(s => Object.values(s).join(',')).join('\n');
console.log(csv);
// 또는 다운로드
const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'submissions.csv';
a.click();
```

## 커스터마이징

### 색상 변경
`styles.css` 파일에서 색상을 변경할 수 있습니다:

```css
/* 배경 그라데이션 */
background: linear-gradient(135deg, #FEE500 0%, #FFD700 100%);

/* 버튼 색상 */
background: #3C1E1E;

/* 링크 색상 */
background: #FEE500;
```

### 입력 항목 추가/제거
1. `index.html`에서 원하는 필드 추가/제거
2. `script.js`의 `formData` 객체에 해당 필드 추가/제거

## 보안 고려사항

- 현재는 클라이언트 사이드에서만 데이터 처리
- 실제 운영 환경에서는 백엔드 서버 연동 권장
- HTTPS 사용 권장
- 개인정보 보호법 준수 필요

## 백엔드 연동 (선택사항)

실제 데이터베이스에 저장하려면 서버 연동이 필요합니다:

```javascript
// script.js의 saveSubmission 함수 수정 예시
async function saveSubmission(data) {
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('데이터 저장 성공');
        }
    } catch (error) {
        console.error('데이터 저장 실패:', error);
    }
}
```

## 브라우저 호환성

- Chrome (권장)
- Firefox
- Safari
- Edge
- 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 문제 해결

### Q: 폼 제출 후 오픈채팅방으로 이동하지 않아요
A: `script.js`의 `KAKAO_CHAT_LINK`가 올바르게 설정되었는지 확인하세요.

### Q: 전화번호 형식이 자동으로 안 맞춰져요
A: 숫자만 입력하면 자동으로 `010-1234-5678` 형식으로 변환됩니다.

### Q: 데이터가 저장되지 않아요
A: 로컬 스토리지는 브라우저별로 독립적입니다. 다른 브라우저나 시크릿 모드에서는 데이터가 공유되지 않습니다.

## 라이선스

MIT License - 자유롭게 사용 및 수정 가능합니다.

## 지원

문제가 있거나 개선 제안이 있으시면 이슈를 등록해주세요.
