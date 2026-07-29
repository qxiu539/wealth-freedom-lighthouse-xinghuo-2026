import assert from "node:assert/strict";

function roundDays(value) {
  return value === null ? null : Math.round(value);
}

function calculate(input) {
  const { price, availableCash, avgDailyExpense, trackingDays } = input;

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(availableCash) ||
    !Number.isFinite(avgDailyExpense) ||
    !Number.isInteger(trackingDays) ||
    price <= 0 ||
    availableCash <= 0 ||
    avgDailyExpense <= 0 ||
    trackingDays <= 0
  ) {
    return { flowMode: "invalid_input" };
  }

  const directCostDaysRaw = price / avgDailyExpense;
  const coverageBeforeDaysRaw = availableCash / avgDailyExpense;
  const remainingCash = availableCash - price;
  const priceCashRatioRaw = price / availableCash;
  const fundsInsufficient = price > availableCash;
  const coverageAfterDaysRaw = fundsInsufficient
    ? null
    : remainingCash / avgDailyExpense;
  const coverageChangeDaysRaw = fundsInsufficient
    ? null
    : coverageBeforeDaysRaw - coverageAfterDaysRaw;

  const sampleConfidence =
    trackingDays < 30 ? "low" : trackingDays < 100 ? "medium" : "high";

  let lamp = "green";
  if (
    fundsInsufficient ||
    coverageAfterDaysRaw < 30 ||
    priceCashRatioRaw >= 0.5
  ) {
    lamp = "red";
  } else if (
    coverageAfterDaysRaw < 90 ||
    priceCashRatioRaw >= 0.2 ||
    trackingDays < 30
  ) {
    lamp = "yellow";
  }

  return {
    flowMode: "normal",
    directCostDays: roundDays(directCostDaysRaw),
    coverageBeforeDays: roundDays(coverageBeforeDaysRaw),
    remainingCash,
    coverageAfterDays: roundDays(coverageAfterDaysRaw),
    coverageChangeDays: roundDays(coverageChangeDaysRaw),
    priceCashRatioPct: Number((priceCashRatioRaw * 100).toFixed(1)),
    sampleConfidence,
    lamp,
  };
}

const cases = [
  {
    name: "完整输入为黄灯",
    input: {
      price: 6999,
      availableCash: 30000,
      avgDailyExpense: 80,
      trackingDays: 120,
    },
    expected: {
      flowMode: "normal",
      directCostDays: 87,
      coverageBeforeDays: 375,
      remainingCash: 23001,
      coverageAfterDays: 288,
      coverageChangeDays: 87,
      priceCashRatioPct: 23.3,
      sampleConfidence: "high",
      lamp: "yellow",
    },
  },
  {
    name: "安全垫充足为绿灯",
    input: {
      price: 1000,
      availableCash: 50000,
      avgDailyExpense: 100,
      trackingDays: 180,
    },
    expected: {
      flowMode: "normal",
      directCostDays: 10,
      coverageBeforeDays: 500,
      remainingCash: 49000,
      coverageAfterDays: 490,
      coverageChangeDays: 10,
      priceCashRatioPct: 2,
      sampleConfidence: "high",
      lamp: "green",
    },
  },
  {
    name: "购买后安全垫过低为红灯",
    input: {
      price: 5000,
      availableCash: 7000,
      avgDailyExpense: 100,
      trackingDays: 120,
    },
    expected: {
      flowMode: "normal",
      directCostDays: 50,
      coverageBeforeDays: 70,
      remainingCash: 2000,
      coverageAfterDays: 20,
      coverageChangeDays: 50,
      priceCashRatioPct: 71.4,
      sampleConfidence: "high",
      lamp: "red",
    },
  },
  {
    name: "资金不足不计算购买后覆盖天数",
    input: {
      price: 12000,
      availableCash: 8000,
      avgDailyExpense: 100,
      trackingDays: 120,
    },
    expected: {
      flowMode: "normal",
      directCostDays: 120,
      coverageBeforeDays: 80,
      remainingCash: -4000,
      coverageAfterDays: null,
      coverageChangeDays: null,
      priceCashRatioPct: 150,
      sampleConfidence: "high",
      lamp: "red",
    },
  },
  {
    name: "短样本最高为黄灯",
    input: {
      price: 2000,
      availableCash: 20000,
      avgDailyExpense: 60,
      trackingDays: 20,
    },
    expected: {
      flowMode: "normal",
      directCostDays: 33,
      coverageBeforeDays: 333,
      remainingCash: 18000,
      coverageAfterDays: 300,
      coverageChangeDays: 33,
      priceCashRatioPct: 10,
      sampleConfidence: "low",
      lamp: "yellow",
    },
  },
  {
    name: "零日花销为无效输入",
    input: {
      price: 2000,
      availableCash: 10000,
      avgDailyExpense: 0,
      trackingDays: 60,
    },
    expected: {
      flowMode: "invalid_input",
    },
  },
];

for (const testCase of cases) {
  assert.deepEqual(calculate(testCase.input), testCase.expected, testCase.name);
  console.log(`PASS ${testCase.name}`);
}

console.log(`ALL_PASS ${cases.length}`);
