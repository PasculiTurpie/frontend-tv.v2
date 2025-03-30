class Api{
  constructor(url) {
    this.url = url;
  }
  _getEquipos() {
    return fetch(this.url + '/equipment')
  }

}

const api = new Api('http://172.19.14.135:5000/api/v2');

export default api;