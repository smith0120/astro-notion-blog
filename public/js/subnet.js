document.addEventListener("DOMContentLoaded", () => {
	const maskSelect = document.getElementById("mask");
	for (let i = 1; i <= 32; i++) {
	  const option = document.createElement("option");
	  option.value = i;
	  option.textContent = `/${i} (${intToIP((0xFFFFFFFF << (32 - i)) >>> 0)})`;
	  maskSelect.appendChild(option);
	}
  });
  
  function calculate() {
	const ip = document.getElementById("ip").value.trim();
	const maskBits = parseInt(document.getElementById("mask").value, 10);
  
	if (!validateIP(ip)) {
	  document.getElementById("result").innerHTML = "無効なIPアドレスです。";
	  return;
	}
  
	const inputIPInt = ipToInt(ip);
	const subnets = listSubnets(ip, maskBits);
	let html = "";
  
	const simplifiedLines = [];

	subnets.forEach(s => {
		const networkInt = ipToInt(s.network);
		const broadcastInt = ipToInt(s.broadcast);
		const isMatch = inputIPInt >= networkInt && inputIPInt <= broadcastInt;
	  
		simplifiedLines.push(`
		  <div class="subnet-line${isMatch ? ' highlight' : ''}">
			${s.network} [${s.network} ～ ${s.broadcast}]
		  </div>
		`);
	
	  // 上部の詳細カード表示も維持
	  if (isMatch && !html.includes("subnet-card")) {
		html += `
		  <div class="subnet-card highlight">
			<strong>${s.cidr}</strong><br /><br />
<hr />
■ネットワークアドレス:<br />
  <strong>${s.network}</strong><br />
<hr />
■サブネットマスク:<br />
  <strong>${s.mask}</strong><br />
<hr />
 ■IPアドレス範囲:<br />
  <strong>${s.network} ～ ${s.broadcast}</strong><br />
<hr />
 ■利用可能範囲:<br />
  <strong>${s.usableRange}</strong><br />
<hr />
 ■IPアドレス数:<br />
  <strong>${s.totalIPs}（利用可能ホスト数: ${s.usableHosts}）</strong><br />
<br />
		  </div>`;
	  }
	});
  
	if (!html) {
	  html = "<p>該当するサブネットが見つかりませんでした。</p>";
	}
  
	if (simplifiedLines.length) {
	  html += `<hr><h3>その他のサブネット一覧</h3>`;
	  html += simplifiedLines.join("\n");
	}
  
	document.getElementById("result").innerHTML = html;
  }
  
  function listSubnets(baseIP, maskBits) {
	const baseInt = ipToInt(baseIP);
	const subnetSize = Math.pow(2, 32 - maskBits);
	const subnets = [];
  
	let groupBits = 24;
	if (maskBits <= 23 && maskBits >= 16) groupBits = 16;
	else if (maskBits <= 15 && maskBits >= 8) groupBits = 8;
	else if (maskBits < 8) groupBits = 0;
  
	const groupMask = (groupBits === 0) ? 0 : (0xFFFFFFFF << (32 - groupBits)) >>> 0;
	const groupBaseInt = baseInt & groupMask;
	const groupSize = groupBits === 0 ? Math.pow(2, 32) : Math.pow(2, 32 - groupBits);
	const groupEnd = groupBaseInt + groupSize;
  
	for (let net = groupBaseInt; net < groupEnd; net += subnetSize) {
	  const maskInt = (0xFFFFFFFF << (32 - maskBits)) >>> 0;
	  const networkInt = net >>> 0;
	  const broadcastInt = (networkInt | (~maskInt)) >>> 0;
	  const totalIPs = Math.pow(2, 32 - maskBits);
	  const usableHosts = maskBits >= 31 ? 0 : totalIPs - 2;
	  const usableRange = maskBits >= 31 ? "なし" : `${intToIP(networkInt + 1)} ～ ${intToIP(broadcastInt - 1)}`;
  
	  subnets.push({
		cidr: `${intToIP(networkInt)}/${maskBits}`,
		network: intToIP(networkInt),
		broadcast: intToIP(broadcastInt),
		totalIPs,
		usableHosts,
		usableRange,
		mask: intToIP(maskInt)
	  });
	}
  
	return subnets;
  }
  
  function validateIP(ip) {
	const regex = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
	return regex.test(ip);
  }
  
  function ipToInt(ip) {
	return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }
  
  function intToIP(int) {
	return [int >>> 24, (int >>> 16) & 0xFF, (int >>> 8) & 0xFF, int & 0xFF].join('.');
  }