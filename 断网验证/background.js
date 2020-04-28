// 全局变量
let nowAllowArr = [];
let nowOffline = false;

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

// 接受来自network的消息
chrome.runtime.onMessage.addListener(msg => {
  if(msg.type === 'allowArr'){
    nowAllowArr = msg.allowArr
  }
  if(msg.type === 'offline'){
    nowOffline = msg.offline
  }
});

// 请求的before事件，用于对请求进行拦截操作
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    let url = details.url
    let cancel = checkAllow(url,nowAllowArr)
    // 通知network.js用于添加显示日志
    if(cancel){
      chrome.runtime.sendMessage({
        type: 'addUrl',
        url: url
      });
    }
    if(!nowOffline){
      cancel = false
    }
    
    return {cancel: cancel};
  },
  {urls: ["<all_urls>"]}, 
//   {
//     urls: ["*://*/*"],
//     types: ["script"]
// },
  // 要执行的操作，这里配置为阻断
  ["blocking"]
);

// 获取缓存中的数据，退出浏览器之后background中的变量会重置
chrome.storage.local.get(['allowArr', 'offline'], function (result,ss) {
	let {
		allowArr,
		offline
	} = result
	nowAllowArr = allowArr;
	nowOffline = offline;
})