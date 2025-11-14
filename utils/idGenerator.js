// 내부관리번호 생성 유틸리티

const IDGenerator = {
  /**
   * 내부관리번호 생성
   * @param {string} brandCode - 브랜드 코드 (2자리, 예: CP)
   * @param {string} dateCode - 날짜 코드 (MMDD, 예: 1104)
   * @param {number} sequence - 순번 (예: 1, 2, 3...)
   * @returns {string} - 내부관리번호 (예: CP1104_001)
   */
  generate(brandCode, dateCode, sequence) {
    // 브랜드 코드 검증 (2자리)
    if (!brandCode || brandCode.length !== 2) {
      throw new Error('브랜드 코드는 2자리여야 합니다.');
    }

    // 날짜 코드 검증 (4자리 MMDD)
    if (!dateCode || dateCode.length !== 4) {
      throw new Error('날짜 코드는 4자리(MMDD)여야 합니다.');
    }

    // 순번을 3자리로 제로 패딩
    const paddedSequence = String(sequence).padStart(3, '0');

    return `${brandCode.toUpperCase()}${dateCode}_${paddedSequence}`;
  },

  /**
   * 현재 날짜로부터 날짜 코드 생성 (MMDD)
   * @returns {string} - 날짜 코드 (예: 1104)
   */
  getCurrentDateCode() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return month + day;
  },

  /**
   * CSV 데이터에 내부관리번호 추가
   * @param {Array} csvData - 원본 CSV 데이터
   * @param {string} brandCode - 브랜드 코드
   * @param {string} dateCode - 날짜 코드
   * @param {number} startNumber - 시작 번호
   * @returns {Array} - 내부관리번호가 추가된 CSV 데이터
   */
  addToCSV(csvData, brandCode, dateCode, startNumber = 1) {
    return csvData.map((row, index) => {
      const sequence = startNumber + index;
      const newId = this.generate(brandCode, dateCode, sequence);

      // 새로운 행 생성
      return {
        '신규내부관리번호': newId,
        '브랜드': row['브랜드'] || '',
        '상품명': row['상품명'] || '',
        '할인전금액': row['할인전금액'] || '',
        '판매가': row['판매가'] || '',
        '배송비': row['배송비'] || '',
        '카테고리': row['카테고리'] || '',
        '옵션정보': row['옵션정보'] || '',
        '전성분': row['전성분'] || '',
        '용량': row['용량'] || '',
        '상품URL': row['상품URL'] || '',
        '상태': '대기',
        '올리브영상품번호': row['내부관리번호'] || row['상품번호'] || ''
      };
    });
  },

  /**
   * 내부관리번호 범위 생성 (미리보기용)
   * @param {string} brandCode - 브랜드 코드
   * @param {string} dateCode - 날짜 코드
   * @param {number} startNumber - 시작 번호
   * @param {number} count - 개수
   * @returns {object} - 시작과 끝 ID
   */
  getRange(brandCode, dateCode, startNumber, count) {
    if (count === 0) {
      return { start: '-', end: '-' };
    }

    const start = this.generate(brandCode, dateCode, startNumber);
    const end = this.generate(brandCode, dateCode, startNumber + count - 1);

    return { start, end };
  },

  /**
   * 내부관리번호 검증
   * @param {string} id - 검증할 ID
   * @returns {boolean} - 유효 여부
   */
  validate(id) {
    // 형식: XX0000_000 (2자리 브랜드코드 + 4자리 날짜 + _ + 3자리 번호)
    const pattern = /^[A-Z]{2}\d{4}_\d{3}$/;
    return pattern.test(id);
  },

  /**
   * 내부관리번호 파싱
   * @param {string} id - 파싱할 ID
   * @returns {object} - 파싱된 정보 또는 null
   */
  parse(id) {
    if (!this.validate(id)) {
      return null;
    }

    const brandCode = id.substring(0, 2);
    const dateCode = id.substring(2, 6);
    const sequence = parseInt(id.substring(7, 10), 10);

    return {
      brandCode,
      dateCode,
      sequence,
      fullId: id
    };
  }
};
