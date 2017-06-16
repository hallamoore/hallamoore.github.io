class MetricsReporter {
  constructor() {
    this._sendInitialData()
  }

  sendData(data) {
    return new Promise((resolve, reject) => {
      const d = JSON.stringify(data)
      let url = 'https://script.google.com/macros/s/AKfycbyGuCpzggfP8Z_KBhCg5dvYdhcS0aAxXQW2Iparc07pAee7xUE/exec'
      url += '?data=' + d
      if (this.id) {
        url += '&id=' + this.id
      }
      const req = new XMLHttpRequest()
      req.onload = () => {
        if (req.status === 200) {
          this.id = req.response
          resolve()
        } else {
          reject()
        }
      }
      req.open('get', url)
      req.send()
    })
  }

  _sendInitialData() {
    const data = {
      timestamp: (new Date()).toString(),
      windowLocation: location.toString(),
      referrer: document.referrer,
      language: navigator.language,
      userAgent: navigator.userAgent,
      cookieEnabled: navigator.cookieEnabled,
      screenWidth: screen.width,
      screenHeight: screen.height,
    }
    this.sendData(data).then(() => this._sendAsyncData())
  }

  async _sendAsyncData() {
    const ipData = await this._getIP()
    this.sendData(ipData)
  }

  _getIP() {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest()
      req.onload = () => {
        let ipData;
        try {
          ipData = JSON.parse(req.response)
        } catch (e) {
          ipData = {'ip': req.response}
        }
        resolve(ipData)
      }
      req.open('get', 'https://mathiasbynens.be/demo/ip')
      req.send()
    })
  }
}

window.onload = () => {
  window._hhMetricsReporter = new MetricsReporter();
}
