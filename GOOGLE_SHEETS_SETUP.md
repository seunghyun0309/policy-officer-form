# Google Sheets 연동 및 이메일 알림 설정 가이드

정책지원관 폼을 Google Sheets와 연동하고 새로운 가입자가 있을 때 자동으로 이메일 알림을 받는 방법입니다.

## 📋 목차

1. [Google Sheets 생성](#1-google-sheets-생성)
2. [Google Apps Script 설정](#2-google-apps-script-설정)
3. [웹 앱 배포](#3-웹-앱-배포)
4. [폼에 URL 연동](#4-폼에-url-연동)
5. [이메일 알림 설정](#5-이메일-알림-설정)
6. [테스트](#6-테스트)
7. [문제 해결](#7-문제-해결)

---

## 1. Google Sheets 생성

### 1-1. 새 스프레드시트 만들기

1. [Google Sheets](https://sheets.google.com) 접속
2. **빈 스프레드시트** 클릭
3. 제목을 "정책지원관 가입 명단" 등으로 변경

### 1-2. 시트 이름 변경 (선택)

- 하단의 "Sheet1"을 "정책지원관"으로 변경
- 또는 `google-apps-script.js`의 `SHEET_NAME` 설정을 변경

---

## 2. Google Apps Script 설정

### 2-1. Apps Script 열기

1. Google Sheets에서 **확장 프로그램** → **Apps Script** 클릭
2. 새 탭에서 Apps Script 에디터가 열림

### 2-2. 스크립트 코드 붙여넣기

1. 기본 `myFunction()` 코드 **전체 삭제**
2. `google-apps-script.js` 파일의 내용을 **전체 복사**하여 붙여넣기

### 2-3. 설정 수정

스크립트 상단의 `CONFIG` 객체를 수정하세요:

```javascript
const CONFIG = {
  // 이메일 알림을 받을 관리자 이메일 주소 (쉼표로 구분하여 여러 명 가능)
  ADMIN_EMAILS: 'your-email@example.com, manager@example.com',

  // 시트 이름 (기본값: '정책지원관')
  SHEET_NAME: '정책지원관',

  // 오픈카톡방 링크 (script.js와 동일하게 설정)
  KAKAO_CHAT_LINK: 'https://open.kakao.com/o/YOUR_CHAT_ID',

  // 이메일 제목
  EMAIL_SUBJECT: '[정책지원관] 새로운 가입자 알림',
};
```

**필수 수정 항목:**
- ✅ `ADMIN_EMAILS`: 실제 이메일 주소로 변경
- ✅ `KAKAO_CHAT_LINK`: 실제 오픈카톡방 링크로 변경

### 2-4. 저장

- **Ctrl + S** (Windows) 또는 **Cmd + S** (Mac)
- 또는 상단의 💾 아이콘 클릭
- 프로젝트 이름을 "정책지원관 폼 핸들러" 등으로 지정

---

## 3. 웹 앱 배포

### 3-1. 배포 시작

1. 우측 상단의 **배포** 버튼 클릭
2. **새 배포** 선택

### 3-2. 배포 설정

1. **유형 선택** 옆의 ⚙️ 아이콘 클릭
2. **웹 앱** 선택
3. 아래 설정 입력:

```
설명: 정책지원관 폼 데이터 수신 (선택)
웹 앱:
  - 다음 계정으로 실행: 나
  - 액세스 권한: 모든 사용자
```

4. **배포** 버튼 클릭

### 3-3. 권한 승인

처음 배포 시 권한 승인이 필요합니다:

1. "승인 필요" 대화상자 → **액세스 권한 검토** 클릭
2. Google 계정 선택
3. **고급** → **[프로젝트명](으)로 이동** 클릭
4. **허용** 클릭

### 3-4. 웹 앱 URL 복사

배포가 완료되면 **웹 앱 URL**이 표시됩니다:

```
https://script.google.com/macros/s/AKfycby.../exec
```

⚠️ **중요**: 이 URL을 복사해두세요! (다음 단계에서 사용)

---

## 4. 폼에 URL 연동

### 4-1. script.js 파일 수정

`script.js` 파일의 3번째 줄을 수정하세요:

**수정 전:**
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
```

**수정 후:**
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec'; // 실제 URL로 변경
```

### 4-2. 오픈카톡방 링크도 확인

`script.js` 파일의 6번째 줄도 확인하세요:

```javascript
const KAKAO_CHAT_LINK = 'https://open.kakao.com/o/YOUR_CHAT_ID'; // 실제 링크로 변경
```

---

## 5. 이메일 알림 설정

### 5-1. 기본 설정

이메일 알림은 `google-apps-script.js`의 `CONFIG.ADMIN_EMAILS`에 설정한 주소로 자동 발송됩니다.

### 5-2. 여러 명에게 알림 보내기

쉼표(,)로 구분하여 여러 이메일 주소를 입력하세요:

```javascript
ADMIN_EMAILS: 'admin1@example.com, admin2@example.com, admin3@example.com',
```

### 5-3. 이메일 내용 커스터마이징

`sendEmailNotification()` 함수에서 이메일 내용을 수정할 수 있습니다.

---

## 6. 테스트

### 6-1. 테스트 데이터 전송

Apps Script 에디터에서 테스트할 수 있습니다:

1. Apps Script 에디터에서 함수 선택 드롭다운 클릭
2. `testSaveToSheet` 선택
3. **실행** 버튼(▶️) 클릭
4. Google Sheets로 돌아가서 데이터가 추가되었는지 확인

### 6-2. 이메일 알림 테스트

1. 함수 선택 드롭다운에서 `testEmailNotification` 선택
2. **실행** 버튼 클릭
3. 설정한 이메일 주소로 테스트 메일이 도착하는지 확인

### 6-3. 실제 폼 테스트

1. 웹 브라우저에서 `index.html` 실행
2. 테스트 정보 입력 및 제출
3. Google Sheets에서 데이터 확인
4. 이메일 수신 확인

---

## 7. 문제 해결

### Q1: 폼 제출 시 "제출 중 오류가 발생했습니다" 메시지가 뜹니다

**해결 방법:**
1. `script.js`의 `GOOGLE_SCRIPT_URL`이 올바른지 확인
2. Google Apps Script가 **웹 앱**으로 배포되었는지 확인
3. 배포 시 액세스 권한을 **"모든 사용자"**로 설정했는지 확인

### Q2: Google Sheets에 데이터가 저장되지 않습니다

**해결 방법:**
1. Apps Script 에디터에서 **실행 로그** 확인 (Ctrl+Enter)
2. `CONFIG.SHEET_NAME`이 실제 시트 이름과 일치하는지 확인
3. `testSaveToSheet` 함수를 실행하여 오류 메시지 확인

### Q3: 이메일이 오지 않습니다

**해결 방법:**
1. `CONFIG.ADMIN_EMAILS`가 올바른지 확인
2. 스팸 메일함 확인
3. Apps Script의 **실행 로그**에서 오류 확인
4. `testEmailNotification` 함수로 테스트

### Q4: "승인 필요" 대화상자가 계속 나타납니다

**해결 방법:**
1. "고급" → "[프로젝트명](으)로 이동" 클릭
2. "허용" 버튼 클릭
3. 여전히 문제가 있다면 Google 계정 설정에서 "보안 수준이 낮은 앱 허용" 확인

### Q5: CORS 오류가 발생합니다

**해결 방법:**
- `script.js`에서 `mode: 'no-cors'`가 설정되어 있는지 확인
- Google Apps Script 웹 앱은 CORS를 지원하지 않으므로 `no-cors` 모드 필수

### Q6: 배포 후 코드를 수정했는데 반영이 안 됩니다

**해결 방법:**
1. Apps Script 에디터에서 **배포** → **배포 관리** 클릭
2. 연필 아이콘(수정) 클릭
3. **버전** → **새 버전** 선택
4. **배포** 클릭

---

## 📊 Google Sheets 데이터 구조

자동으로 생성되는 시트의 열 구조:

| 제출일시 | 이름 | 소속 기관/부서 | 연락처 | 이메일 | 직급/직책 | 담당 업무 분야 | 참여 목적 |
|---------|------|---------------|--------|--------|----------|--------------|----------|
| 2024-01-15 14:30:00 | 홍길동 | 교육부 정책기획과 | 010-1234-5678 | hong@gov.kr | 사무관 | 교육정책 | 정보공유 |

---

## 🔒 보안 고려사항

### 개인정보 보호

- Google Sheets 공유 설정을 **비공개** 또는 **특정 사용자**로 제한
- 민감한 데이터는 암호화 고려
- 주기적으로 불필요한 데이터 삭제

### Apps Script 권한

- 배포 시 "다음 계정으로 실행: 나" 선택 권장
- 정기적으로 배포 상태 확인

---

## 🚀 추가 기능 (선택사항)

### 1. Slack/Discord 알림 연동

`sendEmailNotification()` 함수에 Webhook URL 추가:

```javascript
function sendSlackNotification(data) {
  const webhookUrl = 'YOUR_SLACK_WEBHOOK_URL';

  UrlFetchApp.fetch(webhookUrl, {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify({
      text: `새로운 가입자: ${data.name} (${data.organization})`
    })
  });
}
```

### 2. 데이터 백업

정기적으로 Google Drive에 백업:

```javascript
function backupToCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  const csv = sheet.getDataRange().getValues().map(row => row.join(',')).join('\n');

  DriveApp.createFile(`backup_${new Date().toISOString()}.csv`, csv);
}
```

### 3. 중복 확인

이메일 중복 체크:

```javascript
function isDuplicate(email) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  const emails = sheet.getRange(2, 5, sheet.getLastRow() - 1, 1).getValues().flat();
  return emails.includes(email);
}
```

---

## 📞 지원

문제가 지속되면:
1. Apps Script 실행 로그 확인
2. Google Sheets 권한 확인
3. 브라우저 콘솔(F12) 확인

---

## ✅ 체크리스트

설정 완료 여부를 확인하세요:

- [ ] Google Sheets 생성
- [ ] Apps Script 코드 붙여넣기
- [ ] `CONFIG.ADMIN_EMAILS` 수정
- [ ] `CONFIG.KAKAO_CHAT_LINK` 수정
- [ ] 웹 앱 배포 완료
- [ ] 웹 앱 URL 복사
- [ ] `script.js`의 `GOOGLE_SCRIPT_URL` 수정
- [ ] `script.js`의 `KAKAO_CHAT_LINK` 수정
- [ ] `testSaveToSheet` 테스트 성공
- [ ] `testEmailNotification` 테스트 성공
- [ ] 실제 폼 제출 테스트 성공

모든 항목이 체크되면 설정 완료입니다! 🎉
