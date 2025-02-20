let guestRow = document.getElementById("guestNameAndDetail");
let noOfGuests = document.getElementById("numberOfGuests");

noOfGuests.addEventListener('input', () =>{
  guestRow.innerHTML = '';
  if(noOfGuests.value >= 100)
  {
    noOfGuests.value = 50;
  }
  let guests = noOfGuests.value;
  for(let i = 0; i < guests; i++)
  { 
    guestRow.innerHTML = guestRow.innerHTML +
    `
    <div class='gstDtl'>
      <div class='gstTime'>
        <div class='time'>
          <label class='form-label'>Guest ${i+1}</label>
          <input class='form-control' placeholder='Name' name='name[${i}]' required/>
        </div>
        <div class="time">
          <label for="arrivalDate" class="form-label">Arrival Date:</label>
          <input type="date" name="arrivalDate" id="arrivalDate" class="form-control" required/>
        </div>
        <div class="time">
          <label for="arrivalTime" class="form-label">Arrival Time:</label>
          <input type="time" name="arrivalTime" id="arrivalTime" class="form-control" required/>
        </div>
        <div class="time">
          <label for="leavingDate" class="form-label">Leaving Date:</label>
            <input type="date" name="leavingDate" id="leavingDate" class="form-control" required/>
        </div>
      </div>
      
      <div class='gstInfo'>
        <div class='gstDInfo'>
          <label class='form-label'>Guest Details</label>
          <textarea class='form-control' name='guestDetail[${i}]' required></textarea>
        </div>

        <div class='gstFInfo'>
          <div class='info'>
            <label class='form-label'>Guest Food Type:</label>
            <div class="form-check p-0">
              <input class="form-check-input" type="radio" name="vegNonVeg[${i}]" id="veg" value="veg" checked>
              <label class="form-check-label" for="veg">
                Vegitarian
              </label>
            </div>
            <div class="form-check p-0">
              <input class="form-check-input" type="radio" name="vegNonVeg[${i}]" id="nonVeg" value="nonVeg">
              <label class="form-check-label" for="nonVeg">
                Non-Vegitarian
              </label>
            </div>
          </div>

          <div class='info'>
            <label class='form-label'> Guest Food Timings:</label>
            <div class="form-check p-0">
              <input class="form-check-input" type="checkbox" name='foodTime[${i}]' value="breakfast" id="breakfast">
              <label class="form-check-label" for="breakfast">
                Breakfast
              </label>
            </div>
            <div class="form-check p-0">
              <input class="form-check-input" type="checkbox" name='foodTime[${i}]' value="lunch" id="lunch" checked>
              <label class="form-check-label" for="lunch">
                Lunch
              </label>
            </div>
            <div class="form-check p-0">
              <input class="form-check-input" type="checkbox" name='foodTime[${i}]' value="dinner" id="dinner" checked>
              <label class="form-check-label" for="dinner">
                Dinner
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
  }
});

// BOOTSTRAP INPUT VALIDATION
// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()