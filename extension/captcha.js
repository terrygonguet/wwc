function wwcLoadCallback() {
  document.querySelector("#wwc-recaptcha-token").value  = "";
  grecaptcha.render("g-recaptcha", {
    "sitekey":"6Le-P0wUAAAAAKm8vDpP1CZhZMUPVvsKt6WnbMVX",
    "callback":"wwcOnSuccess",
    "expired-callback":"wwcOnExpired",
    "error-callback":"wwcOnError"
  });
}

function wwcOnSuccess(token) {
  document.querySelector("#wwc-recaptcha-token").value  = token;
}

function wwcOnExpired() {
  document.querySelector("#wwc-recaptcha-token").value = "";
}

function wwcOnError() {

}
