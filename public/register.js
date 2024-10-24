let button = document.querySelector("button");

button.addEventListener("click", () =>{
    let password = document.getElementById("password");
    let conPassword = document.getElementById("confirmPassword");
    let username = document.getElementById("username");
    let department = document.getElementById("department");
    let email = document.getElementById("email");

    if(password.value != conPassword.value)
    {   
        let check = document.getElementById("pass-check");
        check.innerHTML = "Please Check Your Password";
        check.style.color="red";
        check.style.textDecoration="underline 1px solid red";
        event.preventDefault();
    
    }
    else if(username.value && department.value && email.value){
        document.getElementById("form").submit();
    }
});
