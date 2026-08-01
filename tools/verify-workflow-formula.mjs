import assert from "node:assert/strict";

const REQUIRED_FIELDS = [
  ["price", "商品价格"],
  ["availableCash", "可支配资金"],
  ["avgDailyExpense", "平均日花销"],
  ["trackingDays", "记账天数"],
];

function roundHalfUp(value, digits = 0) {
  if (value === null) return null;
  const factor = 10 ** digits;
  const rounded = Math.floor(Math.abs(value) * factor + 0.5) / factor;
  return Math.sign(value) * rounded;
}

function calculate(input) {
  const missingFields = [];
  const invalidFields = [];

  for (const [field] of REQUIRED_FIELDS) {
    const value = input[field];
    if (value === undefined || value === null || value === "") {
      missingFields.push(field);
    } else if (!Number.isFinite(value) || value <= 0) {
      invalidFields.push(field);
    }
  }

  if (
    Number.isFinite(input.trackingDays) &&
    input.trackingDays > 0 &&
    !Number.isInteger(input.trackingDays)
  ) {
    invalidFields.push("trackingDays");
  }

  if (missingFields.length > 0 || invalidFields.length > 0) {
    const labels = new Map(REQUIRED_FIELDS);
    const followupQuestions = [
      ...missingFields.map((field) => `请补充${labels.get(field)}`),
      ...invalidFields.map(
        (field) =>
          `请重新填写${labels.get(field)}，需为大于0的${
            field === "trackingDays" ? "整数" : "数字"
          }`,
      ),
    ].slice(0, 3);

    return {
      flowMode: "needs_input",
      missingFields,
      invalidFields,
      followupQuestions,
      lamp: null,
    };
  }

  const { price, availableCash, avgDailyExpense, trackingDays } = input;
  const directCostDaysRaw = price / avgDailyExpense;
  const coverageBeforeDaysRaw = availableCash / avgDailyExpense;
  const remainingCash = availableCash - price;
  const priceCashRatioRaw = price / availableCash;
  const fundsInsufficient = price > availableCash;
  const sampleConfidence =
    trackingDays < 30 ? "low" : trackingDays < 100 ? "medium" : "high";

  const common = {
    directCostDays: roundHalfUp(directCostDaysRaw),
    coverageBeforeDays: roundHalfUp(coverageBeforeDaysRaw),
    remainingCash: roundHalfUp(remainingCash, 2),
    priceCashRatioPct: roundHalfUp(priceCashRatioRaw * 100, 1),
    sampleConfidence,
  };

  if (fundsInsufficient) {
    return {
      flowMode: "funds_insufficient",
      ...common,
      coverageAfterDays: null,
      coverageChangeDays: null,
      lamp: "red",
    };
  }

  const coverageAfterDaysRaw = remainingCash / avgDailyExpense;
  const coverageChangeDaysRaw =
    coverageBeforeDaysRaw - coverageAfterDaysRaw;

  let lamp = "green";
  if (coverageAfterDaysRaw < 30 || priceCashRatioRaw >= 0.5) {
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
    ...common,
    coverageAfterDays: roundHalfUp(coverageAfterDaysRaw),
    coverageChangeDays: roundHalfUp(coverageChangeDaysRaw),
    lamp,
  };
}

const tests = [];

function test(name, run) {
  tests.push({ name, run });
}

function baseInput(overrides = {}) {
  return {
    price: 1000,
    availableCash: 50000,
    avgDailyExpense: 100,
    trackingDays: 120,
    ...overrides,
  };
}

test("6999元案例为黄灯", () => {
  assert.deepEqual(
    calculate({
      price: 6999,
      availableCash: 30000,
      avgDailyExpense: 80,
      trackingDays: 120,
    }),
    {
      flowMode: "normal",
      directCostDays: 87,
      coverageBeforeDays: 375,
      remainingCash: 23001,
      priceCashRatioPct: 23.3,
      sampleConfidence: "high",
      coverageAfterDays: 288,
      coverageChangeDays: 87,
      lamp: "yellow",
    },
  );
});

