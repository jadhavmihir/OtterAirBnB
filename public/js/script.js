// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
})()

document.addEventListener("DOMContentLoaded", function () {
  var alertElement = document.querySelector(".alert-p");
  if (alertElement) {
      setTimeout(function () {
          var alertInstance = bootstrap.Alert.getOrCreateInstance(alertElement);
          alertInstance.close(); // Bootstrap's built-in close method
      }, 5000); // 5 seconds
  }
});