function wwcLoadCallback() {
  document.querySelector("#wwc-recaptcha-token").value  = "";
}

function wwcRenderCaptcha() {
  grecaptcha.render("g-recaptcha", {
    "sitekey":"6Le-P0wUAAAAAKm8vDpP1CZhZMUPVvsKt6WnbMVX",
    "callback":"wwcOnSuccess",
    "expired-callback":"wwcOnExpired",
    "error-callback":"wwcOnError"
  });
  document.querySelector("#wwcRender").remove();
  document.querySelector("#g-recaptcha").style.display = "initial";
}

function wwcOnSuccess(token) {
  document.querySelector("#wwc-recaptcha-token").value = token;
  setTimeout(function () {
    document.querySelector("#g-recaptcha").style.display = "none";
  }, 500);
}

function wwcOnExpired() {
  document.querySelector("#wwc-recaptcha-token").value = "";
}

function wwcOnError() {

}
