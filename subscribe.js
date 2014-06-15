/*global Stripe*/
window.onload = function () {

  var plans = {
    basic: { price: 9 },
    advanced: { price: 19 },
    ultimate: { price: 29 }
  };
  var plan;
  Object.keys(plans).forEach(function (name) {
    plans[name].cell = document.getElementById("plan-" + name);
    plans[name].label = document.querySelector("#plan-" + name + " .action-button a");
    plans[name].radio = document.getElementById("plan-" + name + "-radio");
    plans[name].radio.addEventListener("change", function () {
      window.location.hash = "#" + name;
    }, false);
  });
  var form = document.querySelector("form");
  form.addEventListener('submit', onSubmit, false);
  var numberField = form.querySelector("[data-stripe=number]");
  var cvcField = form.querySelector("[data-stripe=cvc]");
  var monthField = form.querySelector("[data-stripe=exp_month]");
  var yearField = form.querySelector("[data-stripe=exp_year]");

  numberField.addEventListener("keyup", function () {
    var valid = Stripe.card.validateCardNumber(numberField.value);
    numberField.setCustomValidity(valid ? "" : "Invalid Card Number");
  });

  cvcField.addEventListener("keyup", function () {
    var valid = Stripe.card.validateCVC(cvcField.value);
    cvcField.setCustomValidity(valid ? "" : "Invalid CVC");
  });

  monthField.addEventListener("change", onDate);
  yearField.addEventListener("keyup", onDate);
  function onDate() {
    var valid = Stripe.card.validateExpiry(monthField.value, yearField.value);
    monthField.setCustomValidity(valid ? "" : "Invalid Date");
    yearField.setCustomValidity(valid ? "" : "Invalid Date");
  }

  window.onhashchange = choose;
  choose();

  if (/test/.test(window.location.search)) {
    Stripe.setPublishableKey('pk_test_7gBYSJ63zOuV6MASx6gUJBru');
  }
  else {
    Stripe.setPublishableKey('pk_live_AyguazpnF3Qicy71XjKZBESZ');
  }

  function appendField(name, value) {
    var field = document.createElement("input");
    field.setAttribute("type", "hidden");
    field.setAttribute("name", name);
    field.setAttribute("value", value);
    form.appendChild(field);
  }

  function onSubmit(evt) {
    console.log("onsubmit");
    evt.preventDefault();
    var submit = form.querySelector("input[type=submit]");
    submit.setAttribute("disabled", true);
    Stripe.card.createToken(form, function (status, response) {
      if (status === 200) {
        var planValue;
        var radios = form.plan;
        for (var i = 0, length = radios.length; i < length; i++) {
          if (!radios[i].checked) continue;
          planValue = radios[i].value;
          break;
        }
        console.log({
          name: form.name.value,
          email: form.email.value,
          comments: form.comments.value,
          plan: planValue,
          token: response.id,
          card: response.card
        });
        // if (window.confirm("GO?")) {
        //   appendField("stripeToken", response.id);
        //   appendField("card", JSON.stringify(response.card));
        //   if (response.livemode) appendField("livemode", response.livemode);
        //   form.submit();
        // }
        // else {
          submit.removeAttribute("disabled");
        // }
        return;
      }
      else if (response.error) {
        var field = form.querySelector("input[data-stripe=" + response.error.param + "]");
        field.setCustomValidity(response.error.message);
        submit.removeAttribute("disabled");
        field.focus();
        return;
      }
      else {
        window.alert("Unknown Stripe response " + status + "\n" + JSON.stringify(response));
        submit.removeAttribute("disabled");
      }
    });
  }



  function choose() {
    var price;
    plan = window.location.hash;
    if (plan) {
      plan = plan.substring(1);
      if (!plans[plan]) plan = "";
    }
    Object.keys(plans).forEach(function (name) {
      var className = "table grid_4 other-plan";
      var label = "Change";
      var selected = name === plan;
      if (selected) {
        className = "table grid_4 selected-plan";
        label = "Selected";
        price = plans[name].price;
      }
      plans[name].radio.checked = selected;
      plans[name].cell.setAttribute("class", className);
      plans[name].label.textContent = label;
    });
    if (plan) {
      document.getElementById('submitbtn').value = "Subscribe for $" + plans[plan].price + "/month";
    }
  }
};
