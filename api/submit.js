import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req, res) {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      ...corsHeaders
    });
  }

  try {
    const {
      name,
      organization,
      phone,
      email,
      position,
      workArea,
      purpose
    } = req.body;

    // 필수 필드 검증
    if (!name || !organization || !phone || !email) {
      return res.status(400).json({
        error: '필수 항목을 모두 입력해주세요.',
        ...corsHeaders
      });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: '올바른 이메일 형식이 아닙니다.',
        ...corsHeaders
      });
    }

    // 전화번호 형식 검증
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(phone.replace(/-/g, ''))) {
      return res.status(400).json({
        error: '올바른 전화번호 형식이 아닙니다.',
        ...corsHeaders
      });
    }

    // 이메일 중복 체크 (선택사항)
    const { data: existingUser } = await supabase
      .from('policy_officers')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: '이미 등록된 이메일입니다.',
        ...corsHeaders
      });
    }

    // Supabase에 데이터 저장
    const { data, error } = await supabase
      .from('policy_officers')
      .insert([
        {
          name,
          organization,
          phone,
          email,
          position: position || null,
          work_area: workArea || null,
          purpose: purpose || null,
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        error: '데이터 저장 중 오류가 발생했습니다.',
        details: error.message,
        ...corsHeaders
      });
    }

    // 이메일 알림 트리거 (Supabase Database Webhook 또는 Edge Function 사용)
    // 여기서는 저장만 하고, 실제 이메일은 Supabase Webhook으로 처리
    await triggerEmailNotification(data[0]);

    // 성공 응답
    return res.status(200).json({
      success: true,
      message: '가입이 완료되었습니다.',
      data: {
        id: data[0].id,
        name: data[0].name
      },
      ...corsHeaders
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: '서버 오류가 발생했습니다.',
      details: error.message,
      ...corsHeaders
    });
  }
}

// 이메일 알림 트리거 함수
async function triggerEmailNotification(policyOfficer) {
  // 방법 1: Supabase Edge Function 호출
  // 방법 2: 외부 이메일 서비스 API 호출 (SendGrid, Resend, etc.)
  // 방법 3: Database Webhook 사용 (권장)

  // 예시: Resend API 사용
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
          to: process.env.ADMIN_EMAILS?.split(',') || ['admin@example.com'],
          subject: '[정책지원관] 새로운 가입자 알림',
          html: generateEmailHTML(policyOfficer),
        }),
      });

      if (!response.ok) {
        console.error('Email sending failed:', await response.text());
      }
    } catch (error) {
      console.error('Email notification error:', error);
      // 이메일 실패해도 가입은 성공으로 처리
    }
  }
}

// 이메일 HTML 생성
function generateEmailHTML(data) {
  return `
    <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FEE500 0%, #FFD700 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; color: #3C1E1E;">🔔 새로운 가입자 알림</h2>
      </div>

      <div style="background: #fff; padding: 30px; border: 1px solid #E0E0E0; border-top: none;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
          정책지원관 오픈채팅방에 새로운 가입자가 등록되었습니다.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #F8F9FA;">
            <td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold; width: 150px;">이름</td>
            <td style="padding: 12px; border: 1px solid #E0E0E0;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">소속 기관/부서</td>
            <td style="padding: 12px; border: 1px solid #E0E0E0;">${data.organization}</td>
          </tr>
          <tr style="background: #F8F9FA;">
            <td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">연락처</td>
            <td style="padding: 12px; border: 1px solid #E0E0E0;">${data.phone}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">이메일</td>
            <td style="padding: 12px; border: 1px solid #E0E0E0;">${data.email}</td>
          </tr>
          <tr style="background: #F8F9FA;">
            <td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">직급/직책</td>
            <td style="padding: 12px; border: 1px solid #E0E0E0;">${data.position || '-'}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">담당 업무</td>
            <td style="padding: 12px; border: 1px solid #E0E0E0;">${data.work_area || '-'}</td>
          </tr>
          <tr style="background: #F8F9FA;">
            <td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">참여 목적</td>
            <td style="padding: 12px; border: 1px solid #E0E0E0;">${data.purpose || '-'}</td>
          </tr>
        </table>

        <p style="color: #666; font-size: 14px; margin: 20px 0;">
          ⏰ 가입 시간: ${new Date(data.created_at).toLocaleString('ko-KR')}
        </p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${process.env.SUPABASE_URL}/project/default/editor"
             style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; margin: 5px;">
            📊 Supabase 대시보드 보기
          </a>

          <a href="${process.env.KAKAO_CHAT_LINK || '#'}"
             style="display: inline-block; background: #FEE500; color: #3C1E1E; padding: 12px 24px;
                    text-decoration: none; border-radius: 5px; margin: 5px; font-weight: bold;">
            💬 오픈채팅방 이동
          </a>
        </div>
      </div>

      <div style="background: #F8F9FA; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 12px;">
        이 메일은 자동으로 발송되었습니다.
      </div>
    </div>
  `;
}
