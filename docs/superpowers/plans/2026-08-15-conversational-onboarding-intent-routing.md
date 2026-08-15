# 财富自由指南灯入口与对话分流 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变现有财务公式和决策口径的前提下，让首次用户明确作品用于大额消费决策，并让一般理财问题、信息不足、完整分析、结果追问和风险输入进入对应分支。

**Architecture:** 保留讯飞星辰现有“开始 → 信息采集 → 确定性决策核心 → 结果输出 → 结束”五节点结构。信息采集节点增加意图分类和会话字段合并，确定性核心继续负责安全校验与财务计算，结果输出节点按 `flow_mode` 选择唯一回复结构。平台能力不足时使用可复制决策卡，不承诺跨会话记忆。

**Tech Stack:** 讯飞星辰 Agent 工作流、Markdown 配置真相源、JavaScript 静态配置检查、Node.js 公式回归脚本、人工平台测试。

---

## 范围拆分

本计划分为三个可独立验收阶段：

1. 本地配置阶段：建立平台基线记录、v0.4 配置真相源和测试清单，不触碰线上正式版。
2. 平台草稿阶段：在可回退副本中修改页面文案和两个大模型节点，完成分流与回归测试，不公开发布。
3. 发布验收阶段：完成三位目标用户试用，取得用户对公开更新的明确确认后再发布。

任何阶段失败都停留在当前阶段。不得用未验证的平台输出覆盖 v0.3 已发布版本。

## 文件结构

**新增文件：**

- `03_项目全记录/08_v0.4平台配置快照与变更记录.md`：保存脱敏后的当前节点、变量、提示词、代码和回退信息。
- `05_队长交付包/08_v0.4入口说明与对话分流配置.md`：保存页面文案、六种 `flow_mode`、信息采集提示词和结果输出提示词。
- `05_队长交付包/09_v0.4对话分流测试与验收清单.md`：保存新增十类对话测试、现有回归测试和平台证据要求。
- `tools/verify-v04-config.mjs`：静态检查 v0.4 配置、测试清单和关键安全规则是否齐全。

**修改文件：**

- `05_队长交付包/README.md`：增加 v0.4 文件入口和状态说明。
- `README.md`：在平台测试通过后更新当前版本和验证边界。
- `00_请先阅读.md`：在平台测试通过后更新队员入口。
- `03_项目全记录/02_过程日志.md`：记录平台草稿、测试、用户试用和发布结果。
- `03_项目全记录/06_Demo测试记录.md`：追加 v0.4 实际测试结果，保留 v0.3 历史记录。

**保持不变：**

- `05_队长交付包/02_公式与灯号规则.md`
- `tools/verify-formulas.mjs`
- 旧指令型智能体 Bot ID `5766257`
- v0.3 已发布工作流，直到新版全部验收并取得发布确认

### Task 1: 建立当前平台基线和回退条件

**Files:**
- Create: `03_项目全记录/08_v0.4平台配置快照与变更记录.md`
- Read: `03_项目全记录/02_过程日志.md:130`
- Read: `03_项目全记录/06_Demo测试记录.md:53`

- [ ] **Step 1: 确认本地起点**

Run:

```bash
git status --short --branch
git log --oneline --all --grep="设计消费决策助手对话分流方案" -1
node tools/verify-formulas.mjs
```

Expected: 工作树没有未提交文件；日志中可以找到设计提交；公式检查输出 `ALL_PASS 6`。

- [ ] **Step 2: 创建不进入公开仓库的截图目录**

Run:

```bash
mkdir -p /Users/xieyuan/Documents/星火杯/work/wealth-v04-platform-baseline
```

Expected: 目录存在，且位于公开 Git 仓库之外。

- [ ] **Step 3: 只读核对讯飞星辰当前工作流**

打开工作流编辑页编号 `661065`，记录以下事实：当前工作流名称、五个节点名称、信息采集提示词、确定性核心代码、结果输出提示词、节点输入输出变量、会话历史或会话变量能力、当前发布渠道和回退入口。

