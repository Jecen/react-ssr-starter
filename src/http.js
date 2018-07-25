export class HttpError {
  constructor(errorInfo) {
    const {
      message,
      code,
      httpStatus = 200
    } = errorInfo
    this.httpStatus = httpStatus
    this.message = message
    this.code = code

    this.prototype = Object.create(Error.prototype)
    this.prototype.constructor = this
  }
}

HttpError.ERROR_CODE = {
  HTTP_STATUS_ERROR: 'HTTP_STATUS_ERROR',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  TOKEN_EXPIRE: 'TOKEN_EXPIRE',
  RESPONSE_PARSING_FAILED: 'RESPONSE_PARSING_FAILED',
}

class httpWrapper {
  constructor(option) {
    const {
      conf: config = { // request配置相关
        baseUrl: '',
        headers: {},
      },
      before = [], // 前置钩子
      after = [], // 后置钩子
      error = null, // error钩子
      timeout = 5000,
    } = option
    this.config = config
    this.beforeHooks = before
    this.afterHooks = after
    this.errorHook = error
    this.timeout = timeout
  }

  _getQueryData = (query, type = 'string') => {
    if (!query) {
      return null
    }
    const queryList = []
    const formData = new FormData()
    Object.entries(query).map((q) => {
      const [key, val] = q
      if (val.length !== 0 && val) {
        queryList.push(`${key}=${encodeURIComponent(val)}`)
        formData.append(key, val)
      }
    })
    return type === 'string' ? queryList.join('&') : formData
  }

  _getRequestOptions = ({
    opt,
    method,
    params
  }) => {
    const finalOpt = {
      method,
      ...opt
    }
    const headers = Object.assign({}, this.config.headers, opt.headers)
    finalOpt.headers = headers
    if (Object.prototype.toString.call(params) === '[object FormData]') {
      finalOpt.body = params
      return finalOpt
    }
    if (method !== 'GET' &&
      method !== 'OPTION' &&
      params) {
      if (!finalOpt.headers['Content-Type']) {
        finalOpt.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
      }
      const contentType = finalOpt.headers['Content-Type']
      if (contentType.indexOf('application/json') > -1) {
        finalOpt.body = typeof params === 'string' ? params : JSON.stringify(params)
      } else if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
        finalOpt.body = Object.keys(params).map((key) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
          })
          .join('&')
      } else if (contentType.indexOf('multipart/form-data') > -1) {
        finalOpt.body = _getQueryData(params, 'formData')
      }
    }
    return Object.assign({}, this.config, finalOpt)
  }

  _checkResponse = (rsp, reject) => true

  _initUrl = (url, method, opt) => {
    const urlType = url.indexOf('://') !== -1 ? 'FULL' : 'PATH'

    let queryString = null

    let baseUrl = this.config.baseUrl || ''
    if (opt && opt.baseUrl) {
      baseUrl = opt.baseUrl
    }
    let finalUrl = urlType !== 'FULL' ?
      baseUrl + url :
      url

    if (method === 'GET' || method === 'OPTION') {
      queryString = this._getQueryData(params)
      if (queryString && queryString.length) {
        finalUrl += `?${queryString}`
      }
    }

    return finalUrl
  }

  _sendRequest = (fetch, url, method = 'GET', params = {}, opt = {}) => {

    let fetchUrl = this._initUrl(url, method, opt)

    let fetchOpt = this._getRequestOptions({
      opt,
      method,
      params
    })

    const [finalUrl, finalOpt] = this.beforeHooks.reduce(([url, opt], hook) => {
      return hook([url, opt]) || [url, opt];
    }, [fetchUrl, fetchOpt])

    return new Promise((resolve, reject) => {
      let isOver = false
      setTimeout(() => {
        const error = new HttpError({
          message: 'time out !!!',
          code: 'TIME_OUT_CODE',
          httpStatus: 901,
        })
        reject(error)
        !isOver && this.errorHook(error)
        isOver = true
      }, this.timeout);

      fetch(finalUrl, finalOpt)
        .then((rsp) => {
          if (this._checkResponse(rsp, reject)) {
            return rsp.json()
          }
          return {}
        })
        .catch((e) => {
          const error = new HttpError({
            message: e,
            code: HttpError.ERROR_CODE.RESPONSE_PARSING_FAILED,
            httpStatus: null,
          })
          reject(error)
        })
        .then((rsp) => {
          this.afterHooks.forEach(hook => {
            !isOver && hook(rsp, (error) => {
              reject(error)
              !isOver && this.errorHook(error)
              isOver = true
            })
          })
          resolve(rsp)
        })
    })
  }

  injectAfter = (after) => {
    after && this.afterHooks.push(after)
  }

  injectBefore = (before) => {
    before && this.beforeHooks.push(before)
  }

  setError = (onError) => {
    if (onError) {
      this.errorHook = onError
    }
  }

  get(fetch, url, params, opt) {
    return this._sendRequest(fetch, url, 'GET', params, opt)
  }

  post(fetch, url, params, opt) {
    return this._sendRequest(fetch, url, 'POST', params, opt)
  }

  put(fetch, url, params, opt) {
    return this._sendRequest(fetch, url, 'PUT', params, opt)
  }

  option(fetch, url, params, opt) {
    return this._sendRequest(fetch, url, 'OPTION', params, opt)
  }

  delete(fetch, url, params, opt) {
    return this._sendRequest(fetch, url, 'DELETE', params, opt)
  }

}

function creatHttpClient(fetch, option) {

  const clientWrapper = new httpWrapper(option)

  const client = {
    injectAfter: clientWrapper.injectAfter,
    injectBefore: clientWrapper.injectBefore,
    setErrorHook: clientWrapper.setError
  }
  const allowMethod = ['get', 'post', 'put', 'delete', 'option']

  allowMethod.forEach(m => {
    client[m] = async (url, params, opt) => clientWrapper[m](fetch, url, params, opt)
  });

  return client

}

export default creatHttpClient