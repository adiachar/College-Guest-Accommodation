let request = document.querySelectorAll(".req-head");

for(req of request)
{   
    let clickedOnce = false;
    req.addEventListener('click', (event)=>{
        if(clickedOnce){
            requestDetails = event.target.parentElement.parentElement.children[2];
            requestDetails.style.height="0vh";
            clickedOnce = false;
        }
        else{
            requestDetails = event.target.parentElement.parentElement.children[2];
            requestDetails.style.display="inline-block";
            requestDetails.style.maxHeight="100vh";
            clickedOnce = true;
        }
        
    });
}

let text = document.querySelector(".mite");
let words = "Welcome To Mangalore Institute Of Technology And Engineering.";

if(text){ 
    text.innerHTML = "";
}

if(text){
    let i = 0;
    let interval = setInterval(() => {
        text.innerHTML = words.slice(0, i++);
        if(words.length == i-2){
            clearInterval(interval); 
        }
    }, 80);  
}
