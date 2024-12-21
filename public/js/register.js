let form = document.querySelector("form");
form.addEventListener("submit", (event) =>{
    let password = document.getElementById("password");
    let conPassword = document.getElementById("confirmPassword");
    if(password.value != conPassword.value)
    {   
        let check = document.getElementById("pass-check");
        check.innerHTML = "Please Check Your Password";
        check.style.color="red";
        check.style.textDecoration="underline 1px solid red";
        event.preventDefault();
    
    }
    else if(password.value == conPassword.value ){
        form.submit();
    }
});


let userType = document.getElementById("user_type");
let department = document.getElementById("department");

userType.addEventListener("change", () =>{
    department.innerHTML = "";
    if(userType.value.toLowerCase() == 'hod' || userType.value.toLowerCase() == 'coordinator')
    {   
        let options = [
            {value :'ise'},
            {value :'cse'},
            {value :'aiml'},
            {value :'aro'},
            {value :'iot'},
            {value :'mec'},
        ]

        for(let option of options)
        {   
            let optn = document.createElement('option');
            optn.value = option.value;
            optn.innerHTML = option.value.toUpperCase();
            department.appendChild(optn);
        }
    }
    else if(userType.value.toLowerCase() == 'principal' || userType.value.toLowerCase() == 'warden')
    {
        let option = document.createElement('option');
        option.value = 'MITE';
        option.innerHTML = 'MITE';
        department.appendChild(option);
    }
    else{
        let option = document.createElement('option');
        option.value = 'select after position';
        department.appendChild(collegeOptn);
    }
});