将截图保存在 `/Users/xieyuan/Documents/星火杯/work/wealth-v04-platform-baseline`。截图前隐藏手机号、账号名称、验证码、真实财务数据和其他个人信息。

Expected: 可以从截图恢复当前页面文案、节点内容和变量映射；平台没有发生保存、发布或覆盖操作。

- [ ] **Step 4: 写入脱敏基线记录**

创建 `03_项目全记录/08_v0.4平台配置快照与变更记录.md`，使用以下结构，并把平台实际读取到的文本逐字写入对应代码块：

```markdown
---
title: 财富自由指南灯 v0.4 平台配置快照与变更记录
project: 星火杯大模型应用创新赛
type: implementation-record
status: 基线已核对，平台未修改
platform: 讯飞星辰 Agent
workflow_id: "661065"
---

# 财富自由指南灯 v0.4 平台配置快照与变更记录

## 基线状态

工作流节点：开始 → 信息采集 → 确定性决策核心 → 结果输出 → 结束

发布状态以本次平台页面实际显示为准，原始截图保存在仓库外的私有工作目录，不提交账号信息。

## 当前页面文案

记录平台当前名称、简介、欢迎语和开场问题的原文。

## 当前信息采集节点

记录模型名称、输入变量、输出变量和提示词原文。

## 当前确定性决策核心

记录输入变量、输出变量和代码原文。代码中的账号数据或凭据必须删除。

## 当前结果输出节点

记录模型名称、输入变量、输出变量和提示词原文。

## 会话能力核对

记录平台是否能向信息采集节点提供同一会话历史，是否支持会话变量，是否支持复制工作流。

## 回退条件

新版只在复制出的草稿工作流中修改。新版测试失败时停止发布，继续保留 v0.3 已发布版本。
```

Expected: 文档只包含脱敏配置事实，不包含对尚未验证能力的肯定表述。

- [ ] **Step 5: 检查基线记录**

Run:

```bash
rg -n "工作流节点|当前页面文案|当前信息采集节点|当前确定性决策核心|当前结果输出节点|会话能力核对|回退条件" 03_项目全记录/08_v0.4平台配置快照与变更记录.md
git diff --check
```

Expected: 七个区块全部出现；Git 差异检查无输出。

- [ ] **Step 6: 提交基线记录**

Run:

```bash
git add 03_项目全记录/08_v0.4平台配置快照与变更记录.md
git commit -m "记录v0.4平台配置基线"
```

Expected: 新提交只包含一份脱敏基线记录。

### Task 2: 建立 v0.4 配置真相源和静态检查

**Files:**
- Create: `tools/verify-v04-config.mjs`
- Create: `05_队长交付包/08_v0.4入口说明与对话分流配置.md`
- Reference: `docs/superpowers/specs/2026-08-15-conversational-onboarding-intent-routing-design.md`

- [ ] **Step 1: 先写会失败的配置检查**

Create `tools/verify-v04-config.mjs`:

```javascript
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, '05_队长交付包/08_v0.4入口说明与对话分流配置.md');

if (!fs.existsSync(configPath)) {
  throw new Error(`CONFIG_MISSING ${configPath}`);
}

const config = fs.readFileSync(configPath, 'utf8');
const required = [
  '大额消费决策助手',
  '不需要记住固定格式',
  'scope_guidance',
  'need_input',
  'normal',
  'follow_up',
  'safety_boundary',
  'invalid_input',
  'scenario_overrides',
  'previous_result',
  '每轮最多询问两个问题',
  '一般性的投资知识提问',
  '不执行财务计算',
  '只回答当前问题',
  '不得推测',
  '跨会话自动记忆'
];

for (const text of required) {
  if (!config.includes(text)) {
    throw new Error(`REQUIRED_TEXT_MISSING ${text}`);
  }
}

if (/T[B]D|T[O]DO|FILL_ME/.test(config)) {
  throw new Error('UNFINISHED_TEXT_FOUND');
}

console.log(`ALL_PASS ${required.length}`);
```

- [ ] **Step 2: 运行检查并确认失败原因正确**

Run:

```bash
node tools/verify-v04-config.mjs
```

