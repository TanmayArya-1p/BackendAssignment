document.addEventListener("DOMContentLoaded", (event) => {
  fetch("/api/auth/verify", {
    method: "GET",
  }).then((response) => {
    if (["/", "/login", "/register"].includes(window.location.pathname)) {
      if (response.status === 200) {
        window.location.href = "/home";
      }
      try {
        document.getElementById("loader").style.display = "none";
        document.getElementById("content").style.display = "flex";
      } catch (error) {}
    } else {
      if (response.status !== 200) {
        window.location.href = "/";
      }
      try {
        document.getElementById("loader").style.display = "none";
        document.getElementById("content").style.display = "flex";
      } catch (error) {}
    }
  });
});
