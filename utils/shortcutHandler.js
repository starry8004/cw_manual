// 단축키 핸들러 유틸리티

const ShortcutHandler = {
  // 단축키 매핑 (command name -> field name)
  SHORTCUT_MAP: {
    'copy-brand': '브랜드',
    'copy-title': '상품명',
    'copy-price': '판매가',
    'copy-category': '카테고리',
    'copy-option': '옵션정보',
    'copy-volume': '용량',
    'copy-ingredient': '전성분',
    'copy-discount': '할인전금액',
    'copy-shipping': '배송비',
    'copy-url': '상품URL'
  },

  // 콜백 함수들
  callbacks: {},

  /**
   * 초기화
   */
  init() {
    // 키보드 이벤트 리스너 등록
    this.setupKeyboardListener();
    console.log('단축키 핸들러 초기화 완료');
  },

  /**
   * 단축키 처리
   * @param {string} command - 단축키 명령
   */
  async handleShortcut(command) {
    console.log('단축키 실행:', command);

    // 데이터 복사 단축키
    if (this.SHORTCUT_MAP[command]) {
      const fieldName = this.SHORTCUT_MAP[command];
      await this.copyField(fieldName);
      this.showToast(`${fieldName} 복사됨`);
      return;
    }

    // 이미지 단축키
    switch (command) {
      case 'copy-main-image':
        await this.copyMainImage();
        break;

      case 'copy-additional-images':
        await this.copyAdditionalImages();
        break;

      case 'open-folder':
        await this.openImageFolder();
        break;

      case 'next-product':
        await this.nextProduct();
        break;

      case 'previous-product':
        await this.previousProduct();
        break;

      case 'mark-failed':
        await this.markFailed();
        break;

      case 'view-all':
        this.viewAllData();
        break;

      default:
        console.warn('알 수 없는 단축키:', command);
    }
  },

  /**
   * 필드 복사
   * @param {string} fieldName - 필드명
   */
  async copyField(fieldName) {
    const success = await CSVHandler.copyField(fieldName);
    if (success && this.callbacks.onCopy) {
      this.callbacks.onCopy(fieldName);
    }
  },

  /**
   * 대표 이미지 경로 복사
   */
  async copyMainImage() {
    const product = CSVHandler.getCurrentProduct();
    if (!product) return;

    const productId = product['신규내부관리번호'];
    const success = await ImageScanner.copyMainImagePath(productId);

    if (success) {
      this.showToast('대표 이미지 경로 복사됨');
      if (this.callbacks.onCopy) {
        this.callbacks.onCopy('대표이미지');
      }
    } else {
      this.showToast('이미지를 찾을 수 없습니다', 'warning');
    }
  },

  /**
   * 추가 이미지 경로 복사
   */
  async copyAdditionalImages() {
    const product = CSVHandler.getCurrentProduct();
    if (!product) return;

    const productId = product['신규내부관리번호'];
    const success = await ImageScanner.copyAdditionalImagePaths(productId);

    if (success) {
      this.showToast('추가 이미지 경로 복사됨');
      if (this.callbacks.onCopy) {
        this.callbacks.onCopy('추가이미지');
      }
    } else {
      this.showToast('추가 이미지를 찾을 수 없습니다', 'warning');
    }
  },

  /**
   * 이미지 폴더 열기
   */
  async openImageFolder() {
    const product = CSVHandler.getCurrentProduct();
    if (!product) return;

    const productId = product['신규내부관리번호'];
    const success = await ImageScanner.openImageFolder(productId);

    if (success) {
      this.showToast('이미지 폴더 경로 복사됨 (탐색기에서 열어주세요)');
    } else {
      this.showToast('이미지 폴더를 찾을 수 없습니다', 'warning');
    }
  },

  /**
   * 다음 상품으로 이동
   */
  async nextProduct() {
    const current = CSVHandler.getCurrentProduct();
    if (current) {
      await CSVHandler.completeAndNext();

      if (this.callbacks.onNext) {
        this.callbacks.onNext();
      }

      this.showToast('✅ 완료 처리 후 다음 상품으로 이동', 'success');
    }
  },

  /**
   * 이전 상품으로 이동
   */
  async previousProduct() {
    CSVHandler.previousProduct();

    if (this.callbacks.onPrevious) {
      this.callbacks.onPrevious();
    }

    this.showToast('이전 상품으로 이동');
  },

  /**
   * 실패 처리
   */
  async markFailed() {
    const current = CSVHandler.getCurrentProduct();
    if (current) {
      await CSVHandler.failAndNext();

      if (this.callbacks.onFailed) {
        this.callbacks.onFailed();
      }

      this.showToast('❌ 실패 처리 후 다음 상품으로 이동', 'error');
    }
  },

  /**
   * 전체 데이터 보기
   */
  viewAllData() {
    if (this.callbacks.onViewAll) {
      this.callbacks.onViewAll();
    }
  },

  /**
   * 콜백 등록
   * @param {string} event - 이벤트명
   * @param {Function} callback - 콜백 함수
   */
  on(event, callback) {
    this.callbacks[event] = callback;
  },

  /**
   * 토스트 알림 표시
   * @param {string} message - 메시지
   * @param {string} type - 타입 (success, error, warning)
   */
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  },

  /**
   * 키보드 이벤트 리스너 등록
   * Alt+알파벳 조합으로 모든 단축키 처리
   */
  setupKeyboardListener() {
    document.addEventListener('keydown', (e) => {
      // Alt 키가 눌렸는지 확인
      if (!e.altKey || e.ctrlKey || e.shiftKey) return;

      const key = e.key.toLowerCase();
      let command = null;

      // 키에 따라 명령 매핑
      switch (key) {
        case 'b': command = 'copy-brand'; break;
        case 't': command = 'copy-title'; break;
        case 'p': command = 'copy-price'; break;
        case 'c': command = 'copy-category'; break;
        case 'o': command = 'copy-option'; break;
        case 'v': command = 'copy-volume'; break;
        case 'i': command = 'copy-ingredient'; break;
        case 'd': command = 'copy-discount'; break;
        case 's': command = 'copy-shipping'; break;
        case 'u': command = 'copy-url'; break;
        case 'm': command = 'copy-main-image'; break;
        case 'a': command = 'copy-additional-images'; break;
        case 'f': command = 'open-folder'; break;
        case 'n': command = 'next-product'; break;
        case 'e': command = 'previous-product'; break;
        case 'x': command = 'mark-failed'; break;
        case 'w': command = 'view-all'; break;
        default: return;
      }

      if (command) {
        e.preventDefault();
        this.handleShortcut(command);
      }
    });

    console.log('키보드 리스너 등록 완료');
  }
};
