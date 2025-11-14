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

// 설치 시 환영 메시지
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('쿠팡 윙 상품등록 도우미가 설치되었습니다!');
  } else if (details.reason === 'update') {
    console.log('쿠팡 윙 상품등록 도우미가 업데이트되었습니다!');
  }
});
