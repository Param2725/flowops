const REFRESH_KEY = 'flowops.refreshToken';

let accessToken = null;
let refreshHandler = null;

const readRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
};

const writeRefreshToken = (token) => {
  try {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  } catch {
    // storage unavailable (private mode): the session just won't survive a reload
  }
};

export const session = {
  getAccessToken: () => accessToken,
  setAccessToken: (token) => {
    accessToken = token;
  },
  getRefreshToken: readRefreshToken,
  setRefreshToken: writeRefreshToken,
  clearRefreshToken: () => writeRefreshToken(null),
  setRefreshHandler: (handler) => {
    refreshHandler = handler;
  },
  refresh: () => (refreshHandler ? refreshHandler() : Promise.resolve(false)),
};
