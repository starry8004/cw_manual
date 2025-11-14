// LocalStorage 관리 유틸리티

const Storage = {
  // 키 이름
  KEYS: {
    CSV_PATH: 'cw_csv_path',
    IMAGE_FOLDER_PATH: 'cw_image_folder_path',
    BRAND_CODE: 'cw_brand_code',
    DATE_CODE: 'cw_date_code',
    START_NUMBER: 'cw_start_number',
    CURRENT_INDEX: 'cw_current_index',
    CSV_DATA: 'cw_csv_data',
    SESSION_ID: 'cw_session_id',
    LAST_SAVE: 'cw_last_save',
    SETTINGS: 'cw_settings',
    RECENT_FILES: 'cw_recent_files'
  },

  // 값 저장
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Storage.set error:', error);
      return false;
    }
  },

  // 값 가져오기
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage.get error:', error);
      return defaultValue;
    }
  },

  // 값 삭제
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage.remove error:', error);
      return false;
    }
  },

  // 모든 앱 데이터 삭제
  clear() {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Storage.clear error:', error);
      return false;
    }
  },

  // CSV 경로 저장
  setCsvPath(path) {
    return this.set(this.KEYS.CSV_PATH, path);
  },

  // CSV 경로 가져오기
  getCsvPath() {
    return this.get(this.KEYS.CSV_PATH);
  },

  // 이미지 폴더 경로 저장
  setImageFolderPath(path) {
    return this.set(this.KEYS.IMAGE_FOLDER_PATH, path);
  },

  // 이미지 폴더 경로 가져오기
  getImageFolderPath() {
    return this.get(this.KEYS.IMAGE_FOLDER_PATH);
  },

  // 현재 인덱스 저장
  setCurrentIndex(index) {
    return this.set(this.KEYS.CURRENT_INDEX, index);
  },

  // 현재 인덱스 가져오기
  getCurrentIndex() {
    return this.get(this.KEYS.CURRENT_INDEX, 0);
  },

  // CSV 데이터 저장
  setCsvData(data) {
    return this.set(this.KEYS.CSV_DATA, data);
  },

  // CSV 데이터 가져오기
  getCsvData() {
    return this.get(this.KEYS.CSV_DATA, []);
  },

  // 마지막 저장 시간 저장
  setLastSave(timestamp = new Date().toISOString()) {
    return this.set(this.KEYS.LAST_SAVE, timestamp);
  },

  // 마지막 저장 시간 가져오기
  getLastSave() {
    return this.get(this.KEYS.LAST_SAVE);
  },

  // 세션 ID 생성 및 저장
  createSession() {
    const sessionId = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
    this.set(this.KEYS.SESSION_ID, sessionId);
    return sessionId;
  },

  // 세션 ID 가져오기
  getSessionId() {
    return this.get(this.KEYS.SESSION_ID);
  },

  // 최근 파일 추가
  addRecentFile(filePath) {
    const recent = this.get(this.KEYS.RECENT_FILES, []);
    // 중복 제거
    const filtered = recent.filter(f => f !== filePath);
    // 최대 5개까지만 저장
    const updated = [filePath, ...filtered].slice(0, 5);
    return this.set(this.KEYS.RECENT_FILES, updated);
  },

  // 최근 파일 목록 가져오기
  getRecentFiles() {
    return this.get(this.KEYS.RECENT_FILES, []);
  },

  // 설정 저장
  setSettings(settings) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    return this.set(this.KEYS.SETTINGS, updated);
  },

  // 설정 가져오기
  getSettings() {
    return this.get(this.KEYS.SETTINGS, {
      theme: 'light',
      autoSave: true,
      useShortcuts: true
    });
  },

  // 브랜드 코드 저장
  setBrandCode(code) {
    return this.set(this.KEYS.BRAND_CODE, code);
  },

  // 브랜드 코드 가져오기
  getBrandCode() {
    return this.get(this.KEYS.BRAND_CODE, 'CP');
  },

  // 날짜 코드 저장
  setDateCode(code) {
    return this.set(this.KEYS.DATE_CODE, code);
  },

  // 날짜 코드 가져오기
  getDateCode() {
    return this.get(this.KEYS.DATE_CODE);
  },

  // 시작 번호 저장
  setStartNumber(num) {
    return this.set(this.KEYS.START_NUMBER, num);
  },

  // 시작 번호 가져오기
  getStartNumber() {
    return this.get(this.KEYS.START_NUMBER, '001');
  }
};
