-- ユーザーアクティビティを記録するテーブル
CREATE TABLE IF NOT EXISTS user_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 備品テーブル
CREATE TABLE IF NOT EXISTS bihin (
    bihin_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM(
        '一眼レフカメラ本体',
        'レンズ',
        '音声レコーダー',
        'トラップカメラ',
        '電池',
        'マイコン',
        'PC周辺機器',
        '記録媒体',
        '気象観測装置',
        'その他'
    ) NOT NULL,
    vendor VARCHAR(100) NOT NULL,
    model_name VARCHAR(200) NOT NULL,
    who_bought ENUM('筑波大学', '北海道大学', '東邦大学', '国環研') NOT NULL,
    when_bought DATE NOT NULL,
    why_bought TEXT NOT NULL,
    bought_memo TEXT,
    photos JSON,  -- 写真のパス配列を JSON 形式で保存
    who_wrote_this VARCHAR(100) NOT NULL,
    when_wrote_this DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_who_bought (who_bought),
    INDEX idx_when_bought (when_bought)
);

-- 備品移動テーブル
CREATE TABLE IF NOT EXISTS movement (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    bihin_id INT NOT NULL,
    when_moved DATETIME NOT NULL,
    who_moved VARCHAR(100) NOT NULL,
    why_moved TEXT NOT NULL,
    status_after_moved VARCHAR(255) NOT NULL,
    moved_memo TEXT,
    photos JSON,  -- 写真のパス配列を JSON 形式で保存
    who_wrote_this VARCHAR(100) NOT NULL,
    when_wrote_this DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bihin_id) REFERENCES bihin(bihin_id),
    INDEX idx_bihin_id (bihin_id),
    INDEX idx_when_moved (when_moved)
);

-- バックアップログテーブル
CREATE TABLE IF NOT EXISTS backup_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backup_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    backup_path VARCHAR(255) NOT NULL,
    status ENUM('success', 'failure') NOT NULL,
    error_message TEXT
);