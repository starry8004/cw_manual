// 쿠팡 윙 상품등록 도우미 - 메인 애플리케이션

class CoupangWingHelper {
  constructor() {
    this.currentScreen = 'setup';
    this.csvFile = null;
    this.imageFolder = null;
    this.init();
  }

  /**
   * 초기화
   */
  async init() {
    console.log('쿠팡 윙 상품등록 도우미 시작');

    // 화면 전환
    this.showScreen('setup');

    // 이벤트 리스너 등록
    this.setupEventListeners();

    // 단축키 핸들러 초기화
    ShortcutHandler.init();
    ShortcutHandler.setupKeyboardListener();

    // 단축키 콜백 등록
    this.setupShortcutCallbacks();

    // 마지막 세션 복구 확인
    await this.checkLastSession();
  }

  /**
   * 화면 전환
   */
  showScreen(screenName) {
    const screens = ['setup', 'converting', 'complete', 'main'];
    screens.forEach(name => {
      const screen = document.getElementById(`${name}-screen`);
      if (screen) {
        screen.classList.toggle('hidden', name !== screenName);
      }
    });
    this.currentScreen = screenName;
  }

  /**
   * 이벤트 리스너 등록
   */
  setupEventListeners() {
    // === 초기 설정 화면 ===

    // CSV 파일 선택
    const selectCsvBtn = document.getElementById('select-csv-btn');
    if (selectCsvBtn) {
      selectCsvBtn.addEventListener('click', () => this.selectCSVFile());
    }

    // 이미지 폴더 선택
    const selectFolderBtn = document.getElementById('select-folder-btn');
    if (selectFolderBtn) {
      selectFolderBtn.addEventListener('click', () => this.selectImageFolder());
    }

    // 내부관리번호 입력 변경 시 미리보기
    const brandCode = document.getElementById('brand-code');
    const dateCode = document.getElementById('date-code');
    const startNumber = document.getElementById('start-number');

    [brandCode, dateCode, startNumber].forEach(input => {
      if (input) {
        input.addEventListener('input', () => this.updateIDPreview());
      }
    });

    // 오늘 날짜로 자동 입력
    if (dateCode && !dateCode.value) {
      dateCode.value = IDGenerator.getCurrentDateCode();
      this.updateIDPreview();
    }

    // 변환 시작 버튼
    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
      convertBtn.addEventListener('click', () => this.startConversion());
    }

    // === 변환 완료 화면 ===

    // 도우미 시작 버튼
    const startHelperBtn = document.getElementById('start-helper-btn');
    if (startHelperBtn) {
      startHelperBtn.addEventListener('click', () => this.startHelper());
    }

    // === 메인 화면 ===

