function wwcLoadCallback() {
  document.querySelector("#wwc-recaptcha-token").value  = "";
}

var wwcCaptcha;
function wwcRenderCaptcha() {
  var container = document.querySelector("#wwc-g-recaptcha");
  container.style.display = "block";
  for (var c of container.children) {
    c.remove();
  }
  if (wwcCaptcha !== undefined)
    grecaptcha.reset(wwcCaptcha);
  else
    wwcCaptcha = grecaptcha.render("wwc-g-recaptcha", {
      "sitekey":"6Le-P0wUAAAAAKm8vDpP1CZhZMUPVvsKt6WnbMVX",
      "callback":"wwcOnSuccess",
      "expired-callback":"wwcOnExpired",
      "error-callback":"wwcOnError"
    });
  document.querySelector("#wwcRender").remove();
}

function wwcOnSuccess(token) {
  document.querySelector("#wwc-recaptcha-token").value = token;
  setTimeout(function () {
    document.querySelector("#wwc-g-recaptcha").style.display = "none";
  }, 500);
}

function wwcOnExpired() {
  document.querySelector("#wwc-recaptcha-token").value = "";
}

function wwcOnError() {

}
document.querySelector("#wwc-isWebsiteAnnoying").value = "0";
