const eras = {
	"令和": 2018,
	"平成": 1988,
	"昭和": 1925,
	"大正": 1911,
	"明治": 1867,
  };
  
  const eraStartDates = {
	"令和": new Date("2019-05-01"),
	"平成": new Date("1989-01-08"),
	"昭和": new Date("1926-12-25"),
	"大正": new Date("1912-07-30"),
	"明治": new Date("1868-01-25")
  };
  
  function getWarekiFromYear(year) {
	for (const [name, offset] of Object.entries(eras)) {
	  if (year >= offset + 1) {
		const eraYear = year - offset;
		return `${name}${eraYear}年`;
	  }
	}
	return "対応外";
  }
  
  function populateSelect(id, count) {
	const select = document.getElementById(id);
	select.innerHTML = "";
	for (let i = 1; i <= count; i++) {
	  const option = document.createElement("option");
	  option.value = i;
	  option.textContent = i;
	  select.appendChild(option);
	}
  }
  
  function populateYearsByEra(era) {
	const yearSelect = document.getElementById("year");
	yearSelect.innerHTML = "";
	const currentYear = new Date().getFullYear();
	const maxYear = currentYear - eras[era];
	for (let i = 1; i <= maxYear; i++) {
	  const option = document.createElement("option");
	  option.value = i;
	  option.textContent = i;
	  yearSelect.appendChild(option);
	}
  }
  
  function updateDays() {
	const era = document.getElementById("era").value;
	const year = parseInt(document.getElementById("year").value, 10);
	const month = parseInt(document.getElementById("month").value, 10);
	const fullYear = eras[era] + year;
	const lastDay = new Date(fullYear, month, 0).getDate();
	populateSelect("day", lastDay);
  }
  
  // ========== JST対応済みの更新関数 ==========
  
  function updateWarekiFromSeireki() {
	const date = new Date(document.getElementById("seireki").value);
	const warekiResult = document.getElementById("wareki-result");
	const fiscalResult = document.getElementById("fiscal-wareki");
  
	if (isNaN(date.getTime())) {
	  warekiResult.textContent = "和暦: 無効な日付です";
	  fiscalResult.textContent = "年度: 無効";
	  return;
	}
  
	for (const [name, offset] of Object.entries(eras)) {
	  if (date >= eraStartDates[name]) {
		const year = date.getFullYear() - offset;
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		warekiResult.textContent = `和暦: ${name}${year}年${m}月${d}日`;
  
		const fiscalYear = (date.getMonth() + 1 >= 4) ? date.getFullYear() : date.getFullYear() - 1;
		fiscalResult.textContent = `年度: ${getWarekiFromYear(fiscalYear)}（${fiscalYear}年度）`;
		return;
	  }
	}
  
	warekiResult.textContent = "和暦: 対応外";
	fiscalResult.textContent = "年度: 対応外";
  }
  
  function updateSeirekiFromWareki() {
	const era = document.getElementById("era").value;
	const year = parseInt(document.getElementById("year").value, 10);
	const month = parseInt(document.getElementById("month").value, 10);
	const day = parseInt(document.getElementById("day").value, 10);
	const result = document.getElementById("result");
	const fiscalResult = document.getElementById("fiscal-seireki");
  
	if (!era || !year || !month || !day) return;
  
	const fullYear = eras[era] + year;
	const date = new Date(fullYear, month - 1, day);
  
	if (date < eraStartDates[era]) {
	  result.textContent = `西暦: 無効な和暦（${era}の開始日より前です）`;
	  fiscalResult.textContent = "年度: 無効";
	  return;
	}
  
	if (
	  isNaN(date.getTime()) ||
	  date.getFullYear() !== fullYear ||
	  date.getMonth() !== month - 1 ||
	  date.getDate() !== day
	) {
	  result.textContent = "西暦: 無効な日付です。";
	  fiscalResult.textContent = "年度: 無効";
	  return;
	}
  
	const y = fullYear;
	const m = String(month).padStart(2, "0");
	const d = String(day).padStart(2, "0");
	result.textContent = `西暦: ${y}-${m}-${d}`;
  
	const fiscalYear = month >= 4 ? fullYear : fullYear - 1;
	fiscalResult.textContent = `年度: ${getWarekiFromYear(fiscalYear)}（${fiscalYear}年度）`;
  }
  
  // ========== 初期化処理 ==========
  
  document.addEventListener("DOMContentLoaded", () => {
	populateSelect("month", 12);
	populateYearsByEra(document.getElementById("era").value);
	updateDays();
	updateSeirekiFromWareki();
  
	document.getElementById("era").addEventListener("change", () => {
	  populateYearsByEra(document.getElementById("era").value);
	  updateDays();
	  updateSeirekiFromWareki();
	});
  
	document.getElementById("year").addEventListener("change", () => {
	  updateDays();
	  updateSeirekiFromWareki();
	});
  
	document.getElementById("month").addEventListener("change", () => {
	  updateDays();
	  updateSeirekiFromWareki();
	});
  
	document.getElementById("day").addEventListener("change", updateSeirekiFromWareki);
	document.getElementById("seireki").addEventListener("input", updateWarekiFromSeireki);
  });