    // 필드 더보기
    const showMoreBtn = document.getElementById('show-more-fields-btn');
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', () => this.toggleAdditionalFields());
    }

    // 단축키 전체보기
    const toggleShortcutsBtn = document.getElementById('toggle-shortcuts-btn');
    if (toggleShortcutsBtn) {
      toggleShortcutsBtn.addEventListener('click', () => this.toggleShortcutGuide());
    }

    // 복사 버튼
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const field = e.target.closest('[data-field]')?.dataset.field;
        if (field) {
          this.copyFieldByButton(field);
        }
      });
    });

    // 이미지 버튼
    const copyMainImageBtn = document.getElementById('copy-main-image-btn');
    if (copyMainImageBtn) {
      copyMainImageBtn.addEventListener('click', () => ShortcutHandler.copyMainImage());
    }

    const copyAdditionalBtn = document.getElementById('copy-additional-images-btn');
    if (copyAdditionalBtn) {
      copyAdditionalBtn.addEventListener('click', () => ShortcutHandler.copyAdditionalImages());
    }

    const openFolderBtn = document.getElementById('open-image-folder-btn');
    if (openFolderBtn) {
      openFolderBtn.addEventListener('click', () => ShortcutHandler.openImageFolder());
    }

    const previewImagesBtn = document.getElementById('preview-images-btn');
    if (previewImagesBtn) {
      previewImagesBtn.addEventListener('click', () => this.showImagePreview());
    }

    // 네비게이션 버튼
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousProduct());
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextProduct());
    }

    const viewAllBtn = document.getElementById('view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => this.showDataModal());
    }

    // 모달 닫기
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.target.dataset.modal;
        this.closeModal(modalId);
      });
    });

    // 모달 오버레이 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('hidden');
        }
      });
    });

    // 설정/도움말 버튼
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showSettings());
    }

    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.showHelp());
    }
  }

  /**
   * 단축키 콜백 설정
   */
  setupShortcutCallbacks() {
    ShortcutHandler.on('onNext', () => this.updateMainUI());
    ShortcutHandler.on('onPrevious', () => this.updateMainUI());
    ShortcutHandler.on('onFailed', () => this.updateMainUI());
    ShortcutHandler.on('onViewAll', () => this.showDataModal());
    ShortcutHandler.on('onCopy', (field) => this.flashCopyButton(field));
  }

  /**
   * CSV 파일 선택
   */
  async selectCSVFile() {
    try {
      const fileInfo = await CSVHandler.selectFile();

      // UI 업데이트
      const fileInfoEl = document.getElementById('csv-file-info');
      if (fileInfoEl) {
        fileInfoEl.innerHTML = `
          <div class="file-selected">
            <div class="file-name">📄 ${fileInfo.name}</div>
            <div class="file-path">${fileInfo.rowCount}개 상품</div>
          </div>
        `;
      }

      this.csvFile = fileInfo;

      // 컬럼 검증
      const validation = CSVHandler.validateColumns(fileInfo.data);
      if (!validation.valid) {
        this.showToast(validation.message, 'error');
        return;
      }

      // 상품 수 업데이트
      this.updateIDPreview();

      // 변환 버튼 활성화 확인
      this.checkConvertReady();

      this.showToast('CSV 파일 로드 완료', 'success');
    } catch (error) {
      console.error('CSV 파일 선택 오류:', error);
      this.showToast('CSV 파일 선택 실패: ' + error.message, 'error');
    }
  }

  /**
   * 이미지 폴더 선택
   */
  async selectImageFolder() {
    try {
      const folderInfo = await ImageScanner.selectFolder();

      // UI 업데이트
      const folderInfoEl = document.getElementById('image-folder-info');
      if (folderInfoEl) {
        folderInfoEl.innerHTML = `
          <div class="file-selected">
            <div class="file-name">📁 ${folderInfo.name}</div>
            <div class="file-path">이미지 폴더 선택됨</div>
          </div>
        `;
      }

      this.imageFolder = folderInfo;

      // 변환 버튼 활성화 확인
      this.checkConvertReady();

      this.showToast('이미지 폴더 선택 완료', 'success');
    } catch (error) {
      console.error('이미지 폴더 선택 오류:', error);
      this.showToast('이미지 폴더 선택 실패: ' + error.message, 'error');
    }
  }

  /**
   * 내부관리번호 미리보기 업데이트
   */
  updateIDPreview() {
    const brandCode = document.getElementById('brand-code')?.value || 'CP';
    const dateCode = document.getElementById('date-code')?.value || '0000';
    const startNumber = parseInt(document.getElementById('start-number')?.value || '1', 10);

    // 미리보기
    const preview = document.getElementById('id-preview');
    if (preview && dateCode.length === 4) {
      try {
        const sampleId = IDGenerator.generate(brandCode, dateCode, startNumber);
        preview.textContent = sampleId;
      } catch (error) {
        preview.textContent = '형식 오류';
      }
    }

    // 총 상품 수
    const totalCount = this.csvFile?.rowCount || 0;
    const totalCountEl = document.getElementById('total-count');
    if (totalCountEl) {
      totalCountEl.textContent = `📊 총 상품 수: ${totalCount}개`;
    }

    // 생성 범위
    if (totalCount > 0 && dateCode.length === 4) {
      try {
        const range = IDGenerator.getRange(brandCode, dateCode, startNumber, totalCount);
        const rangeEl = document.getElementById('id-range');
        if (rangeEl) {
          rangeEl.textContent = `생성 범위: ${range.start} ~ ${range.end}`;
        }
      } catch (error) {
        console.error('범위 생성 오류:', error);
      }
    }
  }

  /**
   * 변환 준비 확인
   */
  checkConvertReady() {
    const convertBtn = document.getElementById('convert-btn');
    const previewBtn = document.getElementById('preview-btn');

    const ready = this.csvFile && this.imageFolder;

    if (convertBtn) {
      convertBtn.disabled = !ready;
    }

    if (previewBtn) {
      previewBtn.disabled = !ready;
    }
  }

  /**
   * 변환 시작
   */
  async startConversion() {
    try {
      this.showScreen('converting');

      const brandCode = document.getElementById('brand-code').value;
      const dateCode = document.getElementById('date-code').value;
      const startNumber = parseInt(document.getElementById('start-number').value, 10);

      // Storage에 저장
      Storage.setBrandCode(brandCode);
      Storage.setDateCode(dateCode);
      Storage.setStartNumber(startNumber);

      // CSV 변환
      const csvStatus = document.getElementById('csv-status');
      const csvProgress = document.getElementById('csv-progress');

      csvStatus.textContent = 'CSV 데이터 변환 중...';
      csvProgress.style.width = '50%';

      CSVHandler.transformData(brandCode, dateCode, startNumber);

      csvStatus.textContent = '✅ CSV 변환 완료';
      csvProgress.style.width = '100%';

      // 이미지 폴더 처리 (실제로는 리네임 불가능하므로 안내만)
      const imageStatus = document.getElementById('image-status');
      const imageProgress = document.getElementById('image-progress');
      const imageLog = document.getElementById('image-log');

      imageStatus.textContent = '이미지 폴더 확인 중...';
      imageProgress.style.width = '50%';

      // 모든 상품의 이미지 폴더 확인
      let foundCount = 0;
      const stats = CSVHandler.getStats();

      for (let i = 0; i < Math.min(5, stats.total); i++) {
        const product = CSVHandler.getCurrentProduct(i);
        const productId = product['신규내부관리번호'];
        const images = await ImageScanner.scanProductImages(productId);

        if (images.totalCount > 0) {
          foundCount++;
          if (imageLog) {
            imageLog.innerHTML += `<div class="progress-log-item">✅ ${productId}: ${images.totalCount}개 이미지</div>`;
          }
        } else {
          if (imageLog) {
            imageLog.innerHTML += `<div class="progress-log-item">⚠️ ${productId}: 이미지 없음</div>`;
          }
        }
      }

      imageStatus.textContent = `✅ 이미지 폴더 확인 완료 (${foundCount}/${Math.min(5, stats.total)}개 샘플)`;
      imageProgress.style.width = '100%';

      // 완료 화면으로 전환
      setTimeout(() => {
        this.showConversionComplete(stats.total, foundCount);
      }, 1000);

    } catch (error) {
      console.error('변환 오류:', error);
      this.showToast('변환 실패: ' + error.message, 'error');
      this.showScreen('setup');
    }
  }

  /**
   * 변환 완료 화면 표시
   */
  showConversionComplete(totalCount, imageCount) {
    this.showScreen('complete');

    const resultSummary = document.getElementById('result-summary');
    if (resultSummary) {
      resultSummary.innerHTML = `
        <div>✅ CSV 변환: ${totalCount}개 행</div>
        <div>✅ 이미지 폴더: ${imageCount}개 확인됨</div>
      `;
    }

    const warnings = document.getElementById('result-warnings');
    if (warnings && imageCount < totalCount) {
      warnings.innerHTML = `
        <div>⚠️ 일부 상품의 이미지 폴더가 없습니다. (${totalCount - imageCount}개)</div>
      `;
    }

    const backupPath = document.getElementById('backup-path');
    if (backupPath) {
      backupPath.textContent = '(브라우저 환경에서는 자동 백업이 제한됩니다)';
    }

    const convertedFile = document.getElementById('converted-file');
    if (convertedFile && this.csvFile) {
      convertedFile.textContent = this.csvFile.name;
    }
  }

  /**
   * 도우미 시작
   */
  startHelper() {
    this.showScreen('main');
    CSVHandler.currentIndex = 0;
    this.updateMainUI();
    this.showToast('쿠팡 상품등록 도우미가 시작되었습니다!', 'success');
  }

  /**
   * 메인 UI 업데이트
   */
  async updateMainUI() {
    const product = CSVHandler.getCurrentProduct();

    if (!product) {
      this.showToast('상품 데이터가 없습니다', 'warning');
      return;
    }

    // 현재 인덱스 및 총 개수
    const stats = CSVHandler.getStats();
    const currentIndex = CSVHandler.currentIndex + 1;

    document.getElementById('current-index').textContent = currentIndex;
    document.getElementById('total-products').textContent = stats.total;

    // CSV 파일명
    if (this.csvFile) {
      document.getElementById('current-csv-name').textContent = this.csvFile.name;
    }

    // 상품 ID
    document.getElementById('product-id').textContent = product['신규내부관리번호'] || '-';
    document.getElementById('original-id').textContent = product['올리브영상품번호'] || '-';

    // 상태
    const statusBadge = document.getElementById('product-status');
    const status = product['상태'] || '대기';
    statusBadge.textContent = status;
    statusBadge.className = `status-badge ${status === '완료' ? 'completed' : status === '실패' ? 'failed' : 'pending'}`;

    // 필드 값
    const fields = {
      'brand': '브랜드',
      'title': '상품명',
      'price': '판매가',
      'category': '카테고리',
      'option': '옵션정보',
      'volume': '용량',
      'ingredient': '전성분',
      'discount': '할인전금액',
      'shipping': '배송비',
      'url': '상품URL'
    };

    Object.entries(fields).forEach(([key, fieldName]) => {
      const el = document.getElementById(`field-${key}`);
      if (el) {
        const value = product[fieldName] || '-';
        el.textContent = value;
        el.title = value; // 전체 텍스트를 툴팁으로
      }
    });

    // 이미지 정보
    await this.updateImageInfo();

    // 통계
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-failed').textContent = stats.failed;
    document.getElementById('progress-percent').textContent = stats.progress + '%';
    document.getElementById('progress-count').textContent = `${stats.completed}/${stats.total}`;

    const progressBar = document.getElementById('overall-progress');
    if (progressBar) {
      progressBar.style.width = stats.progress + '%';
    }
  }

  /**
   * 이미지 정보 업데이트
   */
  async updateImageInfo() {
    const product = CSVHandler.getCurrentProduct();
    if (!product) return;

    const productId = product['신규내부관리번호'];
    const images = await ImageScanner.scanProductImages(productId);

    // 이미지 개수
    document.getElementById('image-count').textContent = `(${images.totalCount}개)`;

    // 대표 이미지
    const mainImageInfo = document.getElementById('main-image-info');
    if (mainImageInfo) {
      if (images.mainImage) {
        mainImageInfo.innerHTML = `
          <div class="image-file">
            <span class="image-filename">${images.mainImage.name}</span>
            <span class="image-meta">${this.formatFileSize(images.mainImage.size)}</span>
          </div>
        `;
      } else {
        mainImageInfo.innerHTML = '<div class="image-placeholder">이미지 없음</div>';
      }
    }

    // 추가 이미지
    const additionalCount = document.getElementById('additional-count');
    if (additionalCount) {
      additionalCount.textContent = `${images.additionalImages.length}개`;
    }

    const additionalInfo = document.getElementById('additional-images-info');
    if (additionalInfo) {
      if (images.additionalImages.length > 0) {
        additionalInfo.innerHTML = images.additionalImages.map(img => `
          <span class="image-filename">${img.name}</span>
        `).join(', ');
      } else {
        additionalInfo.innerHTML = '<div class="image-placeholder">이미지 없음</div>';
      }
    }
  }

  /**
   * 다음 상품
   */
  async nextProduct() {
    await CSVHandler.completeAndNext();
    await this.updateMainUI();
    this.showToast('✅ 완료 처리 후 다음 상품으로 이동', 'success');
  }

  /**
   * 이전 상품
   */
  async previousProduct() {
    CSVHandler.previousProduct();
    await this.updateMainUI();
    this.showToast('이전 상품으로 이동');
  }

  /**
   * 추가 필드 토글
   */
  toggleAdditionalFields() {
    const additionalFields = document.getElementById('additional-fields');
    const btn = document.getElementById('show-more-fields-btn');

    if (additionalFields) {
      const isHidden = additionalFields.classList.toggle('hidden');
      if (btn) {
        btn.textContent = isHidden ? '더 많은 필드 보기 ▼' : '접기 ▲';
      }
    }
  }

  /**
   * 단축키 가이드 토글
   */
  toggleShortcutGuide() {
    const fullGuide = document.getElementById('shortcut-full');
    const btn = document.getElementById('toggle-shortcuts-btn');

    if (fullGuide) {
      const isHidden = fullGuide.classList.toggle('hidden');
      if (btn) {
        btn.textContent = isHidden ? '전체보기 ▼' : '접기 ▲';
      }
    }
  }

  /**
   * 버튼으로 필드 복사
   */
  async copyFieldByButton(field) {
    const fieldMap = {
      'brand': '브랜드',
      'title': '상품명',
      'price': '판매가',
      'category': '카테고리',
      'option': '옵션정보',
      'volume': '용량',
      'ingredient': '전성분',
      'discount': '할인전금액',
      'shipping': '배송비',
      'url': '상품URL'
    };

    const fieldName = fieldMap[field];
    if (fieldName) {
      const success = await CSVHandler.copyField(fieldName);
      if (success) {
        this.showToast(`${fieldName} 복사됨`);
        this.flashCopyButton(field);
      }
    }
  }

  /**
   * 복사 버튼 플래시 효과
   */
  flashCopyButton(field) {
    const btn = document.querySelector(`[data-field="${field}"] .copy-btn`);
    if (btn) {
      btn.style.backgroundColor = 'var(--success-color)';
      btn.style.color = 'white';
      setTimeout(() => {
        btn.style.backgroundColor = '';
        btn.style.color = '';
      }, 500);
    }
  }

  /**
   * 전체 데이터 모달 표시
   */
  showDataModal() {
    const modal = document.getElementById('data-modal');
    const body = document.getElementById('modal-data-body');

    if (!modal || !body) return;

    const product = CSVHandler.getCurrentProduct();
    if (!product) return;

    // 모달 내용 생성
    const fields = {
      '신규내부관리번호': product['신규내부관리번호'],
      '브랜드': product['브랜드'],
      '상품명': product['상품명'],
      '판매가': product['판매가'],
      '할인전금액': product['할인전금액'],
      '배송비': product['배송비'],
      '카테고리': product['카테고리'],
      '옵션정보': product['옵션정보'],
      '전성분': product['전성분'],
      '용량': product['용량'],
      '상품URL': product['상품URL'],
      '올리브영상품번호': product['올리브영상품번호']
    };

    body.innerHTML = Object.entries(fields)
      .map(([key, value]) => `
        <div class="field-row" style="margin-bottom: 16px;">
          <strong>${key}:</strong>
          <div style="margin-top: 4px;">${value || '-'}</div>
          <button class="btn btn-small" onclick="navigator.clipboard.writeText('${value || ''}')">복사</button>
        </div>
      `)
      .join('');

    modal.classList.remove('hidden');
  }

  /**
   * 이미지 미리보기 모달
   */
  async showImagePreview() {
    const modal = document.getElementById('image-modal');
    const body = document.getElementById('modal-image-body');

    if (!modal || !body) return;

    const product = CSVHandler.getCurrentProduct();
    if (!product) return;

    const productId = product['신규내부관리번호'];
    const images = await ImageScanner.scanProductImages(productId);

    body.innerHTML = `
      <div style="text-align: center;">
        <h3>${productId}</h3>
        <p>총 ${images.totalCount}개의 이미지</p>
        ${images.totalCount === 0 ? '<p>이미지 폴더를 찾을 수 없습니다.</p>' : ''}
        ${images.validation.map(v => `
          <div class="${v.type}">${v.message}</div>
        `).join('')}
      </div>
    `;

    modal.classList.remove('hidden');
  }

  /**
   * 설정 표시
   */
  showSettings() {
    const modal = document.getElementById('settings-modal');
    const body = document.getElementById('modal-settings-body');

    if (!modal || !body) return;

    const settings = Storage.getSettings();

    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label>
            <input type="checkbox" ${settings.autoSave ? 'checked' : ''} id="setting-autosave">
            자동 저장
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" ${settings.useShortcuts ? 'checked' : ''} id="setting-shortcuts">
            단축키 사용
          </label>
        </div>
        <button class="btn btn-primary" id="save-settings-btn">저장</button>
      </div>
    `;

    // 저장 버튼
    setTimeout(() => {
      const saveBtn = document.getElementById('save-settings-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const autoSave = document.getElementById('setting-autosave').checked;
          const useShortcuts = document.getElementById('setting-shortcuts').checked;
          Storage.setSettings({ autoSave, useShortcuts });
          this.showToast('설정이 저장되었습니다', 'success');
          this.closeModal('settings-modal');
        });
      }
    }, 0);

    modal.classList.remove('hidden');
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    const modal = document.getElementById('help-modal');
    const body = document.getElementById('modal-help-body');

    if (!modal || !body) return;

    body.innerHTML = `
      <div style="line-height: 1.8;">
        <h3>🚀 시작하기</h3>
        <ol>
          <li>CSV 파일과 이미지 폴더 선택</li>
          <li>내부관리번호 생성 및 변환</li>
          <li>쿠팡 윙 페이지 열기</li>
          <li>Alt+알파벳 단축키로 빠르게 입력</li>
        </ol>

        <h3>⌨️ 필수 단축키 5개</h3>
        <ul>
          <li><kbd>Alt+B</kbd> 브랜드</li>
          <li><kbd>Alt+T</kbd> 상품명</li>
          <li><kbd>Alt+P</kbd> 판매가</li>
          <li><kbd>Alt+C</kbd> 카테고리</li>
          <li><kbd>Alt+O</kbd> 옵션정보</li>
        </ul>

        <h3>💡 사용 팁</h3>
        <ul>
          <li>쿠팡 입력 필드 클릭 → Alt+키 → Ctrl+V</li>
          <li>단축키는 영어 첫 글자로 외우기 쉬움</li>
          <li>이미지는 자동으로 폴더에서 감지</li>
          <li>상태는 자동 저장됨</li>
        </ul>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  /**
   * 모달 닫기
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  /**
   * 마지막 세션 복구
   */
  async checkLastSession() {
    const lastSave = Storage.getLastSave();
    if (lastSave) {
      const csvPath = Storage.getCsvPath();
      const imagePath = Storage.getImageFolderPath();

      if (csvPath || imagePath) {
        // 복구 가능한 세션이 있음
        console.log('마지막 세션:', lastSave);
        // TODO: 복구 확인 다이얼로그
      }
    }
  }

  /**
   * 토스트 알림
   */
  showToast(message, type = 'info') {
    ShortcutHandler.showToast(message, type);
  }

  /**
   * 파일 크기 포맷
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  window.app = new CoupangWingHelper();
});
