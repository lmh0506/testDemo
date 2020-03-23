
import gcoord from 'gcoord'
import { Toast } from 'vant'

/**
 * data = {}, 提交的参数
 * api, 接口方法
 * successMsg = '提交成功',  成功提示
 * failMsg, 失败提示
 * success, 成功回调
 * fail, 失败回调
 * complete 完成回调（无论成功失败）
 */
export async function saveLoading ({
  data = {},
  api,
  successMsg = '提交成功',
  failMsg,
  success,
  fail,
  complete
}) {
  let loading = Toast.loading({
    duration: 0, // 持续展示 toast
    forbidClick: true
  })

  let res = await api(data)

  loading.clear()

  if (res.success) {
    Toast.success(successMsg)
    success && success(res)
  } else {
    Toast(failMsg || res.message)
    fail && fail(res)
  }
  complete && complete(res)
}

// 坐标转换  flag为true  高德--->wgs84  false wgs84--->高德
export function transformPoint (lon, lat, flag) {
  let newPoint = flag ? gcoord.transform([lon * 1, lat * 1], gcoord.AMap, gcoord.WGS84) : gcoord.transform([lon * 1, lat * 1], gcoord.WGS84, gcoord.AMap)
  let newlonLat = {
    longitude: newPoint[0],
    latitude: newPoint[1]
  }
  return newlonLat
}

/* 判断是否为json */
export function isJSON (val) {
  try {
    if (Object.prototype.toString.call(val) === '[object Object]') {
      return true
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

// 格式化时间
export function dateFmt (fmt, date) {
  var o = {
    'y+': date.getFullYear(), // 年
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) { fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length)) }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) { fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))) }
  }
  return fmt
}

// 深拷贝
export function deepCopy (obj) {
  var result = Array.isArray(obj) ? [] : {}
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = deepCopy(obj[key]) // 递归复制
      } else {
        result[key] = obj[key]
      }
    }
  }
  return result
}

//  判断手机类型
export function judgeDeviceType () {
  var ua = window.navigator.userAgent.toLocaleLowerCase()
  var isIOS = /iphone|ipad|ipod/.test(ua)
  var isAndroid = /android/.test(ua)
  var isMiuiBrowser = /miuibrowser/.test(ua)

  return {
    isIOS: isIOS,
    isAndroid: isAndroid,
    isMiuiBrowser: isMiuiBrowser
  }
}