Expected: FAIL，错误以 `CONFIG_MISSING` 开头。

- [ ] **Step 3: 创建 v0.4 配置文件**

创建 `05_队长交付包/08_v0.4入口说明与对话分流配置.md`。页面部分使用以下完整内容：

```text
名称：财富自由指南灯
副标题：大额消费决策助手

简介：把一笔大额消费换算成自由天数，结合现金安全垫、实际需求和替代方案，帮助用户比较现在购买、延后观察或降低预算。

欢迎语：
我可以帮你判断一笔大额消费会占用多少自由天数，并结合现金安全垫、实际需求和替代方案，分析现在购买、延后观察或降低预算哪种选择更合适。

你可以提供：
1. 准备购买什么，大概多少钱
2. 当前可支配资金
3. 平均每天花多少钱，已经记录了多久
4. 为什么想买，目前遇到了什么问题
5. 是否考虑过维修、继续使用或其他价位方案

不需要记住固定格式，也不需要一次写完整。你可以先说购买内容和价格，我会逐步询问缺少的信息。

本工具主要提供大额消费决策辅助，不提供投资、借贷或收益建议。

开场问题：
1. 我想买一台 6999 元的电脑，应该怎么判断？
2. 我想报名一个 3000 元的课程，帮我分析一下。
3. 我不知道需要提供什么信息，请一步一步问我。
```

信息采集提示词使用以下完整规则，并在文件中记录平台实际输入变量和输出变量：

```text
你是财富自由指南灯的信息采集节点。先判断当前用户消息属于哪一种 flow_mode，再提取用户明确提供的字段。

flow_mode 只允许：scope_guidance、need_input、normal、follow_up、safety_boundary、invalid_input。

分支优先级：
1. safety_boundary：用户要求贷款保证、收益承诺、伪造数据，或发送账号凭据和敏感信息。
2. invalid_input：数字为空、非数字、小于等于零、单位无法确认，或新旧字段冲突且用户没有明确表达更正或假设。
3. follow_up：用户解释、质疑或修改本轮已有分析结果。
4. need_input 或 normal：用户提出一笔具体消费计划。五个财务必填字段齐全且有效时为 normal，否则为 need_input。
5. scope_guidance：用户询问一般理财、投资知识、资金分配或财富自由但没有提出具体消费计划，或者只说“你好”“你能做什么”等模糊开场。

一般性的投资知识提问进入 scope_guidance。只有贷款保证、收益承诺、伪造数据或敏感信息请求进入 safety_boundary。

财务必填字段：purchase_name、price、available_cash、avg_daily_expense、tracking_days。
需求证据和替代方案字段沿用 v0.3 当前字段。只提取用户明确提供的信息，不得推测收入、资金、价格、日均花销、使用频率、期限或替代方案金额。

同一会话存在已确认字段时，先合并旧值和本轮新值。用户明确更正时使用新值并把字段名写入 changed_fields；用户提出假设时把字段名写入 changed_fields，把假设值写入 scenario_overrides，但不覆盖原方案；无法判断冲突时进入 invalid_input。

need_input 每轮最多询问两个问题，优先级为 available_cash、avg_daily_expense、tracking_days、price、purchase_name。不得重复询问已经确认的字段。五个财务必填字段齐全后即可进入 normal，需求证据或替代证据不足不能阻塞财务分析。

只输出结构化对象，不计算财务结果，不给购买建议。输出必须包含 flow_mode、user_intent_summary、known_fields、missing_fields、changed_fields、scenario_overrides、previous_result、follow_up_question 和 validation_errors。previous_result 只允许引用同一会话已有的确定性结果或用户重新粘贴的决策卡；没有来源时输出 null。
```

结果输出提示词使用以下完整规则，并保留 v0.3 结构化财务结果字段：

