import Exchange from '../exchange'

export default class extends Exchange {
  id = 'BTCEX'
  protected endpoints = {
    PRODUCTS: ['https://api.btcex.com/api/v1']
  }

  async getUrl(pair) {
    if (/-SPOT$/.test(pair)) {
      return 'wss://api.btcex.com/ws/api/v1'
    }
  }

  formatProducts(data) {
    return data.map(product => product.id)
  }

  /**
   * Sub
   * @param {WebSocket} api
   * @param {string} pair
   */
  async subscribe(api: WebSocket, pair: string): Promise<boolean> {
    if (!(await super.subscribe(api, pair))) {
      return
    }

    if (/-SPOT$/.test(pair)) {
      api.send(
        JSON.stringify({
          topic: 'trade',
          event: 'sub',
          params: { binary: false, symbol: pair.replace(/-SPOT$/, '') }
        })
      )
    } else {
      api.send(
        JSON.stringify({
          op: 'subscribe',
          args: ['trade.' + pair, 'liquidation.' + pair]
        })
      )
    }

    return true
  }
}
