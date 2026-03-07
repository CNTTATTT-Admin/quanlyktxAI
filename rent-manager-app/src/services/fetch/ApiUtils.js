import { API_BASE_URL, ACCESS_TOKEN } from "../../constants/Connect";

export const request = (options) => {
  const headers = new Headers();

  if (!(options.body instanceof FormData)) {
    headers.append("Content-Type", "application/json");
  }

  if (localStorage.getItem(ACCESS_TOKEN)) {
    headers.append(
      "Authorization",
      "Bearer " + localStorage.getItem(ACCESS_TOKEN),
    );
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options).then((response) =>
    response.text().then((text) => {
      // Handle empty bodies (e.g., HTTP 200 OK with no content or HTTP 204)
      const isJson = response.headers
        .get("content-type")
        ?.includes("application/json");
      let json = {};

      if (text) {
        try {
          json = JSON.parse(text);
        } catch (e) {
          // If it's not valid JSON, but response is OK, we can just return the text
          if (response.ok) {
            return text;
          }
        }
      }

      if (!response.ok) {
        if (json.error === "FACE_REQUIRED") {
          // Toast is now handled globally in index.js via monkey-patch.
          // We still return a specific error that components can recognize.
          const message =
            json.message ||
            "Vui lòng hoàn tất xác thực khuôn mặt để sử dụng chức năng này.";
          const error = new Error(message);
          error.json = json;
          error.isHandled = true; // Signal to components that this error is common/handled
          return Promise.reject(error);
        }
        return Promise.reject(json);
      }
      return json;
    }),
  );
};

export function getAllElectricAndWaterOfRentaler(pageNo, pageSize, name) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/electric-water?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&keyword=" +
      name,
    method: "GET",
  });
}

export function getAllWater(pageNo, pageSize, name) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/water?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&keyword=" +
      name,
    method: "GET",
  });
}

export function getCurrentUser() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/user/me",
    method: "GET",
  });
}

export function getCurrentRentaler() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/rentaler/me",
    method: "GET",
  });
}

export function getCurrentAdmin() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/admin/me",
    method: "GET",
  });
}

export function getCurrentUserUnified() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/api/user/me",
    method: "GET",
  });
}

export function forgotPassword(emailRequest) {
  return request({
    url: API_BASE_URL + "/auth/forgot-password",
    method: "POST",
    body: JSON.stringify(emailRequest),
  });
}

export function changeConfirmedStatus(emailRequest) {
  return request({
    url: API_BASE_URL + "/auth/confirmed",
    method: "POST",
    body: JSON.stringify(emailRequest),
  });
}

export function resetPassword(resetPassword) {
  return request({
    url: API_BASE_URL + "/auth/reset-password",
    method: "POST",
    body: JSON.stringify(resetPassword),
  });
}

export function login(loginRequest) {
  return request({
    url: API_BASE_URL + "/auth/login",
    method: "POST",
    body: JSON.stringify(loginRequest),
  });
}

export function signup(signupRequest) {
  return request({
    url: API_BASE_URL + "/auth/signup",
    method: "POST",
    body: JSON.stringify(signupRequest),
  });
}

export function faceLogin(faceVector) {
  return request({
    url: API_BASE_URL + "/auth/face-login",
    method: "POST",
    body: JSON.stringify(faceVector),
  });
}

export function changePassword(changePasswordRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/auth/change-password",
    method: "POST",
    body: JSON.stringify(changePasswordRequest),
  });
}

export function registerFace(faceRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/auth/face-register",
    method: "POST",
    body: JSON.stringify(faceRequest),
  });
}

export function getCheckInOutHistory(page, size) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/auth/history?page=" + page + "&size=" + size,
    method: "GET",
  });
}

export function getAllRoomOfCustomer(
  pageNo,
  pageSize,
  title,
  price,
  categoryId,
) {
  return request({
    url:
      API_BASE_URL +
      "/customer/room?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&title=" +
      title +
      "&price=" +
      price +
      "&categoryId=" +
      categoryId,
    method: "GET",
  });
}

export function getAllAccountRentalerForCustomer(pageNo, pageSize, keyword) {
  return request({
    url:
      API_BASE_URL +
      "/account/customer?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&keyword=" +
      (keyword || ""),
    method: "GET",
  });
}

export function getAllrRoomByUserId(pageNo, pageSize, userId) {
  return request({
    url:
      API_BASE_URL +
      "/room/" +
      userId +
      "/rentaler" +
      "?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize,
    method: "GET",
  });
}

