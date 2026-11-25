/*
 * Prime Mover (formerly HowWeMove)
 * Copyright (c) 2026 Miloš Milinkov. All rights reserved.
 *
 * Keeps old links working: howwemove.milos300399.workers.dev/<path> forwards
 * permanently to the same path on the renamed site.
 */
const TARGET = 'https://prime-mover.milos300399.workers.dev';

export default {
  fetch(request) {
    const { pathname, search } = new URL(request.url);
    return Response.redirect(TARGET + pathname + search, 301);
  },
};
