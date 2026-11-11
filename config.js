/* =========================================================
   동두천시 유튜브 시민참여 허브 — 설정 파일
   이 파일만 고치면 구글폼·유튜브·SNS 주소가 바뀌어요.
   ========================================================= */
window.HUB_CONFIG = {

  /* 1) 구글폼 연결
     구글폼에서 [⋮ → 미리 채워진 링크 가져오기]로 아래처럼 채운 뒤
     '링크 복사'한 주소를 따옴표 안에 그대로 붙여 넣으세요.
       - 보낼 곳  : 시장에게 묻기   (첫 번째 보기 선택)
       - 닉네임   : NICK
       - 사는 동네 : TOWN
       - 내용     : BODY
       - 링크     : LINK
     비워 두면 '시연 모드'로 동작해요(브라우저에만 저장). */
  googleFormPrefillUrl: "https://docs.google.com/forms/d/e/1FAIpQLSckQ-neSInTCSyGwc23i7pUWuI_Vec9cvZoBvKpzSdtXY210Q/viewform?usp=pp_url&entry.1227553604=%EC%8B%9C%EC%9E%A5%EC%97%90%EA%B2%8C+%EB%AC%BB%EA%B8%B0&entry.1716663427=NICK&entry.682521228=TOWN&entry.366953459=BODY&entry.391765214=LINK",

  /* 1-2) 답변 게시판 연결 (구글시트 → 웹에 게시 → CSV 링크)
     응답 시트 오른쪽에 열 4개를 추가하세요: 공개 · 답변 · 포맷 · 영상ID
     '공개' 칸에 Y 를 적고 '답변'을 채운 행만 게시판에 올라가요.
     파일 → 공유 → 웹에 게시 → (응답 시트) · 쉼표로 구분된 값(.csv) → 게시 → 링크를 아래에 붙여 넣기.
     비워 두면 예시 답변이 보여요. */
  answerSheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSvwIFln3gplh-Wq4bDnlUYOYdi2B_YKi6iH6zmOr6hhT3sAzofE4a7_Y2ab3eBY0SDC76WiZ0H2V2x/pub?gid=1290994465&single=true&output=csv",

  /* 2) 동두천시 공식 유튜브 채널 주소 (구독하기 버튼) */
  youtubeChannel: "https://www.youtube.com/results?search_query=%EB%8F%99%EB%91%90%EC%B2%9C%EC%8B%9C",

  /* 3) 영상 연결: 유튜브 영상 ID(주소의 v= 뒤 11자리)를 넣으면 팝업에서 바로 재생돼요 */
  videos: {
    answer:  { title: "시민이 묻고 시장이 답하다 EP.07", id: "" },
    dict:    { title: "신비한 동두천 사전 — 소요산 절벽에 절이 매달린 이유", id: "" },
    time:    { title: "AI 타임머신 — 동두천역, 50년 동안 이렇게 변했다", id: "" },
    news:    { title: "AI 앵커 동두천 1분 뉴스 — 11월", id: "" },
    policy:  { title: "1분 정책사전 — 청년 월세 지원", id: "" },
    proxy:   { title: "민원 대신 물어봄 — 대형폐기물", id: "" },
    closing: { title: "동두천 사람들: 마감 10분 — 보산동 분식집", id: "" },
    photo:   { title: "세대공감 사진관 — 1970년 보산동", id: "" },
    toon:    { title: "공감 사연툰 — 우산 빌려준 학생을 찾습니다", id: "" },
    walk:    { title: "동두천 1분 산책 — 소요산 단풍길", id: "" }
  },

  /* 4) 푸터 SNS 주소 (비워 두면 '준비 중' 안내) */
  sns: { youtube: "", instagram: "", facebook: "", blog: "", x: "" }
};