export function followAgents(followRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/follow",
    method: "POST",
    body: JSON.stringify(followRequest),
  });
}

export function saveBlog(storeRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/blog-store/save",
    method: "POST",
    body: JSON.stringify(storeRequest),
  });
}

export function unsaveBlog(roomId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/blog-store/unsave/" + roomId,
    method: "DELETE",
  });
}

export function checkBlogSavedStatus(roomId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.resolve(false);
  }

  return request({
    url: API_BASE_URL + "/blog-store/check/" + roomId,
    method: "GET",
  });
}

export function getUserOfChat() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/user/message",
    method: "GET",
  });
}

// ADMIN
export function getAllRoomOfAdmin(pageNo, pageSize, name) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/room/all?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&title=" +
      name,
    method: "GET",
  });
}

export function getAllRoomApprovingOfAdmin(pageNo, pageSize, approve) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/room/all?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&approve=" +
      approve,
    method: "GET",
  });
}

export function getAllAccpuntOfAdmin(pageNo, pageSize, name) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/account?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&keyword=" +
      name,
    method: "GET",
  });
}

export function getAccountById(id) {
  return request({
    url: API_BASE_URL + "/account/" + id,
    method: "GET",
  });
}

export function approveRoomOfAdmin(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/room/" + id + "/approve",
    method: "POST",
  });
}

export function removeRoomOfAdmin(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/room/" + id,
    method: "DELETE",
  });
}

export function lockedAccount(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/auth/" + id + "/locked",
    method: "POST",
  });
}

export function unlockAccount(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/auth/unlock/" + id,
    method: "POST",
  });
}

export function checkFollow(rentalerId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/follow/check/" + rentalerId,
    method: "GET",
  });
}

export function sendEmailForRentaler(id, sendEmailRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/account/send-email/" + id,
    method: "POST",
    body: JSON.stringify(sendEmailRequest),
  });
}

export function sendEmailForContact(sendEmailRequest) {
  return request({
    url: API_BASE_URL + "/account/send-mail-rentaler",
    method: "POST",
    body: JSON.stringify(sendEmailRequest),
  });
}

export function setAuthorization(id, roleRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/account/" + id + "/authorization",
    method: "POST",
    body: JSON.stringify(roleRequest),
  });
}

export function getAllRequireOfCustomer(pageNo, pageSize, name, phone) {
  return request({
    url:
      API_BASE_URL +
      "/request/customer?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&keyword=" +
      name +
      "&phone=" +
      phone,
    method: "GET",
  });
}

// RENTALER
export function getAllRoomOfRentaler(pageNo, pageSize, name) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/room?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&title=" +
      name,
    method: "GET",
  });
}

export function getAllContractOfRentaler(pageNo, pageSize, name) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/contract?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&name=" +
      name,
    method: "GET",
  });
}

export function getAllRoomHired(pageNo, pageSize, phone) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/contract/customer?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&phone=" +
      phone,
    method: "GET",
  });
}

export function getAllFollow(pageNo, pageSize) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/follow?pageNo=" + pageNo + "&pageSize=" + pageSize,
    method: "GET",
  });
}

export function getAllBlogStore(pageNo, pageSize) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/blog-store/all?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize,
    method: "GET",
  });
}

export function getAllMaintenceOfRentaler(pageNo, pageSize, name) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/maintenance?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&keyword=" +
      name,
    method: "GET",
  });
}

export function getAllRequireOfRentaler(pageNo, pageSize, name) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/request?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize +
      "&keyword=" +
      name,
    method: "GET",
  });
}

export function getRoom(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/room/" + id,
    method: "GET",
  });
}

export function getRentOfHome() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/room/rent-home",
    method: "GET",
  });
}

export function getElectricByRoomUser(roomId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/electric-water/room/" + roomId,
    method: "GET",
  });
}

export function payElectricBill(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/electric-water/" + id + "/pay",
    method: "PUT",
  });
}

export function createCheckoutRequest(data) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/checkout-request/user/create",
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCheckoutRequestsForRentaler(page, size) {
  page = page || 0;
  size = size || 10;
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url:
      API_BASE_URL +
      "/checkout-request/rentaler/history?pageNo=" +
      page +
      "&pageSize=" +
      size,
    method: "GET",
  });
}

export function approveCheckoutRequest(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/checkout-request/rentaler/" + id + "/approve",
    method: "PUT",
  });
}

