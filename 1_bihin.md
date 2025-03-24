# 1. 備品管理アプリ
メインとなるソフトウェア。備品の動きを管理する。
購入者、品目、メーカー、機種名、目的、購入後の設置場所や管理者の変遷を辿れる機能をつける。

## データベース
以下のような２つのDBを持ち、bihin_idで結合できるようにしておく。
1. bihin
bihin_id, type, vendor, model_name, serial_number, who_bought, when_bought, why_bought, bought_memo, who_wrote_this, when_wrote_this

2. movement
bihin_id, when_moved, who_moved, why_moved, status_after_moved, moved_memo , who_wrote_this

## UI
トップページは備品のリストを表形式で表示する。表の並び順はデフォルトでtype別とし、追加日でも並び替えられるようにする。
表の一番上に、新しい備品を追加するためのボタンを配置し、そこをタップすると備品情報の入力画面に遷移する。備品情報の入力方式は以下に従うようにする。全部入力したら「完了」ボタンを押す。
- id: 自動的に作成。連番で良い。
- type: 表示名は「備品タイプ」。選択式（一眼レフカメラ本体、レンズ、音声レコーダー、トラップカメラ、電池、マイコン、PC周辺機器、記録媒体（SDカード等）、気象観測装置、その他）
- vendor: 表示名は「メーカー」。自由入力
- model_name: 表示名は「製品名」。自由入力
- serial_number: 表示名は「シリアル番号」。自由入力。任意。
- who_bought: 表示名は「購入者」。選択式（筑波大学、北海道大学、東邦大学、国環研）
- is_property: 表示名は「資産の有無」。選択式（有、無）
- when_bought: 表示名は「購入時期」。年月をプルダウンで入力。
- why_bought: 表示名は「購入目的」。自由入力。
- bought_memo: 表示名は「メモ」。自由入力。
- who_wrote_this: 自動的に作成。入力しているユーザー名を使用。
- when_wrote_this 自動的に作成。入力した日付を使う。