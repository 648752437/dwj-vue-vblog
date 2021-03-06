// import Fuse from 'fuse.js'
import fecha from 'fecha'
import { MetricMaps } from 'utils/metrics'
import Vue from 'vue'
// eslint-disable-next-line
Date.prototype.format = function (fmt = 'yyyy-MM-dd HH:mm:ss') {
  let o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    'S': this.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

export function time2str (time, fmt) {
  return fecha.format(time, fmt)
}

export function time2sec (time) {
  return Math.round(time.getTime() / 1000)
}

export function sec2time (sec) {
  return new Date(sec * 1000)
}

export function msec2time (msec) {
  return new Date(msec)
}

export function sec2str (sec, fmt) {
  return sec2time(sec).format(fmt)
}

export function msec2str (msec, fmt) {
  return msec2time(msec).format(fmt)
}

export function checkEmail (email) {
  return /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/.test(email)
}

export function checkIp (ip) {
  return /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(ip)
}

export function checkSuccessCode (code) {
  if (!code) return false
  return true
}

export function checkSpecialRelatedField (data) {
  if (!data) return false
  return true
}

export function checkPositiveNumber (number) {
  return /^([1-9])+([0-9])*$/.test(number)
}

export function fuseSearch (candidates, keys, query, insensitive = false) {
  if (!Array.isArray(candidates) || candidates.length === 0) return []
  // return query ? new Fuse(candidates, { keys }).search(query) : candidates
  query = query.trim()
  if (!query) return candidates
  return candidates.filter(item => keys.some(key => {
    let val = item[key] ? item[key].toUpperCase() : ''
    if (insensitive) return val.indexOf(query.toUpperCase()) > -1
    return item[key].indexOf(query) > -1
  }))
}

export const AuthorityLevel = {
  superAdmin: 0,
  admin: 1,
  viewer: 2
}

export function confirmTip (self, config) {
  let boxType = config.boxType || 'confirm'
  if (boxType === 'confirm') {
    self.$confirm(config.body, config.head, {
      confirmButtonText: config.confirmButtonText || '确定',
      cancelButtonText: config.cancelButtonText || '取消',
      confirmButtonClass: 'el-button--' + (config.confirmButtonClass || 'primary'),
      type: config.type || 'warning',
      center: true
    }).then(() => {
      let callback = config.callback()
      if (typeof callback === 'object' && typeof callback.then === 'function') {
        callback.then(args => {
          typeof config.success === 'function' && config.success(args)
          successTip(self, config.successMessage)
        }).catch(error => {
          typeof config.error === 'function' && config.error(error)
          errorTip(self, error, config.errorMessage)
        })
      } else {
        typeof config.success === 'function' && config.success()
        successTip(self, config.successMessage)
      }
    }).catch(() => {
      typeof config.cancel === 'function' && config.cancel()
      cancelTip(self, config.cancelMessage)
    })
  } else if (boxType === 'prompt') {
    self.$prompt(config.body, config.head, {
      confirmButtonText: config.confirmButtonText || '确定',
      cancelButtonText: config.cancelButtonText || '取消',
      inputPattern: config.inputPattern || /.+/,
      inputValidator: config.inputValidator,
      center: true,
      ...(typeof config.value !== 'undefined' ? { inputValue: config.value } : {})
    }).then(({ value }) => {
      let callback = config.callback(value)
      if (typeof callback === 'object' && typeof callback.then === 'function') {
        callback.then(args => {
          typeof config.success === 'function' && config.success(args)
          successTip(self, config.successMessage)
        }).catch(error => {
          typeof config.error === 'function' && config.error(error)
          errorTip(self, error, config.errorMessage)
        })
      } else {
        typeof config.success === 'function' && config.success()
        successTip(self, config.successMessage)
      }
    }).catch(() => {
      typeof config.cancel === 'function' && config.cancel()
      cancelTip(self, config.cancelMessage)
    })
  }
}

export function infoTip (self, infoMessage) {
  self.$message({
    type: 'info',
    message: infoMessage || '无提示',
    center: true
  })
}

export function cancelTip (self, cancelMessage) {
  self.$message({
    type: 'info',
    message: cancelMessage || '已取消',
    center: true
  })
}

export function successTip (self, successMessage) {
  self.$message({
    type: 'success',
    message: successMessage || '操作成功',
    center: true
  })
}

export function errorTip (self, error, errorMessage) {
  let message = translate(error.message || error.msg || '出错了，请重试')
  console.log(error, message)
  self.$message({
    type: 'error',
    message: errorMessage || message,
    center: true,
    duration: (error.message && error.message.indexOf('Network Error') !== -1) ? 8000 : 3000
  })
  return message
}

function translate (message) {
  if (message.indexOf('timeout') !== -1) {
    return '请求超时'
  } else if (message.indexOf('Network Error') !== -1) {
    return '网络错误'
  } else if (message.indexOf('Unauthorized') !== -1) {
    return '认证失败'
  } else if (message.indexOf('Kpi does not exist') !== -1) {
    return 'Kpi不存在'
  } else if (message.indexOf('Kpi: name already exist') !== -1) {
    return 'Kpi名称已存在'
  } else if (message.indexOf('Name already existed') !== -1) {
    return '名称已存在'
  } else if (message.indexOf('taskError') === 0) {
    return message.replace('taskError', '错误')
  } else if (message.indexOf('user already existed') !== -1) {
    return message.replace('user already existed', '用户已存在')
  } else if (message.indexOf('simpleTrain') === 0) {
    return message.replace('simpleTrain.', '训练错误: ')
  } else if (message.indexOf('Activated kpi can not be deleted') !== -1) {
    return 'Kpi已激活，无法删除，请先停用Kpi后再删除'
  } else if (message.indexOf('A JSONObject text must begin with') !== -1) {
    return '无效的JSON Object'
  } else if (message.startsWith('#')) {
    return message.replace(/#([^\n]+): expected type: (\S+), found: (\S+)/, '$1: $3, 期望 $2 类型')
                  .replace(/#: required key \[(\S+)\] not found/, '缺失必要字段: $1')
                  .replace(/#.*?: extraneous key \[(\S+)\] is not permitted/, '存在无关字段: $1')
                  .replace(/#: (\d+) schema violations found/, '发现 $1 个不合法设置')
  } else {
    return '出错了，请重试'
  }
}

// 指标等文案翻译
export function translateColumnText (text, type = 'metric') {
  if (type === 'metric') {
    return MetricMaps[text] ? `${MetricMaps[text]}` : text
  }
  return text
}
// 通配符转换为正则
export function wildcardToRegex (glob) {
  let result = '^'
  let i = 0
  while (i < glob.length) {
    let c = glob.charAt(i)
    switch (c) {
      case '*': result += '.*'; break
      case '?': result += '.'; break
      case '^': result += '\\^'; break
      case '.': result += '\\.'; break
      case '\\': result += '\\\\'; break
      default: result += c; break
    }
    i += 1
  }
  result += '$'
  return result
}
// event bus
export const eventBus = new Vue()
// 嵌入平台化日志分析结果的页面前缀
export const AIOPS_WEB_PREFIX = process.env.AIOPS_WEB_PREFIX
