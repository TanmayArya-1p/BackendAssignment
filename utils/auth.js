export function UnauthorizedResponse(res) {
  res.status(401).send({ message: "Unauthorized" });
  return;
}

export function extractAuthToken(req) {
  if (req.headers.authorization) {
    var authToken = req.headers.authorization.slice("Bearer ".length);
  } else if (req.cookies.authToken) {
    var authToken = req.cookies.authToken;
  } else {
    return null;
  }
  return authToken;
}

export function extractRefreshToken(req) {
  if (req.headers.refreshToken) {
    var refreshToken = req.headers.refreshToken;
  } else if (req.cookies.refreshToken) {
    var refreshToken = req.cookies.refreshToken;
  } else {
    return null;
  }
  return refreshToken;
}

export const CUSTOMER = 1;
export const CHEF = 2;
export const ADMIN = 3;
export const roleMap = { customer: CUSTOMER, admin: ADMIN, chef: CHEF };