```text
你是财富自由指南灯的结果输出节点。你会收到 flow_mode、用户已确认字段和确定性决策核心结果。只执行当前 flow_mode 对应的一种回复结构，不混合其他分支。

scope_guidance：一般理财问题先确认用户想了解整体资金安排；模糊开场直接说明当前能力。随后说明作品主要分析一笔具体大额消费，邀请用户先提供购买内容和大概价格。不集中索要五个字段，不输出灯号或决策状态。

need_input：先复述已经确认的购买内容和价格，再按 missing_fields 每轮最多询问两个问题。不得重复询问已知字段，不提前输出灯号。

normal：先用一句话同时说明财务灯号和决策状态，再按六部分输出计划与计算假设、自由时间和现金安全垫影响、需求证据与缺失项、主方案与替代方案、财务灯号与决策状态、今天的一个动作与复盘方式。不得重新计算或修改确定性核心数字。

follow_up：只回答当前问题。解释性问题只解释被问到的概念或依据；假设重算只展示变化的数字、灯号、决策状态和原因；用户明确要求完整报告时才重新输出完整决策卡。上下文不足时列出需要重新确认的字段，不得推测。

safety_boundary：只输出边界说明和一个安全的下一步，不执行财务计算，不鼓励贷款，不提供收益承诺，不帮助伪造数据。

invalid_input：只说明需要修正或确认的字段，不执行财务计算，不输出灯号。

如果平台无法提供同一会话历史，明确说明无法跨会话自动记忆，并邀请用户粘贴上一轮决策卡或重新提供关键字段。
```

Expected: 配置文件同时包含页面文案、六类分支、输入契约、输出规则和会话降级方案。

- [ ] **Step 4: 运行静态检查并确认通过**

Run:

```bash
node tools/verify-v04-config.mjs
git diff --check
```

Expected: 输出 `ALL_PASS 16`；Git 差异检查无输出。

- [ ] **Step 5: 提交配置真相源和检查脚本**

Run:

```bash
git add tools/verify-v04-config.mjs 05_队长交付包/08_v0.4入口说明与对话分流配置.md
git commit -m "新增v0.4对话分流配置"
```

Expected: 新提交只包含配置文件和静态检查脚本。

### Task 3: 先定义新版对话验收，再修改平台

**Files:**
- Create: `05_队长交付包/09_v0.4对话分流测试与验收清单.md`
- Modify: `tools/verify-v04-config.mjs`
- Reference: `05_队长交付包/05_测试用例与验收清单.md`

- [ ] **Step 1: 扩展静态检查并确认测试清单尚不存在**

在 `tools/verify-v04-config.mjs` 中加入：

```javascript
const testPath = path.join(root, '05_队长交付包/09_v0.4对话分流测试与验收清单.md');

if (!fs.existsSync(testPath)) {
  throw new Error(`TEST_PLAN_MISSING ${testPath}`);
}

const tests = fs.readFileSync(testPath, 'utf8');
const requiredCases = [
  'V04-01 一般理财问题',
  'V04-02 名称误解',
  'V04-03 极简消费输入',
  'V04-04 分轮补充',
  'V04-05 结果解释',
  'V04-06 假设重算',
  'V04-07 上下文不足',
  'V04-08 字段更正',
  'V04-09 单位歧义',
  'V04-10 完整报告',
  'REG-01 公式回归',
  'REG-02 平台回归'
];

for (const name of requiredCases) {
  if (!tests.includes(name)) {
    throw new Error(`TEST_CASE_MISSING ${name}`);
  }
}

console.log(`TEST_PLAN_PASS ${requiredCases.length}`);
```

Run:

```bash
node tools/verify-v04-config.mjs
```

Expected: FAIL，错误以 `TEST_PLAN_MISSING` 开头。

- [ ] **Step 2: 创建测试与验收清单**

创建 `05_队长交付包/09_v0.4对话分流测试与验收清单.md`，逐项写入以下输入和预期：

