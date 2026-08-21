"use strict";

// 鄧宇律師網站目前使用的官方 LINE 連結。
const LINE_OFFICIAL_URL = "https://lin.ee/yfDGMXo";

const evidenceOptions = [
  ["protection", "保護令、法院裁判或調解資料", ""],
  ["police", "報案紀錄、刑事案件資料", ""],
  ["medical", "驗傷單、診斷證明或病歷", ""],
  ["social", "社工、家防中心、學校或輔導紀錄", ""],
  ["household", "戶籍遷徙、離婚或監護資料", ""],
  ["payment", "匯款、扶養費或生活費紀錄", ""],
  ["messages", "訊息、信件、錄音、照片或影片", ""],
  ["witness", "親屬、鄰居、老師或其他證人", ""],
  ["other", "其他客觀資料", ""],
  ["none", "目前沒有相關資料", ""],
  ["unknown", "不確定什麼可以作為證據", ""]
];

const questions = [
  {
    id: "status",
    title: "您現在遇到哪一種情況？",
    help: "這會影響您目前應優先處理的事項。",
    options: [
      ["none", "目前沒有人要求我付款", "我想預先處理，避免日後突然被追討。"],
      ["private", "收到父母、親屬或機構的付款要求", "包含口頭、訊息、帳單或存證信函，但尚未收到法院文件。"],
      ["court", "有人已經透過法院要求我付款", "我收到法院通知、聲請狀、起訴狀或調解通知，案件仍在進行中。"],
      ["social", "收到追討65歲以上父母的老人保護安置費的行政處分", ""],
      ["decision", "法院已經作成裁判、調解已成立，或已進入執行程序", "法院已經作成裁判、調解已經成立，或目前正在進行強制執行。"],
      ["unknown", "我不知道手上的文件屬於哪一種", "需要先辨識請求人、文件性質及處理時機。"]
    ]
  },
  {
    id: "alive",
    title: "該位父母目前是否健在？",
    help: "父母死亡後，原則上不再發生將來的扶養義務，但生前費用可能另有爭議。",
    options: [
      ["yes", "是，父母目前健在", ""],
      ["no", "否，父母已經過世", ""],
      ["unknown", "不確定", ""]
    ]
  },
  {
    id: "pastCosts",
    title: "目前是否仍有人向您追討父母生前的安置費、照護費或其他費用？",
    help: "這類費用不一定等於扶養費，必須另外辨識請求依據。",
    when: answers => answers.alive === "no",
    options: [
      ["no", "沒有", "目前沒有任何生前費用爭議。"],
      ["yes", "有", "已收到費用明細、催繳、行政處分或其他付款要求。"],
      ["unknown", "不確定", "我不知道對方請求的是什麼費用。"]
    ]
  },
  {
    id: "parentMeans",
    title: "父母目前能否以自己的收入或財產維持基本生活？",
    help: "請綜合考量薪資、年金、退休金、存款、保單、不動產與其他收入。",
    when: answers => answers.alive !== "no",
    options: [
      ["sufficient", "可以，父母有相當收入或財產", "例如有穩定高收入、相當存款、保單或可利用的不動產。"],
      ["insufficient", "不行，父母目前無法自行維持生活", "沒有足以維持基本生活的收入或財產。"],
      ["unknown", "不知道父母的收入或財產狀況", ""]
    ]
  },
  {
    id: "supportHistory",
    title: "在您未成年期間，父母實際扶養您的情形為何？",
    help: "請綜合同住照顧、生活費、教育費、探視聯繫及持續時間回答。",
    when: answers => answers.alive !== "no",
    options: [
      ["minimal", "幾乎沒有扶養", "很早離家，此後長期未照顧、未聯絡或未給付生活費。"],
      ["partial", "曾扶養一段時間，後來停止", "童年或青少年期間有過同住、照顧或部分給付。"],
      ["substantial", "大部分未成年期間都有扶養", "雖有衝突或後期中斷，整體仍有相當扶養貢獻。"],
      ["unknown", "不確定", ""]
    ]
  },
  {
    id: "stopAge",
    title: "父母大約在您幾歲時停止扶養？",
    help: "若扶養情形反覆中斷，請選擇開始長期停止扶養時的年齡。",
    when: answers => answers.alive !== "no" && ["minimal", "partial"].includes(answers.supportHistory),
    options: [
      ["0to5", "5歲以前", ""],
      ["6to9", "6至9歲", ""],
      ["10to15", "10至15歲", ""],
      ["16plus", "16歲以後", ""],
      ["unknown", "不確定", ""]
    ]
  },
  {
    id: "reason",
    title: "父母未扶養您的主要原因為何？",
    help: "請選擇最接近的主要原因。",
    when: answers => answers.alive !== "no" && ["minimal", "partial"].includes(answers.supportHistory),
    options: [
      ["objective", "重病、重度障礙或其他客觀上無法工作照顧的原因", "可能屬於非出於本意的客觀障礙。"],
      ["poverty", "主要是貧困或失業", "仍需判斷父母是否曾在能力範圍內盡力扶養。"],
      ["culpable", "有能力卻拒絕負責，或因犯罪、賭博、成癮、外遇而離家", "可能屬於可歸責且無正當理由的未扶養。"],
      ["unknown", "不知道主要原因", ""],
      ["complex", "上述選項都無法完整描述我的情況", "例如同時涉及經濟困難、疾病、失業、服刑、探視受阻，或其他複雜家庭因素。"]
    ]
  },
  {
    id: "abuse",
    title: "父母是否曾對您或您的家人有虐待、重大侮辱或其他侵害？",
    help: "請依侵害的方式、次數、持續時間及造成的影響，選擇最接近的情形。",
    when: answers => answers.alive !== "no",
    options: [
      ["extreme", "有危及生命、重大傷害、持械攻擊、限制自由或其他極重大侵害", ""],
      ["repeated", "有反覆的身體或精神侵害", "包含持續暴力、威脅、重大侮辱或長期精神控制。"],
      ["conflict", "較接近偶發衝突或一般管教爭議", ""],
      ["none", "沒有上述情形", ""],
      ["unknown", "不確定是否達到法律上的侵害", ""]
    ]
  },
  {
    id: "evidence",
    title: "目前有哪些資料可以支持父母未扶養或侵害的事實？",
    help: "可以複選。沒有保護令或驗傷單，不代表您沒有減輕或免除的法律理由。",
    multiple: true,
    when: answers => answers.alive !== "no" &&
      (["minimal", "partial"].includes(answers.supportHistory) ||
        ["extreme", "repeated", "conflict"].includes(answers.abuse)),
    options: evidenceOptions
  },
  {
    id: "ownMeans",
    title: "如果要您負擔父母扶養費，對您目前生活會有什麼影響？",
    help: "請考量收入、財產、房租、醫療費、未成年子女及其他必要扶養支出。",
    when: answers => answers.alive !== "no",
    options: [
      ["comfortable", "仍有能力負擔", "支付後不致影響自己及家庭的基本生活。"],
      ["difficult", "會造成明顯困難，但可能負擔少部分", ""],
      ["unable", "會使自己或家庭無法維持基本生活", "例如低收入、身心障礙、重大疾病或需扶養多名家屬。"],
      ["unknown", "無法判斷", ""]
    ]
  }
];

