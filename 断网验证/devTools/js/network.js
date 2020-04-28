// 点击确定
document.getElementById('confirm').addEventListener('click', function () {
	nowAllowArr = [
		getValue(1),
		getValue(2),
		getValue(3)
	]
	chrome.storage.local.set({
		values: nowAllowArr
	})
})
// 点击清除日志
document.getElementById('clear').addEventListener('click', function () {
	let ps = document.getElementById('content').getElementsByTagName('p')
	let l = ps.length;
	for (let i = 0; i < l; i++) {
		ps[0].remove()
	}
})


// 获取inpt值
let getValue = function (num) {
	return document.getElementById('input' + num).value;
}
// 设置inpt值
let setValue = function (num, arr) {
	document.getElementById('input' + num).value = (arr && arr[num - 1]) || '';
}

// 仅控制http、https、ws、wss
let checkProtocol = function (url) {
	let urlLower = url.toLowerCase()
	if (urlLower.indexOf('http') == 0 || urlLower.indexOf('ws') == 0) {
		return true
	}
	return false
}

// 数组中是否存在值
let isValidArr = function (arr) {
	let flag = false
	for (let i = 0; i < arr.length; i++) {
		flag = flag || arr[i]
	}
	return flag
}

// 判断url是否包含特定字符串
let checkArr = function (url, allowArr) {
	let checkFun = function (url, allowValue) {
		let flag = allowValue ? url.indexOf(allowValue) < 0 : true
		return flag
	}
	debugger
	let arrFlag = true
	for (let i = 0; i < allowArr.length; i++) {
		arrFlag = arrFlag && checkFun(url, allowArr[i])
	}
	return arrFlag
}

// 判断url是否包含允许的字符串
let checkAllow = function (url, allowArr) {
	return checkProtocol(url) && isValidArr(allowArr) && checkArr(url, allowArr)
}

let nowAllowArr = []

chrome.devtools.network.onRequestFinished.addListener(async (...args) => {
	try {
		const [{
			request: {
				url
			},
		}] = args;
		if (checkAllow(url, nowAllowArr)) {
			let p = document.createElement('p')
			p.innerHTML = url
			document.getElementById('content').appendChild(p)
		}
	} catch (err) {
		log(err.stack || err.toString());
	}
});



chrome.storage.local.get(['values'], function (result) {
	nowAllowArr = result.values
	setValue(1, nowAllowArr)
	setValue(2, nowAllowArr)
	setValue(3, nowAllowArr)
})