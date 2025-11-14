// Background Service Worker for Coupang Wing Helper

// 확장앱 아이콘 클릭 시 새 창 열기
chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL('popup/index.html'),
    type: 'popup',
    width: 1200,
    height: 800,
    focused: true
  });
});

// 단축키 명령 처리
chrome.commands.onCommand.addListener((command) => {
  // 현재 활성화된 도우미 창에 메시지 전송
  chrome.runtime.sendMessage({
    type: 'shortcut',
    command: command
  }).catch(() => {
    // 창이 열려있지 않으면 무시
    console.log('Helper window not open');
  });
});

// 메시지 리스너 (단축키 처리용)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'copy-to-clipboard') {
    // 클립보드 복사는 콘텐츠 스크립트나 팝업에서 직접 처리
    sendResponse({ success: true });
  }
  return true;
});

// 설치 시 환영 메시지
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('쿠팡 윙 상품등록 도우미가 설치되었습니다!');
  } else if (details.reason === 'update') {
    console.log('쿠팡 윙 상품등록 도우미가 업데이트되었습니다!');
  }
});