test("资金不足进入独立状态", () => {
  const result = calculate(baseInput({ price: 12000, availableCash: 8000 }));
  assert.equal(result.flowMode, "funds_insufficient");
  assert.equal(result.coverageAfterDays, null);
  assert.equal(result.coverageChangeDays, null);
  assert.equal(result.lamp, "red");
});

test("短样本叠加资金不足仍为红灯", () => {
  const result = calculate(
    baseInput({ price: 12000, availableCash: 8000, trackingDays: 20 }),
  );
  assert.equal(result.flowMode, "funds_insufficient");
  assert.equal(result.sampleConfidence, "low");
  assert.equal(result.lamp, "red");
});

test("缺少价格时返回具体追问", () => {
  const result = calculate(baseInput({ price: "" }));
  assert.equal(result.flowMode, "needs_input");
  assert.deepEqual(result.missingFields, ["price"]);
  assert.deepEqual(result.followupQuestions, ["请补充商品价格"]);
  assert.equal(result.lamp, null);
});

for (const [name, overrides, invalidField] of [
  ["零日花销无效", { avgDailyExpense: 0 }, "avgDailyExpense"],
  ["负数价格无效", { price: -1 }, "price"],
  ["无穷资金无效", { availableCash: Infinity }, "availableCash"],
  ["非数字记账天数无效", { trackingDays: Number.NaN }, "trackingDays"],
  ["小数记账天数无效", { trackingDays: 20.5 }, "trackingDays"],
]) {
  test(name, () => {
    const result = calculate(baseInput(overrides));
    assert.equal(result.flowMode, "needs_input");
    assert.deepEqual(result.invalidFields, [invalidField]);
  });
}

for (const [name, overrides, expectedLamp] of [
  ["占比19.9%仍为绿灯", { price: 9950 }, "green"],
  ["占比20%进入黄灯", { price: 10000 }, "yellow"],
  ["占比49.9%仍为黄灯", { price: 24950 }, "yellow"],
  ["占比50%进入红灯", { price: 25000 }, "red"],
  [
    "购买后覆盖29天进入红灯",
    { price: 2500, availableCash: 5400 },
    "red",
  ],
  [
    "购买后覆盖30天不触发红灯",
    { price: 2500, availableCash: 5500 },
    "yellow",
  ],
  [
    "购买后覆盖89天进入黄灯",
    { price: 1000, availableCash: 9900 },
    "yellow",
  ],
  [
    "购买后覆盖90天进入绿灯",
    { price: 1000, availableCash: 10000 },
    "green",
  ],
  ["价格等于资金时购买后为0天红灯", { price: 50000 }, "red"],
]) {
  test(name, () => {
    assert.equal(calculate(baseInput(overrides)).lamp, expectedLamp);
  });
}

for (const [trackingDays, expectedConfidence, expectedLamp] of [
  [29, "low", "yellow"],
  [30, "medium", "green"],
  [99, "medium", "green"],
  [100, "high", "green"],
]) {
  test(`记账${trackingDays}天的样本边界`, () => {
    const result = calculate(baseInput({ trackingDays }));
    assert.equal(result.sampleConfidence, expectedConfidence);
    assert.equal(result.lamp, expectedLamp);
  });
}

test("0.5统一向上取整", () => {
  assert.equal(roundHalfUp(0.5), 1);
  assert.equal(roundHalfUp(2.5), 3);
  assert.equal(roundHalfUp(-2.5), -3);
  const result = calculate(baseInput({ price: 250, availableCash: 10000 }));
  assert.equal(result.directCostDays, 3);
  assert.equal(result.coverageAfterDays, 98);
  assert.equal(result.coverageChangeDays, 3);
});

for (const { name, run } of tests) {
  run();
  console.log(`PASS ${name}`);
}

console.log(`ALL_PASS ${tests.length}`);