```text
V04-01 一般理财问题
输入：我应该怎么理财？
预期：scope_guidance；不输出灯号；不集中追问五个字段；引导用户说出一笔具体消费。

V04-02 名称误解
输入：我想实现财富自由，你能教我投资吗？
预期：scope_guidance；说明产品范围；不提供投资、收益或资产配置建议。

V04-03 极简消费输入
输入：我想买电脑。
预期：need_input；先复述购买内容；只询问价格和可支配资金。

V04-04 分轮补充
第一轮：我想买一台 6999 元的电脑。
第二轮：我有 30000 元可支配资金，平均每天花 80 元。
第三轮：已经记账 120 天，旧电脑偶尔卡顿。
预期：前两轮不计算；第三轮进入 normal；不重复询问已提供字段；购买前覆盖 375 天，购买后覆盖约 288 天，减少约 87 天，价格现金比 23.3%，财务灯号为黄灯，决策状态为 gather_evidence。

V04-05 结果解释
前置：完成 V04-04。
输入：黄灯是什么意思？
预期：follow_up；只解释黄灯是现金安全垫提示，不重复整张决策卡。

V04-06 假设重算
前置：完成 V04-04。
输入：如果预算降到 5000 元呢？
预期：follow_up；scenario_overrides.price 为 5000；原方案保持 6999 元；假设方案直接成本约 63 天、购买后覆盖约 313 天、价格现金比 16.7%，财务灯号为绿灯，决策状态仍为 gather_evidence；只展示变化结果。

V04-07 上下文不足
新建对话输入：如果改成 5000 元呢？
预期：need_input；要求重新确认购买内容、可支配资金、平均日花销和记账天数；不猜测旧会话。

V04-08 字段更正
前置：用户已说价格 6999 元。
输入：价格其实是 5999 元。
预期：采用 5999 元，只覆盖 price，不修改其他字段。

V04-09 单位歧义
输入：我买电脑的预算是 5k。
预期：平台无法可靠归一化时确认是否为 5000 元；确认前不计算。

V04-10 完整报告
前置：完成 V04-04。
输入：请把完整分析再发一次。
预期：重新输出完整六部分决策卡，数字与确定性核心一致。

REG-01 公式回归
运行 node tools/verify-formulas.mjs。
预期：ALL_PASS 6。

REG-02 平台回归
重新执行 v0.3 的完整输入、财务红灯、安全边界、证据已齐和频率反例。
预期：公式、灯号、决策状态和隐私边界保持不变。旧缺失输入测试更新为每轮最多两个问题，不能复用旧通过证据。
```

每个用例增加实际输出、证据位置、执行时间和结论四个记录项。未在平台运行时统一标记为“未执行”，不得标记通过。

- [ ] **Step 3: 运行检查并确认通过**

Run:

```bash
node tools/verify-v04-config.mjs
node tools/verify-formulas.mjs
git diff --check
```

Expected: 配置检查输出 `ALL_PASS 16` 和 `TEST_PLAN_PASS 12`；公式检查输出 `ALL_PASS 6`；Git 差异检查无输出。

- [ ] **Step 4: 提交测试清单**

Run:

```bash
git add tools/verify-v04-config.mjs 05_队长交付包/09_v0.4对话分流测试与验收清单.md
git commit -m "新增v0.4对话分流测试"
```

Expected: 新提交包含测试清单和对应静态检查。

### Task 4: 更新队长交付包入口

**Files:**
- Modify: `05_队长交付包/README.md:3`

- [ ] **Step 1: 更新版本和文件入口**

将版本行改为：

```text
版本：v0.2 财务基线，v0.3 证据型决策，v0.4 入口与对话分流
```

在文件入口中增加：

```text
`08_v0.4入口说明与对话分流配置.md` 提供页面文案、意图分流、信息采集提示词、结果输出提示词和会话降级规则。

`09_v0.4对话分流测试与验收清单.md` 提供十类新增对话测试、平台回归和证据要求。

v0.4 正式设计稿位于 `docs/superpowers/specs/2026-08-15-conversational-onboarding-intent-routing-design.md`。
```

在当前完成边界中明确：v0.4 设计已确认；平台基线、草稿修改、测试和发布按实际结果填写，未执行内容不得写成完成。

- [ ] **Step 2: 验证文件入口和状态**

Run:

```bash
rg -n "v0.4|08_v0.4|09_v0.4|2026-08-15-conversational" 05_队长交付包/README.md
node tools/verify-v04-config.mjs
git diff --check
```

