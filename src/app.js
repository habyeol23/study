const fs = require("fs");
const { statement, htmlStatement } = require("./statement");

// 공연 정보와 청구서 데이터를 JSON 파일에서 읽어옴
const plays = JSON.parse(fs.readFileSync("./plays.json"));
const invoices = JSON.parse(fs.readFileSync("./invoices.json"));

// 텍스트 형식 청구서 출력
invoices.map((invoice) => console.log(statement(invoice, plays)));

// HTML 형식 청구서 출력
invoices.map((invoice) => console.log(htmlStatement(invoice, plays)));
