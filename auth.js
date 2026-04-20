document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const user   = params.get("user");

  const publicPages = ["/login", "/signup"];
  const path        = window.location.pathname;

  if (!publicPages.includes(path)) {

    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Attach user to all links (except login/signup)
    document.querySelectorAll("a").forEach(link => {
      if (!link.href.includes("login") && !link.href.includes("signup")) {
        if (!link.href.includes("user=")) {
          link.href += (link.href.includes("?") ? "&" : "?") + `user=${user}`;
        }
      }
    });

    // Attach user to forms
    document.querySelectorAll("form").forEach(form => {
      if (!form.action.includes("user=")) {
        form.action += (form.action.includes("?") ? "&" : "?") + `user=${user}`;
      }
    });
  }
});