Expected: 四类入口均可检索；配置和测试检查通过；Git 差异检查无输出。

- [ ] **Step 3: 提交入口更新**

Run:

```bash
git add 05_队长交付包/README.md
git commit -m "更新v0.4交付包入口"
```

Expected: 提交只修改交付包 README。

### Task 5: 在可回退草稿中应用页面文案

**Files:**
- Read: `05_队长交付包/08_v0.4入口说明与对话分流配置.md`
- Modify external draft: 讯飞星辰 Agent 工作流副本
- Record: `03_项目全记录/08_v0.4平台配置快照与变更记录.md`

- [ ] **Step 1: 取得平台写入授权并确认回退点**

向用户说明将复制或修改哪个工作流、会影响哪个公开体验、是否会保存草稿，以及本步骤不会发布。只有用户明确同意平台写入后继续。

Expected: 获得明确授权；基线截图和 v0.3 回退入口可用。

- [ ] **Step 2: 创建工作流副本**

在平台复制工作流 `661065`，副本名称使用：

```text
财富自由指南灯 v0.4 对话分流测试
```

Expected: 新工作流具有独立编号，仍显示五个节点，不影响 v0.3 发布版本。

如果平台不支持复制，停止平台修改并报告限制。不得直接覆盖已发布工作流。

- [ ] **Step 3: 更新副本页面文案**

将 Task 2 配置文件中的名称、副标题或简介、欢迎语和三个开场问题逐字填入副本。平台没有副标题字段时，把“大额消费决策助手”放在简介首句。

Expected: 首屏明确出现“大额消费决策助手”“不需要记住固定格式”和“不提供投资、借贷或收益建议”。

- [ ] **Step 4: 运行首屏验收**

新建对话，检查三个开场问题均可点击，并输入：

```text
你能帮我做什么？
```

Expected: 回复聚焦具体大额消费分析，没有宣称综合理财、投资或资产配置能力。

- [ ] **Step 5: 记录副本编号和页面证据**

在 `03_项目全记录/08_v0.4平台配置快照与变更记录.md` 追加副本编号、页面更新时间、首屏测试结果和仓库外截图位置。

Run:

```bash
git diff --check
git add 03_项目全记录/08_v0.4平台配置快照与变更记录.md
git commit -m "记录v0.4平台草稿"
```

Expected: 提交只包含脱敏后的副本记录，不包含平台账号信息。

### Task 6: 实施六类对话分流

**Files:**
- Read: `03_项目全记录/08_v0.4平台配置快照与变更记录.md`
- Read: `05_队长交付包/08_v0.4入口说明与对话分流配置.md`
- Modify external draft: v0.4 工作流副本的信息采集、确定性决策核心和结果输出节点

- [ ] **Step 1: 核对实际变量与目标契约**

把平台现有输入输出逐项映射到：

```text
flow_mode
user_intent_summary
known_fields
missing_fields
changed_fields
scenario_overrides
previous_result
follow_up_question
validation_errors
```

Expected: 每个目标字段都有明确的平台来源或新增变量。若平台不支持对象、数组、会话历史或会话变量，在继续修改前启用设计中的决策卡降级方案，并删除跨会话记忆承诺。

- [ ] **Step 2: 替换信息采集提示词**

将 Task 2 配置文件中的信息采集提示词粘贴到副本的信息采集节点，保持实际用户输入变量连接不变。

Expected: 节点调试对“我应该怎么理财？”输出 `scope_guidance`，对“我想买电脑”输出 `need_input`，对完整五字段案例输出 `normal`。

- [ ] **Step 3: 调整确定性核心的提前返回规则**

根据基线中保存的实际代码，在财务计算入口前增加以下顺序，继续复用现有公式函数和灯号规则。下面代码放在现有财务计算语句之前：

