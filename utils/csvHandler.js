// CSV 파일 처리 유틸리티

const CSVHandler = {
  // 파일 핸들 저장
  fileHandle: null,
  csvData: [],
  currentIndex: 0,

  /**
   * CSV 파일 선택 및 로드
   * @returns {Promise<object>} - 파일 정보 및 데이터
   */
  async selectFile() {
    try {
      // File System Access API 지원 확인
      if (!('showOpenFilePicker' in window)) {
        throw new Error('File System Access API를 지원하지 않는 브라우저입니다. Chrome 86+ 이상을 사용해주세요.');
      }

      // 파일 선택 대화상자
      const [handle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'CSV Files',
            accept: {
              'text/csv': ['.csv']
            }
          }
        ],
        excludeAcceptAllOption: true,
        multiple: false
      });

      this.fileHandle = handle;
      const file = await handle.getFile();
      const text = await file.text();

      // BOM 제거 (UTF-8 with BOM)
      const cleanText = text.replace(/^\uFEFF/, '');

      // PapaParse로 파싱
      const result = Papa.parse(cleanText, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8'
      });

      if (result.errors.length > 0) {
        console.warn('CSV 파싱 경고:', result.errors);
      }

      this.csvData = result.data;

      return {
        name: file.name,
        path: handle.name,
        size: file.size,
        data: this.csvData,
        rowCount: this.csvData.length
      };
    } catch (error) {
      console.error('CSV 파일 선택 오류:', error);
      throw error;
    }
  },

  /**
   * CSV 파일 저장
   * @param {Array} data - 저장할 데이터
   * @returns {Promise<boolean>} - 성공 여부
   */
  async saveFile(data = null) {
    try {
      if (!this.fileHandle) {
        throw new Error('파일 핸들이 없습니다. 먼저 파일을 선택해주세요.');
      }

      const dataToSave = data || this.csvData;

      // CSV 문자열 생성
      const csv = Papa.unparse(dataToSave, {
        quotes: true,
        header: true
      });

      // UTF-8 BOM 추가 (Excel 호환성)
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });

      // 파일 쓰기
      const writable = await this.fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      console.log('CSV 파일 저장 완료');
      Storage.setLastSave();

      return true;
    } catch (error) {
      console.error('CSV 파일 저장 오류:', error);
      throw error;
    }
  },

  /**
   * CSV 데이터 변환 (내부관리번호 추가)
   * @param {string} brandCode - 브랜드 코드
   * @param {string} dateCode - 날짜 코드
   * @param {number} startNumber - 시작 번호
   * @returns {Array} - 변환된 데이터
   */
  transformData(brandCode, dateCode, startNumber = 1) {
    this.csvData = IDGenerator.addToCSV(this.csvData, brandCode, dateCode, startNumber);
    return this.csvData;
  },

  /**
   * 현재 상품 데이터 가져오기
   * @param {number} index - 인덱스 (선택사항)
   * @returns {object} - 상품 데이터
   */
  getCurrentProduct(index = null) {
    const idx = index !== null ? index : this.currentIndex;

    if (idx < 0 || idx >= this.csvData.length) {
      return null;
    }

    return this.csvData[idx];
  },

  /**
   * 다음 상품으로 이동
   * @returns {object} - 다음 상품 데이터
   */
  nextProduct() {
    if (this.currentIndex < this.csvData.length - 1) {
      this.currentIndex++;
      Storage.setCurrentIndex(this.currentIndex);
      return this.getCurrentProduct();
    }
    return null;
  },

  /**
   * 이전 상품으로 이동
   * @returns {object} - 이전 상품 데이터
   */
  previousProduct() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      Storage.setCurrentIndex(this.currentIndex);
      return this.getCurrentProduct();
    }
    return null;
  },

  /**
   * 특정 인덱스로 이동
   * @param {number} index - 이동할 인덱스
   * @returns {object} - 상품 데이터
   */
  goToProduct(index) {
    if (index >= 0 && index < this.csvData.length) {
      this.currentIndex = index;
      Storage.setCurrentIndex(this.currentIndex);
      return this.getCurrentProduct();
    }
    return null;
  },

  /**
   * 상품 상태 업데이트
   * @param {number} index - 인덱스
   * @param {string} status - 상태 ('대기', '완료', '실패')
   * @returns {Promise<boolean>} - 성공 여부
   */
  async updateStatus(index, status) {
    if (index >= 0 && index < this.csvData.length) {
      this.csvData[index]['상태'] = status;

      // 자동 저장
      if (Storage.getSettings().autoSave) {
        await this.saveFile();
      }

      // localStorage에도 저장
      Storage.setCsvData(this.csvData);

      return true;
    }
    return false;
  },

  /**
   * 현재 상품 완료 처리 후 다음으로 이동
   * @returns {object} - 다음 상품 데이터
   */
  async completeAndNext() {
    await this.updateStatus(this.currentIndex, '완료');
    return this.nextProduct();
  },

  /**
   * 현재 상품 실패 처리 후 다음으로 이동
   * @returns {object} - 다음 상품 데이터
   */
  async failAndNext() {
    await this.updateStatus(this.currentIndex, '실패');
    return this.nextProduct();
  },

  /**
   * 통계 계산
   * @returns {object} - 통계 정보
   */
  getStats() {
    const total = this.csvData.length;
    const completed = this.csvData.filter(row => row['상태'] === '완료').length;
    const failed = this.csvData.filter(row => row['상태'] === '실패').length;
    const pending = this.csvData.filter(row => row['상태'] === '대기').length;

    return {
      total,
      completed,
      failed,
      pending,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  },

  /**
   * 필드 값 가져오기
   * @param {string} fieldName - 필드 이름
   * @param {number} index - 인덱스 (선택사항)
   * @returns {string} - 필드 값
   */
  getField(fieldName, index = null) {
    const product = this.getCurrentProduct(index);
    return product ? (product[fieldName] || '') : '';
  },

  /**
   * 필드 값 복사 (클립보드)
   * @param {string} fieldName - 필드 이름
   * @returns {Promise<boolean>} - 성공 여부
   */
  async copyField(fieldName) {
    const value = this.getField(fieldName);

    if (!value) {
      console.warn(`필드 "${fieldName}"의 값이 없습니다.`);
      return false;
    }

    try {
      await navigator.clipboard.writeText(value);
      console.log(`복사됨: ${fieldName} = ${value}`);
      return true;
    } catch (error) {
      console.error('클립보드 복사 오류:', error);
      return false;
    }
  },

  /**
   * CSV 데이터 로드 (localStorage에서)
   * @returns {boolean} - 성공 여부
   */
  loadFromStorage() {
    const data = Storage.getCsvData();
    if (data && data.length > 0) {
      this.csvData = data;
      this.currentIndex = Storage.getCurrentIndex() || 0;
      return true;
    }
    return false;
  },

  /**
   * 필수 컬럼 검증
   * @param {Array} data - 검증할 데이터
   * @returns {object} - 검증 결과
   */
  validateColumns(data) {
    const required = ['브랜드', '상품명', '판매가'];
    const optional = ['할인전금액', '배송비', '카테고리', '옵션정보', '전성분', '용량', '상품URL'];

    if (!data || data.length === 0) {
      return {
        valid: false,
        message: 'CSV 데이터가 비어있습니다.'
      };
    }

    const columns = Object.keys(data[0]);
    const missing = required.filter(col => !columns.includes(col));

    if (missing.length > 0) {
      return {
        valid: false,
        message: `필수 컬럼이 없습니다: ${missing.join(', ')}`
      };
    }

    return {
      valid: true,
      message: '유효한 CSV 파일입니다.',
      columns: {
        required: required.filter(col => columns.includes(col)),
        optional: optional.filter(col => columns.includes(col)),
        extra: columns.filter(col => !required.includes(col) && !optional.includes(col))
      }
    };
  },

  /**
   * 데이터 초기화
   */
  reset() {
    this.fileHandle = null;
    this.csvData = [];
    this.currentIndex = 0;
  }
};
