// 이미지 폴더 스캔 및 관리 유틸리티

const ImageScanner = {
  imageFolderHandle: null,
  imageCache: {}, // productId -> images 매핑

  /**
   * 이미지 폴더 선택
   * @returns {Promise<object>} - 폴더 정보
   */
  async selectFolder() {
    try {
      // File System Access API 지원 확인
      if (!('showDirectoryPicker' in window)) {
        throw new Error('File System Access API를 지원하지 않는 브라우저입니다. Chrome 86+ 이상을 사용해주세요.');
      }

      // 폴더 선택 대화상자
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      this.imageFolderHandle = handle;

      return {
        name: handle.name,
        path: handle.name
      };
    } catch (error) {
      console.error('이미지 폴더 선택 오류:', error);
      throw error;
    }
  },

  /**
   * 특정 상품의 이미지 폴더 스캔
   * @param {string} productId - 상품 ID (예: CP1104_001)
   * @returns {Promise<object>} - 이미지 정보
   */
  async scanProductImages(productId) {
    try {
      if (!this.imageFolderHandle) {
        throw new Error('이미지 폴더가 선택되지 않았습니다.');
      }

      // 캐시 확인
      if (this.imageCache[productId]) {
        return this.imageCache[productId];
      }

      // 상품 폴더 찾기
      let productFolderHandle = null;
      try {
        productFolderHandle = await this.imageFolderHandle.getDirectoryHandle(productId);
      } catch (error) {
        // 폴더가 없으면 빈 결과 반환
        return this.createEmptyImageResult(productId);
      }

      // 폴더 내 파일 스캔
      const files = [];
      for await (const entry of productFolderHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          // 이미지 파일만 필터링
          if (this.isImageFile(file.name)) {
            files.push({
              name: file.name,
              file: file,
              size: file.size,
              handle: entry
            });
          }
        }
      }

      // 파일명으로 정렬 (001.jpg, 002.jpg, ...)
      files.sort((a, b) => a.name.localeCompare(b.name));

      // 이미지 분류
      const result = {
        productId,
        folderPath: `${this.imageFolderHandle.name}/${productId}`,
        mainImage: files.length > 0 ? files[0] : null,
        additionalImages: files.slice(1, 9), // 2~9번째
        detailImages: files.slice(9), // 10번째 이후
        totalCount: files.length,
        validation: this.validateImages(files)
      };

      // 캐시에 저장
      this.imageCache[productId] = result;

      return result;
    } catch (error) {
      console.error('이미지 스캔 오류:', error);
      return this.createEmptyImageResult(productId);
    }
  },

  /**
   * 빈 이미지 결과 생성
   * @param {string} productId - 상품 ID
   * @returns {object} - 빈 결과
   */
  createEmptyImageResult(productId) {
    return {
      productId,
      folderPath: null,
      mainImage: null,
      additionalImages: [],
      detailImages: [],
      totalCount: 0,
      validation: [
        {
          type: 'warning',
          message: '이미지 폴더를 찾을 수 없습니다.'
        }
      ]
    };
  },

  /**
   * 이미지 파일 여부 확인
   * @param {string} filename - 파일명
   * @returns {boolean} - 이미지 파일 여부
   */
  isImageFile(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
  },

  /**
   * 이미지 검증
   * @param {Array} files - 파일 목록
   * @returns {Array} - 검증 결과
   */
  validateImages(files) {
    const validations = [];

    // 이미지 개수 체크
    if (files.length === 0) {
      validations.push({
        type: 'error',
        message: '이미지가 없습니다.'
      });
    } else if (files.length > 9) {
      validations.push({
        type: 'warning',
        message: `이미지가 ${files.length}개입니다. 쿠팡 윙은 최대 9개까지 지원합니다.`
      });
    }

    // 파일 크기 체크
    files.forEach(file => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > 5) {
        validations.push({
          type: 'warning',
          message: `${file.name}: 파일 크기가 ${sizeMB.toFixed(2)}MB입니다. (권장: 5MB 이하)`,
          filename: file.name
        });
      }
    });

    // 모든 검증 통과
    if (validations.length === 0) {
      validations.push({
        type: 'info',
        message: `${files.length}개의 이미지가 준비되었습니다.`
      });
    }

    return validations;
  },

  /**
   * 대표 이미지 경로 가져오기
   * @param {string} productId - 상품 ID
   * @returns {Promise<string>} - 이미지 경로
   */
  async getMainImagePath(productId) {
    const images = await this.scanProductImages(productId);
    if (images.mainImage) {
      return `${images.folderPath}/${images.mainImage.name}`;
    }
    return null;
  },

  /**
   * 추가 이미지 경로 목록 가져오기
   * @param {string} productId - 상품 ID
   * @param {string} separator - 구분자 (기본: 줄바꿈)
   * @returns {Promise<string>} - 이미지 경로 목록
   */
  async getAdditionalImagePaths(productId, separator = '\n') {
    const images = await this.scanProductImages(productId);
    if (images.additionalImages.length > 0) {
      const paths = images.additionalImages.map(img =>
        `${images.folderPath}/${img.name}`
      );
      return paths.join(separator);
    }
    return null;
  },

  /**
   * 대표 이미지 경로 복사
   * @param {string} productId - 상품 ID
   * @returns {Promise<boolean>} - 성공 여부
   */
  async copyMainImagePath(productId) {
    const path = await this.getMainImagePath(productId);
    if (path) {
      try {
        await navigator.clipboard.writeText(path);
        console.log('대표 이미지 경로 복사:', path);
        return true;
      } catch (error) {
        console.error('클립보드 복사 오류:', error);
        return false;
      }
    }
    return false;
  },

  /**
   * 추가 이미지 경로 복사
   * @param {string} productId - 상품 ID
   * @returns {Promise<boolean>} - 성공 여부
   */
  async copyAdditionalImagePaths(productId) {
    const paths = await this.getAdditionalImagePaths(productId);
    if (paths) {
      try {
        await navigator.clipboard.writeText(paths);
        console.log('추가 이미지 경로 복사:', paths);
        return true;
      } catch (error) {
        console.error('클립보드 복사 오류:', error);
        return false;
      }
    }
    return false;
  },

  /**
   * 이미지 폴더 열기 (브라우저 제한으로 실제 폴더 열기는 불가능)
   * 대신 폴더 경로를 클립보드에 복사
   * @param {string} productId - 상품 ID
   * @returns {Promise<boolean>} - 성공 여부
   */
  async openImageFolder(productId) {
    const images = await this.scanProductImages(productId);
    if (images.folderPath) {
      try {
        await navigator.clipboard.writeText(images.folderPath);
        console.log('이미지 폴더 경로 복사:', images.folderPath);
        return true;
      } catch (error) {
        console.error('클립보드 복사 오류:', error);
        return false;
      }
    }
    return false;
  },

  /**
   * 이미지 캐시 초기화
   */
  clearCache() {
    this.imageCache = {};
  },

  /**
   * 이미지 프리로드 (여러 상품의 이미지를 미리 스캔)
   * @param {Array} productIds - 상품 ID 배열
   */
  async preloadImages(productIds) {
    const promises = productIds.map(id => this.scanProductImages(id));
    await Promise.all(promises);
    console.log(`${productIds.length}개 상품의 이미지 프리로드 완료`);
  },

  /**
   * 이미지 폴더 리네임
   * @param {string} oldName - 기존 폴더명
   * @param {string} newName - 새 폴더명
   * @returns {Promise<boolean>} - 성공 여부
   */
  async renameFolder(oldName, newName) {
    try {
      if (!this.imageFolderHandle) {
        throw new Error('이미지 폴더가 선택되지 않았습니다.');
      }

      // File System Access API에서는 직접 rename이 안 되므로
      // 이 기능은 제한적입니다. 사용자가 수동으로 리네임하도록 안내해야 합니다.
      console.warn('브라우저에서 폴더 리네임은 지원되지 않습니다. 수동으로 변경해주세요.');

      return false;
    } catch (error) {
      console.error('폴더 리네임 오류:', error);
      return false;
    }
  },

  /**
   * 데이터 초기화
   */
  reset() {
    this.imageFolderHandle = null;
    this.imageCache = {};
  }
};
