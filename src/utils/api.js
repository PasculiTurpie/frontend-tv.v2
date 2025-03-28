class Api{
  constructor(url) {
    this.url = url;
  }
  _getEquipos() {
    return fetch(this.url + '/equipment')
  }

}

const api = new Api('http://localhost:3000/api/v2');

export default api;