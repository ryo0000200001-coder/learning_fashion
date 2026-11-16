/*
 * ブランドデータ
 *
 * 1ブランド = 1オブジェクト。項目の意味:
 *   id        URLに使う英数字のID（例: #/brand/cdg）
 *   name      ブランド名 / ja: 日本語読み
 *   origin    "domestic"（日本）または "import"（海外）
 *   country   国 / city: 拠点
 *   founded   創業年（数値）
 *   tags      分類タグ（フィルタに使われる）
 *   summary   概要
 *   history   [{ year, text }] 年表
 *   designers [{ d: designers.jsのキー, role, from, to }]  to: null = 現在
 *   items     [{ name, year, desc }] 代表的なアイテム
 *   archive   古着・アーカイブで見る時のポイント
 *   related   関連ブランドのid
 *
 * 内容は学習用のメモです。年号や体制は変わることがあるので、
 * 気になるものは公式情報・書籍で確認して、どんどん書き足してください。
 */
window.BRANDS = [
  // =========================================================
  // 日本（ドメスティック）
  // =========================================================
  {
    id: "cdg", name: "COMME des GARÇONS", ja: "コム デ ギャルソン",
    origin: "domestic", country: "日本", city: "東京 / パリ", founded: 1969,
    tags: ["アヴァンギャルド", "モード", "メンズ", "ウィメンズ"],
    summary: "川久保玲が率いる、既存の「美しさ」や「服の形」を問い直し続けるブランド。多数のラインを持ち、渡辺淳弥や阿部千登勢など多くのデザイナーを輩出した。",
    history: [
      { year: 1969, text: "川久保玲がCOMME des GARÇONSとして服づくりを始める" },
      { year: 1973, text: "株式会社コム デ ギャルソン設立" },
      { year: 1978, text: "メンズライン「COMME des GARÇONS HOMME」開始" },
      { year: 1981, text: "パリコレクションに初参加。翌年にかけて穴あきニットなど黒一色の服が「黒の衝撃」「ボロルック」と呼ばれ論争に" },
      { year: 1984, text: "「COMME des GARÇONS HOMME PLUS」開始" },
      { year: 1988, text: "「COMME des GARÇONS SHIRT」開始" },
      { year: 1992, text: "「JUNYA WATANABE COMME des GARÇONS」開始" },
      { year: 1997, text: "1997年春夏「Body Meets Dress, Dress Meets Body」（通称こぶドレス）を発表" },
      { year: 2002, text: "「PLAY COMME des GARÇONS」開始" },
      { year: 2004, text: "ロンドンにDover Street Marketを開業" },
      { year: 2017, text: "メトロポリタン美術館で回顧展「Art of the In-Between」開催" }
    ],
    designers: [
      { d: "kawakubo", role: "デザイナー", from: 1969, to: null }
    ],
    items: [
      { name: "穴あきニット（ボロルック）", year: 1982, desc: "意図的に穴を開けたニット。「黒の衝撃」を象徴するピース。" },
      { name: "こぶドレス", year: 1997, desc: "パッドで身体に「こぶ」を作り、身体と服の関係を問い直したコレクション。" },
      { name: "ポリエステル縮絨ジャケット", year: "1990年代", desc: "HOMME PLUSなどで見られる、縮絨させた独特の質感のテーラード。アーカイブ人気が高い。" },
      { name: "PLAY ハートロゴ", year: 2002, desc: "フィリップ・パゴウスキーによる目のついたハート。最も知られたアイコン。" }
    ],
    archive: [
      "タグや洗濯表示の「AD1994」のような表記は製造年の目安になる（ブランド独自の年表記）。",
      "HOMME / HOMME PLUS / HOMME DEUX / tricot / robe de chambre など、ライン名で狙いや価格帯が大きく異なる。",
      "1980〜90年代の黒・縮絨・解体的なピースはアーカイブ市場で特に評価が高い。"
    ],
    related: ["junya", "sacai", "yohji"]
  },
  {
    id: "junya", name: "JUNYA WATANABE COMME des GARÇONS", ja: "ジュンヤ ワタナベ コム デ ギャルソン",
    origin: "domestic", country: "日本", city: "東京 / パリ", founded: 1992,
    tags: ["アヴァンギャルド", "モード", "ワーク", "ウィメンズ", "メンズ"],
    summary: "COMME des GARÇONSのパタンナー出身・渡辺淳弥のブランド。テクニカルな素材や構造、既存ブランドとのコラボレーションによる再構築が得意。",
    history: [
      { year: 1987, text: "渡辺淳弥がCOMME des GARÇONSに入社（パタンナー）" },
      { year: 1992, text: "JUNYA WATANABE COMME des GARÇONSとして東京でデビュー。翌年パリへ" },
      { year: 2001, text: "メンズライン「JUNYA WATANABE MAN」開始" }
    ],
    designers: [ { d: "watanabe", role: "デザイナー", from: 1992, to: null } ],
    items: [
      { name: "パッチワーク・ワークウェア", year: "2000年代〜", desc: "デニムやワーク素材を切り替えたMANの定番。Levi's、Carhartt、The North Faceなどとの協業も多い。" },
      { name: "テクノクチュール", year: "2000年代", desc: "化学繊維や折り紙的な構造を用いたウィメンズのピース。" }
    ],
    archive: [
      "コラボ相手のブランドタグとJUNYAのタグが併記されることが多い。",
      "メンズ（MAN）とウィメンズで発表の文脈がかなり違う。"
    ],
    related: ["cdg"]
  },
  {
    id: "yohji", name: "Yohji Yamamoto", ja: "ヨウジヤマモト",
    origin: "domestic", country: "日本", city: "東京 / パリ", founded: 1972,
    tags: ["アヴァンギャルド", "モード", "メンズ", "ウィメンズ", "ブラック"],
    summary: "山本耀司による、黒と非対称、ゆとりのあるカッティングで知られるブランド。男女の服の境界を曖昧にする仕立ては今も影響力を持つ。",
    history: [
      { year: 1972, text: "株式会社ワイズ設立（Y's）" },
      { year: 1977, text: "東京でコレクションを発表" },
      { year: 1981, text: "パリコレクションに初参加" },
      { year: 1984, text: "メンズ「Yohji Yamamoto POUR HOMME」を開始" },
      { year: 1989, text: "ヴィム・ヴェンダース監督のドキュメンタリー『都市とモードのビデオノート』" },
      { year: 2002, text: "adidasとの「Y-3」開始" },
      { year: 2009, text: "民事再生法の適用を申請し、のちに再建" },
      { year: 2011, text: "ロンドンのV&Aで回顧展" }
    ],
    designers: [ { d: "yamamoto", role: "デザイナー", from: 1972, to: null } ],
    items: [
      { name: "ウールギャバジンのセットアップ", year: "定番", desc: "落ち感のあるギャバジンで仕立てたジャケットやワイドパンツ。POUR HOMMEの象徴的素材。" },
      { name: "変形・非対称ジャケット", year: "1980年代〜", desc: "ボタン位置や前身頃がずれた構築。" },
      { name: "Y-3 スニーカー", year: "2002〜", desc: "adidasとの協業によるスポーツとモードの融合。" }
    ],
    archive: [
      "Y's、Yohji Yamamoto（メイン）、POUR HOMME、Y's for men などラインを確認する。",
      "1980〜90年代の手の込んだ黒のピースは状態の良いものが少なく評価が高い。"
    ],
    related: ["cdg", "issey"]
  },
  {
    id: "issey", name: "ISSEY MIYAKE", ja: "イッセイ ミヤケ",
    origin: "domestic", country: "日本", city: "東京 / パリ", founded: 1970,
    tags: ["テクノロジー", "素材", "モード", "ウィメンズ", "メンズ"],
    summary: "三宅一生が「一枚の布」という思想から始めたブランド。プリーツやA-POCなど、素材と技術の研究開発を軸にしている。メインラインは三宅以外のデザイナーに引き継がれてきた。",
    history: [
      { year: 1970, text: "三宅デザイン事務所設立" },
      { year: 1973, text: "パリでコレクションを発表" },
      { year: 1993, text: "「PLEATS PLEASE ISSEY MIYAKE」開始" },
      { year: 1999, text: "藤原大と「A-POC」を発表（一本の糸から一体成型で服をつくる）。同時期にメインラインを滝沢直己に引き継ぐ" },
      { year: 2013, text: "メンズのプリーツ「HOMME PLISSÉ ISSEY MIYAKE」開始" },
      { year: 2022, text: "三宅一生逝去" }
    ],
    designers: [
      { d: "miyake",   role: "デザイナー", from: 1970, to: 1999 },
      { d: "takizawa", role: "デザイナー（メインライン）", from: 1999, to: 2006 },
      { d: "fujiwara", role: "クリエイティブディレクター", from: 2006, to: 2011 },
      { d: "miyamae",  role: "デザイナー", from: 2011, to: 2019 },
      { d: "kondo",    role: "デザイナー", from: 2019, to: null }
    ],
    items: [
      { name: "PLEATS PLEASE", year: 1993, desc: "縫製後にプリーツをかける「製品プリーツ」。軽く、洗えて、しわにならない。" },
      { name: "A-POC", year: 1999, desc: "編み機で筒状の布に服の形を織り込み、切り取って着る。" },
      { name: "BAO BAO", year: 2000, desc: "三角形のピースを組み合わせた、形が変わるバッグ。" }
    ],
    archive: [
      "1980〜90年代のメインラインには彫刻的で実験的なピースが多い。",
      "デザイナー交代の年で作風が変わるので、年代とデザイナーを合わせて覚えると良い。"
    ],
    related: ["yohji", "cdg"],
    note: "デザイナーの在任期間は概ねの年です。"
  },
  {
    id: "undercover", name: "UNDERCOVER", ja: "アンダーカバー",
    origin: "domestic", country: "日本", city: "東京 / パリ", founded: 1990,
    tags: ["裏原宿", "パンク", "モード", "グラフィック", "メンズ", "ウィメンズ"],
    summary: "高橋盾のブランド。パンクとグラフィックを軸に、裏原宿のストリートからパリのランウェイへ進んだ。2000年代前半のコレクションはアーカイブ人気が非常に高い。",
    history: [
      { year: 1990, text: "文化服装学院在学中の高橋盾がUNDERCOVERを始める" },
      { year: 1993, text: "NIGOと原宿に「NOWHERE」を開店。裏原宿ブームの起点の一つに" },
      { year: 1994, text: "東京コレクションに参加" },
      { year: 2002, text: "パリコレクションに進出（2003年春夏「SCAB」）" },
      { year: 2010, text: "Nikeとのランニングライン「GYAKUSOU」開始" },
      { year: 2017, text: "メンズをピッティ・ウオモで発表し、のちにパリで再開" }
    ],
    designers: [ { d: "takahashi", role: "デザイナー", from: 1990, to: null } ],
    items: [
      { name: "SCABシリーズ", year: 2003, desc: "パッチワークやつぎはぎで「かさぶた」を表現したパリ初期の代表作。" },
      { name: "GYAKUSOU", year: 2010, desc: "Nikeとのランニングウェア。" },
      { name: "グラフィックT・パーカー", year: "1990年代〜", desc: "パンクやノイズ、カルト映画由来のグラフィック。" }
    ],
    archive: [
      "2000年代前半のコレクション名（シーズン名）を覚えると古着の相場感がつかみやすい。",
      "裏原宿期（1990年代）とパリ期でターゲットも作りも違う。"
    ],
    related: ["bape", "nine", "soloist"]
  },
  {
    id: "nine", name: "NUMBER (N)INE", ja: "ナンバーナイン",
    origin: "domestic", country: "日本", city: "東京", founded: 1996,
    tags: ["ロック", "グランジ", "メンズ", "アーカイブ"],
    summary: "宮下貴裕のブランドとして、ロックやグランジを背景にしたダメージ加工やニットで2000年代の東京メンズを象徴した。宮下の退任後は別体制で継続している。",
    history: [
      { year: 1996, text: "宮下貴裕がNUMBER (N)INEを設立" },
      { year: 2004, text: "パリでコレクションを発表" },
      { year: 2009, text: "宮下貴裕が退任し、ブランドは一時休止" },
      { year: 2010, text: "宮下が新ブランド「TAKAHIROMIYASHITA TheSoloist.」を開始" }
    ],
    designers: [ { d: "miyashita", role: "デザイナー", from: 1996, to: 2009 } ],
    items: [
      { name: "ダメージ加工デニム", year: "2000年代", desc: "履き込んだように加工されたデニム。" },
      { name: "モヘア・カーディガン、ロックT", year: "2000年代", desc: "グランジやロックミュージシャンを想起させるアイテム。" }
    ],
    archive: [
      "宮下在任期（1996〜2009）とそれ以降を区別して見ること。アーカイブとして評価されるのは主に在任期。"
    ],
    related: ["soloist", "undercover"],
    note: "コレクション別の詳細は要調査。シーズン名を書き足していくと強力なノートになります。"
  },
  {
    id: "soloist", name: "TAKAHIROMIYASHITA TheSoloist.", ja: "タカヒロミヤシタ ザ ソロイスト",
    origin: "domestic", country: "日本", city: "東京", founded: 2010,
    tags: ["ロック", "モード", "メンズ"],
    summary: "NUMBER (N)INEを離れた宮下貴裕が始めたブランド。より個人的でテーラリングの効いた作風。",
    history: [
      { year: 2010, text: "TAKAHIROMIYASHITA TheSoloist.を開始" }
    ],
    designers: [ { d: "miyashita", role: "デザイナー", from: 2010, to: null } ],
    items: [
      { name: "テーラードジャケット・レザー", year: "2010年代〜", desc: "ロック的ムードを残しつつ、より精緻な仕立て。" }
    ],
    archive: [],
    related: ["nine"]
  },
  {
    id: "sacai", name: "sacai", ja: "サカイ",
    origin: "domestic", country: "日本", city: "東京 / パリ", founded: 1999,
    tags: ["ハイブリッド", "モード", "ウィメンズ", "メンズ"],
    summary: "COMME des GARÇONS出身の阿部千登勢によるブランド。ニットとシャツ、MA-1とプリーツなど、異なる服を一着に「ドッキング」するハイブリッドが特徴。",
    history: [
      { year: 1999, text: "阿部千登勢がsacaiを始める（ニット中心の少数型から）" },
      { year: 2009, text: "パリでのプレゼンテーションを開始（のちランウェイへ）" },
      { year: 2019, text: "Nikeとの「LDWaffle」が大きな話題に" },
      { year: 2021, text: "Jean Paul Gaultierクチュールの初のゲストデザイナーを務める" }
    ],
    designers: [ { d: "abe_c", role: "デザイナー", from: 1999, to: null } ],
    items: [
      { name: "ドッキングMA-1", year: "2010年代", desc: "フライトジャケットにプリーツやニットを接ぎ合わせた代表的ハイブリッド。" },
      { name: "Nike LDWaffle", year: 2019, desc: "二つのスニーカーを重ねたようなデザイン。" }
    ],
    archive: [],
    related: ["cdg", "kolor", "jpg"]
  },
  {
    id: "kolor", name: "kolor", ja: "カラー",
    origin: "domestic", country: "日本", city: "東京 / パリ", founded: 2004,
    tags: ["ハイブリッド", "メンズ", "モード"],
    summary: "阿部潤一によるブランド。色・素材・パターンを一着の中で切り替える、ひねりのある大人の服。",
    history: [
      { year: 2004, text: "阿部潤一がkolorを開始" },
      { year: 2012, text: "パリでコレクションを発表" }
    ],
    designers: [ { d: "abe_j", role: "デザイナー", from: 2004, to: null } ],
    items: [
      { name: "異素材切替のジャケット", year: "定番", desc: "一見ベーシックだが、素材や色が細かく切り替わる。" }
    ],
    archive: [],
    related: ["sacai"]
  },
  {
    id: "visvim", name: "visvim", ja: "ヴィズヴィム",
    origin: "domestic", country: "日本", city: "東京", founded: 2000,
    tags: ["ヴィンテージ", "クラフト", "メンズ", "シューズ"],
    summary: "中村ヒロキによるブランド。ネイティブアメリカンのモカシンや民藝、ヴィンテージを研究し、天然染めや手仕事を多用する。",
    history: [
      { year: 2000, text: "中村ヒロキがvisvimを設立。シューズから出発" }
    ],
    designers: [ { d: "nakamura", role: "デザイナー", from: 2000, to: null } ],
    items: [
      { name: "FBT", year: "初期", desc: "モカシンとスニーカーを融合させた代表作。" },
      { name: "泥染め・藍染めのアイテム", year: "2000年代〜", desc: "天然染料による加工。" }
    ],
    archive: [],
    related: ["kapital"]
  },
  {
    id: "wtaps", name: "WTAPS", ja: "ダブルタップス",
    origin: "domestic", country: "日本", city: "東京", founded: 1996,
    tags: ["裏原宿", "ミリタリー", "メンズ"],
    summary: "西山徹によるブランド。ミリタリーウェアを軸にした裏原宿世代の代表格。",
    history: [ { year: 1996, text: "西山徹がWTAPSを開始" } ],
    designers: [ { d: "nishiyama", role: "デザイナー", from: 1996, to: null } ],
    items: [
      { name: "ジャングルファティーグ、M-65", year: "定番", desc: "米軍ミリタリーをベースにしたアイテム。" }
    ],
    archive: [],
    related: ["nbhd", "bape"]
  },
  {
    id: "nbhd", name: "NEIGHBORHOOD", ja: "ネイバーフッド",
    origin: "domestic", country: "日本", city: "東京", founded: 1994,
    tags: ["裏原宿", "バイカー", "ミリタリー", "メンズ"],
    summary: "滝沢伸介によるブランド。モーターサイクルカルチャーとミリタリーを背景にした、硬派な裏原宿ブランド。",
    history: [ { year: 1994, text: "滝沢伸介が原宿でNEIGHBORHOODを開始" } ],
    designers: [ { d: "takizawa_s", role: "デザイナー", from: 1994, to: null } ],
    items: [
      { name: "レザージャケット、デニム", year: "定番", desc: "バイカーカルチャー由来。" }
    ],
    archive: [],
    related: ["wtaps"]
  },
  {
    id: "bape", name: "A BATHING APE", ja: "ア ベイシング エイプ",
    origin: "domestic", country: "日本", city: "東京", founded: 1993,
    tags: ["裏原宿", "ストリート", "グラフィック"],
    summary: "NIGOが1993年に始めたブランド。猿のロゴと独自のカモ柄で、裏原宿から世界的なストリートブランドに。2011年に香港のI.T社に売却された。",
    history: [
      { year: 1993, text: "NIGOがA BATHING APEを開始" },
      { year: 2011, text: "香港のI.T社に売却" },
      { year: 2013, text: "NIGOが退任" }
    ],
    designers: [ { d: "nigo", role: "創業者・デザイナー", from: 1993, to: 2013 } ],
    items: [
      { name: "ABCカモ", year: "定番", desc: "猿の顔が隠れたオリジナル迷彩。" },
      { name: "シャークパーカー", year: "2000年代", desc: "フルジップでフードに鮫の顔があしらわれたパーカー。" },
      { name: "BAPE STA", year: "2000年代", desc: "星のマークのスニーカー。" }
    ],
    archive: [
      "NIGO在任期（〜2013頃）の初期アイテムと、それ以降を分けて見る。",
      "偽物が非常に多いブランドなので、タグや縫製の見分け方を別途学ぶ必要がある。"
    ],
    related: ["undercover", "wtaps"]
  },
  {
    id: "hysteric", name: "HYSTERIC GLAMOUR", ja: "ヒステリックグラマー",
    origin: "domestic", country: "日本", city: "東京", founded: 1984,
    tags: ["ロック", "ポップアート", "グラフィック", "ウィメンズ", "メンズ"],
    summary: "北村信彦が1984年に始めたブランド。60〜70年代ロック、ポップアート、ポルノグラフィティなどを東京的に再解釈。",
    history: [ { year: 1984, text: "北村信彦がHYSTERIC GLAMOURを開始" } ],
    designers: [ { d: "kitamura", role: "デザイナー", from: 1984, to: null } ],
    items: [
      { name: "ヒスガール（ロゴガール）", year: "定番", desc: "ブランドを象徴するグラフィック。" },
      { name: "ロックT・アーティストコラボ", year: "1990年代〜", desc: "ミュージシャンや写真家とのグラフィック。" }
    ],
    archive: [ "1990年代のグラフィックTやデニムは海外でも人気が高い。" ],
    related: []
  },
  {
    id: "kapital", name: "KAPITAL", ja: "キャピタル",
    origin: "domestic", country: "日本", city: "岡山・児島", founded: 1985,
    tags: ["デニム", "クラフト", "ボロ", "メンズ"],
    summary: "デニムの産地・岡山県児島で平田俊清が始めたブランド。ボロ、刺し子、パッチワークなど日本の手仕事とアメリカンカジュアルの混交。",
    history: [ { year: 1985, text: "平田俊清が児島でKAPITALを始める" } ],
    designers: [
      { d: "hirata_t", role: "創業者", from: 1985, to: null },
      { d: "hirata_k", role: "クリエイティブ", from: 2000, to: null }
    ],
    items: [
      { name: "ボロ・パッチワーク", year: "定番", desc: "つぎはぎや刺し子で古布の表情を作る。" },
      { name: "センチュリーデニム", year: "定番", desc: "手作業の加工を重ねたデニム。" }
    ],
    archive: [],
    related: ["visvim"],
    note: "平田和宏の参画年は概算です。"
  },
  {
    id: "mastermind", name: "mastermind JAPAN", ja: "マスターマインド ジャパン",
    origin: "domestic", country: "日本", city: "東京", founded: 1997,
    tags: ["ストリート", "ラグジュアリー", "メンズ"],
    summary: "本間正章によるブランド。スカル&クロスボーンとラグジュアリー素材を組み合わせ、2000年代のストリートを象徴。2013年に一度幕を閉じた。",
    history: [
      { year: 1997, text: "本間正章がmastermind JAPANを開始" },
      { year: 2013, text: "mastermind JAPANとしての活動を一旦終了。のちに再始動" }
    ],
    designers: [ { d: "honma", role: "デザイナー", from: 1997, to: null } ],
    items: [
      { name: "スカル&クロスボーン", year: "定番", desc: "ブランドを象徴するモチーフ。" }
    ],
    archive: [],
    related: []
  },
  {
    id: "mihara", name: "Maison MIHARA YASUHIRO", ja: "メゾン ミハラヤスヒロ",
    origin: "domestic", country: "日本", city: "東京", founded: 1997,
    tags: ["シューズ", "解体", "メンズ"],
    summary: "三原康裕が靴から始めたブランド。オリジナルソールのスニーカーや、溶けたようなソールなどアイロニカルなデザインで知られる。",
    history: [
      { year: 1997, text: "三原康裕がシューズブランドとして開始（1990年代後半）" },
      { year: 2000, text: "PUMAとのコラボレーションを開始" }
    ],
    designers: [ { d: "mihara", role: "デザイナー", from: 1997, to: null } ],
    items: [
      { name: "オリジナルソールスニーカー", year: "2010年代〜", desc: "子供が描いたようなソールを持つスニーカー。" }
    ],
    archive: [],
    related: []
  },

  // =========================================================
  // 海外（インポート）
  // =========================================================
  {
    id: "margiela", name: "Maison Margiela", ja: "メゾン マルジェラ",
    origin: "import", country: "フランス", city: "パリ", founded: 1988,
    tags: ["アヴァンギャルド", "脱構築", "アントワープ", "アーカイブ"],
    summary: "マルタン・マルジェラがジェニー・メイレンスと設立。匿名性、白いタグ、古着や既製品の再構築で1990年代のファッションを変えた。2009年のマルジェラ退任後、ガリアーノ、マーティンスへと続く。",
    history: [
      { year: 1988, text: "Maison Martin Margiela設立。足袋ブーツはこの頃から" },
      { year: 1989, text: "1989年春夏で初のショー" },
      { year: 1997, text: "マルジェラがHermèsウィメンズのデザイナーを兼任（〜2003）" },
      { year: 2002, text: "DieselのRenzo Rosso（のちのOTBグループ）が買収" },
      { year: 2009, text: "マルタン・マルジェラが退任。以降デザインチーム体制" },
      { year: 2014, text: "ジョン・ガリアーノがクリエイティブディレクターに就任" },
      { year: 2015, text: "「Maison Margiela」に名称変更" },
      { year: 2025, text: "グレン・マーティンスがクリエイティブディレクターに就任" }
    ],
    designers: [
      { d: "margiela", role: "創業者・デザイナー", from: 1988, to: 2009 },
      { d: "galliano", role: "クリエイティブディレクター", from: 2014, to: 2024 },
      { d: "martens",  role: "クリエイティブディレクター", from: 2025, to: null }
    ],
    items: [
      { name: "足袋ブーツ（Tabi）", year: 1988, desc: "日本の地下足袋から着想した、つま先が割れたブーツ。" },
      { name: "ジャーマントレーナー（レプリカ）", year: "2000年代〜", desc: "ドイツ軍トレーナーを再現したReplicaライン。" },
      { name: "アーティザナル（Line 0）", year: "1990年代〜", desc: "古着や既製品を手作業で別物に作り替える一点もの的ライン。" },
      { name: "ストックマンジャケット", year: "1990年代", desc: "トルソー（ボディ）の形をそのまま服にしたピース。" }
    ],
    archive: [
      "白いタグの数字に丸が付いているのがライン番号（0 アーティザナル、1 ウィメンズ、10 メンズ、14 メンズワードローブ、22 シューズ など）。",
      "外側に見える4つの白いステッチはタグを留める糸。",
      "マルジェラ本人在任期（1988〜2009）のピースが「アーカイブ」として特に評価される。"
    ],
    related: ["hermes", "dior", "anndemeulemeester", "dries"]
  },
  {
    id: "hermes", name: "Hermès", ja: "エルメス",
    origin: "import", country: "フランス", city: "パリ", founded: 1837,
    tags: ["ラグジュアリー", "レザー", "メゾン"],
    summary: "馬具工房から始まった老舗。ウィメンズのプレタポルテではマルジェラ、ゴルチエ、ルメールといった意外な人選が続き、デザイナー変遷を学ぶ好例。",
    history: [
      { year: 1837, text: "ティエリ・エルメスがパリに馬具工房を開く" },
      { year: 1956, text: "グレース・ケリーの持ったバッグが「ケリー」と呼ばれるように" },
      { year: 1984, text: "ジェーン・バーキンとの出会いから「バーキン」誕生" },
      { year: 1988, text: "ヴェロニク・ニシャニアンがメンズを担当" },
      { year: 1997, text: "マルタン・マルジェラがウィメンズを担当" }
    ],
    designers: [
      { d: "margiela",  role: "ウィメンズ", from: 1997, to: 2003 },
      { d: "gaultier",  role: "ウィメンズ", from: 2004, to: 2010 },
      { d: "lemaire",   role: "ウィメンズ", from: 2010, to: 2014 },
      { d: "vanhee",    role: "ウィメンズ", from: 2014, to: null },
      { d: "nichanian", role: "メンズ", from: 1988, to: null }
    ],
    items: [
      { name: "ケリー / バーキン", year: "1956 / 1984", desc: "メゾンを代表するバッグ。" },
      { name: "マルジェラ期のウィメンズ", year: "1997〜2003", desc: "ダブルフェイスのウール、ボタンを最小限にしたコートなど。アーカイブで人気。" }
    ],
    archive: [ "マルジェラ期のHermèsウィメンズは、Margiela本体と並んでアーカイブ蒐集の対象。" ],
    related: ["margiela", "jpg"],
    note: "メンズの体制は最新情報を要確認。"
  },
  {
    id: "helmutlang", name: "Helmut Lang", ja: "ヘルムート ラング",
    origin: "import", country: "オーストリア", city: "ウィーン / ニューヨーク", founded: 1986,
    tags: ["ミニマル", "アーカイブ", "90年代", "メンズ", "ウィメンズ"],
    summary: "ヘルムート・ラングが1990年代のミニマリズムを象徴したブランド。ストラップや反射素材、ペインターデニムなどのアイテムはアーカイブ市場で最重要クラス。本人は2005年に去った。",
    history: [
      { year: 1986, text: "パリで初のコレクション（ウィーンでは1970年代から活動）" },
      { year: 1998, text: "拠点をニューヨークに移し、コレクションをインターネットで発表" },
      { year: 1999, text: "Pradaグループが資本参加（のちに完全買収）" },
      { year: 2005, text: "ヘルムート・ラングが退任しファッションから離れる" },
      { year: 2006, text: "Theory（ファーストリテイリング傘下）がブランドを取得" }
    ],
    designers: [
      { d: "lang",    role: "創業者・デザイナー", from: 1986, to: 2005 },
      { d: "colovos", role: "クリエイティブディレクター", from: 2007, to: 2014 },
      { d: "peterdo", role: "クリエイティブディレクター", from: 2023, to: 2024 }
    ],
    items: [
      { name: "ボンデージストラップ", year: "1990年代後半", desc: "ジャケットやパンツにつく、着用には不要なストラップ。" },
      { name: "ペインターデニム", year: "1990年代後半", desc: "ペンキが飛んだような加工のデニム。" },
      { name: "アストロバイカー", year: "1990年代後半", desc: "パッド入りのレザー/ナイロンのバイカージャケット。" },
      { name: "反射素材のアイテム", year: "1990年代", desc: "リフレクターを使ったミニマルなアウター。" }
    ],
    archive: [
      "本人在任期（〜2005）のピースを指して「アーカイブ」と呼ぶことが多い。",
      "Made in Italy表記の時期など、タグの変遷で年代を推定できる。"
    ],
    related: ["jilsander", "raf"],
    note: "2007〜2014年以降も複数のデザイナー・体制を経ています。"
  },
  {
    id: "raf", name: "Raf Simons", ja: "ラフ シモンズ",
    origin: "import", country: "ベルギー", city: "アントワープ", founded: 1995,
    tags: ["ユースカルチャー", "アーカイブ", "メンズ", "ベルギー"],
    summary: "ラフ・シモンズが1995年に始めたメンズブランド。ニューウェーブやテクノ、反抗的な若者像を服にした。2001〜2003年頃のコレクションはアーカイブの頂点の一つ。2022年にブランドを終了。",
    history: [
      { year: 1995, text: "ラフ・シモンズが自身のメンズを開始" },
      { year: 2001, text: "2001-02年秋冬「Riot Riot Riot」" },
      { year: 2002, text: "2002-03年秋冬「Virginia Creeper」" },
      { year: 2003, text: "2003-04年秋冬「Closer」：ピーター・サヴィルのジョイ・ディヴィジョン/ニュー・オーダーのアートワークを使用" },
      { year: 2005, text: "Jil Sanderのクリエイティブディレクターに（〜2012）" },
      { year: 2022, text: "ブランドの終了を発表" }
    ],
    designers: [ { d: "raf", role: "デザイナー", from: 1995, to: 2022 } ],
    items: [
      { name: "Riot Riot Riot のボンバー", year: 2001, desc: "パッチやフードを組み合わせた、アーカイブの象徴的ジャケット。" },
      { name: "Closer期のピーター・サヴィル・グラフィック", year: 2003, desc: "レコードジャケットのアートワークをパーカーやコートに。" },
      { name: "adidas Ozweego", year: "2010年代", desc: "adidasとの協業スニーカー。" }
    ],
    archive: [
      "シーズン名とアイテムをセットで覚えると価値がわかる（例：Riot Riot Riot、Virginia Creeper、Closer）。",
      "偽物・リプロダクションも多いので、タグとシーズンの整合を確認する。"
    ],
    related: ["jilsander", "dior", "prada", "dries"]
  },
  {
    id: "jilsander", name: "Jil Sander", ja: "ジル サンダー",
    origin: "import", country: "ドイツ", city: "ハンブルク / ミラノ", founded: 1968,
    tags: ["ミニマル", "ラグジュアリー", "メンズ", "ウィメンズ"],
    summary: "ジル・サンダーによる「ミニマリズム」の代名詞的ブランド。創業者が2度去って2度戻り、ラフ・シモンズやメイヤー夫妻を迎えるなど、デザイナー変遷の教材として最適。",
    history: [
      { year: 1968, text: "ジル・サンダーがハンブルクにブティックを開く" },
      { year: 1999, text: "Pradaグループが買収。翌年ジル・サンダーが退任" },
      { year: 2003, text: "ジル・サンダーが復帰（〜2004）" },
      { year: 2005, text: "ラフ・シモンズが就任" },
      { year: 2012, text: "ジル・サンダーが再び復帰（〜2013）" },
      { year: 2021, text: "OTBグループが買収" }
    ],
    designers: [
      { d: "sander",      role: "創業者", from: 1968, to: 2000 },
      { d: "vukmirovic",  role: "クリエイティブディレクター", from: 2000, to: 2002 },
      { d: "sander",      role: "創業者（復帰）", from: 2003, to: 2004 },
      { d: "raf",         role: "クリエイティブディレクター", from: 2005, to: 2012 },
      { d: "sander",      role: "創業者（再復帰）", from: 2012, to: 2013 },
      { d: "paglialunga", role: "クリエイティブディレクター", from: 2014, to: 2017 },
      { d: "meier",       role: "クリエイティブディレクター", from: 2017, to: 2025 },
      { d: "bellotti",    role: "クリエイティブディレクター", from: 2025, to: null }
    ],
    items: [
      { name: "テーラードコート・シャツ", year: "1990年代", desc: "上質な素材とシンプルな仕立て。" },
      { name: "ラフ期のメンズ", year: "2005〜2012", desc: "細身でシャープなテーラリング。" }
    ],
    archive: [ "創業者期・ラフ期・メイヤー期で同じブランドでも全く空気感が違う。" ],
    related: ["raf", "helmutlang", "prada"]
  },
  {
    id: "dior", name: "Dior / Dior Homme", ja: "ディオール / ディオール オム",
    origin: "import", country: "フランス", city: "パリ", founded: 1946,
    tags: ["ラグジュアリー", "メゾン", "メンズ", "ウィメンズ"],
    summary: "1947年の「ニュールック」から始まるメゾン。ウィメンズとメンズで系譜が分かれ、メンズはエディ・スリマンのDior Homme期（2000〜2007）が2000年代のシルエットを決定づけた。",
    history: [
      { year: 1946, text: "クリスチャン・ディオールがメゾンを設立" },
      { year: 1947, text: "初コレクション「ニュールック」" },
      { year: 1957, text: "ディオール急逝。21歳のイヴ・サンローランが後継に" },
      { year: 2000, text: "エディ・スリマンがDior Hommeのデザイナーに" },
      { year: 2007, text: "クリス・ヴァン・アッシュがDior Hommeを引き継ぐ" },
      { year: 2018, text: "キム・ジョーンズがDior Menへ" },
      { year: 2025, text: "ジョナサン・アンダーソンがメンズ・ウィメンズ両方を統括" }
    ],
    designers: [
      { d: "dior",      role: "創業者", from: 1946, to: 1957 },
      { d: "ysl",       role: "ウィメンズ", from: 1957, to: 1960 },
      { d: "bohan",     role: "ウィメンズ", from: 1961, to: 1989 },
      { d: "ferre",     role: "ウィメンズ", from: 1989, to: 1996 },
      { d: "galliano",  role: "ウィメンズ", from: 1996, to: 2011 },
      { d: "raf",       role: "ウィメンズ", from: 2012, to: 2015 },
      { d: "chiuri",    role: "ウィメンズ", from: 2016, to: 2025 },
      { d: "hedi",      role: "メンズ（Dior Homme）", from: 2000, to: 2007 },
      { d: "kva",       role: "メンズ（Dior Homme）", from: 2007, to: 2018 },
      { d: "kimjones",  role: "メンズ（Dior Men）", from: 2018, to: 2025 },
      { d: "anderson",  role: "メンズ・ウィメンズ", from: 2025, to: null }
    ],
    items: [
      { name: "バージャケット", year: 1947, desc: "ニュールックを象徴する、ウエストを絞ったジャケット。" },
      { name: "エディ期のスリムデニム・テーラード", year: "2000〜2007", desc: "極細のシルエット。ロックミュージシャンを着想源に。" },
      { name: "サドルバッグ", year: "1999", desc: "ガリアーノ期のアイコンバッグ。" }
    ],
    archive: [ "Dior Hommeはエディ期とヴァン・アッシュ期でサイズ感・ムードが大きく異なる。" ],
    related: ["saintlaurent", "celine", "raf", "loewe"]
  },
  {
    id: "saintlaurent", name: "Saint Laurent (YSL)", ja: "サンローラン",
    origin: "import", country: "フランス", city: "パリ", founded: 1961,
    tags: ["ラグジュアリー", "メゾン", "ロック", "メンズ", "ウィメンズ"],
    summary: "イヴ・サンローランとピエール・ベルジェが設立。トム・フォード、ピラーティ、エディ・スリマン、ヴァカレロと続く。エディ期に「Saint Laurent」表記へ。",
    history: [
      { year: 1961, text: "イヴ・サンローランとピエール・ベルジェがメゾンを設立" },
      { year: 1966, text: "「ル・スモーキング」発表。プレタポルテ「Rive Gauche」開始" },
      { year: 2002, text: "イヴ・サンローランが引退" },
      { year: 2012, text: "エディ・スリマンが就任し、表記を「Saint Laurent」に" }
    ],
    designers: [
      { d: "ysl",        role: "創業者", from: 1961, to: 2002 },
      { d: "hedi",       role: "メンズ（Rive Gauche Homme）", from: 1997, to: 2000 },
      { d: "tomford",    role: "クリエイティブディレクター", from: 1999, to: 2004 },
      { d: "pilati",     role: "クリエイティブディレクター", from: 2004, to: 2012 },
      { d: "hedi",       role: "クリエイティブディレクター", from: 2012, to: 2016 },
      { d: "vaccarello", role: "クリエイティブディレクター", from: 2016, to: null }
    ],
    items: [
      { name: "ル・スモーキング", year: 1966, desc: "女性のためのタキシード。" },
      { name: "テディジャケット、ワイアットブーツ", year: "2010年代", desc: "エディ期のロックなアイテム。" }
    ],
    archive: [ "エディ期（2012〜2016）のレザーやテディは今もアーカイブ人気が高い。" ],
    related: ["dior", "celine", "gucci"]
  },
  {
    id: "celine", name: "Celine", ja: "セリーヌ",
    origin: "import", country: "フランス", city: "パリ", founded: 1945,
    tags: ["ラグジュアリー", "ミニマル", "ウィメンズ", "メンズ"],
    summary: "フィービー・ファイロ期（2008〜2017）は「オールド・セリーヌ」と呼ばれ、今もアーカイブ人気が極めて高い。その後エディ・スリマンが就任し、メンズも開始。",
    history: [
      { year: 1945, text: "セリーヌ・ヴィピアナが子ども靴の店として創業" },
      { year: 2008, text: "フィービー・ファイロが就任" },
      { year: 2018, text: "エディ・スリマンが就任し、ロゴのアクセント記号を外す" },
      { year: 2025, text: "マイケル・ライダーの初コレクション" }
    ],
    designers: [
      { d: "kors",  role: "クリエイティブディレクター", from: 1997, to: 2004 },
      { d: "philo", role: "クリエイティブディレクター", from: 2008, to: 2017 },
      { d: "hedi",  role: "クリエイティブディレクター", from: 2018, to: 2024 },
      { d: "rider", role: "クリエイティブディレクター", from: 2025, to: null }
    ],
    items: [
      { name: "ラゲージバッグ", year: "2010年頃", desc: "フィービー期の代表的バッグ。" },
      { name: "オールド・セリーヌのコート・パンツ", year: "2008〜2017", desc: "実用的で知的なワードローブ。" }
    ],
    archive: [ "「Céline」（アクセント付き）表記のタグはフィービー期以前のもの。" ],
    related: ["saintlaurent", "dior", "bottega"]
  },
  {
    id: "gucci", name: "Gucci", ja: "グッチ",
    origin: "import", country: "イタリア", city: "フィレンツェ / ミラノ", founded: 1921,
    tags: ["ラグジュアリー", "メゾン", "レザー"],
    summary: "フィレンツェの革製品店から始まったメゾン。トム・フォードの1990年代、アレッサンドロ・ミケーレの2010年代など、デザイナーごとに全く別の顔を持つ。",
    history: [
      { year: 1921, text: "グッチオ・グッチがフィレンツェで創業" },
      { year: 1947, text: "バンブーハンドルのバッグ" },
      { year: 1953, text: "ホースビットローファー" },
      { year: 1994, text: "トム・フォードがクリエイティブディレクターに" },
      { year: 2015, text: "アレッサンドロ・ミケーレが就任" },
      { year: 2025, text: "デムナが就任" }
    ],
    designers: [
      { d: "tomford",  role: "クリエイティブディレクター", from: 1994, to: 2004 },
      { d: "giannini", role: "クリエイティブディレクター", from: 2006, to: 2014 },
      { d: "michele",  role: "クリエイティブディレクター", from: 2015, to: 2022 },
      { d: "desarno",  role: "クリエイティブディレクター", from: 2023, to: 2025 },
      { d: "demna",    role: "アーティスティックディレクター", from: 2025, to: null }
    ],
    items: [
      { name: "ホースビットローファー", year: 1953, desc: "馬具モチーフの金具がついたローファー。" },
      { name: "トム・フォード期のベルベットスーツなど", year: "1990年代", desc: "セクシーでグラマラスな90年代Gucci。" }
    ],
    archive: [ "トム・フォード期（1994〜2004）の服はアーカイブとして根強い人気。" ],
    related: ["saintlaurent", "balenciaga"]
  },
  {
    id: "balenciaga", name: "Balenciaga", ja: "バレンシアガ",
    origin: "import", country: "フランス", city: "パリ", founded: 1937,
    tags: ["ラグジュアリー", "メゾン", "ストリート"],
    summary: "クリストバル・バレンシアガが1937年にパリで開いたメゾン。1968年に閉じたのち、ニコラ・ジェスキエールが再興、デムナがストリートの頂点に押し上げた。",
    history: [
      { year: 1917, text: "スペインのサン・セバスティアンで最初の店" },
      { year: 1937, text: "パリにメゾンを開く" },
      { year: 1968, text: "メゾンを閉鎖" },
      { year: 1997, text: "ニコラ・ジェスキエールが就任" },
      { year: 2015, text: "デムナが就任" },
      { year: 2025, text: "ピエールパオロ・ピッチョーリが就任" }
    ],
    designers: [
      { d: "balenciaga", role: "創業者", from: 1937, to: 1968 },
      { d: "ghesquiere", role: "クリエイティブディレクター", from: 1997, to: 2012 },
      { d: "wang",       role: "クリエイティブディレクター", from: 2012, to: 2015 },
      { d: "demna",      role: "アーティスティックディレクター", from: 2015, to: 2025 },
      { d: "piccioli",   role: "クリエイティブディレクター", from: 2025, to: null }
    ],
    items: [
      { name: "モーターサイクルバッグ（City）", year: 2001, desc: "ジェスキエール期のヒットバッグ。" },
      { name: "トリプルS", year: 2017, desc: "デムナ期のダッドスニーカーブームを牽引。" }
    ],
    archive: [ "ジェスキエール期（1997〜2012）のウェアは近年再評価が進んでいる。" ],
    related: ["gucci", "lv"]
  },
  {
    id: "prada", name: "Prada / Miu Miu", ja: "プラダ / ミュウミュウ",
    origin: "import", country: "イタリア", city: "ミラノ", founded: 1913,
    tags: ["ラグジュアリー", "ナイロン", "メンズ", "ウィメンズ"],
    summary: "ミラノの革製品店から始まり、ミウッチャ・プラダが工業用ナイロンを高級素材に変えた。1990年代後半のPrada Sport（赤ライン）は古着市場でも定番。",
    history: [
      { year: 1913, text: "マリオ・プラダがミラノで創業" },
      { year: 1978, text: "ミウッチャ・プラダが経営・デザインを担う" },
      { year: 1984, text: "ナイロン（ポコノ）のバッグを発表" },
      { year: 1993, text: "Miu Miu開始" },
      { year: 1997, text: "Prada Sport（Linea Rossa）開始" },
      { year: 2020, text: "ラフ・シモンズが共同クリエイティブディレクターに" }
    ],
    designers: [
      { d: "mprada", role: "デザイナー", from: 1978, to: null },
      { d: "raf",    role: "共同クリエイティブディレクター", from: 2020, to: null }
    ],
    items: [
      { name: "ナイロンバックパック", year: 1984, desc: "ポコノナイロンと三角プレート。" },
      { name: "Prada Sport（赤ライン）", year: 1997, desc: "赤いラインのロゴが入ったテクニカルウェア・スニーカー。" }
    ],
    archive: [ "1990年代後半〜2000年代前半のPrada Sportのナイロンアウターは古着で探しやすい入門アーカイブ。" ],
    related: ["raf", "jilsander", "helmutlang"]
  },
  {
    id: "givenchy", name: "Givenchy", ja: "ジバンシィ",
    origin: "import", country: "フランス", city: "パリ", founded: 1952,
    tags: ["ラグジュアリー", "メゾン", "ウィメンズ", "メンズ"],
    summary: "ユベール・ド・ジバンシィのメゾン。1990年代以降はガリアーノ、マックイーン、ティッシなど、デザイナー交代が非常に多いメゾンの代表例。",
    history: [
      { year: 1952, text: "ユベール・ド・ジバンシィが設立" },
      { year: 1995, text: "ユベールが引退、ジョン・ガリアーノが後任に" }
    ],
    designers: [
      { d: "givenchy",     role: "創業者", from: 1952, to: 1995 },
      { d: "galliano",     role: "クリエイティブディレクター", from: 1995, to: 1996 },
      { d: "mcqueen",      role: "クリエイティブディレクター", from: 1996, to: 2001 },
      { d: "macdonald",    role: "クリエイティブディレクター", from: 2001, to: 2004 },
      { d: "tisci",        role: "クリエイティブディレクター", from: 2005, to: 2017 },
      { d: "waightkeller", role: "クリエイティブディレクター", from: 2017, to: 2020 },
      { d: "mwilliams",    role: "クリエイティブディレクター", from: 2020, to: 2023 },
      { d: "burton",       role: "クリエイティブディレクター", from: 2024, to: null }
    ],
    items: [
      { name: "ティッシ期のロットワイラー/バンビ柄スウェット", year: "2010年代前半", desc: "ストリートとラグジュアリーの融合を象徴。" }
    ],
    archive: [],
    related: ["mcqueen", "dior", "burberry"]
  },
  {
    id: "lv", name: "Louis Vuitton", ja: "ルイ・ヴィトン",
    origin: "import", country: "フランス", city: "パリ", founded: 1854,
    tags: ["ラグジュアリー", "メゾン", "レザー"],
    summary: "トランク職人の店から始まったメゾン。マーク・ジェイコブスがプレタポルテを立ち上げ、メンズはキム・ジョーンズ、ヴァージル・アブロー、ファレル・ウィリアムスと続く。",
    history: [
      { year: 1854, text: "ルイ・ヴィトンがパリでトランクの店を開く" },
      { year: 1997, text: "マーク・ジェイコブスがプレタポルテを立ち上げ" },
      { year: 2001, text: "スティーヴン・スプラウスのグラフィティ・モノグラム" },
      { year: 2003, text: "村上隆とのマルチカラー・モノグラム" },
      { year: 2017, text: "キム・ジョーンズ期にSupremeとコラボ" }
    ],
    designers: [
      { d: "jacobs",     role: "クリエイティブディレクター", from: 1997, to: 2013 },
      { d: "ghesquiere", role: "ウィメンズ", from: 2013, to: null },
      { d: "kimjones",   role: "メンズ", from: 2011, to: 2018 },
      { d: "abloh",      role: "メンズ", from: 2018, to: 2021 },
      { d: "pharrell",   role: "メンズ", from: 2023, to: null }
    ],
    items: [
      { name: "モノグラム", year: 1896, desc: "LVの組み文字と花のモチーフ。" },
      { name: "マルチカラー・モノグラム", year: 2003, desc: "村上隆とのコラボ。" }
    ],
    archive: [],
    related: ["balenciaga", "dior"]
  },
  {
    id: "chanel", name: "Chanel", ja: "シャネル",
    origin: "import", country: "フランス", city: "パリ", founded: 1910,
    tags: ["ラグジュアリー", "メゾン", "ウィメンズ"],
    summary: "ガブリエル・シャネルのメゾン。1983年から36年にわたりカール・ラガーフェルドが率い、現在はマチュー・ブレイジー。",
    history: [
      { year: 1910, text: "パリに帽子店を開く" },
      { year: 1921, text: "香水「No.5」" },
      { year: 1955, text: "「2.55」バッグ" },
      { year: 1971, text: "ガブリエル・シャネル逝去" },
      { year: 1983, text: "カール・ラガーフェルドが就任" }
    ],
    designers: [
      { d: "chanel",    role: "創業者", from: 1910, to: 1971 },
      { d: "lagerfeld", role: "クリエイティブディレクター", from: 1983, to: 2019 },
      { d: "viard",     role: "クリエイティブディレクター", from: 2019, to: 2024 },
      { d: "blazy",     role: "アーティスティックディレクター", from: 2025, to: null }
    ],
    items: [
      { name: "ツイードジャケット", year: "1950年代〜", desc: "シャネルスーツ。" },
      { name: "2.55", year: 1955, desc: "キルティングとチェーンのショルダーバッグ。" }
    ],
    archive: [ "ラガーフェルド期の1990年代はロゴを大胆に使ったアイテムが多く、ヴィンテージ人気が高い。" ],
    related: ["bottega"]
  },
  {
    id: "bottega", name: "Bottega Veneta", ja: "ボッテガ・ヴェネタ",
    origin: "import", country: "イタリア", city: "ヴィチェンツァ / ミラノ", founded: 1966,
    tags: ["ラグジュアリー", "レザー", "クラフト"],
    summary: "革を編む「イントレチャート」で知られるクラフトのメゾン。ロゴを出さない「ステルス・ラグジュアリー」の代表。",
    history: [
      { year: 1966, text: "ヴィチェンツァで創業" },
      { year: 2001, text: "トーマス・マイヤーが就任" },
      { year: 2018, text: "ダニエル・リーが就任" }
    ],
    designers: [
      { d: "maier",   role: "クリエイティブディレクター", from: 2001, to: 2018 },
      { d: "dlee",    role: "クリエイティブディレクター", from: 2018, to: 2021 },
      { d: "blazy",   role: "クリエイティブディレクター", from: 2021, to: 2024 },
      { d: "trotter", role: "クリエイティブディレクター", from: 2025, to: null }
    ],
    items: [
      { name: "イントレチャート", year: "定番", desc: "細い革を編み込む技法。" },
      { name: "ザ・ポーチ", year: 2019, desc: "ダニエル・リー期のヒットバッグ。" }
    ],
    archive: [],
    related: ["celine", "chanel", "burberry"]
  },
  {
    id: "loewe", name: "Loewe", ja: "ロエベ",
    origin: "import", country: "スペイン", city: "マドリード / パリ", founded: 1846,
    tags: ["ラグジュアリー", "レザー", "クラフト"],
    summary: "マドリードの革工房に起源をもつメゾン。ジョナサン・アンダーソンの11年でクラフトとアートを軸に大きく刷新された。",
    history: [
      { year: 1846, text: "マドリードの革工房に起源" },
      { year: 2013, text: "ジョナサン・アンダーソンが就任" },
      { year: 2014, text: "「パズル」バッグ" },
      { year: 2025, text: "マッコロー&ヘルナンデスが就任" }
    ],
    designers: [
      { d: "vevers",     role: "クリエイティブディレクター", from: 2008, to: 2013 },
      { d: "anderson",   role: "クリエイティブディレクター", from: 2013, to: 2025 },
      { d: "mccollough", role: "クリエイティブディレクター", from: 2025, to: null }
    ],
    items: [ { name: "パズルバッグ", year: 2014, desc: "幾何学的なパーツを組み合わせたバッグ。" } ],
    archive: [],
    related: ["dior"]
  },
  {
    id: "burberry", name: "Burberry", ja: "バーバリー",
    origin: "import", country: "イギリス", city: "ロンドン", founded: 1856,
    tags: ["トレンチ", "英国", "ヴィンテージ"],
    summary: "ギャバジンとトレンチコートの老舗。古着市場ではヴィンテージのトレンチ・ステンカラーの定番。",
    history: [
      { year: 1856, text: "トーマス・バーバリーが創業" },
      { year: 1879, text: "ギャバジンを開発" },
      { year: 2001, text: "クリストファー・ベイリーが加入" }
    ],
    designers: [
      { d: "bailey", role: "クリエイティブディレクター", from: 2001, to: 2018 },
      { d: "tisci",  role: "チーフクリエイティブオフィサー", from: 2018, to: 2022 },
      { d: "dlee",   role: "クリエイティブディレクター", from: 2022, to: null }
    ],
    items: [
      { name: "トレンチコート", year: "第一次大戦期〜", desc: "軍用コートから民間の定番へ。" },
      { name: "ノヴァチェック", year: "1920年代〜", desc: "コートの裏地に使われたチェック柄。" }
    ],
    archive: [ "ヴィンテージのトレンチ・ステンカラーはタグの表記（Burberrys'など）で年代を推定する。" ],
    related: ["givenchy", "bottega"]
  },
  {
    id: "anndemeulemeester", name: "Ann Demeulemeester", ja: "アン ドゥムルメステール",
    origin: "import", country: "ベルギー", city: "アントワープ", founded: 1985,
    tags: ["アントワープ", "ブラック", "ロマンティック", "アーカイブ"],
    summary: "アントワープ・シックスの一人、アン・ドゥムルメステールのブランド。黒と白、パティ・スミスへの敬愛、編み上げブーツ。本人は2013年に退いた。",
    history: [
      { year: 1985, text: "ブランド設立" },
      { year: 2013, text: "アン・ドゥムルメステールが引退" },
      { year: 2020, text: "Antonioliのクラウディオ・アントニオーリが買収" }
    ],
    designers: [
      { d: "demeulemeester", role: "創業者・デザイナー", from: 1985, to: 2013 },
      { d: "meunier",        role: "クリエイティブディレクター", from: 2013, to: 2020 },
      { d: "gallici",        role: "クリエイティブディレクター", from: 2024, to: null }
    ],
    items: [
      { name: "編み上げのレザーブーツ", year: "定番", desc: "ブランドを象徴するロングブーツ。" },
      { name: "ドレープのジャケット・シャツ", year: "1990〜2000年代", desc: "詩的でダークなテーラリング。" }
    ],
    archive: [ "本人在任期（〜2013）が「アーカイブ」の主対象。" ],
    related: ["dries", "margiela", "rickowens"]
  },
  {
    id: "dries", name: "Dries Van Noten", ja: "ドリス ヴァン ノッテン",
    origin: "import", country: "ベルギー", city: "アントワープ", founded: 1986,
    tags: ["アントワープ", "プリント", "メンズ", "ウィメンズ"],
    summary: "アントワープ・シックスの一人。プリントと色彩、民族衣装的な要素の組み合わせで知られる。2024年に本人が引退。",
    history: [
      { year: 1986, text: "ブランド設立（ロンドンでアントワープ・シックスとして注目される）" },
      { year: 2018, text: "スペインのPuigが過半数を取得" },
      { year: 2024, text: "ドリス・ヴァン・ノッテンが引退" },
      { year: 2025, text: "ジュリアン・クラウスナーが就任" }
    ],
    designers: [
      { d: "vannoten", role: "創業者・デザイナー", from: 1986, to: 2024 },
      { d: "klausner", role: "クリエイティブディレクター", from: 2025, to: null }
    ],
    items: [ { name: "プリントシャツ・刺繍", year: "定番", desc: "大胆な柄合わせ。" } ],
    archive: [],
    related: ["anndemeulemeester", "margiela", "raf"]
  },
  {
    id: "jpg", name: "Jean Paul Gaultier", ja: "ジャン＝ポール・ゴルチエ",
    origin: "import", country: "フランス", city: "パリ", founded: 1976,
    tags: ["ポップ", "ボーダー", "アーカイブ", "ウィメンズ", "メンズ"],
    summary: "「アンファン・テリブル」と呼ばれたゴルチエのブランド。マリンボーダー、コーンブラ、タトゥー柄のメッシュトップは古着・アーカイブの定番。",
    history: [
      { year: 1976, text: "最初のコレクション" },
      { year: 1990, text: "マドンナのツアー衣装でコーンブラを制作" },
      { year: 2014, text: "プレタポルテから撤退を発表" },
      { year: 2020, text: "クチュール最後のショー。翌年からゲストデザイナー制" },
      { year: 2025, text: "デュラン・ランティンクがクリエイティブディレクターに" }
    ],
    designers: [
      { d: "gaultier", role: "創業者・デザイナー", from: 1976, to: 2020 },
      { d: "duran",    role: "クリエイティブディレクター", from: 2025, to: null }
    ],
    items: [
      { name: "マリニエール（ボーダー）", year: "1980年代〜", desc: "セーラーのボーダーを再解釈。" },
      { name: "メッシュのタトゥー柄トップ", year: "1990年代", desc: "Soleilなどで出た総柄メッシュ。古着人気が非常に高い。" },
      { name: "コーンブラ", year: 1990, desc: "円錐形のブラ。" }
    ],
    archive: [ "Jean Paul Gaultier Homme / Femme / JPG Jeans / Soleil などライン表記を確認。" ],
    related: ["hermes", "sacai"]
  },
  {
    id: "westwood", name: "Vivienne Westwood", ja: "ヴィヴィアン・ウエストウッド",
    origin: "import", country: "イギリス", city: "ロンドン", founded: 1971,
    tags: ["パンク", "英国", "アーカイブ"],
    summary: "マルコム・マクラーレンとキングスロード430番地で始めたショップからパンクの服を生み、のちに英国の伝統を引用した独自のスタイルへ。",
    history: [
      { year: 1971, text: "マクラーレンと「Let It Rock」開店（キングスロード430番地）" },
      { year: 1974, text: "店名を「SEX」に" },
      { year: 1976, text: "「Seditionaries」に改名。ボンデージパンツなど" },
      { year: 1981, text: "初のランウェイ「Pirate」" },
      { year: 1987, text: "オーブ（宝珠）のロゴが登場" },
      { year: 2022, text: "ヴィヴィアン・ウエストウッド逝去" }
    ],
    designers: [
      { d: "westwood",   role: "創業者・デザイナー", from: 1971, to: 2022 },
      { d: "kronthaler", role: "クリエイティブディレクター", from: 2016, to: null }
    ],
    items: [
      { name: "ボンデージパンツ", year: "1976", desc: "Seditionaries期のパンクの象徴。" },
      { name: "ロッキンホースシューズ", year: "1985", desc: "厚い木製ソールの靴。" },
      { name: "オーブ（Orb）", year: 1987, desc: "王冠と土星を組み合わせたロゴ。" }
    ],
    archive: [ "SEX / Seditionaries期の物は偽物・再現品が多い。", "Gold Label / Red Label / MAN などのライン表記を確認。" ],
    related: ["mcqueen", "nemeth"]
  },
  {
    id: "mcqueen", name: "Alexander McQueen", ja: "アレキサンダー・マックイーン",
    origin: "import", country: "イギリス", city: "ロンドン", founded: 1992,
    tags: ["ドラマティック", "英国", "テーラリング"],
    summary: "サヴィル・ロウ仕込みのテーラリングと劇的なショーで知られるリー・アレキサンダー・マックイーンのブランド。2010年の逝去後はサラ・バートンが継いだ。",
    history: [
      { year: 1992, text: "セントラル・セント・マーチンズの卒業コレクション" },
      { year: 1996, text: "Givenchyのデザイナーを兼任（〜2001）" },
      { year: 2010, text: "マックイーン逝去。2010年春夏「Plato's Atlantis」が生前最後の完成したショー" },
      { year: 2023, text: "ショーン・マクガーが就任" }
    ],
    designers: [
      { d: "mcqueen", role: "創業者・デザイナー", from: 1992, to: 2010 },
      { d: "burton",  role: "クリエイティブディレクター", from: 2010, to: 2023 },
      { d: "mcgirr",  role: "クリエイティブディレクター", from: 2023, to: null }
    ],
    items: [
      { name: "バムスター", year: "1990年代", desc: "腰の極端に低いパンツ。" },
      { name: "スカルスカーフ", year: "2000年代", desc: "スカル柄のシルクスカーフ。" },
      { name: "アルマジロブーツ", year: 2010, desc: "Plato's Atlantisの異形のブーツ。" }
    ],
    archive: [],
    related: ["givenchy", "westwood"],
    note: "現在の体制は最新情報を要確認。"
  },
  {
    id: "rickowens", name: "Rick Owens", ja: "リック・オウエンス",
    origin: "import", country: "アメリカ", city: "ロサンゼルス / パリ", founded: 1994,
    tags: ["ブラック", "ゴシック", "アーカイブ", "メンズ", "ウィメンズ"],
    summary: "LA出身のリック・オウエンスが妻ミシェル・ラミーと築いたブランド。ドレープ、長いシルエット、巨大なスニーカー。",
    history: [
      { year: 1994, text: "ロサンゼルスでブランドを始める" },
      { year: 2003, text: "パリに拠点を移す" }
    ],
    designers: [ { d: "rowens", role: "創業者・デザイナー", from: 1994, to: null } ],
    items: [
      { name: "ジオバスケット / ラモーンズ", year: "2000年代〜", desc: "ハイカットスニーカーの定番。" },
      { name: "レザージャケット（ストゥージズなど）", year: "定番", desc: "薄手の柔らかいレザー。" },
      { name: "DRKSHDW", year: "2000年代〜", desc: "デニム・カジュアルのライン。" }
    ],
    archive: [],
    related: ["anndemeulemeester"]
  },
  {
    id: "stoneisland", name: "Stone Island / C.P. Company", ja: "ストーンアイランド / シーピーカンパニー",
    origin: "import", country: "イタリア", city: "ボローニャ / ラヴァリーノ", founded: 1982,
    tags: ["テクニカル", "素材", "ミリタリー", "メンズ"],
    summary: "マッシモ・オスティが創設した二つのブランド。製品染めや特殊素材の研究で、テクニカルウェアのアーカイブ文化の源流になった。",
    history: [
      { year: 1971, text: "オスティがC.P. Company（当初Chester Perry）を始める" },
      { year: 1982, text: "Stone Islandを発表" },
      { year: 1988, text: "C.P. Companyのゴーグルジャケット（Mille Miglia）" },
      { year: 1994, text: "ポール・ハーヴェイがStone Islandのデザインを担当（〜2008）" },
      { year: 2020, text: "Monclerがストーンアイランドを買収" }
    ],
    designers: [
      { d: "osti",   role: "創業者", from: 1982, to: 1994 },
      { d: "harvey", role: "デザイナー", from: 1994, to: 2008 }
    ],
    items: [
      { name: "コンパスバッジ", year: "定番", desc: "袖の取り外し式バッジ。" },
      { name: "ゴーグルジャケット", year: 1988, desc: "フードにゴーグルがついたC.P. Companyの代表作。" },
      { name: "アイスジャケット", year: "1980〜90年代", desc: "温度で色が変わる素材。" }
    ],
    archive: [ "オスティ期・ハーヴェイ期の素材実験的なピースが高く評価される。" ],
    related: []
  },
  {
    id: "nemeth", name: "Christopher Nemeth", ja: "クリストファー・ネメス",
    origin: "import", country: "イギリス", city: "ロンドン / 東京", founded: 1985,
    tags: ["ハンドメイド", "パンク", "アーカイブ"],
    summary: "ロンドン出身のクリストファー・ネメスが1986年に東京へ拠点を移して続けたブランド。ロープ柄や手縫い、再利用素材。日本との関わりが深いインポート。",
    history: [
      { year: 1985, text: "ロンドンで活動（1980年代半ば、Judy Blameらと交流）" },
      { year: 1986, text: "東京に拠点を移す" },
      { year: 2010, text: "クリストファー・ネメス逝去。その後家族がブランドを継続" }
    ],
    designers: [ { d: "nemeth", role: "創業者・デザイナー", from: 1985, to: 2010 } ],
    items: [ { name: "ロープ柄", year: "定番", desc: "ロープをモチーフにしたプリント・構造。" } ],
    archive: [],
    related: ["westwood"],
    note: "創業年は概算です。"
  }
];
