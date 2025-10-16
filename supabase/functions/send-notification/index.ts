// Supabase Edge Function - 이메일 알림 발송
// Database Webhook으로 트리거됨

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAILS = Deno.env.get('ADMIN_EMAILS') || 'admin@example.com';
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'noreply@yourdomain.com';
const KAKAO_CHAT_LINK = Deno.env.get('KAKAO_CHAT_LINK') || 'https://open.kakao.com/o/YOUR_CHAT_ID';

interface PolicyOfficer {
  id: string;
  name: string;
  organization: string;
  phone: string;
  email: string;
  position?: string;
  work_area?: string;
  purpose?: string;
  created_at: string;
}

serve(async (req) => {
  try {
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Preflight 요청 처리
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // 요청 본문 파싱
    const payload = await req.json();
    console.log('Received payload:', payload);

    // Database Webhook에서 전달된 데이터
    const policyOfficer: PolicyOfficer = payload.record || payload;

    if (!policyOfficer.name || !policyOfficer.email) {
      throw new Error('Invalid data received');
    }

    // 이메일 발송
    await sendEmailNotification(policyOfficer);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function sendEmailNotification(data: PolicyOfficer) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return;
  }

  const emailHTML = generateEmailHTML(data);
  const adminEmailList = ADMIN_EMAILS.split(',').map(email => email.trim());

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: adminEmailList,
      subject: '[정책지원관] 새로운 가입자 알림',
      html: emailHTML,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  console.log('Email sent successfully to:', adminEmailList);
}

function generateEmailHTML(data: PolicyOfficer): string {
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
          ⏰ 가입 시간: ${new Date(data.created_at).toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul'
          })}
        </p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${KAKAO_CHAT_LINK}"
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
