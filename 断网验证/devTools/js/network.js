// 全局变量
let nowAllowArr = [];
let nowOffline = false;

// 获取inpt值
let getValue = function (num) {
	return document.getElementById('input' + num).value;
}
// 设置inpt值
let setValue = function (num, arr) {
	document.getElementById('input' + num).value = (arr && arr[num - 1]) || '';
}

// 打印日志
let addLog = function (log) {
	let p = document.createElement('p')
	p.innerHTML = log
	document.getElementById('content').appendChild(p)
}

let addHeadLog = function (log) {
	let p = document.createElement('p')
	p.innerHTML = log
	let content = document.getElementById('content')
	content.insertBefore(p, content.childNodes[0])
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

let setAllowArr = function () {
	nowAllowArr = [
		getValue(1),
		getValue(2),
		getValue(3)
	]
	// 缓存中存储
	chrome.storage.local.set({
		allowArr: nowAllowArr
	})

	// 通知background
	chrome.runtime.sendMessage({
		type: 'allowArr',
		allowArr: nowAllowArr
	});
}

let setOffline = function () {
	nowOffline = document.getElementById('offline').checked
	chrome.storage.local.set({
		offline: nowOffline
	})
	// 通知background
	chrome.runtime.sendMessage({
		type: 'offline',
		offline: nowOffline
	});
}

// 点击确定
document.getElementById('confirm').addEventListener('click', function () {
	setAllowArr()
	setOffline()
	addHeadLog('确认成功')
})



// 点击清除日志
document.getElementById('clear').addEventListener('click', function () {
	let ps = document.getElementById('content').getElementsByTagName('p')
	let l = ps.length;
	for (let i = 0; i < l; i++) {
		ps[0].remove()
	}
})


// 点击重置
document.getElementById('clearSet').addEventListener('click', function () {
	setValue(1, '')
	setValue(2, '')
	setValue(3, '')
	setAllowArr()
	document.getElementById('offline').checked = false
	setOffline(false)
	addHeadLog('重置成功')
})

// 请求完成之后的监听
// 如果拦截的话不会进入此监听，因此提示信息换一种实现方式
// chrome.devtools.network.onRequestFinished.addListener(async (...args) => {
// 	try {
// 		const [{
// 			request: {
// 				url
// 			},
// 		}] = args;
// 		if (checkAllow(url, nowAllowArr)) {
// 			let p = document.createElement('p')
// 			p.innerHTML = url
// 			document.getElementById('content').appendChild(p)
// 		}
// 	} catch (err) {
// 		log(err.stack || err.toString());
// 	}
// });

// 接收background的消息用于显示日志
chrome.runtime.onMessage.addListener(msg => {
	if (msg.type === 'addUrl') {
		addLog(msg.url)
	}
});



// 获取缓存中的数据，用于展示
chrome.storage.local.get(['allowArr', 'offline'], function (result) {
	let {
		allowArr,
		offline
	} = result
	nowAllowArr = allowArr;
	nowOffline = offline;
	setValue(1, allowArr)
	setValue(2, allowArr)
	setValue(3, allowArr)
	document.getElementById('offline').checked = offline
})