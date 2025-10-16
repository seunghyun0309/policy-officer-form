/**
 * Google Apps Script - 정책지원관 폼 데이터 수신 및 이메일 알림
 *
 * 설정 방법:
 * 1. Google Sheets 생성
 * 2. 확장 프로그램 > Apps Script 클릭
 * 3. 이 코드를 붙여넣기
 * 4. 배포 > 새 배포 > 유형: 웹 앱 선택
 * 5. 액세스 권한: "모든 사용자" 선택
 * 6. 배포 후 웹 앱 URL 복사
 */

// ===== 설정 영역 =====
var CONFIG = {
  ADMIN_EMAILS: 'admin@example.com, manager@example.com',
  SHEET_NAME: '정책지원관',
  KAKAO_CHAT_LINK: 'https://open.kakao.com/o/YOUR_CHAT_ID',
  EMAIL_SUBJECT: '[정책지원관] 새로운 가입자 알림'
};

// ===== 웹 앱 POST 요청 처리 =====
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    saveToSheet(data);
    sendEmailNotification(data);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: '데이터가 성공적으로 저장되었습니다.',
        chatLink: CONFIG.KAKAO_CHAT_LINK
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== GET 요청 처리 (테스트용) =====
function doGet(e) {
  return ContentService
    .createTextOutput('정책지원관 오픈채팅방 가입 시스템이 정상 작동 중입니다.')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ===== Google Sheets에 데이터 저장 =====
function saveToSheet(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);

    var headers = [
      '제출일시',
      '이름',
      '소속 의회',
      '연락처',
      '이메일',
      '급수',
      '담당 의원 이름',
      '담당 상임위',
      '참여 목적'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#FEE500')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    for (var i = 0; i < headers.length; i++) {
      sheet.autoResizeColumn(i + 1);
    }
  }

  var row = [
    new Date(data.timestamp),
    data.name || '',
    data.organization || '',
    data.phone || '',
    data.email || '',
    data.position || '',
    data.workArea || '',
    data.committee || '',
    data.purpose || ''
  ];

  sheet.appendRow(row);

  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, row.length).setBackground('#FFFACD');
  sheet.getRange(lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

// ===== 이메일 알림 발송 =====
function sendEmailNotification(data) {
  var adminEmailsStr = CONFIG.ADMIN_EMAILS.split(',');
  var adminEmails = [];

  for (var i = 0; i < adminEmailsStr.length; i++) {
    adminEmails.push(adminEmailsStr[i].trim());
  }

  var emailBody = '정책지원관 오픈채팅방에 새로운 가입자가 등록되었습니다.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '📋 가입자 정보\n\n' +
    '• 이름: ' + (data.name || '-') + '\n' +
    '• 소속 의회: ' + (data.organization || '-') + '\n' +
    '• 연락처: ' + (data.phone || '-') + '\n' +
    '• 이메일: ' + (data.email || '-') + '\n' +
    '• 급수: ' + (data.position || '-') + '\n' +
    '• 담당 의원 이름: ' + (data.workArea || '-') + '\n' +
    '• 담당 상임위: ' + (data.committee || '-') + '\n' +
    '• 참여 목적: ' + (data.purpose || '-') + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '⏰ 제출 시간: ' + new Date(data.timestamp).toLocaleString('ko-KR') + '\n\n' +
    '📊 Google Sheets에서 전체 데이터 확인:\n' +
    SpreadsheetApp.getActiveSpreadsheet().getUrl() + '\n\n' +
    '💬 오픈채팅방 링크:\n' +
    CONFIG.KAKAO_CHAT_LINK + '\n\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    '이 메일은 자동으로 발송되었습니다.';

  var htmlBody = '<div style="font-family: \'Apple SD Gothic Neo\', \'Malgun Gothic\', sans-serif; max-width: 600px; margin: 0 auto;">' +
    '<div style="background: linear-gradient(135deg, #FEE500 0%, #FFD700 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">' +
    '<h2 style="margin: 0; color: #3C1E1E;">🔔 새로운 가입자 알림</h2>' +
    '</div>' +
    '<div style="background: #fff; padding: 30px; border: 1px solid #E0E0E0; border-top: none;">' +
    '<p style="font-size: 16px; color: #333; margin-bottom: 20px;">정책지원관 오픈채팅방에 새로운 가입자가 등록되었습니다.</p>' +
    '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">' +
    '<tr style="background: #F8F9FA;"><td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold; width: 150px;">이름</td>' +
    '<td style="padding: 12px; border: 1px solid #E0E0E0;">' + (data.name || '-') + '</td></tr>' +
    '<tr><td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">소속 의회</td>' +
    '<td style="padding: 12px; border: 1px solid #E0E0E0;">' + (data.organization || '-') + '</td></tr>' +
    '<tr style="background: #F8F9FA;"><td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">연락처</td>' +
    '<td style="padding: 12px; border: 1px solid #E0E0E0;">' + (data.phone || '-') + '</td></tr>' +
    '<tr><td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">이메일</td>' +
    '<td style="padding: 12px; border: 1px solid #E0E0E0;">' + (data.email || '-') + '</td></tr>' +
    '<tr style="background: #F8F9FA;"><td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">급수</td>' +
    '<td style="padding: 12px; border: 1px solid #E0E0E0;">' + (data.position || '-') + '</td></tr>' +
    '<tr><td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">담당 의원 이름</td>' +
    '<td style="padding: 12px; border: 1px solid #E0E0E0;">' + (data.workArea || '-') + '</td></tr>' +
    '<tr style="background: #F8F9FA;"><td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">담당 상임위</td>' +
    '<td style="padding: 12px; border: 1px solid #E0E0E0;">' + (data.committee || '-') + '</td></tr>' +
    '<tr><td style="padding: 12px; border: 1px solid #E0E0E0; font-weight: bold;">참여 목적</td>' +
    '<td style="padding: 12px; border: 1px solid #E0E0E0;">' + (data.purpose || '-') + '</td></tr>' +
    '</table>' +
    '<p style="color: #666; font-size: 14px; margin: 20px 0;">⏰ 제출 시간: ' + new Date(data.timestamp).toLocaleString('ko-KR') + '</p>' +
    '<div style="margin-top: 30px; text-align: center;">' +
    '<a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '" ' +
    'style="display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px;">' +
    '📊 Google Sheets 보기</a>' +
    '<a href="' + CONFIG.KAKAO_CHAT_LINK + '" ' +
    'style="display: inline-block; background: #FEE500; color: #3C1E1E; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: bold;">' +
    '💬 오픈채팅방 이동</a>' +
    '</div></div>' +
    '<div style="background: #F8F9FA; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 12px;">' +
    '이 메일은 자동으로 발송되었습니다.</div></div>';

  for (var i = 0; i < adminEmails.length; i++) {
    var email = adminEmails[i];
    if (email) {
      try {
        MailApp.sendEmail({
          to: email,
          subject: CONFIG.EMAIL_SUBJECT,
          body: emailBody,
          htmlBody: htmlBody
        });
      } catch (error) {
        Logger.log('이메일 발송 실패 (' + email + '): ' + error);
      }
    }
  }
}

// ===== 테스트 함수 =====
function testEmailNotification() {
  var testData = {
    name: '홍길동',
    organization: '교육부 정책기획과',
    phone: '010-1234-5678',
    email: 'test@example.com',
    position: '사무관',
    workArea: '교육정책',
    purpose: '정보공유',
    timestamp: new Date().toISOString()
  };

  sendEmailNotification(testData);
  Logger.log('테스트 이메일이 발송되었습니다.');
}

function testSaveToSheet() {
  var testData = {
    name: '테스트 사용자',
    organization: '테스트 부서',
    phone: '010-9999-9999',
    email: 'test@test.com',
    position: '과장',
    workArea: '테스트',
    purpose: '테스트',
    timestamp: new Date().toISOString()
  };

  saveToSheet(testData);
  Logger.log('테스트 데이터가 저장되었습니다.');
}
