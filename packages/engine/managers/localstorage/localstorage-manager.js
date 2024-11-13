export class LocalStorageManager extends EventTarget {
  getJwt() {
    const jwtString = localStorage.getItem('jwt');
    const jwt = jwtString ?
      JSON.parse(jwtString)
    :
      null;
    return jwt;
  }
  setJwt(jwt) {
    const jwtString = JSON.stringify(jwt);
    localStorage.setItem('jwt', jwtString);

    this.dispatchEvent(new MessageEvent('jwtupdate', {
      data: {
        jwt,
      },
    }));
  }
  deleteJwt() {
    localStorage.removeItem('jwt');

    this.dispatchEvent(new MessageEvent('jwtupdate', {
      data: {
        jwt: null,
      },
    }));
  }

  getAccessToken() {
    const accessToken = localStorage.getItem('accessToken');
    return accessToken;
  }
  setAccessToken(accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
  deleteAccessToken() {
    localStorage.removeItem('accessToken');
  }

  usedAutoLogin() {
    return localStorage.getItem('usedAutoLogin') === (true + '');
  }
  setUsedAutoLogin(usedAutoLogin) {
    localStorage.setItem('usedAutoLogin', usedAutoLogin);
  }

  getControlsVisible() {
    const controlsVisibleString = localStorage.getItem('controlsVisible');
    const controlsVisible = controlsVisibleString ?
      JSON.parse(controlsVisibleString)
    :
      true;
    return controlsVisible;
  }
  setControlsVisible(controlsVisible) {
    const controlsVisibleString = JSON.stringify(controlsVisible);
    localStorage.setItem('controlsVisible', controlsVisibleString);

    this.dispatchEvent(new MessageEvent('controlsvisibleupdate', {
      data: {
        controlsVisible,
      },
    }));
  }
  toggleControlsVisible() {
    this.setControlsVisible(!this.getControlsVisible());
  }

  getConfig(key) {
    const k = 'config.' + key;
    const valueString = localStorage.getItem(k);
    const value = valueString ?
      JSON.parse(valueString)
    :
      null;
    return value;
  }
  setConfig(key, value) {
    const k = 'config.' + key;
    const valueString = JSON.stringify(value);
    localStorage.setItem(k, valueString);
  }
}