```javascript
const flowMode = input.flow_mode;
const changedFields = Array.isArray(input.changed_fields) ? input.changed_fields : [];
const scenarioOverrides = input.scenario_overrides ?? {};
const previousResult = input.previous_result ?? {};
const recalculationFields = [
  'price',
  'available_cash',
  'avg_daily_expense',
  'tracking_days',
  'alternative_price'
];
const requiresRecalculation = flowMode === 'follow_up'
  && changedFields.some((field) => recalculationFields.includes(field));

if (['safety_boundary', 'invalid_input', 'need_input', 'scope_guidance'].includes(flowMode)) {
  return { ...input, calculation: null, risk: null };
}

if (flowMode === 'follow_up' && !requiresRecalculation) {
  return {
    ...input,
    calculation: previousResult.calculation ?? null,
    risk: previousResult.risk ?? null
  };
}

const calculationInput = {
  ...input.known_fields,
  ...scenarioOverrides
};
```

将现有 v0.3 计算语句的输入改为 `calculationInput`，其余公式和阈值保持原样。若平台实际代码无法在不改写公式的情况下接入 `calculationInput`，停止本任务并报告当前代码结构，不继续修改已发布版本。

Expected: `scope_guidance`、`need_input`、`safety_boundary` 和 `invalid_input` 不产生财务计算；`normal` 结果与 v0.3 一致。

- [ ] **Step 4: 替换结果输出提示词**

将 Task 2 配置文件中的结果输出提示词粘贴到副本的结果输出节点，保持确定性核心结果变量连接不变。

Expected: 六种 `flow_mode` 各自只输出一种结构；`normal` 先给核心判断；`follow_up` 不自动重复完整决策卡。

- [ ] **Step 5: 保存副本但不发布**

Expected: 平台显示副本已保存；v0.3 已发布版本保持原状态；没有执行更新发布。

### Task 7: 运行对话测试和公式回归

**Files:**
- Modify: `05_队长交付包/09_v0.4对话分流测试与验收清单.md`
- Modify: `03_项目全记录/06_Demo测试记录.md`

- [ ] **Step 1: 执行十类新增对话测试**

严格按 `09_v0.4对话分流测试与验收清单.md` 的 V04-01 至 V04-10 顺序执行。每个独立用例使用新对话；要求多轮上下文的用例在同一对话连续执行。

Expected: 每项记录完整输入、完整输出、执行时间、证据位置和通过或失败结论。失败项保留原始输出，不通过修改记录文字掩盖问题。

- [ ] **Step 2: 运行本地公式回归**

Run:

```bash
node tools/verify-formulas.mjs
```

Expected: 输出 `ALL_PASS 6`。

- [ ] **Step 3: 执行平台回归**

重新执行 v0.3 的完整输入、财务红灯、安全边界、证据已齐和频率反例。缺失输入按新版每轮最多两个问题执行。

Expected: 数字、灯号、决策状态、安全边界和频率证据与 v0.3 正确口径一致；缺失输入不再一次询问三个问题。

- [ ] **Step 4: 处理失败项**

每次只修改导致失败的最小节点。信息分类错误只改信息采集提示词；固定格式错误只改结果输出提示词；公式或灯号错误回退确定性核心改动并与基线代码比较。

每次修正后重跑失败用例及其相邻分支，再运行 `node tools/verify-formulas.mjs`。

Expected: 全部新增测试和回归测试通过；公式继续输出 `ALL_PASS 6`。

- [ ] **Step 5: 追加 v0.4 测试记录**

先运行 `date +%F` 取得实际执行日期，再在 `03_项目全记录/06_Demo测试记录.md` 新增“实际执行日期 v0.4 对话分流测试”区块，记录工作流副本编号、十类新增测试结果、五类平台回归、公式回归和仍存在的平台限制。保留所有 v0.3 历史内容。

Run:

```bash
node tools/verify-v04-config.mjs
node tools/verify-formulas.mjs
git diff --check
git add 05_队长交付包/09_v0.4对话分流测试与验收清单.md 03_项目全记录/06_Demo测试记录.md
git commit -m "记录v0.4对话分流测试"
```

Expected: 两项检查通过；提交只包含测试预期和实际结果。

### Task 8: 完成三位用户试用和发布前验收

**Files:**
- Modify: `03_项目全记录/02_过程日志.md`
- Modify: `03_项目全记录/06_Demo测试记录.md`

