export const ROUTES = {
  home: "/",
  catalog: "/s/nc-catalog-x7k",
  about: "/s/nc-about-q4m",
  login: "/s/nc-login-a9p",
  adminLogin: "/access-panel-admin",
  register: "/s/nc-register-v8r",
  verify2fa: "/s/nc-verify-k2f",
  product: "/s/nc-item-p6d",
  apiComments: "/s/nc-comments-t5c",
  profile: "/s/nc-profile-h3u",
  cart: "/s/nc-cart-r2b",
  payments: "/s/nc-pay-m8z",
  orders: "/s/nc-orders-y4n",
  chat: "/s/nc-support-c6w",
  dashboard: "/s/nc-admin-d1x",
  dashboardOverview: "/s/nc-admin-d1x/ov",
  dashboardPayments: "/s/nc-admin-d1x/py",
  dashboardClients: "/s/nc-admin-d1x/cl",
  dashboardProducts: "/s/nc-admin-d1x/pr",
  dashboardSecurity: "/s/nc-admin-d1x/sc",
  dashboardDeliveries: "/s/nc-admin-d1x/dl",
  dashboardClaims: "/s/nc-admin-d1x/cr"
};

export const productRoute = (id) => `${ROUTES.product}/${id}`;