const state = {
  answers: {},
  activeQuestions: [],
  index: 0,
  result: null,
  evidence: null,
  shareMode: "review"
};

const $ = selector => document.querySelector(selector);
const introView = $("#introView");
const seoContent = $("#seoContent");
const quizView = $("#quizView");
const resultView = $("#resultView");
const quizForm = $("#quizForm");
const optionsContainer = $("#options");
const questionError = $("#questionError");
const shareDialog = $("#shareDialog");
const shareText = $("#shareText");
const shareConsent = $("#shareConsent");
const shareError = $("#shareError");
const copyStatus = $("#copyStatus");

function refreshActiveQuestions() {
  state.activeQuestions = questions.filter(question => !question.when || question.when(state.answers));
}

function showView(view) {
  introView.hidden = view !== "intro";
  seoContent.hidden = view !== "intro";
  quizView.hidden = view !== "quiz";
  resultView.hidden = view !== "result";
  $("#restartHeader").hidden = view === "intro";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startQuiz() {
  state.answers = {};
  state.index = 0;
  state.result = null;
  state.evidence = null;
  refreshActiveQuestions();
  showView("quiz");
  renderQuestion();
}

function updateExclusiveCheckboxes(input, question) {
  if (!question.multiple || !input.checked) return;
  const exclusiveValues = ["none", "unknown"];
  const inputs = [...optionsContainer.querySelectorAll("input")];
  if (exclusiveValues.includes(input.value)) {
    inputs.forEach(other => {
      if (other !== input) other.checked = false;
    });
  } else {
    inputs.forEach(other => {
      if (exclusiveValues.includes(other.value)) other.checked = false;
    });
  }
}

function renderQuestion() {
  refreshActiveQuestions();
  const question = state.activeQuestions[state.index];
  if (!question) {
    finishQuiz();
    return;
  }

  $("#questionTitle").textContent = question.title;
  $("#questionHelp").textContent = question.help || "";
  $("#questionHelp").hidden = !question.help;
  optionsContainer.replaceChildren();

  question.options.forEach(([value, title, description], optionIndex) => {
    const label = document.createElement("label");
    label.className = "option-item";

    const input = document.createElement("input");
    input.type = question.multiple ? "checkbox" : "radio";
    input.name = question.id;
    input.value = value;
    const saved = state.answers[question.id];
    input.checked = question.multiple ? Array.isArray(saved) && saved.includes(value) : saved === value;
    if (description) input.setAttribute("aria-describedby", `${question.id}-description-${optionIndex}`);
    input.addEventListener("change", () => {
      updateExclusiveCheckboxes(input, question);
      questionError.hidden = true;
    });

    const text = document.createElement("span");
    const optionTitle = document.createElement("span");
    optionTitle.className = "option-title";
    optionTitle.textContent = title;
    text.append(optionTitle);

    if (description) {
      const optionDescription = document.createElement("span");
      optionDescription.className = "option-description";
      optionDescription.id = `${question.id}-description-${optionIndex}`;
      optionDescription.textContent = description;
      text.append(optionDescription);
    }

    label.append(input, text);
    optionsContainer.append(label);
  });

  const current = state.index + 1;
  const total = state.activeQuestions.length;
  $("#progressText").textContent = `問題 ${current}，共 ${total} 題`;
  $("#progressBar").style.width = `${Math.round((current / total) * 100)}%`;
  $("#backButton").hidden = state.index === 0;
  $("#nextButton").textContent = current === total ? "查看結果" : "下一題";
  questionError.textContent = question.multiple ? "請先選擇至少一個答案。" : "請先選擇一個答案。";
  questionError.hidden = true;

  const firstChecked = optionsContainer.querySelector("input:checked");
  (firstChecked || optionsContainer.querySelector("input"))?.focus({ preventScroll: true });
}

function removeHiddenAnswers() {
  const visibleIds = new Set(state.activeQuestions.map(question => question.id));
  Object.keys(state.answers).forEach(id => {
    if (!visibleIds.has(id)) delete state.answers[id];
  });
}

quizForm.addEventListener("submit", event => {
  event.preventDefault();
  const question = state.activeQuestions[state.index];
  const selected = [...quizForm.querySelectorAll(`input[name="${question.id}"]:checked`)];

  if (selected.length === 0) {
    questionError.hidden = false;
    optionsContainer.querySelector("input")?.focus();
    return;
  }

  state.answers[question.id] = question.multiple ? selected.map(input => input.value) : selected[0].value;
  refreshActiveQuestions();
  removeHiddenAnswers();

  if (question.id === "reason" && state.answers.reason === "complex") {
    finishQuiz();
    return;
  }

  if (question.id === "status" && state.answers.status === "decision") {
    finishQuiz();
    return;
  }

  if (state.index >= state.activeQuestions.length - 1) {
    finishQuiz();
  } else {
    state.index += 1;
    renderQuestion();
  }
});

$("#backButton").addEventListener("click", () => {
  if (state.index > 0) {
    state.index -= 1;
    renderQuestion();
  }
});

function assessEvidence() {
  const selected = state.answers.evidence;
  if (!Array.isArray(selected) || selected.length === 0) return null;

  if (selected.includes("none")) {
    return {
      level: "尚待補強",
      text: "沒有現成文件，不代表您沒有減輕或免除的法律理由；但後續能否找到紀錄、證人或其他客觀資料，可能影響訴訟結果。"
    };
  }

  if (selected.includes("unknown")) {
    return {
      level: "需要辨識",
      text: "您目前不確定哪些資料可以使用。律師可依具體事實協助辨識可調取、保存或提出的證據。"
    };
  }

  const strongTypes = ["protection", "police", "medical", "social"];
  const strongCount = selected.filter(value => strongTypes.includes(value)).length;
  if (strongCount >= 1 && selected.length >= 2) {
    return {
      level: "已有較強的客觀資料",
      text: "您已勾選官方、醫療或其他相互支持的資料。後續仍需確認每項資料能證明的事件、期間及與主張的關聯。"
    };
  }

  return {
    level: "已有證據線索",
    text: "您已持有部分資料或知道可能的證人。這些線索可作為後續整理與補充客觀紀錄的起點。"
  };
}

function baseReasons(a) {
  const reasons = [];
  if (a.parentMeans === "insufficient") {
    reasons.push(["父母可能符合受扶養門檻", "父母似已不能維持自己生活。"]);
  } else if (a.parentMeans === "unknown") {
    reasons.push(["父母資力尚未確認", "是否能維持生活，是扶養義務是否發生的重要門檻。"]);
  }

  if (a.supportHistory === "minimal") {
    reasons.push(["長期幾乎沒有扶養", "自幼缺乏照顧、探視或給付，可能構成減輕或免除的重要理由。"]);
  } else if (a.supportHistory === "partial") {
    reasons.push(["父母曾有部分扶養", "未扶養期間、停止原因及整體情節會影響減輕或免除的判斷。"]);
  } else if (a.supportHistory === "substantial") {
    reasons.push(["父母曾有相當扶養貢獻", "單以未扶養為由主張完全免除通常較不利。"]);
  }

  if (a.reason === "culpable") {
    reasons.push(["可能構成無正當理由未盡扶養義務", "有能力卻拒絕負責，或因可歸責原因離家，對減輕或免除較有利。"]);
  } else if (a.reason === "objective") {
    reasons.push(["似未構成無正當理由未盡扶養義務", "重病或重度障礙可能被認定屬於非出於本意的客觀障礙。"]);
  }

  if (a.abuse === "extreme") {
    reasons.push(["侵害情節可能極為重大", "危及生命、重大傷害或限制自由等事實，可能單獨支持完全免除。"]);
  } else if (a.abuse === "repeated") {
    reasons.push(["曾有反覆侵害", "侵害方式、持續時間及造成的影響，可能支持減輕，重大時也可能支持免除。"]);
  } else if (a.abuse === "conflict") {
    reasons.push(["曾有衝突或管教爭議", "仍需判斷是否超出合理範圍，以及整體情節是否重大。"]);
  }

  if (a.ownMeans === "unable") {
    reasons.push(["扶養可能危及您的基本生活", "您的收入、財產及必要家庭支出，可能構成減輕扶養義務的重要理由。"]);
  } else if (a.ownMeans === "difficult") {
    reasons.push(["您的負擔能力有限", "收入、必要支出及扶養人口可能影響最後應負擔的金額。"]);
  }
  return reasons;
}

function evaluate() {
  const a = state.answers;

  if (a.status === "decision") {
    return {
      code: "individual-review",
      title: "既有結果能否調整，需要個案判斷",
      summary: "依您填答情形，案件已有法院裁判、成立的調解或執行程序。既有結果是否仍可調整，可能涉及裁判是否確定、調解效力、執行範圍及事後情況是否發生變化，無法再依通常規則判斷。",
      reasons: [
        ["案件已有法律上的處理結果", "需要先確認裁判、調解或執行文件的內容與目前程序狀態。"]
      ]
    };
  }

  if (a.alive === "no") {
    if (a.pastCosts === "no") {
      return {
        code: "deceased-clear",
        title: "目前很可能不需要支付扶養費",
        summary: "依您填答情形，父母已經過世，而且目前沒有生前費用爭議，原則上不再發生將來的扶養義務。",
        reasons: [
          ["扶養主體已不存在", "父母死亡後，將來的身分扶養義務原則上不再發生。"],
          ["目前沒有既存費用爭議", "依您的回答，沒有人追討生前安置或照護費用。"]
        ]
      };
    }
    return {
      code: "deceased-costs",
      title: "是否需要付款，目前還不能確定",
      summary: "依您填答情形，父母雖已過世，但對方可能主張生前安置費、照護費或其他既存費用，不能只用扶養義務判斷。",
      reasons: [
        ["將來扶養與生前費用不同", "父母死亡不一定使已經發生的費用爭議一併消失。"],
        ["必須先看請求依據", "需要辨識請求人、契約、行政處分及費用期間。"]
      ]
    };
  }

  if (a.reason === "complex") {
    return {
      code: "individual-review",
      title: "您的情況需要個案判斷",
      summary: "依您填答情形，現有選項無法完整判斷父母未盡扶養是否具有正當理由，暫不足以判斷您是否仍須負擔扶養費，或能否請求減輕、免除扶養義務。",
      reasons: [
        ["本問卷無法完整涵蓋", "您的情況可能同時涉及疾病、經濟能力、探視受阻、家庭衝突或其他特殊因素，需要結合實際經過、目前請求內容及相關資料個別判斷。"]
      ]
    };
  }

  let reasons = baseReasons(a);

  if (a.parentMeans === "sufficient") {
    reasons.unshift(["父母目前可能仍能維持生活", "有相當收入或財產時，受扶養要件可能尚未成立。"]);
    return {
      code: "not-triggered",
      title: "目前很可能不需要支付扶養費",
      summary: "依您填答情形，父母目前仍能以自己的收入或財產維持生活，扶養義務可能尚未發生。",
      reasons: reasons.slice(0, 5)
    };
  }

  const infringementFull = a.abuse === "extreme";
  const nonSupportFull = a.supportHistory === "minimal" && a.reason === "culpable" &&
    ["0to5", "6to9", "10to15"].includes(a.stopAge);
  const reductionGround = a.abuse === "repeated" ||
    (["minimal", "partial"].includes(a.supportHistory) && ["culpable", "poverty"].includes(a.reason)) ||
    ["difficult", "unable"].includes(a.ownMeans);
  const lateNonSupportNeedsReview = a.stopAge === "16plus" && a.reason === "culpable" &&
    ["minimal", "partial"].includes(a.supportHistory) &&
    !["extreme", "repeated"].includes(a.abuse) &&
    !["difficult", "unable"].includes(a.ownMeans);
  const unknownCore = a.alive === "unknown" || a.parentMeans === "unknown" ||
    a.supportHistory === "unknown" || a.abuse === "unknown";

  if (infringementFull || nonSupportFull) {
    let summary;
    if (infringementFull) {
      summary = "依您填答情形，如果上述重大侵害成功舉證，您爭取完全免除扶養義務的條件明顯有利。";
    } else if (nonSupportFull) {
      summary = "依您填答情形，如果父母長期無正當理由未盡扶養成功舉證，您爭取完全免除扶養義務的條件較為有利。";
    }
    return {
      code: "exemption-favorable",
      title: "爭取完全不用付的條件較有利",
      summary,
      reasons: reasons.slice(0, 5)
    };
  }

  if (lateNonSupportNeedsReview) {
    return {
      code: "individual-review",
      title: "是否可以減輕，目前需要個案判斷",
      summary: "依您填答情形，父母可能曾無正當理由未盡部分扶養義務；但因停止扶養時您已接近成年，僅憑目前資訊尚不足以判斷要求您負擔扶養義務是否顯失公平。您目前仍須扶養的可能性不低，但仍可能有爭取減輕的空間。",
      reasons: reasons.slice(0, 5)
    };
  }

  if (reductionGround) {
    return {
      code: "partial-likely",
      title: "爭取減輕扶養義務的可能性較高",
      summary: "依您填答情形，您爭取減輕扶養義務的可能性較高。換句話說，您很可能仍要支付一部分，但未必須全額給付對方提出的金額。",
      reasons: reasons.slice(0, 5)
    };
  }

  if (unknownCore) {
    return {
      code: "uncertain",
      title: "是否需要付款，目前還不能確定",
      summary: "依您填答情形，目前仍缺少父母資力、扶養經過或侵害情節等關鍵資料，尚無法可靠判斷您是否需要支付。",
      reasons: reasons.length ? reasons.slice(0, 5) : [["關鍵事實不足", "需要先確認請求依據、父母資力及過去扶養經過。"]]
    };
  }

  return {
    code: "payment-likely",
    title: "仍需支付扶養費的可能性較高",
    summary: "依您填答情形，目前較可能仍有扶養義務；但對方請求的金額是否合理，仍應依雙方資力、需求及其他扶養義務人狀況判斷。",
    reasons: reasons.slice(0, 5)
  };
}

function getServiceAdvice(status) {
  const advice = {
    none: "縱使對方還沒有進入法院程序，現在亦可先聲明您的法律立場。律師可先檢視可能的請求依據及金額與您現有的證據；如果有長期未扶養或重大侵害事實，也可以考慮主動向法院聲請減輕或免除扶養義務。",
    private: "縱使目前尚未進入司法程序，現在亦可先聲明您的法律立場。律師可先檢視對方的請求依據、金額及您現有的證據，以律師函正式回覆；如果有長期未扶養或重大侵害事實，也可以考慮主動向法院聲請減輕或免除扶養義務。",
    court: "對方已經透過法院提出請求，現在須掌握答辯時機。律師可協助檢視對方的請求內容、整理答辯方向、提出有利事實與證據，並代理您進行協商及出庭。",
    social: "這類文件可能同時涉及費用減免及行政救濟時機。建議先確認是否可以申請減輕或免除追討費用；如對機關處分不服，可依法提起後續救濟。",
    decision: "建議先將裁判、調解筆錄、執行文件及近期情況變動的相關資料交由律師確認，再判斷可以採取的法律程序。",
    unknown: "目前應先辨識文件性質、請求人及處理時機。律師可檢視您收到的文件，再確認應採取法院答辯、行政救濟、律師函或主動聲請。"
  };
  return advice[status] || advice.unknown;
}

function finishQuiz() {
  state.result = evaluate();
  state.evidence = assessEvidence();
  const result = state.result;

  $("#resultTitle").textContent = result.title;
  $("#resultView").dataset.result = result.code;
  $("#legalReminder").textContent = result.summary;

  const reasons = $("#resultReasons");
  reasons.replaceChildren();
  result.reasons.forEach(([title, description]) => {
    const item = document.createElement("div");
    item.className = "reason-item";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const span = document.createElement("span");
    span.textContent = description;
    item.append(strong, span);
    reasons.append(item);
  });

  const evidenceGroup = $("#evidenceGroup");
  evidenceGroup.hidden = !state.evidence;
  $("#evidenceSummary").textContent = state.evidence
    ? `${state.evidence.level}。依您填答情形，${state.evidence.text}`
    : "";

  const isIndividualReview = result.code === "individual-review";
  $("#serviceHeading").textContent = "律師依您填答情形的提醒";
  const individualConsultation = $("#individualConsultation");
  individualConsultation.hidden = !isIndividualReview;
  individualConsultation.textContent = isIndividualReview
    ? "網頁工具目前無法涵蓋所有家庭經歷及法律關係。建議將目前已完成的自評結果與相關文件傳送給律師，由律師進一步確認合適的處理方向。"
    : "";
  $("#procedureAdviceTitle").hidden = !isIndividualReview;
  $("#serviceAdvice").textContent = getServiceAdvice(state.answers.status);
  const deadlineWarning = $("#deadlineWarning");
  const warnings = {
    court: "也應儘早整理事實、證據與法律主張，避免過晚提出而遭受不利益。",
    social: "須注意文件所載的處理期限及救濟教示。",
    decision: "須注意文件所載的處理期限及救濟教示。"
  };
  deadlineWarning.hidden = !warnings[state.answers.status];
  deadlineWarning.textContent = warnings[state.answers.status] || "";

  showView("result");
  $("#resultTitle").focus();
}

function statusLabel(value) {
  const labels = {
    none: "尚未有人要求付款",
    private: "收到付款要求，但尚未進入法院",
    court: "對方已透過法院提出請求",
    social: "收到老人保護安置費行政處分",
    decision: "法院已作成裁判、調解已成立或已進入執行程序",
    unknown: "文件性質不明"
  };
  return labels[value] || "未填寫";
}

function buildShareText(mode) {
  const purpose = mode === "engage" ? "洽談委任律師協助處理" : "申請律師免費初評";
  const rows = [
    "您好，我已完成成年子女對父母扶養義務線上自評。",
    "",
    `聯絡目的：${purpose}`,
    `自評結論：${state.result.title}`,
    `目前狀態：${statusLabel(state.answers.status)}`,
    `初步說明：${state.result.summary}`
  ];
  if (state.evidence) rows.push(`證據狀況：${state.evidence.level}`);
  rows.push("", "我會視需要在 LINE 另行提供法院、社會局或其他相關文件。");
  return rows.join("\n");
}

function openShareDialog(mode) {
  state.shareMode = mode;
  shareText.value = buildShareText(mode);
  shareConsent.checked = false;
  shareError.hidden = true;
  copyStatus.textContent = "";
  $("#shareTitle").textContent = mode === "engage" ? "確認委任需求摘要" : "確認免費初評摘要";
  shareDialog.showModal();
}

async function copyAndOpenLine() {
  if (!shareConsent.checked) {
    shareError.hidden = false;
    shareConsent.focus();
    return;
  }

  shareError.hidden = true;
  try {
    await navigator.clipboard.writeText(shareText.value);
    copyStatus.textContent = "摘要已複製。請到官方 LINE 貼上並傳送。";
  } catch {
    shareText.focus();
    shareText.select();
    document.execCommand("copy");
    copyStatus.textContent = "摘要已複製。請到官方 LINE 貼上並傳送。";
  }

  if (LINE_OFFICIAL_URL) {
    window.setTimeout(() => {
      window.location.href = LINE_OFFICIAL_URL;
    }, 350);
  } else {
    copyStatus.textContent += " 尚未設定官方 LINE 連結。";
  }
}

$("#startButton").addEventListener("click", startQuiz);
$("#restartHeader").addEventListener("click", startQuiz);
$("#restartResult").addEventListener("click", startQuiz);
$("#freeReviewButton").addEventListener("click", () => openShareDialog("review"));
$("#engageButton").addEventListener("click", () => openShareDialog("engage"));
$("#copyAndLineButton").addEventListener("click", copyAndOpenLine);
shareConsent.addEventListener("change", () => {
  if (shareConsent.checked) shareError.hidden = true;
});

document.addEventListener("click", event => {
  const toolsMenu = document.querySelector(".tools-menu");
  if (toolsMenu?.open && !toolsMenu.contains(event.target)) toolsMenu.open = false;
});