- [ ] **Step 1: 邀请三位目标用户使用脱敏案例**

至少包含本次反馈者。只发送 v0.4 草稿体验入口和一句“请按你自然想到的方式提问”，不提前发送字段模板。

每位用户检查：能否说清产品用途、能否知道下一步提供什么、是否出现答非所问或重复追问、能否区分财务灯号与购买价值判断、是否愿意执行当天行动。

Expected: 三份独立记录均包含首次输入、关键回复和用户反馈。记录中删除姓名、手机号、账号和真实财务明细。

- [ ] **Step 2: 判断发布资格**

发布条件全部满足：

```text
V04-01 至 V04-10 全部通过
平台回归全部通过
本地公式 ALL_PASS 6
三位用户都能说清作品主要用途
没有未解释的答非所问
没有新增金融建议或隐私风险
```

Expected: 任一条件不满足时继续保留草稿状态，不申请发布。

- [ ] **Step 3: 更新过程日志**

在 `03_项目全记录/02_过程日志.md` 追加 v0.4 草稿完成情况、三位用户试用结论、未解决限制和下一步。未达到发布条件时明确记录“保持草稿，v0.3 继续作为公开版本”。

- [ ] **Step 4: 提交用户验收记录**

Run:

```bash
git diff --check
git add 03_项目全记录/02_过程日志.md 03_项目全记录/06_Demo测试记录.md
git commit -m "记录v0.4用户验收"
```

Expected: 提交不包含个人信息或原始真实财务数据。

### Task 9: 经确认后更新正式版和项目状态

**Files:**
- Modify external state: 讯飞星辰 Agent 正式发布版本
- Modify: `README.md:7`
- Modify: `00_请先阅读.md:7`
- Modify: `05_队长交付包/README.md:7`
- Modify: `03_项目全记录/02_过程日志.md`
- Modify: `03_项目全记录/06_Demo测试记录.md`

- [ ] **Step 1: 单独取得发布确认**

向用户说明将更新哪个智能体、公开范围、当前草稿测试结果、回退版本和发布时间。只有用户明确同意公开更新后继续。

Expected: 获得明确发布授权。没有授权时结束任务，保留已通过测试的私有草稿。

- [ ] **Step 2: 发布已验收的 v0.4 版本**

在讯飞星辰 Agent 平台选择已经通过测试的 v0.4 草稿版本，执行更新发布。不得在发布前继续修改提示词或节点。

Expected: 平台显示更新发布成功或进入审核；保存版本编号、提交时间和脱敏截图。

- [ ] **Step 3: 运行公开体验冒烟测试**

公开入口依次输入：

```text
我应该怎么理财？
```

```text
我想买电脑。
```

Expected: 第一条进入能力范围说明，第二条只询问价格和可支配资金。任一失败时停止推广并回退到 v0.3。

- [ ] **Step 4: 更新项目状态文件**

只有平台实际发布或进入审核后，才将 README、队员入口、交付包和过程日志更新为对应状态。文案必须区分“已创建发布版本”“审核中”和“公开入口已验证”。

- [ ] **Step 5: 完成最终验证并提交**

Run:

```bash
node tools/verify-v04-config.mjs
node tools/verify-formulas.mjs
git diff --check
git status --short
```

Expected: 配置与测试检查通过；公式输出 `ALL_PASS 6`；Git 差异检查无输出；状态中只出现本任务的项目状态文件。

Run:

```bash
git add README.md 00_请先阅读.md 05_队长交付包/README.md 03_项目全记录/02_过程日志.md 03_项目全记录/06_Demo测试记录.md
git commit -m "发布财富自由指南灯v0.4"
```

Expected: 最终提交只包含已验证的发布状态和测试证据。

## 最终验收

执行完成后必须同时满足：

```bash
node tools/verify-v04-config.mjs
node tools/verify-formulas.mjs
git diff --check
git status --short --branch
```

成功标志：v0.4 配置检查和测试清单检查全部通过；公式输出 `ALL_PASS 6`；工作树干净；项目文档中的平台状态与实际页面一致；公开版本仅在用户明确授权后更新。
