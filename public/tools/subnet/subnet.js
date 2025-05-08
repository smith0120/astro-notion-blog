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
  
	let detailedBlock = null;
	const simplifiedRows = [];
  
	subnets.forEach(s => {
	  const networkInt = ipToInt(s.network);
	  const broadcastInt = ipToInt(s.broadcast);
	  const isMatch = inputIPInt >= networkInt && inputIPInt <= broadcastInt;
  
	  if (isMatch) {
		detailedBlock = `
		  <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; background-color: #ffe5e5;">
			<strong>${s.cidr}</strong>
			<ul>
			  <li>ネットワークアドレス: ${s.network}</li>
			  <li>ブロードキャストアドレス: ${s.broadcast}</li>
			  <li>IPアドレス数: ${s.totalIPs}（利用可能ホスト数: ${s.usableHosts}）</li>
			  <li>使用可能範囲: ${s.usableRange}</li>
			  <li>サブネットマスク: ${s.mask}</li>
			</ul>
		  </div>`;
	  }
  
	  simplifiedRows.push(`
		<tr style="background-color: ${isMatch ? '#ffe5e5' : 'transparent'};">
		  <td>${s.network}</td>
		  <td>/${maskBits} (${s.mask})</td>
		  <td>${s.network} ～ ${s.broadcast}</td>
		  <td>${s.usableRange}</td>
		</tr>`);
	});
  
	html += detailedBlock ?? "<p>該当するサブネットが見つかりませんでした。</p>";
  
	html += `<hr><h3>その他のサブネット一覧</h3>`;
	html += `
	  <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; min-width: 800px;">
		<thead style="background-color: #f0f0f0;">
		  <tr>
			<th>ネットワークアドレス</th>
			<th>サブネットマスク</th>
			<th>IPアドレス範囲</th>
			<th>利用可能IPアドレス範囲</th>
		  </tr>
		</thead>
		<tbody>
		  ${simplifiedRows.join("\n")}
		</tbody>
	  </table>
	`;
  
	document.getElementById("result").innerHTML = html;
  }
  
  function listSubnets(baseIP, maskBits) {
	const baseInt = ipToInt(baseIP);
	const subnetSize = Math.pow(2, 32 - maskBits);
	const subnets = [];
  
	// グループ単位決定
	let groupBits = 24;
	if (maskBits <= 23 && maskBits >= 16) groupBits = 16;
	else if (maskBits <= 15 && maskBits >= 8) groupBits = 8;
	else if (maskBits < 8) groupBits = 0;
  
	const groupMask = (0xFFFFFFFF << (32 - groupBits)) >>> 0;
	const groupBaseInt = baseInt & groupMask;
	const groupSize = Math.pow(2, 32 - groupBits);
	const groupEnd = groupBaseInt + groupSize;
  
	for (let net = groupBaseInt; net < groupEnd; net += subnetSize) {
	  const maskInt = (0xFFFFFFFF << (32 - maskBits)) >>> 0;
	  const networkInt = net;
	  const broadcastInt = networkInt | (~maskInt >>> 0);
	  const totalIPs = Math.pow(2, 32 - maskBits);
	  const usableHosts = maskBits >= 31 ? 0 : totalIPs - 2;
  
	  subnets.push({
		cidr: `${intToIP(networkInt)}/${maskBits}`,
		network: intToIP(networkInt),
		broadcast: intToIP(broadcastInt),
		usableRange: maskBits >= 31 ? 'なし' : `${intToIP(networkInt + 1)} 〜 ${intToIP(broadcastInt - 1)}`,
		totalIPs,
		usableHosts,
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