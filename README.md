# 티켓서포트

## 📌 주요 기능
- 예약한 시간에 지정한 경기의 좌석 선택 페이지에 자동 접속
- 홈팀과 경기일정을 드롭다운으로 선택
- 보안문자 수동 입력 이후 예매 페이지 진입

## 🛠 경기 일정 업데이트 방법
1. `/games.js` 파일 열기
2. 아래 형식에 맞춰 URL 및 경기일정을 수정하세요:

```js
const gameData = {
  lg: [
    {
      name: "vs 한화이글스 5월 28일 (화)",
      url: "https://facility.ticketlink.co.kr/reserve/product/54833?scheduleId=204628209"
    }
  ],
  hanwha: [
    {
      name: "vs 엘지트윈스 6월 1일 (토)",
      url: "https://facility.ticketlink.co.kr/reserve/product/54833?scheduleId=204628209"
    }
  ]
};
```

3. 저장 후 크롬 확장 프로그램을 다시 압축하여 스토어에 업데이트하세요.