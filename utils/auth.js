export function UnauthorizedResponse(res) {
  res.status(401).send({ message: "Unauthorized" });
  return;
}

function extractAuthToken(req) {
  if (req.headers.authorization) {
    var authToken = req.headers.authorization.slice("Bearer ".length);
  } else if (req.cookies.authToken) {
    var authToken = req.cookies.authToken;
  } else {
    return null;
  }
  return authToken;
}

function extractRefreshToken(req) {
  if (req.headers.refreshToken) {
    var refreshToken = req.headers.refreshToken;
  } else if (req.cookies.refreshToken) {
    var refreshToken = req.cookies.refreshToken;
  } else {
    return null;
  }
  return refreshToken;
}
