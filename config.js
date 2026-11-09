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

  /* 2) 동두천시 공식 유튜브 채널 주소 (구독하기 버튼) */
  youtubeChannel: "https://www.youtube.com/results?search_query=%EB%8F%99%EB%91%90%EC%B2%9C%EC%8B%9C",

  /* 3) 영상 연결: 유튜브 영상 ID(주소의 v= 뒤 11자리)를 넣으면 팝업에서 바로 재생돼요 */
  videos: {
    answer:  { title: "시민이 묻고 시장이 답하다 EP.07", id: "" },
    dict:    { title: "신비한 동두천 사전 — 소요산 자재암 이야기", id: "" },
    news:    { title: "AI 앵커 동두천 1분 뉴스 — 11월", id: "" },
    closing: { title: "동두천 사람들: 마감 10분 — 보산동 노포", id: "" },
    photo:   { title: "세대공감 사진관 — 1970년 보산동", id: "" },
    proxy:   { title: "민원 대신 물어봄 — 대형폐기물 신청", id: "" },
    line1:   { title: "1호선 역마다 내려보기 — 보산역", id: "" }
  },

  /* 4) 푸터 SNS 주소 (비워 두면 '준비 중' 안내) */
  sns: { youtube: "", instagram: "", facebook: "", blog: "", x: "" }
};
