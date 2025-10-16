# Vercel + Supabase 배포 가이드

정책지원관 폼을 Vercel과 Supabase를 사용하여 배포하는 전체 가이드입니다.

## 📋 목차

1. [준비사항](#1-준비사항)
2. [Supabase 설정](#2-supabase-설정)
3. [Resend 이메일 설정](#3-resend-이메일-설정-선택사항)
4. [Vercel 배포](#4-vercel-배포)
5. [환경 변수 설정](#5-환경-변수-설정)
6. [데이터베이스 Webhook 설정](#6-데이터베이스-webhook-설정)
7. [테스트](#7-테스트)
8. [문제 해결](#8-문제-해결)

---

## 1. 준비사항

### 필요한 계정

- ✅ [Supabase](https://supabase.com) 계정 (무료)
- ✅ [Vercel](https://vercel.com) 계정 (무료)
- ✅ [Resend](https://resend.com) 계정 (선택사항, 이메일 알림용)
- ✅ GitHub 계정 (Vercel 배포용)

### 로컬 개발 환경

```bash
# Node.js 설치 확인
node --version  # v18 이상 권장

# 프로젝트 디렉토리로 이동
cd /Users/seuntang/abc

# 패키지 설치
npm install
```

---

## 2. Supabase 설정

### 2-1. 프로젝트 생성

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - Name: `policy-officer-form`
   - Database Password: 안전한 비밀번호 입력 (잘 기억해두세요!)
   - Region: `Northeast Asia (Seoul)`
4. **Create new project** 클릭 (1-2분 소요)

### 2-2. 데이터베이스 스키마 생성

1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase-schema.sql` 파일의 내용을 복사하여 붙여넣기
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)

✅ 성공 메시지가 표시되면 테이블 생성 완료!

### 2-3. API 키 확인

1. 좌측 메뉴에서 **Settings** → **API** 클릭
2. 다음 정보를 복사해두세요:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (긴 문자열)

---

## 3. Resend 이메일 설정 (선택사항)

이메일 알림을 받으려면 Resend를 설정하세요.

### 3-1. Resend 가입 및 도메인 설정

1. [Resend](https://resend.com) 가입
2. **Domains** → **Add Domain** 클릭
3. 도메인 추가 또는 테스트용으로 `onboarding@resend.dev` 사용

### 3-2. API 키 생성

1. **API Keys** → **Create API Key** 클릭
2. Name: `policy-officer-notifications`
3. Permission: **Full Access**
4. API Key 복사 (`re_...` 형식)

⚠️ **중요**: API Key는 한 번만 표시되므로 안전한 곳에 저장하세요!

### 대안: 다른 이메일 서비스

- **SendGrid**: 무료 플랜 100통/일
- **Mailgun**: 무료 플랜 100통/일
- **Gmail SMTP**: 개인 프로젝트용

---

## 4. Vercel 배포

### 4-1. GitHub 저장소 생성

```bash
# Git 초기화 (아직 안 했다면)
cd /Users/seuntang/abc
git init

# 파일 추가
git add .
git commit -m "Initial commit: Policy officer form with Vercel + Supabase"

# GitHub 저장소 연결 (GitHub에서 먼저 저장소 생성)
git remote add origin https://github.com/YOUR_USERNAME/policy-officer-form.git
git branch -M main
git push -u origin main
```

### 4-2. Vercel에서 프로젝트 가져오기

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **Add New** → **Project** 클릭
3. GitHub 저장소 연결:
   - **Import Git Repository** 선택
   - `policy-officer-form` 저장소 선택
   - **Import** 클릭

### 4-3. 프로젝트 설정

빌드 설정은 기본값 사용:
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: (비워둠)
- **Output Directory**: (비워둠)

**Deploy** 클릭하지 말고, 먼저 환경 변수를 설정합니다!

---

## 5. 환경 변수 설정

### 5-1. Vercel 환경 변수 추가

Vercel 프로젝트 설정 페이지에서:

1. **Settings** → **Environment Variables** 클릭
2. 다음 변수들을 추가:

```env
# Supabase
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGc...

# Resend (이메일 알림 사용 시)
RESEND_API_KEY = re_...
EMAIL_FROM = noreply@yourdomain.com
ADMIN_EMAILS = admin@example.com,manager@example.com

# 오픈카톡방
KAKAO_CHAT_LINK = https://open.kakao.com/o/YOUR_CHAT_ID
```

**각 환경 변수 설정 시:**
- Environment: **Production**, **Preview**, **Development** 모두 체크
- **Add** 클릭

### 5-2. 로컬 개발용 환경 변수

로컬 개발을 위해 `.env` 파일 생성:

```bash
# .env.example을 복사
cp .env.example .env

# .env 파일 편집
nano .env  # 또는 원하는 에디터 사용
```

`.env` 파일에 실제 값 입력:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAILS=your-email@example.com
KAKAO_CHAT_LINK=https://open.kakao.com/o/YOUR_CHAT_ID
```

---

## 6. 데이터베이스 Webhook 설정

새로운 가입자가 등록될 때 자동으로 이메일을 보내기 위한 Webhook 설정입니다.

### 방법 A: Supabase Edge Function 사용 (권장)

#### 1. Supabase CLI 설치

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### 2. Supabase 프로젝트 연결

```bash
# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_ID
```

#### 3. Edge Function 배포

```bash
# Edge Function 배포
supabase functions deploy send-notification

# 환경 변수 설정
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAILS=admin@example.com
supabase secrets set EMAIL_FROM=noreply@yourdomain.com
supabase secrets set KAKAO_CHAT_LINK=https://open.kakao.com/o/YOUR_CHAT_ID
```

#### 4. Database Webhook 생성

Supabase Dashboard에서:

1. **Database** → **Webhooks** 클릭
2. **Create a new hook** 클릭
3. 설정:
   - Name: `notify-new-policy-officer`
   - Table: `policy_officers`
   - Events: `INSERT` 체크
   - Type: `HTTP Request`
   - Method: `POST`
   - URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/send-notification`
   - HTTP Headers:
     ```
     Authorization: Bearer YOUR_ANON_KEY
     Content-Type: application/json
     ```
4. **Create webhook** 클릭

### 방법 B: Vercel API 직접 호출

Supabase Webhook URL을 다음으로 설정:
```
https://your-vercel-domain.vercel.app/api/submit-webhook
```

이 경우 `api/submit-webhook.js` 파일을 별도로 생성해야 합니다.

---

## 7. 테스트

### 7-1. 로컬 테스트

```bash
# Vercel 개발 서버 실행
npm run dev

# 또는
vercel dev
```

브라우저에서 `http://localhost:3000` 접속하여 폼 테스트

### 7-2. 배포 후 테스트

1. Vercel에서 **Deploy** 클릭
2. 배포 완료 후 도메인 확인 (예: `https://policy-officer-form.vercel.app`)
3. 실제 폼 제출 테스트:
   - 테스트 정보 입력
   - 제출 버튼 클릭
   - Supabase Dashboard에서 데이터 확인
   - 이메일 수신 확인

### 7-3. Supabase에서 데이터 확인

1. Supabase Dashboard → **Table Editor**
2. `policy_officers` 테이블 선택
3. 제출한 데이터가 표시되는지 확인

---

## 8. 문제 해결

### Q1: "Failed to send data" 오류가 발생합니다

**해결 방법:**
1. Vercel 환경 변수가 올바르게 설정되었는지 확인
2. Supabase URL과 API Key가 정확한지 확인
3. Vercel 함수 로그 확인:
   - Vercel Dashboard → **Deployments** → 최신 배포 클릭 → **Functions** 탭

### Q2: 이메일이 도착하지 않습니다

**해결 방법:**
1. Resend Dashboard에서 이메일 로그 확인
2. 스팸 메일함 확인
3. `ADMIN_EMAILS` 환경 변수가 올바른지 확인
4. Supabase Webhook 로그 확인:
   - Supabase Dashboard → **Database** → **Webhooks** → 로그 확인

### Q3: CORS 오류가 발생합니다

**해결 방법:**
1. `vercel.json`의 CORS 설정 확인
2. Supabase RLS(Row Level Security) 정책 확인
3. 브라우저 콘솔에서 정확한 오류 메시지 확인

### Q4: Supabase에 데이터가 저장되지 않습니다

**해결 방법:**
1. `supabase-schema.sql`이 올바르게 실행되었는지 확인
2. RLS 정책 확인:
   ```sql
   -- Supabase SQL Editor에서 실행
   SELECT * FROM policy_officers;
   ```
3. Supabase 로그 확인:
   - Supabase Dashboard → **Logs** → **Postgres Logs**

### Q5: "Module not found" 오류

**해결 방법:**
```bash
# 패키지 재설치
rm -rf node_modules package-lock.json
npm install

# Vercel에 재배포
git add .
git commit -m "Fix dependencies"
git push
```

---

## 🔒 보안 모범 사례

### 환경 변수 관리

- ✅ `.env` 파일을 `.gitignore`에 추가 (이미 포함됨)
- ✅ GitHub에 환경 변수를 절대 커밋하지 않기
- ✅ API Key는 정기적으로 교체

### Supabase RLS 정책

현재 설정된 정책:
- 공개 쓰기 허용 (폼 제출용)
- 읽기/수정/삭제는 인증된 사용자만

더 엄격한 보안이 필요한 경우 RLS 정책을 수정하세요.

### Rate Limiting

악의적인 요청을 방지하기 위해 Rate Limiting 추가 권장:
- Vercel Pro: Edge Middleware 사용
- 무료: Cloudflare 사용

---

## 📊 모니터링

### Vercel Analytics

1. Vercel Dashboard → 프로젝트 선택
2. **Analytics** 탭에서 트래픽 확인

### Supabase 사용량

1. Supabase Dashboard → **Settings** → **Usage**
2. 무료 플랜 제한:
   - 500MB 데이터베이스
   - 월 500MB Egress
   - 월 2백만 Edge Function 호출

---

## 🚀 고급 기능

### 커스텀 도메인 설정

#### Vercel 도메인 연결

1. Vercel Dashboard → 프로젝트 → **Settings** → **Domains**
2. 도메인 추가 (예: `policy.yourdomain.com`)
3. DNS 설정에 따라 CNAME 레코드 추가

### 이메일 템플릿 커스터마이징

`api/submit.js`의 `generateEmailHTML()` 함수를 수정하여 원하는 디자인 적용

### Slack 알림 추가

```javascript
// api/submit.js에 추가
async function sendSlackNotification(data) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `새로운 가입자: ${data.name} (${data.organization})`
    })
  });
}
```

---

## ✅ 배포 체크리스트

완료 여부를 확인하세요:

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 실행
- [ ] Supabase API 키 복사
- [ ] Resend API 키 발급 (선택사항)
- [ ] GitHub 저장소 생성 및 푸시
- [ ] Vercel 프로젝트 생성
- [ ] Vercel 환경 변수 설정
- [ ] Vercel 배포 완료
- [ ] Supabase Webhook 설정 (선택사항)
- [ ] 로컬 테스트 성공
- [ ] 프로덕션 테스트 성공
- [ ] 이메일 알림 테스트 (선택사항)
- [ ] 오픈카톡방 링크 연동
- [ ] `script.js`의 `KAKAO_CHAT_LINK` 업데이트

모든 항목이 완료되면 배포 성공! 🎉

---

## 📞 지원 및 문서

- [Vercel 문서](https://vercel.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Resend 문서](https://resend.com/docs)

---

## 📝 업데이트 방법

코드를 수정한 후 배포하는 방법:

```bash
# 변경사항 커밋
git add .
git commit -m "Update feature"

# GitHub에 푸시 (자동 배포됨)
git push origin main
```

Vercel은 GitHub에 푸시하면 자동으로 배포합니다!

---

## 💰 비용 안내

### 무료 플랜으로 충분한 경우

- Supabase: 월 500MB DB, 2GB Egress
- Vercel: 월 100GB Bandwidth
- Resend: 월 3,000통 (개인 도메인), 100통/일 (테스트)

대부분의 소규모 프로젝트는 무료 플랜으로 충분합니다!

### 유료 플랜이 필요한 경우

- 대량의 가입자 (월 수천 명 이상)
- 높은 트래픽
- 커스텀 도메인 이메일 필수

---

축하합니다! 🎉 이제 Vercel + Supabase로 완벽하게 배포되었습니다!
