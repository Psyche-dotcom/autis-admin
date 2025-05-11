export const routes = {
  login: () => "/api/user/login",
  signup: () => "/api/user/register",
  Adminsignup: () => "/api/admin/register",
  forgotPassword: (email) => `/api/user/forgot_password?email=${email}`,
  deleteAccount: (email) => `/api/user/delete_user/${email}`,
  retrieveAllAdmin: (perpage, pageno) => `/api/all/${perpage}/${pageno}`,
  confirmEmail: () => "/api/user/confirm-email",
  profile: () => "/api/user/info",
  catSymbolUrl: () => "/api/symbol/category/all",
  catinSymbolUrl: () => "/api/symbol/category/retrieve_all_symbol",
  retrievePlans: () => "/api/subscription/retrieve/all",
  updateProfile: (email) => `/api/user/update_details/${email}`,
  symbolUrl: (symbolid) => `/api/symbol/image/${symbolid}`,
  UploadsymbolUrl: (catName, desc) =>
    `/api/symbol/upload?CategoryName=${catName}&Description=${desc}`,
};
