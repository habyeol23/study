// statementData를 생성하는 함수로, 공연 요금과 포인트를 계산하고 데이터를 구조화함
function createStatementData(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer; // 고객명 저장
  statementData.performances = invoice.performances.map(enrichPerformance); // 공연 정보 보강
  statementData.totalAmount = totalAmount(statementData); // 총 공연료 계산
  statementData.totalVolumeCredits = totalVolumeCredits(statementData); // 총 적립 포인트 계산
  return statementData;

  // 공연 정보를 보강하는 함수
  function enrichPerformance(aPerformance) {
    const result = Object.assign({}, aPerformance); // 기존 공연 데이터를 복사
    result.play = playFor(result); // 해당 공연의 상세 정보를 추가
    result.amount = amountFor(result); // 해당 공연의 요금을 계산
    result.volumeCredits = volumeCreditsFor(result); // 해당 공연의 포인트를 계산
    return result;
  }

  // 공연 ID로 해당 공연 데이터를 가져오는 함수
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }

  // 공연의 요금을 계산하는 함수 (리팩토링)
  function amountFor(aPerformance) {
    let result = 0;
    // 공연 장르에 따른 요금 계산 로직을 각 장르별로 분리하여 처리
    switch (aPerformance.play.type) {
      case "tragedy": // 비극의 요금 계산
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy": // 희극의 요금 계산
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      case "history":  // 새롭게 추가된 사극(history) 장르 요금 계산 (리팩토링)
        result = 10000 + 1500 * aPerformance.audience; // 기본 요금 $100(10000) + 관객 1인당 추가 요금 $15
        break;
      default:
        throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
    }
    return result;
  }

  // 공연별 포인트를 계산하는 함수 (리팩토링)
  function volumeCreditsFor(aPerformance) {
    let result = Math.max(aPerformance.audience - 30, 0); // 기본 포인트 계산 (30명을 초과할 때)
    if (aPerformance.play.type === "comedy") result += Math.floor(aPerformance.audience / 5); // 희극은 관객 5명당 추가 포인트 지급
    if (aPerformance.play.type === "history" && aPerformance.audience > 20) result += 10; // 사극은 20명 초과 시 추가 10포인트 지급 (리팩토링)
    return result;
  }

  // 전체 공연의 총액을 계산하는 함수
  function totalAmount(data) {
    return data.performances.reduce((total, p) => total + p.amount, 0); // 각 공연의 요금을 더해 총액 계산
  }

  // 전체 공연의 총 포인트를 계산하는 함수
  function totalVolumeCredits(data) {
    return data.performances.reduce((total, p) => total + p.volumeCredits, 0); // 각 공연의 포인트를 더해 총 포인트 계산
  }
}

// 텍스트 형식 청구 내역을 생성하는 함수
function statement(invoice, plays) {
  return renderPlainText(createStatementData(invoice, plays)); // 데이터를 생성한 후 텍스트로 렌더링
}

// 텍스트 형식의 청구 내역을 렌더링하는 함수
function renderPlainText(data) {
  let result = `청구 내역 (고객명: ${data.customer})\n`;
  for (let perf of data.performances) {
    result += `  ${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`; // 각 공연에 대한 요금 정보 출력
  }
  result += `총액: ${usd(data.totalAmount)}\n`; // 총액 출력
  result += `적립 포인트: ${data.totalVolumeCredits}점\n`; // 포인트 출력
  return result;
}

// HTML 형식 청구 내역을 생성하는 함수 (리팩토링)
function htmlStatement(invoice, plays) {
  return renderHtml(createStatementData(invoice, plays)); // 데이터를 생성한 후 HTML로 렌더링
}

// HTML 형식의 청구 내역을 렌더링하는 함수 (리팩토링)
function renderHtml(data) {
  let result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n<ul>\n`; // 고객명을 포함한 청구서 제목 생성
  for (let perf of data.performances) {
    result += `<li>${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)</li>\n`; // 각 공연 정보 HTML로 출력
  }
  result += `</ul>\n<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`; // 총액 출력
  result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`; // 포인트 출력
  return result;
}

// USD 형식으로 금액을 포맷팅하는 함수
function usd(aNumber) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(aNumber / 100); // 금액을 소수점 둘째 자리까지 USD로 변환
}

module.exports = { statement, htmlStatement }; // 텍스트 및 HTML 청구서 함수 내보냄