export function rejectCheckoutRequest(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/checkout-request/rentaler/" + id + "/reject",
    method: "PUT",
  });
}

export function getNumber() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/statistical",
    method: "GET",
  });
}

export function getNumberOfAdmin() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/statistical/admin",
    method: "GET",
  });
}

export function getByMonth() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/statistical/get-by-month",
    method: "GET",
  });
}

export function getByCost() {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/statistical/cost",
    method: "GET",
  });
}

export function getContract(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/contract/" + id,
    method: "GET",
  });
}

export function getElectricAndWater(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/electric-water/" + id,
    method: "GET",
  });
}

export function checkoutRoom(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/room/" + id + "/checkout",
    method: "POST",
  });
}

export function checkoutContract(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/room/contract/" + id + "/checkout",
    method: "POST",
  });
}

export function sendRequestForRentaler(data) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/request",
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getRequestById(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/request/" + id,
    method: "GET",
  });
}

export function checkRequestStatus(roomId) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/request/check/" + roomId,
    method: "GET",
  });
}

export function changeStatusOfRequest(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/request/" + id,
    method: "POST",
  });
}

export function approveRequest(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/request/" + id + "/approve",
    method: "POST",
  });
}

export function getMaintenance(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/maintenance/" + id,
    method: "GET",
  });
}

export function exportBillRequest(
  nameBill,
  description,
  price,
  nameRoom,
  nameOfRent,
) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/export-bill" +
      "?nameBill=" +
      nameBill +
      "&description=" +
      description +
      "&price=" +
      price +
      "&nameRoom=" +
      nameRoom +
      "&nameOfRent=" +
      nameOfRent,
    method: "GET",
  });
}

export function disableRoom(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/room/" + id,
    method: "POST",
  });
}

export function deleteMaintenance(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/maintenance/" + id,
    method: "DELETE",
  });
}

export function reportMaintenance(data) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  const formData = new FormData();
  formData.append("roomId", data.roomId);
  formData.append("description", data.description);
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  return request({
    url: API_BASE_URL + "/maintenance/user-request",
    method: "POST",
    body: formData,
  });
}

export function updateMaintenanceStatus(id, data) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  const formData = new FormData();
  formData.append("status", data.status);
  if (data.price) formData.append("price", data.price);
  if (data.maintenanceDate)
    formData.append("maintenanceDate", data.maintenanceDate);
  if (data.files && data.files.length > 0) {
    data.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  return request({
    url: API_BASE_URL + "/maintenance/" + id + "/status",
    method: "PUT",
    body: formData,
  });
}

export function getMaintenanceHistoryForUser(pageNo, pageSize) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/maintenance/user?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize,
    method: "GET",
  });
}

export function createLeaveRequest(leaveRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/leave-request",
    method: "POST",
    body: JSON.stringify(leaveRequest),
  });
}

export function getLeaveRequestsByUser(pageNo, pageSize) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/leave-request/user?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize,
    method: "GET",
  });
}

export function getLeaveRequestsForRentaler(pageNo, pageSize) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url:
      API_BASE_URL +
      "/leave-request/rentaler?pageNo=" +
      pageNo +
      "&pageSize=" +
      pageSize,
    method: "GET",
  });
}

export function updateLeaveRequestStatus(id, status) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: API_BASE_URL + "/leave-request/" + id + "?status=" + status,
    method: "PATCH",
  });
}

export function getActiveBanners() {
  return request({
    url: API_BASE_URL + "/banner/active",
    method: "GET",
  });
}

export function getAllBanners(pageNo, pageSize) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/banner?pageNo=" + pageNo + "&pageSize=" + pageSize,
    method: "GET",
  });
}

export function getBannerById(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/banner/" + id,
    method: "GET",
  });
}

export function createBanner(bannerRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/banner",
    method: "POST",
    body:
      bannerRequest instanceof FormData
        ? bannerRequest
        : JSON.stringify(bannerRequest),
  });
}

export function updateBanner(id, bannerRequest) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/banner/" + id,
    method: "PUT",
    body:
      bannerRequest instanceof FormData
        ? bannerRequest
        : JSON.stringify(bannerRequest),
  });
}

export function deleteBanner(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/banner/" + id,
    method: "DELETE",
  });
}

export function toggleBannerActive(id) {
  if (!localStorage.getItem(ACCESS_TOKEN)) {
    return Promise.reject("No access token set.");
  }
  return request({
    url: API_BASE_URL + "/banner/" + id + "/toggle",
    method: "POST",
  });
}
