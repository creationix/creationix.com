window.onload = function () {

  var plans = {
    basic: { price: 9 },
    advanced: { price: 19 },
    ultimate: { price: 29 }
  };
  Object.keys(plans).forEach(function (name) {
    plans[name].cell = document.getElementById("plan-" + name);
    plans[name].label = document.querySelector("#plan-" + name + " .action-button a");
    plans[name].radio = document.getElementById("plan-" + name + "-radio");
    plans[name].radio.addEventListener("change", function (evt) {
      window.location.hash = "#" + name;
    }, false);
  });

  window.onhashchange = choose;
  choose();

  function choose() {
    var price;
    var plan = window.location.hash;
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
    // if (plan) {
      // document.getElementById("number-field").focus();
    // }
  }
};
