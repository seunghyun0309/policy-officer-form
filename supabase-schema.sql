-- 정책지원관 가입 정보 테이블
CREATE TABLE policy_officers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT,
  work_area TEXT,
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 이메일 중복 체크를 위한 인덱스
CREATE INDEX idx_policy_officers_email ON policy_officers(email);

-- 생성일시 기준 정렬을 위한 인덱스
CREATE INDEX idx_policy_officers_created_at ON policy_officers(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE policy_officers ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 권한 (선택사항 - 필요시 주석 해제)
-- CREATE POLICY "Allow public read access" ON policy_officers
--   FOR SELECT USING (true);

-- 공개 쓰기 권한 (폼 제출용)
CREATE POLICY "Allow public insert access" ON policy_officers
  FOR INSERT WITH CHECK (true);

-- 관리자만 수정/삭제 가능 (authenticated users)
CREATE POLICY "Allow authenticated users to update" ON policy_officers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete" ON policy_officers
  FOR DELETE USING (auth.role() = 'authenticated');

-- 이메일 알림을 위한 함수 (Supabase Edge Functions 또는 Webhook 사용 권장)
-- 아래는 Database Webhook을 위한 트리거 예제

-- 알림 로그 테이블 (선택사항)
CREATE TABLE notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_officer_id UUID REFERENCES policy_officers(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'email', 'slack', etc.
  status TEXT NOT NULL, -- 'pending', 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_notification_logs_policy_officer_id ON notification_logs(policy_officer_id);
CREATE INDEX idx_notification_logs_status ON notification_logs(status);

-- 통계를 위한 뷰 (선택사항)
CREATE VIEW policy_officers_stats AS
SELECT
  COUNT(*) as total_count,
  COUNT(DISTINCT organization) as organization_count,
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as daily_count
FROM policy_officers
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- 최근 가입자 조회 함수
CREATE OR REPLACE FUNCTION get_recent_policy_officers(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  organization TEXT,
  phone TEXT,
  email TEXT,
  position TEXT,
  work_area TEXT,
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    po.id,
    po.name,
    po.organization,
    po.phone,
    po.email,
    po.position,
    po.work_area,
    po.purpose,
    po.created_at
  FROM policy_officers po
  ORDER BY po.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 이메일 중복 체크 함수
CREATE OR REPLACE FUNCTION check_email_exists(check_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM policy_officers WHERE email = check_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
