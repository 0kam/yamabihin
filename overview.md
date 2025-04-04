# 山岳研究班備品管理ツール
## 概要
山岳研究班（以下、山岳班）では、調査対象の山岳エリアに定点カメラや音声レコーダー、気象測器をおいている。
研究が進むにつれて、購入した備品が今どこに置かれているか、次メンテナンスが必要なのはいつか等をアプリ上で管理するべきだという結論に至った。
そこで、備品管理のために、以下の３つのアプリを統合した備品管理スイートを作る。

1. 備品管理アプリ
備品の購入者やその後の動き（誰かへの送付、現場への設置等）を管理するアプリ。購入者や設置者が適宜記入し、それぞれの備品が、今どこで、誰によって、どう使われているかを把握できるようにする。
2. カメラ管理アプリ
山岳班では、一眼レフカメラを改造した定点カメラを山に設置し、観測を行っている。定点カメラはバッテリーやSDカードの交換、故障や修理予定などのメンテナンスが多い。また、カメラ本体やレンズ、バッテリー、ソーラーなど部品が多いため、ある場所のカメラがどの備品で構成されているかがわかりにくい。そこで、備品管理アプリと連携して現在稼働しているカメラの状態や備品構成、現在の管理者を表示できるようにする。
3. レコーダー管理アプリ
山岳班では自動録音の音声レコーダーを山に設置し、鳥類の鳴き声等の観測を実施している。音声レコーダーは頻繁に電池交換やSDカードの交換が必要であり、その頻度は機種やバッテリーの種類、録音スケジュールによって異なるため、わかりにくい。そこで、備品管理アプリと連携して、1日あたりの電力・ストレージ消費量、バッテリーの種類を適宜入力し、次の電池・SDカードの交換時期がひと目でわかるようにしたい。また、時期が近づいたら管理者にメールする機能もほしい。

## 3つのアプリで共通する要件
- 同時アクセスが生じてもエラーを起こさないようにする。ただし、一度にアクセスするユーザー数は多くて10人であり、過度にパフォーマンスを気にする必要はない。
- 保守性を上げるため、可能な限りわかりやすく簡潔な構成、コードを心がける
- フロントエンドはReactを使う
- バックエンドは何でも良いが、全ツールで共通させる
- スマートフォンからの操作が想定されるため、スマホ対応のフロントエンドを使う。
- 管理者アカウントが他ユーザーの管理（メール登録、初期パスワード発行）をする仕組みを採用する。また、ログイン時にはユーザー名を入力し、誰がデータの入力等の操作を行ったかわかるようにログをつけておく。また、ログインしているユーザー名を表示するようにし、ログアウトボタンも用意する。
- システム不良に備えて、週一回、各DBをCSVとしてエクスポートする。
- 開発に伴い、第三者が見てわかりやすいドキュメントを整備する。
- 後から新しいコンポーネントを追加することが想定されるので、コンポーネントごとに分けられたクリーンなアーキテクチャを意識してください。