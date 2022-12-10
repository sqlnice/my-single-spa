const H = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  get registerApplication() {
    return ft;
  },
  get getAppNames() {
    return G;
  },
  get start() {
    return et;
  }
}, Symbol.toStringTag, { value: "Module" })), S = "NOT_LOADED", j = "LOAD_RESOURCE_CODE", B = "NOT_BOOTSTRAPPED", V = "BOOTSTRAPPING", v = "NOT_MOUNTED", x = "MOUNTING", E = "MOUNTED", z = "UNMOUNTING", f = "SKIP_BEACUSE_BROKEN", w = "LOAD_ERROR";
function _(t) {
  return t.status !== f;
}
function J(t) {
  return t.status !== w;
}
function C(t) {
  return t.status !== S && t.status !== w && t.status !== j;
}
function q(t) {
  return !C(t);
}
function N(t) {
  return t.status === E;
}
function Q(t) {
  return !N(t);
}
function $(t) {
  try {
    return t.activityWhen(window.location);
  } catch (e) {
    throw t.status = f, e;
  }
}
function X(t) {
  try {
    return !t.activityWhen(window.location);
  } catch (e) {
    throw t.status = f, e;
  }
}
const L = /^(hashchange|popstate)$/i, A = {
  hashchange: [],
  popstate: []
};
function P() {
  y([], arguments);
}
window.addEventListener("hashchange", P);
window.addEventListener("popstate", P);
const Y = window.addEventListener, Z = window.removeEventListener;
window.addEventListener = function(t, e) {
  if (t && L.test(t) && typeof e == "function") {
    const n = A[t];
    n.indexOf(e) === -1 && n.push(e);
  }
  return Y.apply(this, arguments);
};
window.removeEventListener = function(t, e) {
  if (t && L.test(t) && typeof e == "function") {
    const n = A[t];
    n.indexOf(e) > -1 && (A[t] = n.filter((o) => o !== e));
  }
  return Z.apply(this, arguments);
};
const p = window.history.pushState, tt = window.history.replaceState;
window.history.pushState = function(t, e, n) {
  const o = p.apply(this, arguments);
  return P(new PopStateEvent("popstate", { state: t })), o;
};
window.history.replaceState = function(t, e, n) {
  const o = tt.apply(this, arguments);
  return P(new PopStateEvent("popstate", { state: t })), o;
};
function a(t) {
  if (!t)
    return;
  Array.isArray(t) && (t = t[0]);
  const e = t.type;
  !L.test(e) || A[e].forEach((n) => n.apply(window, t));
}
let g = !1;
function et() {
  if (!g)
    return g = !0, y();
}
function nt() {
  return g;
}
const ot = {
  bootstrap: {
    millisecond: 3e3,
    rejectWhenTimeout: !1
  },
  mount: {
    millisecond: 3e3,
    rejectWhenTimeout: !1
  },
  unmount: {
    millisecond: 3e3,
    rejectWhenTimeout: !1
  },
  unload: {
    millisecond: 3e3,
    rejectWhenTimeout: !1
  }
};
function rt(t = {}) {
  return {
    ...ot,
    ...t
  };
}
function U(t, e, n) {
  return new Promise((o, u) => {
    let i = !1;
    t.then((r) => {
      i = !0, o(r);
    }).catch((r) => {
      i = !0, u(r);
    }), setTimeout(() => s(), n.millisecond);
    function s() {
      if (i)
        return;
      const r = `${e} \u6CA1\u6709\u5728 ${n.millisecond} \u65F6\u95F4\u5185 resolve \u6216 reject`;
      n.rejectWhenTimeout ? u(new Error(r)) : console.error(r);
    }
  });
}
function d(t) {
  return {
    ...t.customProps,
    name: t.name,
    mySingleSpa: H
  };
}
function I(t) {
  return t instanceof Promise ? !0 : typeof t == "object" && typeof t.then == "function" && typeof t.catch == "function";
}
function st(t) {
  return typeof t == "function" ? !0 : Array.isArray(t) ? t.filter((e) => typeof e != "function").length === 0 : !1;
}
function m(t = []) {
  return Array.isArray(t) || (t = [t]), t.length === 0 && (t = [() => Promise.resolve()]), function(e) {
    return new Promise((n, o) => {
      u(0);
      function u(i) {
        const s = t[i](e);
        if (!I(s)) {
          o(`${s} \u672A\u8FD4\u56DE promise`);
          return;
        }
        s.then(() => {
          i === t.length - 1 ? n() : u(++i);
        }).catch((r) => {
          o(r);
        });
      }
    });
  };
}
function W(t) {
  if (t.status !== E)
    return Promise.resolve(t);
  t.status = z;
  function e(o) {
    return U(t.unmount(d(t)), `app: ${t.name} unmounting`, t.timeouts.unmount).catch((u) => {
      console.log(u), t.status = f;
    }).then(() => (t.status !== f && (t.status = o === !0 ? f : v), t));
  }
  return Promise.all(Object.keys(t.services).map((o) => t.services[o].unmountSelf())).catch((o) => (console.log(o), !0)).then(e);
}
function R(t) {
  if (t.status !== S && t.status !== w)
    return Promise.resolve(t);
  t.status = j;
  const e = t.loadApp(d(t));
  return I(e) ? e.then((n) => {
    const o = [];
    return typeof n != "object" && o.push(`app: ${t.name} \u6CA1\u6709\u5BFC\u51FA\u4EFB\u4F55\u4E1C\u897F`), ["bootstrap", "mount", "unmount"].forEach((u) => {
      st(n[u]) || o.push(`app: ${t.name} \u6CA1\u6709\u5BFC\u51FA\u751F\u547D\u5468\u671F: ${u},\u6216\u4E0D\u662F\u4E00\u4E2A\u65B9\u6CD5`);
    }), o.length ? (console.log(o), t.status = f, t) : (t.status = B, t.bootstrap = m(n.bootstrap), t.mount = m(n.mount), t.unmount = m(n.unmount), t.unload = m(n.unload), t.timeouts = rt(n.timeouts), t);
  }).catch((n) => (console.log(n), t.status = w, t)) : (console.log("app loadFunction must return a promise"), t.status = f, Promise.resolve(t));
}
function b(t) {
  return t.status !== B ? Promise.resolve(t) : (t.status = V, U(t.bootstrap(d(t)), `app: ${t.name} bootstrapping`, t.timeouts.bootstrap).then(() => (t.status = v, t)).catch((e) => (console.log(e), t.status = f, t)));
}
function D(t) {
  return t.status !== v ? Promise.resolve(t) : (t.status = x, U(t.mount(d(t)), `app: ${t.name} mounting`, t.timeouts.mount).then(() => {
    t.status = E;
  }).catch((e) => (console.log(e), t.status = E, W(t).catch((n) => {
    console.log(n);
  }).then(() => (t.status = f, t)))));
}
let T = !1, h = [];
function y(t = [], e) {
  if (T)
    return new Promise((s, r) => {
      h.push({ success: s, failure: r, eventArgs: e });
    });
  if (T = !0, nt())
    return n();
  return o();
  function n() {
    const s = it(), r = Promise.all(s.map(W)), K = M().map((c) => R(c).then((O) => b(O)).then(() => r).then(() => D(c))), k = ut().map((c) => b(c).then(() => r).then(() => D(c)));
    return r.then(
      () => {
        a();
        const c = K.concat(k);
        return Promise.all(c).then(u, (O) => {
          t.forEach((F) => F.reject(O));
        });
      },
      (c) => {
        throw a(), console.log(c), c;
      }
    );
  }
  function o() {
    const s = M().map(R);
    return Promise.all(s).then(() => (i(), u())).catch((r) => {
      i(), console.log(r);
    });
  }
  function u() {
    const s = ct();
    if (t != null && t.length && t.forEach((r) => r.success(s)), T = !1, h.length) {
      const r = h;
      return h = [], y(r);
    }
    return s;
  }
  function i() {
    t.length && t.filter((s) => s.eventArgs).forEach((s) => a(s.eventArgs)), e && a(e);
  }
}
const l = [];
function G() {
  return l.map(({ name: t }) => t);
}
function M() {
  return l.filter(_).filter(J).filter(q).filter($);
}
function ut() {
  return l.filter(_).filter(C).filter(Q).filter($);
}
function it() {
  return l.filter(_).filter(N).filter(X);
}
function ct() {
  return l.filter(N).map((t) => t);
}
function ft(t, e, n, o = {}) {
  if (!t || typeof t != "string")
    throw new Error("\u53C2\u6570:appName \u4E0D\u80FD\u4E3A\u7A7A\u5B57\u7B26\u4E32");
  if (G().includes(t))
    throw new Error(`\u5B50\u5E94\u7528appName: ${t} \u5DF2\u6CE8\u518C`);
  if (!e)
    throw new Error("\u7F3A\u5C11\u53C2\u6570: applicationOrLoadFunction");
  if (typeof n != "function")
    throw new Error("\u53C2\u6570: activityWhen \u683C\u5F0F\u5FC5\u987B\u4E3A Function");
  if (typeof o != "object" || Array.isArray(o))
    throw new Error("\u53C2\u6570:customProps \u683C\u5F0F\u5FC5\u987B\u4E3A Object");
  return typeof e != "function" && (e = () => Promise.resolve(e)), l.push({
    name: t,
    loadApp: e,
    activityWhen: n,
    customProps: o,
    status: S,
    services: []
  }), y();
}
export {
  G as getAppNames,
  ft as registerApplication,
  et as start
};
//# sourceMappingURL=my-single-spa.js.map
