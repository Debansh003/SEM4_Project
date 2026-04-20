document.addEventListener('DOMContentLoaded', () => {

  const params     = new URLSearchParams(window.location.search);
  const user       = params.get('user');
  const publicPages = ['/login', '/signup'];
  const path       = window.location.pathname;

  if (!publicPages.includes(path)) {

    if (!user) {
      window.location.href = '/login';
      return;
    }

    // Attach user= to all non-auth links
    document.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (href.includes('login') || href.includes('signup')) return;
      if (href.includes('user=')) return;
      link.href = href + (href.includes('?') ? '&' : '?') + `user=${user}`;
    });

    // Attach user= to forms
    document.querySelectorAll('form').forEach(form => {
      if (form.action.includes('user=')) return;
      form.action = form.action + (form.action.includes('?') ? '&' : '?') + `user=${user}`;
    });
  }
});